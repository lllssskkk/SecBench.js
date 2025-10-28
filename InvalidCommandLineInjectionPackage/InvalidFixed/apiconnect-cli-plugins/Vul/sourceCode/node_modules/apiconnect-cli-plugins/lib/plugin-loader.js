/********************************************************* {COPYRIGHT-TOP} ***
 * Licensed Materials - Property of IBM
 * 5725-Z22, 5725-Z63, 5725-U33, 5725-Z63
 *
 * (C) Copyright IBM Corporation 2016, 2017
 *
 * All Rights Reserved.
 * US Government Users Restricted Rights - Use, duplication or disclosure
 * restricted by GSA ADP Schedule Contract with IBM Corp.
 ********************************************************** {COPYRIGHT-END} **/
// Node module: apiconnect-cli-plugins

var Promise = require('bluebird');
var _ = require('lodash');
var d = require('debug')('apiconnect:lib:plugin-loader');
var exec = require('child_process').exec;
var format = require('util').format;
var fs = require('fs');
var fsExtra = Promise.promisifyAll(require('fs-extra'));
var g = require('strong-globalize')();
var getConfigDir = require('apiconnect-config').getUserConfigDir;
var mkdirp = Promise.promisify(require('mkdirp'));
var mktmpdir = require('./util').mktmpdir;
var path = require('path');
var util = require('util');
var which = require('shelljs').which;

var readDirAsync = Promise.promisify(fs.readdir);

var userPluginBaseDir = path.resolve(getConfigDir(), 'plugins', 'node_modules');
function ensureUserPluginDir() {
  return mkdirp(userPluginBaseDir);
}

/**
 * Validate plugin package info, topics/components and commands.
 *
 * @param {string} path to local plugin directory.
 *
 * @return {boolean}
 */
function validatePlugin(pluginPath) {
  d('validating plugin path %s', pluginPath);

  var pluginInfo;
  var maybePlugin;
  try {
    pluginInfo = require(path.join(pluginPath, 'package.json'));
  } catch (err) {
    d('unable to load plugin metadata: %s', err.message);
    return false;
  }

  var k = pluginInfo.keywords;
  if (!k ||
    !(k.indexOf('apic-toolkit-plugin') !== -1 || (process.env.APIC_DEV && k.indexOf('apic-toolkit-dev-plugin') !== -1))
  ) {
    d('invalid plugin: missing keyword');
    return false;
  }

  try {
    maybePlugin = require(pluginPath);
  } catch (err) {
    d('unable to load plugin: %s', err.message);
    return false;
  }

  if (!(
    maybePlugin && (maybePlugin.getTopics || maybePlugin.getComponents)
    && ((typeof maybePlugin.getTopics === 'function') ||
    (typeof maybePlugin.getComponents === 'function')))
  ) {
    d('invalid plugin: no topics/commands found');
    return false;
  }
  var maybePluginTopics;
  var maybePluginComponents;
  if (maybePlugin.getTopics) {
    maybePluginTopics = maybePlugin.getTopics();
  }
  if (maybePlugin.getComponents) {
    maybePluginComponents = maybePlugin.getComponents();
  }

  // At least one of the two must exist!
  if (!util.isArray(maybePluginTopics) &&
    !util.isArray(maybePluginComponents)) {
    d('invalid plugin: no topics/components found');
    return false;
  }

  var validTopics = [];
  var validComponents = [];

  if (maybePluginTopics) {
    validTopics = _(maybePluginTopics).map(function(maybeTopic) {
      if (!maybeTopic || !maybeTopic.name || !maybeTopic.commands) {
        return null;
      }
      var commands = _(maybeTopic.commands).map(function(maybeCommand) {
        if (
          !maybeCommand.command ||
          !maybeCommand.aliases || !util.isArray(maybeCommand.aliases) ||
          !maybeCommand.options || !util.isArray(maybeCommand.options) ||
          !maybeCommand.helpInfo ||
          !maybeCommand.action || typeof maybeCommand.action !== 'function'
        ) {
          return false;
        }
        return maybeCommand;
      }).compact().value();
      maybeTopic.commands = commands;
      return maybeTopic;
    }).compact().value();
  }
  if (maybePluginComponents) {
    validComponents = _(maybePluginComponents).map(function(maybeComp) {
      if (!maybeComp || !maybeComp.name || !maybeComp.ctor ||
        typeof maybeComp.ctor !== 'function' || !maybeComp.ctor.prototype.start ||
        typeof maybeComp.ctor.prototype.start !== 'function') {
        return null;
      }
      return maybeComp;
    }).compact().value();
  }

  return validTopics.length + validComponents.length > 0;
}
exports.validatePlugin = validatePlugin;

/**
 * Installs module in tmp dir, validates then copies it into user plugin dir.
 *
 * @param {string} pluginUri URI for plugin. (passed to npm for installation)
 * @param {string} [registryUri] Optional URL for npm registry
 *
 * @return {Promise}
 */
