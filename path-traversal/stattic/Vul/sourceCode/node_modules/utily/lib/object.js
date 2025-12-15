//Get the keys of an object
module.exports.keys = function(obj)
{
  //Return the object keys
  return Object.keys(obj);
};

//Get the values of an object
module.exports.values = function(obj)
{
  //Return the list of values of this object
  return Object.keys(obj).map(function(key)
  {
    //Replace with the value associated
    return obj[key];
  });
};

//Execute a function for each pair key-value in an object
module.exports.each = function(obj, fn)
{
  //Iterate over all the elements in the object
  Object.keys(obj).forEach(function(key)
  {
    //Call the function
    fn.call(null, key, obj[key]);
  });
};

//Sort a list of objects by key
module.exports.sort = function(array, keys, order)
{
  //Check the keys to sort
  if(typeof keys === 'undefined'){ return array; }

  //Check if columns is not an array
  if(Array.isArray(keys) === false){ keys = [ keys ]; }

  //Check the order
  if(typeof order === 'undefined')
  {
    //For each key
    for(var i = 0; i < keys.length; i++)
    {
      //Add the ASC order
      order.push('ASC');
    }
  }
  else
  {
    //Check if order is not an array
    if(Array.isArray(order) === false){ order = [ order ]; }

    //Parse the order array
    order = order.map(function(el){ return el.toUpperCase(); });

    //Check the order array length
    if(order.length < keys.length)
    {
      //Complete the order array
      for(var i = order.length; i < keys.length; i++)
      {
        //Add the ASC order
        order.push('ASC');
      }
    }
  }

  //Sort the array
  array.sort(function(left, right)
  {
    //Compare all the keys
    for(var i = 0; i < keys.length; i++)
    {
      //Get the key
      var key = keys[i];

      //Check if que difference is numeric
      var numeric = !isNaN(+left[key] - +right[key]);

      //Get the values
      var a = (numeric === true) ? +left[key] : left[key].toLowerCase();
      var b = (numeric === true) ? +right[key] : right[key].toLowerCase();

      //Check the values
      if(a < b)
      {
        //Check the order
        return (order[i] === 'ASC') ? -1 : 1;
      }
      else if(a > b)
      {
        //Check the order
        return (order[i] === 'ASC') ? 1 : -1;
      }
    }

    //Default, return 0
    return 0;
  });

  //Return the array
  return array;
};
