var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var utils = require('../utils');

module.exports = function(file) {
  if (file[0] !== '/') {
    file = path.join(process.cwd(), file);
  }

  return {
    read: function() {
      return new Promise(function(resolve, reject) {
        fs.readFile(file, function(err, content) {
          if (err) {
            if (err.code !== 'ENOENT') { return reject(err); }
            content = '{}';
          }
          resolve(content.toString());
        });
      }).then(function(content) {
        return utils.parseJSON(content);
      });
    },
    write: function(config) {
      if (!config) { config = {}; }

      return new Promise(function(resolve, reject) {
        var content = JSON.stringify(config, null, 2);
        fs.writeFile(file, content, 'utf8', function(err) {
          if (err) { return reject(err); }
          resolve();
        });
      });
    }
  };
};