function installPlugin(pluginUri, registryUri) {
  var npmScript = which('npm') || which('npm.bat');
  if (!npmScript) {
    throw new Error(g.f('The npm executable is not found on the path.'));
  }

  try {
    var maybeLocalPath = path.resolve(pluginUri);
    if (fs.statSync(maybeLocalPath)) {
      pluginUri = maybeLocalPath;
    }
  } catch (e) {
    // ignore
  }

  return mktmpdir()
    .then(installPluginInDir)
    .then(function(pluginDir) {
      if (!validatePlugin(pluginDir)) {
        throw new Error(g.f('The plugin is invalid.'));
      }
      return copyPluginIntoPlace(pluginDir);
    });

  function copyPluginIntoPlace(srcDir) {
    var pluginName = path.basename(srcDir);
    var destDir = path.join(userPluginBaseDir, pluginName);
    d('copy plugin from %s to %s', srcDir, destDir);
    return fsExtra.copyAsync(srcDir, destDir, { dereference: true });
  }

  function installPluginInDir(dir) {
    var installCmd = format(
      '"%s" --prefix "%s" install %s -g --silent --no-spin --no-progress',
      npmScript, dir, pluginUri
    );
    if (registryUri) {
      installCmd = format('%s --registry=%s', installCmd, registryUri);
    }
    d(installCmd);
    return new Promise(function(resolve, reject) {
      var proc = exec(installCmd, function(err) {
        if (err) {
          d('Error running npm install: %s', err.message);
          return reject(err);
        }
        // npm will append a lib directory on unix machine, but not windows
        // https://docs.npmjs.com/files/folders
        var isWindows = /^win/.test(process.platform);
        var pluginBase;
        if (isWindows) {
          pluginBase = path.join(dir, 'node_modules');
        } else {
          pluginBase = path.join(dir, 'lib', 'node_modules');
        }
        var pluginDirs = fs.readdirSync(pluginBase);
        d('tmp install dir listing %j', pluginDirs);
        if (pluginDirs[0] === '.bin') { pluginDirs.shift(); }
        if (pluginDirs.length < 1) {
          return reject(g.f('NPM installation failed'));
        }

        var pluginDir = path.join(pluginBase, pluginDirs[0]);
        return loadPlugins().then(function(plugins) {
          var pkg = require(path.join(pluginDir, 'package.json'));
          var pluginInfo = _(plugins).find({ name: pkg.name });
          if (pluginInfo && pluginInfo.isBuiltin) {
            var err = new Error(g.f('The built-in plugin %s %s is already installed.',
              pluginInfo.name, pluginInfo.version));
            return reject(err);
          }

          d('found installed plugin in %s', pluginDirs[0]);
          return resolve(pluginDir);
        });
      });
      proc.stdout.pipe(process.stdout);
      proc.stderr.pipe(process.stderr);
    });
  }
}
exports.installPlugin = installPlugin;

/**
 * Load a single plugin from from pluginDir
 *
 * @return PluginDef
 */
function loadPluginFromDir(pluginDir, isBuiltin) {
  if (typeof isBuiltin === 'undefined') {
    isBuiltin = false;
  }

  d('loading %s', pluginDir);
  try {
    if (!validatePlugin(pluginDir)) { return Promise.resolve(); }
  } catch (err) {
    d('error loading %s: %s', pluginDir, err);
    return Promise.resolve();
  }
  if (!require(pluginDir).getVersion ||
    typeof require(pluginDir).getVersion !== 'function') {
    // By default, read package.json
    var pkg = require(path.join(pluginDir, 'package.json'));
    var plugin = require(pluginDir);
    return {
      name: pkg.name,
      version: pkg.version,
      topics: plugin.getTopics ? plugin.getTopics() : null,
      components: plugin.getComponents ? plugin.getComponents() : null,
      path: pluginDir,
      isBuiltin: isBuiltin,
      gitHead: pkg.gitHead,
    };
  } else {
    // .getVersion() does the same plugin loading as above, but nests
    // some dependencies below @see apiconnect-cli-pm
    return require(pluginDir).getVersion();
  }
}
exports.loadPluginFromDir = loadPluginFromDir;

function loadPluginsFromDir(basedir, isBuiltin) {
  // Handle either an array or a single dir.
  var directories = util.isArray(basedir) ? basedir : [ basedir ];
  return Promise.map(directories, processDir)
    .then(function(res) {
      return _(res).compact().flatten().value();
    });

  function processDir(directory) {
    return readDirAsync(directory)
      .then(function(dirs) {
        return Promise.map(dirs, function(d) {
          return loadPluginFromDir(path.join(directory, d), isBuiltin);
        });
      })
      .catch(function(err) {
        d('caught error while loading %s', directory, err.message);
        return;
      });
  }
}

/**
 * Load plugins from ./lib/builtin-plugins/, node_modules and
 * ~/.apiconnect/plugins/node_modules.
 *
 * @return Array[PluginDef]
 */
function loadPlugins(dir) {
  return ensureUserPluginDir()
    .then(function() {
      var load = [ loadPluginsFromDir(exports.getPluginDirs(dir), true), loadPluginsFromDir(userPluginBaseDir, false) ];
      return Promise.all(load);
    }).then(function(res) {
      res.push(require('./plugins'));
      return _(res).flatten().compact().value();
    });
}
exports.loadPlugins = loadPlugins;

exports.__loaderContext = __dirname;

function init(nodeModulesDir) {
  exports.__loaderContext = nodeModulesDir;
}
exports.init = init;

function getContextDirs(root) {
  root = root || exports.__loaderContext;

  return util.isArray(root) ? root : [ root ];
}
exports.getContextDirs = getContextDirs;

/**
 * Returns an array of plugin directories.
 */
function getPluginDirs(root) {
  return _(getContextDirs(root)).map(function(dir) {
    return path.resolve(dir, 'node_modules');
  }).compact().value();
}
exports.getPluginDirs = getPluginDirs;

