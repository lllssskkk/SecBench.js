//Import dependencies
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');

//Generate the checksum of a file
module.exports.checksum = function(file, opt, cb)
{
  //Check the options
  if(typeof opt === 'function')
  {
    //Save the new callback method
    cb = opt;

    //Initialize the options object
    opt = {};
  }

  //Check for string algorithm
  if(typeof opt === 'string'){ opt = { algorithm: opt }; }

  //Check for no object
  if(typeof opt !== 'object'){ opt = {}; }

  //Check the algorithm option
  if(typeof opt.algorithm !== 'string'){ opt.algorithm = 'md5'; }

  //Check the encoding option
  if(typeof opt.encoding !== 'string'){ opt.encoding = 'hex'; }

  //Check if the file exists
  return fs.stat(file, function(error, stat)
  {
    //Check the error
    if(error){ return cb(error, null); }

    //Check for not a file
    if(stat.isFile() ===false){ return cb(new Error('Provided path is not a file'), null); }

    //Create the new hash
    var hash = crypto.createHash(opt.algorithm);

    //Initialize the read stream
    var reader = fs.createReadStream(file);

    //Read data from file
    reader.on('data', function(data)
    {
      //Update the hash with the new chunk of data
      hash.update(data);
    });

    //Data read end
    reader.on('end', function()
    {
      //Return the checksum fo the file
      return cb(null, hash.digest(opt.encoding));
    });

    //Error event handler
    reader.on('error', function(error)
    {
      //Do the callback with the error
      return cb(error, null);
    });
  });
};

//Copy a file
module.exports.copy = function(input, output, cb)
{
  //Check the callback method
  if(typeof cb !== 'function'){ throw new Error('No callback method provided'); }

  //Check the input file
  if(typeof input !== 'string'){ return cb(new Error('Input path must be a string')); }

  //Check the output file
  if(typeof output !== 'string'){ return cb(new Error('Output path must be a string')); }

  //Parse the input file
  var path_input = path.resolve(process.cwd(), input);

  //Parse the output file
  var path_output = path.resolve(process.cwd(), output);

  //Check the paths
  if(path_input === path_output){ return cb(new Error('Input and Output must not be the same.')); }

  //Create the readable stream
  var reader = fs.createReadStream(path_input);

  //Create the writable stream
  var writer = fs.createWriteStream(path_output);

  //Process is completed
  var completed = false;

  //Done method
  var done = function(error)
  {
    //Check the error
    if(typeof error === 'undefined'){ error = null; }

    //Check if process is completed
    if(completed === false)
    {
      //Set as completed
      completed = true;

      //Destroy the streams
      writer.destroy();
      reader.destroy();

      //Do the callback
      return cb(error);
    }
  };

  //Reader error
  reader.on('error', done);

  //Writer error
  writer.on('error', done);

  //Writer finish method
  writer.on('finish', done);

  //Pipe
  reader.pipe(writer);
};

//Check if a path exists
var fs_exists = function(p, cb)
{
  //Get the status of the path
  return fs.stat(p, function(error, stat)
  {
    //Check the error
    if(error)
    {
      //Check the error code
      if(error.code !== 'ENOENT')
      {
        //Do the callback with the error
        return cb(error, false, stat);
      }
      else
      {
        //Do the callback without error
        return cb(null, false, stat);
      }
    }

    //Do the callback with the stat
    return cb(null, true, stat);
  });
};

//Exports the exists method
module.exports.exists = fs_exists;

//Check if a path is a directory
module.exports.isDir = function(p, cb)
{
  //Check the callback method
  if(typeof cb !== 'function'){ throw new Error('No callback function provided'); }

  //Check if exists
  return fs_exists(p, function(error, exists, stat)
  {
    //Check the error
    if(error || exists === false){ return cb(error, exists); }

    //Check if path is a directory
    return cb(null, stat.isDirectory());
  });
};

//Check if a path is a file
module.exports.isFile = function(p, cb)
{
  //Check the callback method
  if(typeof cb !== 'function'){ throw new Error('No callback function provided'); }

  //Check if exists
  return fs_exists(p, function(error, exists, stat)
  {
    //Check the error
    if(error || exists === false){ return cb(error, exists); }

    //Check if path is a file
    return cb(null, stat.isFile());
  });
};

//Create a directory
module.exports.mkdir = function(folder, cb)
{
  //Check the folder
  if(typeof folder !== 'string'){ return cb(new Error('Invalid folder path')); }

  //Create the folder recursive
  var create_folder = function(dir, callback)
  {
    //Check if the folder exists
    return fs.stat(dir, function(error, stat)
    {
      //Check for no error
      if(!error)
      {
        //Check if folder exists
        if(stat.isDirectory() === true)
        {
          //Continue with the next chunk on the list
          return callback(null);
        }
        else
        {
          //Display the path exists and is a directory
          return callback(new Error('Path ' + dir + ' exists and is not a directory'));
        }
      }
      else
      {
        //Check the error code
        if(error.code === 'ENOENT')
        {
          //Check if the parent directory exists
          return create_folder(path.dirname(dir), function(err)
          {
            //Check the error
            if(err){ return callback(err); }

            //Create the directory
            return fs.mkdir(dir, callback);
          });
        }
        else
        {
          //Do the callback with the error
          return callback(error);
        }
      }
    });
  };

  //Create the folder
  return create_folder(path.resolve(folder), cb);
};

//Get the size of a file
module.exports.size = function(file, cb)
{
  //Get the status of the file
  return fs.stat(file, function(error, stats)
  {
    //Check the error
    if(error){ return cb(error, 0); }

    //Do the callback with the size of the file
    return cb(null, stats.size);
  });
};

//Get the list of files available in a path
module.exports.readdir = function(p, cb)
{
  //Parse the path
  var real_path = path.resolve(process.cwd(), p);

  //Read the content of the path
  return fs.readdir(real_path, { encoding: 'utf8' }, function(error, files)
  {
    //Check the error
    if(error){ return cb(error, []); }

    //Parse each file in the list
    files = files.map(function(file){ return path.join(real_path, file); });

    //Call the callback method with the parsed files list
    return cb(null, files);
  });
};

//Remove a list of files
module.exports.unlink = function(files, cb)
{
  //Check the list of files
  if(typeof files === 'string'){ files = [ files ]; }

  //Remove file method
  var remove_file = function(index)
  {
    //Check the index
    if(index >= files.length)
    {
      //Do the callback
      return cb(null);
    }

    //Get the file to remove
    var file = files[index];

    //Remove the file
    fs.unlink(file, function(error)
    {
      //Check the error
      if(error)
      {
        //Check the error code
        if(error.code !== 'ENOENT')
        {
          //Do the callback with the error
          return cb(error);
        }
      }

      //Continue with the next file
      return remove_file(index + 1);
    });
  };

  //Remove the first file of the list
  return remove_file(0);
};
