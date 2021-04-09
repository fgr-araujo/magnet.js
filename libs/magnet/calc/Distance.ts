import { Alignments } from '../Base';

const alignMap = new WeakMap();
const rawMap = new WeakMap();
const absMap = new WeakMap();

export default class Distance {
  /**
   * Distance info
   */
  constructor(src?: Distance | Alignments, ...args: [number?, boolean?]) {
    if (Distance.isDistance(src)) {
      // use the same reference
      return src;
    }

    const alignment = src;
    const [val = Infinity, abs = true] = args;

    alignMap.set(this, alignment);
    rawMap.set(this, val);

    if (abs) {
      absMap.set(this, Math.abs(val));
    }
  }

  /**
   * Check if {src} is distance
   */
  static isDistance(src: unknown): src is Distance {
    return src instanceof this;
  }

  /**
   * Type of alignment
   */
  get alignment(): Alignments {
    return alignMap.get(this);
  }

  /**
   * Raw distance (+/-)
   */
  get rawVal(): number { return rawMap.get(this); }

  /**
   * Absolute value of distance
   */
  get absVal(): number { return absMap.get(this); }
}
