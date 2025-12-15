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
    var up_dir

    var files = []
      , dirs = []

    stream.queue('<' + options.parentTag + '>\n')

    if(options.showUp) {
      up_dir = path.dirname(dir) + '/'
      stream.queue(
          '<' + options.childTag + '>' +
          '..'.link(up_dir) +
          '</' + options.childTag + '>\n'
      )
    }

    ls(dir).pipe(through(on_dir, done))

    function on_dir(data) {
      if(!data || path.dirname(data.path) !== dir) return done()
      if(options.hideDot && dotfile.test(path.basename(data.path))) return

      var object_name = path.basename(data.path)
        , object_string

      if(data.stat.isDirectory()) {
        dirs.push(object_name + '/')
      } else {
        files.push(object_name)
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
        stream_item(entities[i])
      }

      stream.queue('</' + options.parentTag + '>\n')
      stream.queue(null)

      function stream_item(object_name) {
        object_string = '<' + options.childTag + '>' +
            object_name.link(object_name) + '</' + options.childTag + '>\n'

        stream.queue(object_string)
      }
    }
  }
}
