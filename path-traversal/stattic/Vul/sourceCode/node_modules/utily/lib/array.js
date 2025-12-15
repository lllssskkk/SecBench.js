//Clone an array
module.exports.clone = function(array)
{
  //Return a cloned array
  return array.slice(0);
};

//Check if an element exists inside the array
module.exports.has = function(array, item)
{
  //Return if the element exists
  return array.indexOf(item) !== -1;
};

//Get the max value in an array
module.exports.max = function(array)
{
  //Return the max value
  return Math.max.apply(Math, array);
};

//Get the min value in an array
module.exports.min = function(obj)
{
  //Return the min value
  return Math.min.apply(Math, obj);
};

//Return a range of values
module.exports.range = function(start, end, step)
{
  //Check the start value
  if(typeof start !== 'number'){ return []; }

  //Check the end value
  if(typeof end !== 'number'){ return []; }

  //Check the step value
  if(typeof step !== 'number'){ step = 1; }

  //Get the range length
  var len = Math.floor((end - start) / step) + 1;

  //Build the range array elements
  return Array(len).fill().map(function(el, idx){return start + (idx * step); });
};

//Remove an element of the array
module.exports.remove = function(array, item)
{
  //Get the index of the item
  var index = array.indexOf(item);

  //Check the index
  if(index !== -1)
  {
    //Remove the item from the array
    array.splice(index, 1);
  }

  //Return the array
  return array;
};
