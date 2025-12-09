// find or update property inside of a object/array

// symbols

/**
 * this symbol represents the default state of param 'update' inside of function digger().
 * @type {symbol}
 */
const EmptyUpdate = Symbol('empty-update');

// checkers

/**
 * check if the target is empty.
 * @param target {any} any value that needs to be check.
 * @returns {boolean}
 */
const isEmpty = target => target === void 0 || target === null;

/**
 * check if the target is quoted by double-quotes or single-quotes.
 * @param target {string} string type value that needs to be check.
 * @returns {boolean}
 */
const isQuoted = target => /^('.+'|".+")$/g.test(target);

/**
 * check if the target is a number type value.
 * @param target {string|number} string or number type value that needs to be check.
 * @returns {boolean}
 */
const isNumber = target => !Number.isNaN(+target) && Number.isFinite(+target);

// filters

/**
 * find matches out of string.
 * @param target {string} - target string like `object.people[0]['name']`.
 * @returns {string[]} - string array, like [ 'object', 'people', '0', "'name'" ]
 */
const splitFinder = target => target.split(/(?:\]\[|\]\.|\.|\[|\])+?/g);

/**
 * filter an array, return an array with no empty value inside.
 * @param array {any[]}
 * @returns {any[]}
 */
const removeEmptyInArray = array => array.filter(value => !!value);

/**
 * remove quotes that are aside the string.
 * @param string {string}
 * @returns {string}
 */
const removeQuotesInString = string => string.replace(/(['"])/g, '');

// main function

/**
 * dig value in any level.
 * example: digger({ people: [ { name: 'shook' } ] }, 'people[0].name');
 * result: 'shook';
 * @param caller {object|*[]}
 * @param find {string}
 * @param [update] {*}
 * @param [untie] {boolean}
 * @param [extend] {boolean}
 * @returns {*}
 */
const digger = (
  caller,
  find,
  update = EmptyUpdate,
  {
    untie = false,
    extend = false,
  } = {}
) => {
  if (isEmpty(caller) || isEmpty(find)) return void 0;

  const classified = removeEmptyInArray(splitFinder(find));
  let   stand      = caller,
        index      = 0;

  for (index = 0; index < classified.length; index++) {
    let current = classified[index];

    if (isQuoted(current)) {
      current = removeQuotesInString(current);
    } else if (isNumber(current)) {
      current = Number(current);
    }
    if (isEmpty(stand[current])) {
      if (extend && update !== EmptyUpdate && index + 1 < classified.length) {
        const next = stand[current + 1];
        stand[current] = isQuoted(next) ? {} : isNumber(next) ? [] : {};
      } else if (!extend || update === EmptyUpdate) {
        break;
      }
    }
    if (update !== EmptyUpdate && index + 1 === classified.length) {
      stand[current] = untie && typeof update === 'function' ? update(stand[current]) : update;
    }

    stand = stand[current];
  }

  return index === classified.length ? stand : void 0;
};

export {
  digger,
};
export default digger;