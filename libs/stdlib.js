'use strict';


export const isset = (o) => 'undefined' !== typeof o;
export const useor = (a, b, f = isset) => f(a) ?a :b;
export const isbool = (b) => 'boolean' === typeof b;
export const tobool = (b) => Boolean(b);
export const isnum = (n) => !isNaN(n);
export const tonum = (n) => parseFloat(n);
export const isint = (n) => isnum(n) && n === n | 0;
export const isstr = (s) => 'string' === typeof s || (isset(s) && s instanceof String);
export const tostr = (s) => String(s);
export const isfunc = (f) => 'function' === typeof f;
export const isarray = (a) => Array.isArray(a);
export const arrayable = (a) => isset(a) && isint(a.length) && 0 <= a.length;
export const toarray = (a) => Array.from(a);
export const objKeys = (o) => Object.keys(o);
export const objForEach = (o, f = ()=>{}, t = this) => objKeys(o).forEach((k) => f.call(t, o[k], k, o));
export const objReduce = (o, f = ()=>{}, s) => objKeys(o).reduce((s, k) => f(s, o[k], k, o), s);
export const objMap = (o, f = ()=>{}, t = this) => objReduce(o, (s, v, k) => ({ ...s, [k]: f.call(t, v, k, o) }), {});
export const objValues = (o) => objReduce(o, (a, v) => a.concat(v), []);
export const iselem = (e) => e instanceof Element || e instanceof Window || e instanceof Document;
export const getStyle = (d) => d.currentStyle || window.getComputedStyle(d) || d.style;
export const stdDoms = (...doms) => doms.reduce((arr, dom) => {
  if (iselem(dom)) {
    return arr.includes(dom) ?arr :arr.concat(dom);
  } else if (arrayable(dom)) {
    return arr.concat(stdDoms(...toarray(dom)));
  }
  throw new Error(`Invalid element: ${tostr(dom)}`);
}, []);
