export default class RectPack {
  __raw
  __rectangle

  constructor(source) {
      if (isRectPack(source)) {
      this.__raw = source.raw;
      this.__rectangle = source.rectangle;
      } else {
      this.__raw = source;
      this.__rectangle = stdRect(source);
      }
  }

  get raw() { return this.__raw; }
  get rectangle() { return this.__rectangle; }
}