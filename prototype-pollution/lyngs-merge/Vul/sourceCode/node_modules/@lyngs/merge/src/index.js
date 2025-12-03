import {
  isObject, isArray, isSet, isMap, isType,
  typeError,
} from './util';

// merge value to a target
const mergeProperty = (target, value) => {
  if (isObject(value)) {
    const merged = target ?? {};
    return mergeObject(merged, value);
  } else if (isArray(value)) {
    const merged = isArray(target) ? target : [];
    return mergeArray(merged, value);
  } else if (isSet(value)) {
    const merged = isSet(target) ? target : new Set();
    return mergeSet(merged, value);
  } else if (isMap(value)) {
    const merged = isMap(target) ? target : new Map();
    return mergeMap(merged, value);
  } else {
    return value;
  }
};

// merge Objects
const mergeObject = (...objects) => {
  return objects.reduce((collection, object) => {
    if (!isType(object, 'object')) {
      throw typeError(object, 'object');
    }

    if (!isType(collection, 'object')) {
      return object;
    } else if (!Reflect.ownKeys(collection).length) {
      return Object.assign(collection, object);
    }

    return Reflect.ownKeys(object).reduce((merged, key) => {
      merged[key] = mergeProperty(merged[key], object[key]);
      return merged;
    }, collection);
  });
};

// merge Arrays
const mergeArray = (...arrays) => {
  return arrays.reduce((collection, array) => {
    if (!isType(array, 'array')) {
      throw typeError(array, 'array');
    }

    if (!isType(collection, 'array')) {
      return array;
    } else if (!collection.length) {
      return collection.concat(array);
    }

    array.forEach((arrayItem, arrayIndex) => {
      collection[arrayIndex] = mergeProperty(collection[arrayIndex], arrayItem);
      return collection;
    });
    return collection;
  });
};

// merge Sets
const mergeSet = (...sets) => {
  const result = sets.reduce((collection, set) => {
    if (!isType(set, 'set')) {
      throw typeError(set, 'set');
    }
    [ ...set ].forEach((value, index) => {
      collection[index] = mergeProperty(collection[index], value);
    });
    return collection;
  }, []);
  return new Set([ ...result ]);
};

// merge Maps
const mergeMap = (...maps) => {
  return maps.reduce((collection, map) => {
    if (!isType(map, 'map')) {
      throw typeError(map, 'map');
    }
    for (let [key, value] of map.entries()) {
      collection.set(key, mergeProperty(collection.get(key), value));
    }
    return collection;
  }, new Map());
};

// main function, merge freely
// also this is the default export of the module
const merge = (...params) => {
  return params.reduce((collection, param) => {
    return mergeProperty(collection, param);
  });
};

// exports
export {
  merge,
  mergeObject,
  mergeArray,
  mergeSet,
  mergeMap,
};
export default merge;