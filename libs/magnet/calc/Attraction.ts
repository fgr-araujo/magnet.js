import Distance from './Distance';
import { RectableSource } from '../../Rect';

const sourceMap = new WeakMap();
const targetMap = new WeakMap();
const distanceMap = new WeakMap();

export default class Attraction extends Distance {
  /**
   * Attraction
   */
  constructor(source: RectableSource, target: RectableSource, distance: Distance) {
    if (Attraction.isAttraction(source)) {
      // use the same reference
      return source;
    }

    super(distance);

    sourceMap.set(this, source);
    targetMap.set(this, target);
    distanceMap.set(this, distance);
  }

  /**
   * Check if {src} is attraction
   */
  static isAttraction(src: unknown): src is Attraction {
    return src instanceof this;
  }

  /**
   * Source
   */
  get source(): RectableSource { return sourceMap.get(this); }

  /**
   * Target
   */
  get target(): RectableSource { return targetMap.get(this); }

  /**
   * Distance
   */
  get distance(): Distance { return distanceMap.get(this); }
}
