var assert = require('assert');
var envStorage = require('../../lib/storage/env');

describe('Environment Variable storage', function() {
  describe('.read()', function() {
    it('reads the default environment variable', function() {
      process.env.CONFIG_OVERRIDE = 'foo.bar=3;foo.baz=#{parseInt(3)}';
      var storage = envStorage();
    
      return storage.read().then(function(config) {
        assert.deepEqual({
          foo: {
            bar: '3',
            baz: '#{parseInt(3)}'
          }
        }, config);
      });
    });
  });
});
