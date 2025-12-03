# @lyngs/digger

## What is this
`@lyngs/digger` provides a function for user to dig value out of a target.
Use `digger()` method to `get`or`set` value, from deep inside of an `object`or`array`.

## Install
```
npm install @lyngs/digger
```

## Usage
### Get
```javascript
// import @lyngs/digger
import digger from '@lyngs/digger';

const target = {
  people: [
    { name: 'shook' }
  ],
};

console.log(digger(target, 'people[0].name')); // 'shook'
```
### Set
```javascript
digger(target, 'people[0].name', 'oral'); // 'oral'
```
### Set with `extend` option
```javascript
// people[1] does'nt exists
digger(target, 'people[1].name', 'who'); // undefined

// layer extended when function context can't find certain property
digger(target, 'people[1].name', 'who', { extend: true }); // 'who'
```
### Set with `untie` option
```javascript
// people[0].name has been updated to anomymous function
digger(target, 'people[0].name', () => 'oral'); // [Function (anonymous)]

// param 'update' has been untied to get the result of function
digger(target, 'people[0].name', () => 'oral', { untie: true }); // 'oral'
```

### Build
```
npm run build
```

### Test
```
npm run test
```