import { isset } from '../../stdlib';
import { RectableSource } from '../../Rect';
import Distance from './Distance';

export default class Attraction extends Distance {
  #source: RectableSource;

  #target: RectableSource | undefined;

  #distance: Distance;

  /**
   * Attraction
   */
  constructor(
    src: RectableSource,
    target?: RectableSource,
    distance: Distance = new Distance(),
  ) {
    super(distance.alignment, distance.rawVal, isset(distance.absVal));

    if (Attraction.isAttraction(src)) {
      // use the same reference
      this.#source = src.source;
      this.#target = src.target;
      this.#distance = src.distance;
    } else {
      this.#source = src;
      this.#target = target;
      this.#distance = distance;
    }
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
  get source(): RectableSource { return this.#source; }

  /**
   * Target
   */
  get target(): RectableSource | undefined { return this.#target; }

  /**
   * Distance
   */
  get distance(): Distance { return this.#distance; }

  /**
   * Clone
   */
  clone(): Attraction {
    return new Attraction(this.source, this.target, this.distance);
  }
}
