//Import dependencies
var fs = require('fs');

//Read a JSON file
module.exports.read = function(file, opt, cb)
{
  //Parse the callback method
  cb = (typeof opt === 'function') ? opt : cb;

  //Parse the options
  opt = (typeof opt === 'function') ? {} : opt;

  //Check the encoding value
  if(typeof opt.encoding !== 'string'){ opt.encoding = 'utf8'; }

  //Read the file
  return fs.readFile(file, opt, function(error, data)
  {
    //Check the error
    if(error){ return cb(error, null); }

    //Output json object
    var obj = null;

    //Convert the data to json
    try
    {
      //Convert to a json object
      obj = JSON.parse(data);
    }
    catch(e)
    {
      //Call the callback with the parse error
      return cb(e, null);
    }

    //Call the callback with the parsed JSON
    return cb(null, obj);
  });
};

//Write a JSON file
module.exports.write = function(file, content, opt, cb)
{
  //Parse the callback method
  cb = (typeof opt === 'function') ? opt : cb;

  //Parse the options
  opt = (typeof opt === 'function') ? {} : opt;

  //Check for string options
  if(typeof opt === 'string'){ opt = { encoding: opt }; }

  //Check the encoding value
  if(typeof opt.encoding !== 'string'){ opt.encoding = 'utf8'; }

  //Check the space option
  if(typeof opt.space !== 'string'){ opt.space = '  '; }

  //Content in string format
  var data = null;

  //Convert the content to string
  try
  {
    data = JSON.stringify(content, null, opt.space);
  }
  catch(error)
  {
    //Call the callback with the error
    return cb(error);
  }

  //Write to the file
  return fs.writeFile(file, data, opt, function(error)
  {
    //Call the callback with the error
    return cb(error);
  });
};
