const Rect = require('./rect'); // prevent dependency cycle

// weak map for info of pack
const rawMap = new WeakMap();
const rectMap = new WeakMap();

export default class Pack {
  constructor(src) {
    if (Pack.isPack(src)) {
      rectMap.set(this, src.rectangle);
      rawMap.set(this, src.raw);
    } else {
      rectMap.set(this, Rect.toRect(src));
      rawMap.set(this, src);
    }
  }

  /**
   * Check if {src} is pack
   *
   * @param {any} src
   * @returns {boolean}
   */
  static isPack(src) {
    return src instanceof this;
  }

  get raw() { return rawMap.get(this); }

  get rectangle() { return rectMap.get(this); }
}
