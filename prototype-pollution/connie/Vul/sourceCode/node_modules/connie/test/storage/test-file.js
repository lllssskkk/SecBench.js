var fs = require('fs');
var assert = require('assert');
var fileStorage = require('../../lib/storage/file');

var assertThrows = function(promise) {
  return promise.then(function() {
    assert.throws(function() {});
  }, function(err) {
    assert.throws(function() {
      throw err;
    });
  });
};

var removeFile = function(filename) {
  return function() {
    try {
      fs.unlinkSync(filename);
    } catch (err) {

    }
  };
};

describe('File storage', function() {
  describe('.read()', function() {
    it('reads a valid config file', function() {
      var storage = fileStorage('test/fixtures/configfile.json');

      return storage.read().then(function(config) {
        assert.deepEqual({foo: 'bar'}, config);
      });
    });

    it('returns empty object when the file does not exist', function() {
      var storage = fileStorage('unknown.json');

      return storage.read().then(function(config) {
        assert.deepEqual({}, config);
      });
    });

    it('throws an exception on a JSON parse error', function() {
      var storage = fileStorage('test/fixtures/configfile.invalid.json');

      return assertThrows(storage.read());
    });
  });

  describe('.write()', function() {
    beforeEach(removeFile('foobarbaz.json'));
    afterEach(removeFile('foobarbaz.json'));

    it('writes config to file', function() {
      var storage = fileStorage('foobarbaz.json');

      return storage.write({foo: 'bar'}).then(function() {
        assert.equal(fs.readFileSync('foobarbaz.json').toString(), '{\n  "foo": "bar"\n}');
      });
    });

    it('writes empty config when nothing passed to write', function() {
      var storage = fileStorage('foobarbaz.json');

      return storage.write().then(function() {
        assert.equal(fs.readFileSync('foobarbaz.json').toString(), '{}');
      });
    });

    it('overwrites file that already exists', function() {
      before(function() {
        fs.writeFileSync('foobarbaz.json', 'something');
      });

      var storage = fileStorage('foobarbaz.json');

      return storage.write({foo: 'bar'}).then(function() {
        assert.equal(fs.readFileSync('foobarbaz.json').toString(), '{\n  "foo": "bar"\n}');
      });
    });
  });
});
