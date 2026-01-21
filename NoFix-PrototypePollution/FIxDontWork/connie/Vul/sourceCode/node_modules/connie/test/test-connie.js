var assert = require('assert');
var connie = require('../');

describe('connie', function() {
  describe('public interface', function() {
    it('creates a Config instance for a valid storage type', function() {
      var config = connie('file', 'test/fixtures/configfile.json');
      assert(config.constructor === connie.Config);
    });

    it('throws an error for an invalid storage type', function() {
      assert.throws(function() {
        connie('unknown');
      });
    });
  });

  describe('combine', function() {
    it('can override a top-level key', function() {
      return connie.combine()
        .merge('file', 'test/fixtures/configfile.json')
        .merge('file', 'test/fixtures/configfile2.json')
      .read().then(function(config) {
        assert.deepEqual(config, {
          foo: 'baz'
        });
      });
    });

    it('can combine top-level keys', function() {
      process.env.CONFIG_OVERRIDE = 'baz=4';

      var configurer = connie.combine()
        .merge('file', 'test/fixtures/configfile.json')
        .merge('file', 'test/fixtures/configfile3.json')
        .merge('env');

      return configurer.read().then(function(config) {
        assert.deepEqual(config, {
          foo: 'bar',
          bar: 'baz',
          baz: '4'
        });
      });
    });

    it('will ignore empty local config', function() {
      return connie.combine()
        .merge('file', 'test/fixtures/configfile.json')
        .merge('file', 'test/fixtures/configfile3.json')
        .merge('file', '/user/foobar/local.json')
      .read().then(function(config) {
        assert.deepEqual(config, {
          foo: 'bar',
          bar: 'baz'
        });
      });
    });
  });
});
