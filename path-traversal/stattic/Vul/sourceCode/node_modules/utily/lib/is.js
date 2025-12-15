//Check if a value is undefined
module.exports.undefined = function(value)
{
  return typeof value === 'undefined';
};

//Check if a value is a string
module.exports.string = function(value)
{
  return typeof value === 'string';
};

//Check if a value is an object
module.exports.object = function(value)
{
  return typeof value === 'object' && value !== null;
};

//Check if a value is an array
module.exports.array = function(value)
{
  return typeof value === 'object' && value !== null && Array.isArray(value) === true;
};

//Check if a value is a stream
module.exports.stream = function(value)
{
  return value !== null && typeof value === 'object' && typeof value.pipe === 'function';
};

//Check if a value is null
module.exports.null = function(value)
{
  return value === null;
};

//Check if a value is an integer
module.exports.integer = function(value)
{
  return typeof value === 'number' && parseInt(value) === value;
};

//Check if a value is a number
module.exports.number = function(value)
{
  return typeof value === 'number';
};

//Check if a value is a boolean
module.exports.boolean = function(value)
{
  return typeof value === 'boolean' && (value === true || value === false);
};

//Check if a value is a function
module.exports.function = function(value)
{
  return typeof value === 'function' && value instanceof Function;
};

//Check if a value is a buffer
module.exports.buffer = function(value)
{
  return value instanceof Buffer;
};

//Check if a value is a regular expression
module.exports.regexp = function(value)
{
  return value instanceof RegExp;
};
