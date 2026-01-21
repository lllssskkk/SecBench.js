var got = require('got');
var Promise = require('bluebird');
var utils = require('../utils');

module.exports = function(url) {
  var opts = {
    json: true,
    method: 'GET',
    headers: {
      'User-Agent': 'connie'
    },
    agent: false
  };

  if (typeof(url) !== 'string') {
    if (url.url) {
      if (url.headers) {
        Object.keys(url.headers).forEach(function(k) {
          opts.headers[k] = url.headers[k];
        });
      }

      ['method', 'query', 'auth', 'timeout'].forEach(function(k) {
        if (url[k]) { opts[k] = url[k]; }
      });

      url = url.url;
    } else {
      throw new Error('Invalid options passed for HTTP storage. Must either by a URL string or an object with at least a "url" key.');
    }
  }

  return {
    read: function() {
      return got(url, opts).then(function(res) {
        return res.body;
      });
    },
    write: function(config) {
      return Promise.reject(new Error('env storage cannot write configurations'));
    }
  };
};
