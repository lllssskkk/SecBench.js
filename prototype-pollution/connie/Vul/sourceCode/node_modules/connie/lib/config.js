/** @module connie */

var Promise = require('bluebird');
var isPlainObject = require('lodash.isplainobject');
var ConnieLang = require('connie-lang');

/**
 * @class Config
 */
function Config(storage) {
  this.storage = storage;
}

/**
 * Read the configuration and parse through connie-lang
 */
Config.prototype.read = function() {
  return Promise.resolve(this.storage.read()).then(function(config) {
    return ConnieLang.parse(config || {}, process.env);
  });
};

/**
 * Write the configuration object
 */
Config.prototype.write = function(config) {
  if (isPlainObject(config)) {
    // check that all values are plain objects or strings
    return Promise.resolve(this.storage.write(config));
  } else {
    return Promise.reject(new Error('Configurations must be objects'));
  }
};

/**
 * An initializer to be used with app-context
 */
Config.prototype.initializer = function() {
  var self = this;

  return function(context) {
    return self.read().then(function(config) {
      context.config = config;
    });
  };
};

module.exports = Config;
