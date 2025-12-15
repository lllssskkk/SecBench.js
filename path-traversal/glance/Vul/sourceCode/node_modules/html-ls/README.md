html-ls
====

[![Build Status](http://img.shields.io/travis/jarofghosts/html-ls.svg?style=flat)](https://travis-ci.org/jarofghosts/html-ls)
[![npm install](http://img.shields.io/npm/dm/html-ls.svg?style=flat)](https://www.npmjs.org/package/html-ls)

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
    hideDot: false // hide dotfiles from list
  , showUp: false // show `..` at the top
  , dirsFirst: false // put dirs at the top of the list, then files
  , parentTag: 'ul' // opening tag for list
  , childTag: 'li' // child element tag
}
```

## license

MIT
