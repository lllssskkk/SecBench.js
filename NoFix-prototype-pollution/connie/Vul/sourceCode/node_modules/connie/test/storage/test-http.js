var assert = require('assert');
var httpStorage = require('../../lib/storage/http');

var configJSON = {
  foo: {
    bar: '3',
    baz: '#{parseInt(3)}'
  }
};

var httpServer = require('http').createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(configJSON));
});

describe('HTTP storage', function() {
  before(function(cb) {
    httpServer.listen(8123, cb);
  });

  after(function() {
    httpServer.close();
  });

  describe('.read()', function() {
    it('reads JSON from a simple JSON endpoint', function() {
      var storage = httpStorage('http://localhost:8123');

      return storage.read().then(function(config) {
        assert.deepEqual(configJSON, config);
      });
    });
  });
});
