/* eslint-disable no-use-before-define */

import Attraction from './Attraction';

const xMap: WeakMap<AttractResult, Attraction> = new WeakMap();
const yMap: WeakMap<AttractResult, Attraction> = new WeakMap();

export default class AttractResult {
  constructor(src?: Attraction|AttractResult, y?: Attraction) {
    if (AttractResult.isAttractResult(src)) {
      // copy values of {src}
      xMap.set(this, src.x);
      yMap.set(this, src.y);
    } else {
      const x = src;

      xMap.set(this, x);
      yMap.set(this, y);
    }
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
  get x(): Attraction { return xMap.get(this); }

  set x(src: Attraction) {
    if (!Attraction.isAttraction(src)) {
      throw new Error(`Invalid attraction of x: ${src}`);
    }

    xMap.set(this, src);
  }

  /**
   * Y
   */
  get y(): Attraction { return yMap.get(this); }

  set y(src: Attraction) {
    if (!Attraction.isAttraction(src)) {
      throw new Error(`Invalid attraction of y: ${src}`);
    }

    yMap.set(this, src);
  }

  /**
   * Get minimal of x/y
   */
  get any(): Attraction {
    const { x, y } = this;

    return x.rawVal < y.rawVal ? x : y;
  }
}
