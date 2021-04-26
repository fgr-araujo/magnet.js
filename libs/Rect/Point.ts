import { isnum } from '../stdlib';
import Rect from './Rect';

export type PointLike = {
  x: number;
  y: number;
};
export default class Point {
  #x = NaN;

  #y = NaN;

  constructor(src: Rect | Point | number = 0, y = 0) {
    if (Point.isPoint(src)) {
      return src.clone();
    }
    if (Rect.isRect(src)) {
      this.x = src.x;
      this.y = src.y;
    } else {
      const x = src;

      this.x = isnum(x) ? x : 0;
      this.y = isnum(y) ? y : 0;
    }
  }

  /**
   * Check if {src} is point
   */
  static isPoint(src: unknown): src is Point {
    return src instanceof this;
  }

  /**
   * X
   */
  get x(): number { return this.#x; }

  set x(x: number) {
    if (!isnum(x)) {
      throw new TypeError(`Invalid x: ${x}`);
    }

    this.#x = x;
  }

  /**
   * Y
   */
  get y(): number { return this.#y; }

  set y(y: number) {
    if (!isnum(y)) {
      throw new TypeError(`Invalid y: ${y}`);
    }

    this.#y = y;
  }

  /**
   * Clone
   */
  clone(): Point {
    return new Point(this.x, this.y);
  }

  /**
   * Convert to object
   */
  toObject(): PointLike {
    return {
      x: this.x,
      y: this.y,
    };
  }
}
