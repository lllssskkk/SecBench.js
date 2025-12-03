/** @module connie */

var Promise = require('bluebird');
var connie = require('./connie');

var extendTopLevel = function() {
  var list = Array.prototype.slice.call(arguments);

  return list.slice(1).reduce(function(target, source) {
    Object.keys(source).forEach(function(key) {
      target[key] = source[key];
    });

    return target;
  }, list[0]);
};

/**
 * @class CombineConfig
 */
function CombineConfig() {
  this.configurers = [];
}

/**
 * Read the configuration and parse through connie-lang
 */
CombineConfig.prototype.read = function() {
  var configs = new Array(this.configurers.length + 1);
  configs[0] = {};

  return Promise.all(
    this.configurers.map(function(c, idx) {
      return c.read().then(function(config) {
        configs[idx + 1] = config;
      });
    })
  ).then(function() {
    return extendTopLevel.apply(null, configs);
  });
};

/**
 * Write the configuration object
 */
CombineConfig.prototype.write = function(config) {
  return Promise.reject(new Error('OverrideConfig objects cannot write configurations'));
};

/**
 *
 */
CombineConfig.prototype.merge = function() {
  var configurer = connie.apply(null, arguments);
  this.configurers.push(configurer);
  return this;
};

/**
 * An initializer to be used with app-context
 */
CombineConfig.prototype.initializer = function() {
  var self = this;

  return function(context) {
    return self.read().then(function(config) {
      context.config = config;
    });
  };
};

module.exports = CombineConfig;
