# utily

> A set of useful functions for node.js

[![npm](https://img.shields.io/npm/v/utily.svg?style=flat-square)](https://www.npmjs.com/package/utily)
[![npm](https://img.shields.io/npm/dt/utily.svg?style=flat-square)](https://www.npmjs.com/package/utily)
[![npm](https://img.shields.io/npm/l/utily.svg?style=flat-square)](https://github.com/jmjuanes/utily)

## Installation 

Use [npm](https://npmjs.com) to install this module:

```
npm install --save utily
```

Now you can import it into your project:

```javascript
var utily = require('utily');
```

## API 

### Common methods 

#### utily.delay(time, fn)

This is just [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout) but with the arguments reverted (first the delay `time`, then the callback `fn` function).

```javascript
utily.delay(1000, function()
{
  console.log('Hello after 1 second!!');
});
```

#### utily.each(items, fn)

Iterate over an `array` or an `object`.

- `items`: `array` or `object` you want to iterate.
- `fn`: function that will be called with each item of the `items` array or object with the following arguments: 
  - `key`: the property name if `items` is an object, or the index if `items` is an array.
  - `value`: the property value if `items` is an object, or the value if `items` is an array.

```javascript
//Iterate over an array 
utily.each([1, 2, 3], function(index, value)
{
  //Display in console 
  console.log(index + ' -> ' + value);
  
  //Continue with the next item in the array 
  return true;
});
// 0 -> 1
// 1 -> 2
// 2 -> 3

//Iterate over an object 
utily.each({ 'key1': 'value1', 'key2': 'value2' }, function(key, value)
{
  //Display in console 
  console.log(key + ' -> ' + value);
  
  //Continue with the next item in the array
  return true;
});
// key1 -> value1
// key2 -> value2
```

You can break the loop at a particular item if you return a `false` boolean in your iterator function.

```javascript
utily.each([1, 2, 3, 4, 5], function(index, value)
{
  //Display in console 
  console.log(index + ' -> ' + value);
  
  //Check the value 
  if(value >= 3){ return false; } 
});
// 0 -> 1
// 1 -> 2
// 2 -> 3
```

#### utily.eachAsync(items, fn, callback)

Asynchronous version of `utily.each`. Iterate over an `array` or an `object` and execute the `callback` when the iteration is finished.

- The `fn` function will be called with the same arguments as the `utily.each` method and with a `next` function, that indicates that the iteration is done and can continue with the next item. 
- The `callback` function will be called when the iteration is finished. 

You can break the iteration by calling the `next` function with a value or an error object. 

```javascript
//List of files 
var files = ['./file1.txt', './file2.txt', './file3.txt'];

//Read all the files
utily.eachAsync(file, function(index, value, next)
{
  //Read the file content
  return fs.readFile(value, function(error, data)
  {
    //If something went wrong -> stop the iteration
    if(error){ return next(error); } 
    
    //Display the file content in console 
    console.log('Content of file ' + index);
    console.log(data);
    
    //Next file in the list 
    return next();
  });
}, function(error)
{
  //Check the error 
  if(error){ return console.log(error.message); } 
  
  //Display done 
  console.log('All files processed!');
});
```


### Array functions 

#### utily.array.clone(array)

Clone an array. Note that if objects exist in the array this method does not do perform a **deep** clone of the content.

```javascript
var array_cloned = utily.array.clone([1, 2, 3, 4]);
```

#### utily.array.has(array, item)

Returns `true` if `item` exists in `array`, `false` if does not.

```javascript
utily.array.has([1, 2, 3, 4], 2); // -> true
utily.array.has([1, 2, 3, 4], 5); // -> false
```

#### utily.array.max(array)

Returns the maximum value in `array`. 

```javascript
utily.array.max([1, 2, 3, 4, 5]); // -> 5
```

#### utily.array.min(array)

Returns the minimum value in `array`.

```javascript
utily.array.min([1, 2, 3, 4, 5]); // -> 1
```

#### utily.array.range(start, end\[, step\])

Returns a new array with values starting in `start` to `end` (included). You can specify the distance between each number in the sequence by providing a `step` value. Default `step` value is `1`.

```javascript
utily.array.range(0, 5); // -> [0, 1, 2, 3, 4, 5]
utily.array.range(0, 4, 2); // -> [0, 2, 4] 
```

#### utily.array.remove(array, item)

Removes a specific `item` of the array `array`. This method also modifies the original array.

```javascript
var list = [ 'bananas', 'oranges', 'apples' ]; 

//Remove an element 
utily.array.remove(list, 'oranges'); // -> list = [ 'bananas', 'apples' ];
```



### File System functions 

#### utily.fs.checksum(file\[, options\], cb)

Generate the checksum of `file`. `options` can be an object with the following options: 

- `algorithm`: a `string` with the algorithm to generate the checksum. Default is `md5`.
- `encoding`: a `string` with the encoding. Default is `hex`.

If `options` is a non-object, it will be treated as the `options.algorithm` option.

```javascript
//Generate the md5 of the file 
utily.fs.checksum('/path/to/file.txt', function(error, sum)
{
  //Check the error 
  if(error){ /* Something went wrong */ }
  
  console.log('Checksum --> ' + sum);
});
```

#### utily.fs.copy(source, destination, cb)

Copy a `source` file to `destination`.

```javascript
utily.fs.copy('/my/source/file.txt', '/my/destination/file.txt', function(error)
{
  //Check the error 
  if(error){ /* Something went wrong */ } 
});
```

#### utily.fs.exists(path, cb)

Check if the provided path exists, and then the `cb` method will be executed with two arguments (`error` and a boolean `exists` that indicates if the path exists).

```javascript
utily.fs.exists('/path/to/my/file.txt', function(error, exists)
{
  //Check the error 
  if(error)
  {
    //Something went wrong...
  }
  
  //Check if the file exists 
  if(exists === true)
  {
    //File exists 
  }
  else 
  {
    //File does not exists...
  }
});
```

#### utily.fs.isDir(path, cb)

Check if the provided path exists and is a directory or not.

```javascript
utily.fs.isDir('/path/to/my/directory', function(error, is_dir)
{
  //Check the error 
  if(error){ /* Something went wrong */ }
  
  //Check if is a directory 
  if(is_dir === true)
  {
    //Path exists and is a directory    
  }
  else
  {
    //Path does not exists ot is not a directory
  }
});
```

#### utily.fs.isFile(path, cb)

Check if the provided path exists and is a file or not.

```javascript
utily.fs.isDir('/path/to/my/file.txt', function(error, is_file)
{
  //Check the error 
  if(error){ /* Something went wrong */ }
  
  //Check if is a file
  if(is_file === true)
  {
    //Path exists and is a file
  }
  else
  {
    //Path does not exists or is not a file
  }
});
```

#### utily.fs.mkdir(path, cb)

Create a folder and all the parent folders of `path`.

```javascript
//Create the folder and all the parent folders (if does not exists)
utily.fs.mkdir('/path/to/my/directory', function(error)
{
  //Check the error 
  if(error){ /* Something went wrong */ }
  
  console.log('Directory created!');
});
```

#### utily.fs.size(file, cb)

Returns the size of the file. The callback function will be executed with an `error` object and the `size` of the file.

```javascript
//Get the size of the file 
utily.fs.size('/path/to/file.txt', function(error, size)
{
  //Check the error 
  if(error)
  {
    //Something went wrong...
  }
  
  console.log('The size of the file is: ' + size);
});
```

#### utily.fs.readdir(path, cb)

Reads the content of a directory. The callback method gets two arguments, `error` and `files`, where `files` is an array with the **real** path of each file in the provided directory.

```javascript
//Content of directory /test/fake/directory: 
// - index.js
// - package.json
// - license.txt

//Read the content of a directory 
return utily.fs.readdit('/test/fake/directory', function(error, files)
{
  //Check the error 
  if(error){ /* display error */ }
  
  //Work with the list of files 
  console.log(files);
  // files = [
  // '/test/fake/directory/index.js', 
  // '/test/fake/directory/package.json', '
  // '/test/fake/directory/license.txt']
});
```


#### utily.fs.unlink(files, cb)

Remove a file or list of files. The `files` argument must be a `string` for a single file, or an `array` with the file paths to remove. 

**Note**: this method does not throw an error if the path does not exists.

```javascript
//Remove multiple files
utily.fs.unlink([ './file1.txt', './file2.txt' ], function(error)
{
  //Check if there is an error 
  if(error)
  {
    //Something went wrong...
  }
  
});

//Remove a single file 
utily.fs.unlink('./another-file.txt', function(error)
{
  //Check if there is an error 
  if(error)
  {
    //Something went wrong...
  }
  
});
```


### Is functions

A set of functions to check the type of a given value. 

#### utily.is.undefined(value)

Return true if `value` is undefined.

```javascript
var a;
var b = 'Hello';
utily.is.undefined(a);  // -> true, `a` is not defined
utily.is.undefined(b);  // -> false, `b` is a string
```

#### utily.is.string(value)

Return true if `value` is a string.

```javascript
utily.is.string('Hello world');   // -> true 
utily.is.string('');              // -> true
utily.is.string({ a: 'Hello' });  // -> false
```

#### utily.is.object(value)

Return true if `value` is an object.

```javascript
utily.is.object({});    // -> true
utily.is.object(null);  // -> false 
```

#### utily.is.array(value)

Return true if `value` is an array.

```javascript
utily.is.array([ 1, 2, 3 ]);  // -> true 
utily.is.array({ a: true });  // -> false
```

#### utily.is.stream(value)

Return true if `value` is a stream.

```javascript
utily.is.stream(fs.createReadStream('file.txt'));  // -> true
utily.is.stream({ });                              // -> false
```

#### utily.is.null(value)

Return true if `value` is `null`.

```javascript
utily.is.null(null);  // -> true
utily.is.null({ });   // -> false
```

#### utily.is.integer(value)

Return true if `value` is an integer number.

```javascript
utily.is.integer(45);   // -> true
utily.is.integer(2.5);  // -> false
```

#### utily.is.number(value)

Return true if `value` is a number;

```javascript
utily.is.number(1235.2);  // --> true
utily.is.number('1234');  // -> false
```

#### utily.is.boolean(value)

Return true if `value` is a boolean.

```javascript
utily.is.boolean(true);  // -> true  
utily.is.boolean(0);     // -> false
```

#### utily.is.function(value)

Return true if `value` is a function.

```javascript
utily.is.function(function(){ return 0; });  // -> true
```

#### utily.is.buffer(value)

Return true if `value` is a buffer.

```javascript
utily.is.buffer(new Buffer(10));  // -> true
```

#### utily.is.regexp(value)

Return true if `value` is a regular expression.

```javascript
utily.is.regexp(/\s/g);  // -> true
```


### JSON functions 

#### utily.json.read(file\[, options\], callback)

Read a JSON `file` and convert it's content to a JSON object using [`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) method.

The `options` object will be passed to [`fs.readFile`](https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback).

```javascript
//Read a JSON file 
utily.json.read('/my/file.json', 'utf8', function(error, data)
{
  //Check the error 
  if(error)
  {
    //Something went wrong
  }
  
  //Print the JSON object in console
  console.log(data);
});
```

#### utily.json.write(file, object\[, opt\], callback)

Converts a JSON `object` to string using the [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) and then it will be written to the provided `file` path.

The `options` object will be passed to [`fs.writeFile`](https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback).

```javascript
//Initialize my object 
var obj = { key1: 'value1', key2: 'value2' };

//Write to a file 
utily.json.write('/my/file.json', obj, 'utf8', function(error)
{
  //Check the error 
  if(error)
  {
    //Something went wrong
  }
});
```


### Object functions 

#### utily.object.each(obj, fn)

Execute `fn` with each pair `key` - `value` in `obj`. 

```javascript
var obj = { key1: 'value1', key2: 'value2', key3: 'value3' };
utily.object.each(obj, function(key, value)
{
  //Display in console
  console.log(key + ' -> ' + value);
});

//Output in console:
// key1 -> value1
// key2 -> value2
// key3 -> value3
```

#### utily.object.keys(obj)

This is just [`Object.keys`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys).

```javascript
var keys = utily.object.keys({ a: 1, b: 2, c: 'hello' }); // --> keys = [ 'a', 'b', 'c' ]
```

#### utily.object.sort(array, keys, order)

Sort an array with objects by the provided `keys` and with the provided `order` (default is `ASC` order).

```javascript
var list = [];
list.push({ name: 'Susan', age: 35 });
list.push({ name: 'Boby', age: 28 });
list.push({ name: 'Andy', age: 24 });
list.push({ name: 'Sarah', age: 29 });

//Sort the list 
utily.object.sort(list, 'name', 'ASC');

//Print the array 
console.log(list);
// [ { name: 'Andy', age: 24 }, 
// { name: 'Boby', age: 28 }, 
// { name: 'Sarah', age: 29 }, 
// { name: 'Susan', age: 35 } ]

```

#### utily.object.values(obj)

Returns an array of a given object's own enumerable property values. It's a ponyfill of the [ `Object.values`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values) method.

```javascript
var values = utily.object.values({ a: 1, b: 2, c: 'hello' }); // -> values = [ 1, 2, 'hello' ]
```


### String functions 

#### utily.string.format(str, obj)

Replace all handlebars expressions from `str` with values of `obj`.

```javascript
utily.string.format('My car is {{ color }}!', { color: 'blue' }); // --> "My car is blue!"
```

#### utily.string.is_empty(str)

Return true if `str` is an empty string.

```javascript
utily.string.is_empty('');   // -> true
utily.string.is_empty(' ');  // -> false
```

#### utily.string.is_lowercase(str)

Return true if `str` is a string in lowercase format.

```javascript
utily.string.is_lowercase('hello world');  // -> true
utily.string.is_lowercase('Hello World');  // -> false
```

#### utily.string.is_uppercase(str)

Return true if `str` is a string in uppercase format;

```javascript
utily.string.is_uppercase('HELLO WORLD');  // -> true
utily.string.is_uppercase('Hello World');  // -> false
```

#### utily.string.camel_case(str)

Return the camel-case format of `str`.

```javascript
utily.string.camel_case('hello world');  // -> 'helloWorld'
```

#### utily.string.capitalize(str)

Return the capitalized format of `str`.

```javascript
utily.string.capitalize('hello world');  // -> 'Hello world'
```

#### utily.string.unique()

Generate a unique random string of 15 characters.

```javascript
var str = utily.string.unique();  // -> str = 'wv1ufiqj5e6xd3k'
```


## License 

Under the [MIT LICENSE](./LICENSE).
