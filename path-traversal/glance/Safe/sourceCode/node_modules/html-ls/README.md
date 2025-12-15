html-ls
===

[![Build Status](https://travis-ci.org/jarofghosts/html-ls.png?branch=master)](https://travis-ci.org/jarofghosts/html-ls)

pretty print directory list in html

## usage

```js
var htmlls = require('html-ls')

htmlls('/var/www').pipe(process.stdout)
```

## options

the optional second argument can contain an options object looking something
like this (with defaults noted):

```js
{
  hideDot: false, // hide dotfiles from list
  showUp: false, // show `..` at the top
  dirsFirst: false, // put dirs at the top of the list, then files
  parentTag: 'ul', // opening tag for list
  childTag: 'li' // child element tag
}
```

## license

MIT
