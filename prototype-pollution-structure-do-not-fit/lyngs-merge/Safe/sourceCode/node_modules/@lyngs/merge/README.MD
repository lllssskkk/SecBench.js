# @lyngs/merge

## What is this
`@lyngs/merge` provides a function for user to merge value, just like `Object.assign()` did.
But the difference is `merge()` will literally merge every layers of params.
> support types: `Object`/`Array`/`Set`/`Map`.

## Install
```
npm install @lyngs/merge
```

## Usage
```javascript
// import @lyngs/merge
import merge from '@lyngs/merge';

const target = {
  info: {
    weather: 'sunny',
  },
  people: [
    { name: 'shook', age: 16 }
  ],
};

merge(target,
  {
    info: {
      dateTime: Date.now(),
      weather: 'cloudy',
    },
  },
  {
    people: [
      { name: 'oral' },
      { name: 'lyngs', age: 15 },
    ],
  }
);

console.log(target);
/**
 {
	info: {
		dateTime: 1605451585612,
		weather: 'cloudy',
	}，
	people: [
		{ name: 'oral', age: 16 },
		{ name: 'lyngs', age: 15 },
	],
}
 **/
```

### Build
```
npm run build
```

### Test
```
npm run test
```
