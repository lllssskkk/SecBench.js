import * as checkIsProxy from 'is-proxy';

// check-is(Proxy)
export const isProxy = checkIsProxy.isProxy;

// check-is(Object)
export const isObject = target => Object.prototype.toString.call(target) === '[object Object]' && !isProxy(target);

// check-is(Array)
export const isArray = target => Array.isArray(target);

// check-is(Set)
export const isSet = target => target instanceof Set;

// check-is(Map)
export const isMap = target => target instanceof Map;

// check if is certain type
export const isType = (target, type) => {
  return {
    object: isObject,
    array: isArray,
    set: isSet,
    map: isMap,
    proxy: isProxy,
  }?.[type]?.(target) ?? false;
};

// upper-case the first letter of string
export const formatType = (type) => {
  const array = type.split('');
  array[0] = array[0].toUpperCase();
  return array.join('');
};

// throw a type error
export const typeError = (value, type) => new Error(`Type-Error: ${value} is not an instance of ${formatType(type)}`);