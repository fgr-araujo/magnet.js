/**
 * Check if {src} is not undefined
 */
export function isset<T>(src: T | undefined): src is T {
  return src !== undefined;
}

/**
 * Check if {src} is null
 */
export function isnull(src: unknown): src is null {
  return src === null;
}

/**
 * Check if {src} is string
 */
export function isstr(src: unknown): src is string {
  return (
    typeof src === 'string'
    || (isset(src) && src instanceof String)
  );
}

/**
 * Convert {src} to string
 */
export function tostr(src: unknown): string {
  return `${src}`;
}

/**
 * Check if {src} is boolean
 */
// export function isbool(src: unknown): src is boolean {
//   return typeof src === 'boolean';
// }

/**
 * Convert {src} to boolean
 */
// export function tobool(src: unknown): boolean {
//   return Boolean(src);
// }

/**
 * Check if {src} is number
 */
export function isnum(src: unknown): src is number {
  return !Number.isNaN(src);
}

/**
 * Convert {src} to number
 */
export function tonum(src: unknown): number {
  return parseFloat(<string>src);
}

/**
 * Check if {src} is integer
 */
export function isint(src: unknown): src is number {
  // eslint-disable-next-line no-bitwise
  return isnum(src) && src === (src | 0);
}

/**
 * Convert {src} to number
 */
export function toint(src: number | unknown): number {
  return (isnum(src)
    // eslint-disable-next-line no-bitwise
    ? (src | 0)
    : parseInt(<string>src, 10)
  );
}

/**
 * Check if {src} is function
 */
export function isfunc(src: unknown): src is (...args: Array<unknown>) => unknown {
  return typeof src === 'function';
}

/**
 * Check if {src} is object
 */
type Obj<
  T extends string | number | symbol = string,
  U = unknown
> = Record<T, U>;

export function isobj(src: unknown): src is Obj {
  return typeof src === 'object';
}

/**
 * Check if {src} is array
 */
export function isarray(src: unknown): src is Array<unknown> {
  return Array.isArray(src);
}

/**
 * Check if {src} is able to be array
 */
export function arrayable(src: unknown): src is Iterable<unknown> {
  return (
    isobj(src)
    && isint(src.length)
    && src.length >= 0
  );
}

/**
 * Convert {src} to array
 */
export function toarray(src: unknown): Array<unknown> {
  return (isstr(src) || arrayable(src)
    ? [...src]
    : [src]
  );
}

/**
 * Get keys of {obj}
 */
export function objKeys<T extends Obj>(obj: T): Array<keyof T> {
  return Object.keys(obj);
}

/**
 * Get values of {obj}
 */
export function objValues<T extends Obj>(obj: T): Array<T[keyof T]> {
  return objKeys(obj).map((key) => obj[key]);
}

/**
 * Traverse values of {obj}
 */
type ObjForEachFunc<T, U = void> = (val: T[keyof T], key: keyof T, ref: T) => U;

// export function objForEach<T extends Obj>(
//   this: unknown,
//   obj: T,
//   func: ObjForEachFunc<T>,
//   self: unknown = this,
// ): void {
//   objKeys(obj).forEach((key) => (
//     func.call(self, obj[key], key, obj)
//   ));
// }

/**
 * Traverse values of {obj} with passing {initial}
 */
type ObjReduceFunc<T, U> = (past: U, val: T[keyof T], key: keyof T, ref: T) => U;

export function objReduce<T extends Obj, U>(
  obj: T,
  func: ObjReduceFunc<T, U>,
  initial: U,
): U {
  return objKeys(obj).reduce((past, key) => (
    func(past, obj[key], key, obj)
  ), initial);
}

/**
 * Fill object with keys of {obj} with result of {func}
 */
type ObjMapFunc<T> = ObjForEachFunc<T, unknown>;

export function objMap<T extends Obj>(
  this: unknown,
  obj: T,
  func: ObjMapFunc<T>,
  self: unknown = this,
): Obj<keyof T> {
  return objReduce(obj, (past, val, key) => ({
    ...past,
    [key]: func.call(self, val, key, obj),
  }), {}) as Obj<keyof T>;
}

/**
 * Check if {src} is element
 */
// export function iselem<T>(src: T): src is T {
//   return (
//     src instanceof Element
//     || src instanceof Window
//     || src instanceof Document
//   );
// }

/**
 * Get style of {dom}
 */
type StyledDOM = Element & {
  currentStyle?: CSSStyleDeclaration;
  style?: CSSStyleDeclaration;
};

export function getStyle(dom: StyledDOM): CSSStyleDeclaration {
  return (dom?.currentStyle
    || window?.getComputedStyle(dom)
    || dom?.style
  );
}

/**
 * Check if {src} is in enum {e}
 */
export function isinEnum<
  T extends Obj<string, string | number>
>(src: string | number, e: T): src is T[keyof T] {
  return isobj(e) && src in e;
}
