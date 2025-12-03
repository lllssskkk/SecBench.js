var fs = require('fs');
var assert = require('assert');
var dirStorage = require('../../lib/storage/dir');

var VALID_CONFIG = {
  server: {
    port: 3000
  },
  social: {
    facebook: {
      key: 'a58240fc018b7344ae9ff7502dd331c8',
      secret: '303e9aef0e645e4abbb1758fda7982f58a66c04b263d91d7efbe7898ef0838b8'
    }
  }
};

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

describe('Directory storage', function() {
  describe('.read()', function() {
    it('reads a valid config directory', function() {
      var storage = dirStorage('test/fixtures/configdir');
      
      return storage.read().then(function(config) {
        assert.deepEqual(VALID_CONFIG, config);
      });
    });
  
    it('returns empty object when the directory does not exist', function() {
      var storage = dirStorage('unknown');
    
      return storage.read().then(function(config) {
        assert.deepEqual({}, config);
      });
    });
  
    it('throws an exception on a JSON parse error', function() {
      var storage = dirStorage('test/fixtures/configdir.invalid');
      
      return assertThrows(storage.read());
    });
  });
  
//   describe('.write()', function() {
//     beforeEach(removeFile('foobarbaz.json'));
//     afterEach(removeFile('foobarbaz.json'));
//
//     it('writes config to file', function() {
//       var storage = dirStorage('foobarbaz.json');
//
//       return storage.write({foo: 'bar'}).then(function() {
//         assert.equal(fs.readFileSync('foobarbaz.json').toString(), '{\n  "foo": "bar"\n}');
//       });
//     });
//
//     it('writes empty config when nothing passed to write', function() {
//       var storage = dirStorage('foobarbaz.json');
//
//       return storage.write().then(function() {
//         assert.equal(fs.readFileSync('foobarbaz.json').toString(), '{}');
//       });
//     });
//
//     it('overwrites file that already exists', function() {
//       before(function() {
//         fs.writeFileSync('foobarbaz.json', 'something');
//       });
//
//       var storage = dirStorage('foobarbaz.json');
//
//       return storage.write({foo: 'bar'}).then(function() {
//         assert.equal(fs.readFileSync('foobarbaz.json').toString(), '{\n  "foo": "bar"\n}');
//       });
//     });
//   });
});
