//Tasks list
var tasks = {};

//Run a task by name
var task_run = function(name)
{
  //Check if the queue exists
  if(typeof tasks[name] !== 'object'){ return; }

  //Check if queue is paused
  if(tasks[name].paused === true)
  {
    //Set task queue running false
    tasks[name].running = false;
  }
  else
  {
    //Set queue running
    tasks[name].running = true;

    //Check the number of tasks on this tag
    if(tasks[name].handlers.length === 0)
    {
      //Delete this path object
      delete tasks[name];
    }
    else
    {
      //Get the function to run
      var handler = tasks[name].handlers.shift();

      //Run this task
      return handler.call(null, function()
      {
        //Continue with the next task
        return process.nextTick(function()
        {
          //Continue with the next task in the queue
          return task_run(name);
        });
      });
    }
  }
};

//Add a new function to the queue
module.exports.add = function(name, handler)
{
  //Check the tag
  if(typeof name !== 'string'){ throw new Error('No task name provided'); }

  //Check the task function
  if(typeof handler !== 'function'){ throw new Error('No task function provided'); }

  //Check if this task name exists
  if(typeof tasks[name] === 'undefined')
  {
    //Initialize the tasks list
    tasks[name] = { handlers: [ handler ], running: false, paused: false };

    //Run the task
    return task_run(name);
  }
  else
  {
    //Add the handler method to this task
    tasks[name].handlers.push(handler);
  }
};

//Cancel all the tasks associated with a name
module.exports.cancel = function(name)
{
  //Check if this tag exists in the queue
  if(typeof tasks[name] !== 'object'){ return; }

  //Delete this task
  delete tasks[name];
};

//Pause a task queue
module.exports.pause = function(name)
{
  //Check if this tag exists in the queue
  if(typeof tasks[name] !== 'object'){ return; }

  //Pause this tag
  tasks[name].paused = true;
};

//Resume a task queue
module.exports.resume = function(name)
{
  //Check if this tag exists in the queue
  if(typeof tasks[name] !== 'object'){ return; }

  //Check if this tag is not paused
  if(tasks[name].paused === false){ return; }

  //Set queue paused as false
  tasks[name].paused = false;

  //Check if queue is running
  if(tasks[name].running === true){ return; }

  //Resume the task queue
  return task_run(name);
};
