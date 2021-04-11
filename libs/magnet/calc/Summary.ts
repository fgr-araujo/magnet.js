import { Pack } from '../../Rect';
import { isarray, isset } from '../../stdlib';
import AttractResult from './AttractResult';

export default class Summary<T, U> {
  #source: Pack;

  #target: T;

  #results: Array<U>;

  #best: AttractResult;

  constructor(
    source: Pack,
    target: T,
    results: Array<U> = [],
    best?: AttractResult,
  ) {
    this.#source = source;
    this.#target = target;
    this.#results = [];
    this.#best = (AttractResult.isAttractResult(best)
      ? best
      : new AttractResult()
    );

    if (isset(results)) {
      if (!isarray(results)) {
        throw new Error(`Invalid result list: ${results}`);
      }

      results.forEach((result) => this.addResult(result));
    }
  }

  /**
   * Source
   */
  get source(): Pack { return this.#source; }

  /**
   * Target
   */
  get target(): T { return this.#target; }

  /**
   * Results
   */
  get results(): Array<U> { return this.#results; }

  /**
   * Best
   */
  get best(): AttractResult { return this.#best; }

  set best(src: AttractResult) { this.#best = src; }

  /**
   * Add attraction result to list
   */
  addResult(result: U): void {
    this.results.push(result);
  }
}
