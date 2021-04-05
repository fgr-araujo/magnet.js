import { Pack } from '../../Rect';
import { isarray, isset } from '../../stdlib';
import AttractResult from './AttractResult';

const srcMap = new WeakMap();
const targetMap = new WeakMap();
const resultsMap = new WeakMap();
const bestMap = new WeakMap();

export default class Summary<T, U> {
  constructor(source: Pack, target: T, results: Array<U>, best: AttractResult) {
    srcMap.set(this, source);
    targetMap.set(this, target);
    resultsMap.set(this, []);
    this.best = best;

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
  get source(): Pack { return srcMap.get(this); }

  /**
   * Target
   */
  get target(): T { return targetMap.get(this); }

  /**
   * Results
   */
  get results(): Array<U> { return resultsMap.get(this); }

  /**
   * Best
   */
  get best(): AttractResult { return bestMap.get(this); }

  set best(src: AttractResult) { bestMap.set(this, src); }

  /**
   * Add attraction result to list
   */
  addResult(result: U): void {
    this.results.push(result);
  }
}
