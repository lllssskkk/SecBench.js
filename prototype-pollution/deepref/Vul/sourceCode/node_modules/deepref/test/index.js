var chai = require('chai');
var assert = chai.assert,
    expect = chai.expect,
    should = chai.should();
var deepref = require('../index');
var set = deepref.set;
var decorate = deepref.decorate;
var undecorate = deepref.undecorate;

describe('#set', function() {
  it('sets obj[0] to true', function() {
    var obj = set({}, '0', true);
    obj[0].should.equal(true);
  });

  it('sets obj.a to true', function() {
    var obj = set({}, 'a', true);
    obj.a.should.equal(true);
  });

  it('sets obj.a.b[0] to true', function() {
    var obj = set({}, 'a.b.0', true);
    obj.a.b[0].should.equal(true);
  });

  it('sets obj to ["A","B","C"]', function() {
    var obj = {};
    obj = set(obj, '0', 'A');
    obj = set(obj, '1', 'B');
    obj = set(obj, '2', 'C');
    obj[0].should.equal('A');
    obj[1].should.equal('B');
    obj[2].should.equal('C');
  });

  it('sets obj.a to ["A","B","C"]', function() {
    var obj = {};
    obj = set(obj, 'a.0', 'A');
    obj = set(obj, 'a.1', 'B');
    obj = set(obj, 'a.2', 'C');
    obj.a[0].should.equal('A');
    obj.a[1].should.equal('B');
    obj.a[2].should.equal('C');
  });
});

describe('#decorate', function() {
  it('gives obj setKey method', function() {
    var obj = {};
    decorate(obj);
    expect(obj.setKey).to.be.a('function');
  });

  it('obj.setKey(\'a.b\') sets obj.a.b to 1', function() {
    var obj = {};
    decorate(obj);
    obj.setKey('a.b', 1);
    obj.a.b.should.equal(1);
  });
});

describe('#undecorate', function() {
  it('removes setKey method from object', function() {
    var obj = {};
    decorate(obj);
    expect(obj.setKey).to.be.a('function');
    undecorate(obj);
    expect(obj.setKey).to.not.be.a('function');
  });
});