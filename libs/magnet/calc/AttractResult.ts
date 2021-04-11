import { isset } from '../../stdlib';
import Attraction from './Attraction';

export default class AttractResult {
  #x: Attraction | undefined;

  #y: Attraction | undefined;

  constructor(
    src?: Attraction | AttractResult,
    y?: Attraction,
  ) {
    if (AttractResult.isAttractResult(src)) {
      // use the same reference
      return src;
    }

    const x = src;

    this.x = x;
    this.y = y;
  }

  /**
   * Check if {src} is result of attraction
   */
  static isAttractResult(src: unknown): src is AttractResult {
    return src instanceof AttractResult;
  }

  /**
   * X
   */
  get x(): Attraction | undefined { return this.#x; }

  set x(src: Attraction | undefined) {
    if (isset(src) && !Attraction.isAttraction(src)) {
      throw new TypeError(`Invalid attraction of x: ${src}`);
    }

    this.#x = src;
  }

  /**
   * Y
   */
  get y(): Attraction | undefined { return this.#y; }

  set y(src: Attraction | undefined) {
    if (isset(src) && !Attraction.isAttraction(src)) {
      throw new TypeError(`Invalid attraction of y: ${src}`);
    }

    this.#y = src;
  }

  /**
   * Get minimal of x/y
   */
  get any(): Attraction | undefined {
    const { x, y } = this;

    if (!isset(x)) {
      return y;
    }
    if (!isset(y)) {
      return x;
    }

    return x.distance.rawVal < y.distance.rawVal ? x : y;
  }

  /**
   * Clone
   */
  clone(): AttractResult {
    return new AttractResult(this.x?.clone(), this.y?.clone());
  }
}
