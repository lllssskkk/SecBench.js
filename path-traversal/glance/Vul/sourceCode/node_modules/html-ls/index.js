var path = require('path')

var through = require('through')
  , ls = require('ls-stream')

module.exports = ls_html

function ls_html(dir, options) {
  var stream = through()
    , dotfile = /^\./

  options = options || {}
  options.parentTag = options.parentTag || 'ul'
  options.childTag = options.childTag || 'li'

  process.nextTick(go)
  
  return stream

  function go() {
    var files = []
      , dirs = []
      , upDir

    stream.queue('<' + options.parentTag + '>\n')

    if(options.showUp) {
      upDir = path.dirname(dir) + '/'
      stream.queue(
          '<' + options.childTag + '>' +
          '..'.link(upDir) +
          '</' + options.childTag + '>\n'
      )
    }

    ls(dir).pipe(through(onDir, done))

    function onDir(data) {
      if(!data || path.dirname(data.path) !== dir) return done()
      if(options.hideDot && dotfile.test(path.basename(data.path))) return

      var objectName = path.basename(data.path)
        , objectString

      if(data.stat.isDirectory()) {
        dirs.push(objectName + '/')
      } else {
        files.push(objectName)
      }
    }

    function done() {
      var entities

      if(options.dirsFirst) {
        entities = dirs.sort().concat(files.sort())
      } else {
        entities = (dirs.concat(files)).sort()
      }

      for(var i = 0, l = entities.length; i < l; ++i) {
        streamItem(entities[i])
      }

      stream.queue('</' + options.parentTag + '>\n')
      stream.queue(null)

      function streamItem(objectName) {
        objectString = '<' + options.childTag + '>' +
            objectName.link(objectName) + '</' + options.childTag + '>\n'

        stream.queue(objectString)
      }
    }
  }
}
