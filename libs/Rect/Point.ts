import { isnum } from '../stdlib';

const xMap = new WeakMap();
const yMap = new WeakMap();

export default class Point {
  constructor(x: number | undefined = 0, y: number | undefined = 0) {
    this.x = x;
    this.y = y;
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
  get x(): number { return xMap.get(this); }

  set x(x: number) {
    if (!isnum(x)) {
      throw new TypeError(`Invalid x: ${x}`);
    }

    xMap.set(this, x);
  }

  /**
   * Y
   */
  get y(): number { return yMap.get(this); }

  set y(y: number) {
    if (!isnum(y)) {
      throw new TypeError(`Invalid y: ${y}`);
    }

    yMap.set(this, y);
  }
}
