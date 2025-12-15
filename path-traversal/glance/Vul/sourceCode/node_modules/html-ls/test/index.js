var path = require('path')
  , fs = require('fs')

var htmlls = require('../index.js')
  , test = require('tape')

test('streams dirs first when specified', function(t) {
  t.plan(8)

  var step = 0
    , stream
  
  stream = htmlls(
      path.join(__dirname, 'test-htmlls')
    , {showUp: true, dirsFirst: true}
  )

  stream.on('data', function (data) {
    data = '' + data

    switch(step) {
      case 0:
        t.equal(data, parent('ul'), 'opening tag')
        break
      case 1:
        t.ok(/\.\./.test(data))
        break
      case 2:
        t.equal(data, child('li', 'dir/'))
        break
      case 3:
        t.equal(data, child('li', '.test'))
        break
      case 4:
        t.equal(data, child('li', 'a.txt'))
        break
      case 5:
        t.equal(data, child('li', 'file.txt'))
        break
      case 6:
        t.equal(data, parent('ul', true), 'closing tag')
        break
    }

    step++
  })

  stream.on('end', check)
  function check() {
    t.equal(step, 7)
  }
})

test('.. is configurable', function(t) {
  t.plan(6)

  var step = 0
    , stream
  
  stream = htmlls(
      path.join(__dirname, 'test-htmlls')
    , {hideDot: true}
  )

  stream.on('data', function (data) {
    data = '' + data

    switch(step) {
      case 0:
        t.equal(data, parent('ul'), 'opening tag')
        break
      case 1:
        t.equal(data, child('li', 'a.txt'))
        break
      case 2:
        t.equal(data, child('li', 'dir/'))
        break
      case 3:
        t.equal(data, child('li', 'file.txt'))
        break
      case 4:
        t.equal(data, parent('ul', true), 'closing tag')
        break
    }

    step++
  })

  stream.on('end', check)

  function check() {
    t.equal(step, 5)
  }
})

test('configurable tags', function(t) {
  t.plan(7)

  var step = 0
    , stream
  
  stream = htmlls(
      path.join(__dirname, 'test-htmlls')
    , {hideDot: true, showUp: true, parentTag: 'select', childTag: 'option'}
  )

  stream.on('data', function (data) {
    data = '' + data

    switch(step) {
      case 0:
        t.equal(data, parent('select'), 'opening tag')
        break
      case 1:
        t.ok(/\.\./.test(data))
        break
      case 2:
        t.equal(data, child('option', 'a.txt'))
        break
      case 3:
        t.equal(data, child('option', 'dir/'))
        break
      case 4:
        t.equal(data, child('option', 'file.txt'))
        break
      case 5:
        t.equal(data, parent('select', true), 'closing tag')
        break
    }

    step++
  })

  stream.on('end', check)
  function check() {
    t.equal(step, 6)
  }
})
function child(tag, name) {
  return '<' + tag + '><a href="' + name + '">' + name + '</a></' + tag + '>\n'
}

function parent(tag, close) {
  return '<' + (close ? '/' : '') + tag + '>\n'
}
