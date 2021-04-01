/**
 * Check if {src} is not undefined
 *
 * @param {any} src
 * @returns {boolean}
 */
export const isset = (src) => src !== undefined;

/**
 * Return {a} if it passed {validator}, or return {b}
 *
 * @param {any} a
 * @param {any} b
 * @param {function} validator
 * @returns {a|b}
 */
export const useor = (a, b, validator = isset) => (
  validator(a) ? a : b
);

/**
 * Check if {src} is boolean
 *
 * @param {any} src
 * @returns {boolean}
 */
export const isbool = (src) => typeof src === 'boolean';

/**
 * Convert {src} to boolean
 *
 * @param {any} src
 * @returns {boolean}
 */
export const tobool = (src) => Boolean(src);

/**
 * Check if {src} is number
 *
 * @param {any} src
 * @returns {number}
 */
export const isnum = (src) => !Number.isNaN(src);

/**
 * Convert {src} to number
 * @param {any} src
 * @returns {number}
 */
export const tonum = (src) => parseFloat(src);

/**
 * Check if {src} is integer
 *
 * @param {any} src
 * @returns {boolean}
 */
// eslint-disable-next-line no-bitwise
export const isint = (src) => isnum(src) && src === (src | 0);

/**
 * Check if {src} is string
 *
 * @param {any} src
 * @returns {boolean}
 */
export const isstr = (src) => typeof src === 'string' || (isset(src) && src instanceof String);

/**
 * Convert {src} to string
 *
 * @param {any} src
 * @returns {string}
 */
export const tostr = (src) => String(src);

/**
 * Check if {src} is function
 *
 * @param {any} src
 * @returns {boolean}
 */
export const isfunc = (src) => typeof src === 'function';

/**
 * Check if {src} is array
 *
 * @param {any} src
 * @returns {boolean}
 */
export const isarray = (src) => Array.isArray(src);

/**
 * Check if {src} is able to be array
 *
 * @param {any} src
 * @returns {boolean}
 */
export const arrayable = (src) => isset(src) && isint(src.length) && src.length >= 0;

/**
 * Convert {src} to array
 *
 * @param {any} src
 * @returns {array}
 */
export const toarray = (src) => Array.from(src);

/**
 * Get keys of {obj}
 *
 * @param {object} obj
 * @returns {array}
 */
export const objKeys = (obj) => Object.keys(obj);

/**
 * Get values of {obj}
 *
 * @param {object} obj
 * @returns {array}
 */
export const objValues = (obj) => objKeys(obj).map((key) => obj[key]);

/**
 * Traverse values of {obj}
 *
 * @param {object} obj
 * @param {function} func
 * @param {any} self as this for {func}
 * @returns {void}
 */
export const objForEach = (obj, func = () => {}, self = this) => (
  objKeys(obj).forEach((key) => func.call(self, obj[key], key, obj))
);

/**
 * Traverse values of {obj} with passing {initial}
 * @param {object} obj
 * @param {function} func
 * @param {any} initial
 * @returns {any} passed by {func}
 */
export const objReduce = (obj, func = () => {}, initial) => (
  objKeys(obj).reduce((past, key) => func(past, obj[key], key, obj), initial)
);

/**
 * Fill object with keys of {obj} with result of {func}
 *
 * @param {object} obj
 * @param {function} func
 * @param {any} self
 * @returns {object}
 */
export const objMap = (obj, func = () => {}, self = this) => (
  objReduce(obj, (past, val, key) => ({
    ...past,
    [key]: func.call(self, val, key, obj),
  }), {})
);

/**
 * Check if {src} is element
 *
 * @param {any} src
 * @returns {boolean}
 */
export const iselem = (src) => (
  src instanceof Element
  || src instanceof Window
  || src instanceof Document
);

/**
 * Get style of {dom}
 *
 * @param {DOM} dom
 * @returns {object} of style
 */
export const getStyle = (dom) => (
  dom.currentStyle
  || window?.getComputedStyle(dom)
  || dom.style
);
