var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var utils = require('../utils');

module.exports = function(rootDir) {
  if (rootDir[0] !== '/') {
    rootDir = path.join(process.cwd(), rootDir);
  }

  var getFileData = function(dir) {
    return function(filename) {
      return {
        path: path.join(dir, filename),
        filename: filename,
        extension: path.extname(filename)
      };
    };
  };

  var collectFiles = function(dir, extensions) {
    dir = path.resolve(dir);

    var fileStack = [getFileData(path.dirname(dir))(path.basename(dir))];
    var collectedFiles = [];

    while (fileStack.length > 0) {
      var currentFile = fileStack.pop();

      if (fs.existsSync(currentFile.path)) {
        if (fs.statSync(currentFile.path).isDirectory()) {
          var files = fs.readdirSync(currentFile.path).map(getFileData(currentFile.path));
          Array.prototype.push.apply(fileStack, files);
        } else if (extensions.indexOf(currentFile.extension) !== -1) {
          collectedFiles.push(currentFile);
        }
      }
    }

    return collectedFiles.map(function(file) {
      file.relativePath = file.path.slice(dir.length).replace(/^\/+/, '');
      return file;
    });
  };

  var parseDir = function(dir, config) {
    return Promise.resolve(collectFiles(dir, ['.json'])).then(function(files) {
      files.forEach(function(file) {
        var content = fs.readFileSync(file.path).toString();
        var key = file.relativePath.slice(0, -file.extension.length).split(path.sep);
        try {
          utils.setValue(config, key, utils.parseJSON(content));
        } catch (err) {
          throw new Error('Error while parsing ' + file.relativePath + file.extension + ': ' + err.message);
        }
      });

      return config;
    });
  };

  return {
    read: function() {
      return parseDir(rootDir, {});
    },
    write: function(config) {
      throw new Error('Not implemented');
    }
  };
};
