/** @module connie */

var StorageTypes = {
  dir: require('./storage/dir'),
  file: require('./storage/file'),
  http: require('./storage/http'),
  env: require('./storage/env')
};

/**
 * @example
 * var connie = require('connie');
 * var AppContext = require('app-context');
 *
 * AppContext.createContext({
 *   configure: function() {
 *     this.use(AppContext.RunLevel.Configured, connie('file', 'config.json').initializer());
 *   }
 * });
 */
module.exports = function(type, opts) {
  var storage = StorageTypes[type];
  if (!storage) { throw new Error('Unknown config storage type: ' + type); }

  return new module.exports.Config(storage(opts));
};

/**
 * @example
 * var connie = require('connie');
 * var AppContext = require('app-context');
 *
 * AppContext.createContext({
 *   configure: function() {
 *     this.use(AppContext.RunLevel.Configured,
 *       connie.combine()
 *         .merge('file', 'default.json')
 *         .merge('file', 'production.json')
 *         .merge('env')
 *       .initializer()
 *     );
 *   }
 * });
 */
module.exports.combine = function() {
  return new module.exports.CombineConfig();
};

module.exports.Config = require('./config');
module.exports.CombineConfig = require('./combine-config');

/**
 * Supported storage types
 */
module.exports.storage = StorageTypes;
