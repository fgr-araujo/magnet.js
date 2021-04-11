import { isinEnum, isset } from '../../stdlib';
import { Alignments } from '../Base';

export default class Distance {
  #alignment: Alignments | undefined;

  #rawVal = NaN;

  #absVal = NaN;

  /**
   * Distance info
   */
  constructor(
    src?: Distance | Alignments,
    ...args: [number?, boolean?]
  ) {
    if (Distance.isDistance(src)) {
      // use the same reference
      return src;
    }

    const alignment = src;
    const [val = Infinity, abs = true] = args;

    if (isset(alignment) && !isinEnum(alignment, Alignments)) {
      throw new TypeError(`Invalid alignment: ${alignment}`);
    }

    this.#alignment = alignment as Alignments;
    this.#rawVal = val;

    if (abs) {
      this.#absVal = Math.abs(val);
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
  get alignment(): Alignments | undefined { return this.#alignment; }

  /**
   * Raw distance (+/-)
   */
  get rawVal(): number { return this.#rawVal; }

  /**
   * Absolute value of distance
   */
  get absVal(): number { return this.#absVal; }

  /**
   * Clone
   */
  clone(): Distance {
    return new Distance(this.alignment, this.rawVal, isset(this.absVal));
  }
}
