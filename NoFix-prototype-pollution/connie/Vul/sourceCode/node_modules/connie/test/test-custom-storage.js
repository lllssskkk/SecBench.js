var customStorage = function(connie) {
  connie.storage.custom = function() {
    return {
      
    };
  };
};


var assert = require('assert');
var connie = require('../');
customStorage(connie);

describe('Custom Storage', function() {
  it('Can create custom storage', function() {
    var config = connie('custom');
    assert(config.constructor === connie.Config);
  });
});
