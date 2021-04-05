import { RectableSource } from '../Rect';
import Point from '../Rect/Point';
import {
  getStyle,
  isarray, isset, isstr, objValues, toarray, toint, tonum, tostr,
} from '../stdlib';
import Base, { Attributes } from './Base';
import { calcAttraction, CalcAttractionOption, CalcAttractionResult, calcMultiAttractions, CalcMultiAttractionsOption, CalcMultiAttractionsResult } from './calc';
import Distance from './calc/Distance';
import Summary from './calc/Summary';
import handleMagnetEnd from './handler/handleMagnetEnd';
import handleMagnetMove from './handler/handleMagnetMove';
import handleMagnetStart from './handler/handleMagnetStart';
import { addEventListener, MagnetConfig, MagnetHandler, removeEventListener } from './handler/MagnetHandler';

const EVENT_DRAGSTART = ['mousedown', 'touchstart'];
const EVENT_DRAGMOVE = ['mousemove', 'touchmove'];
const EVENT_DRAGEND = ['mouseup', 'touchend'];

const HiddenCfgMap = new WeakMap();

// style properties
export enum Styles {
  offsetX = '--mg-offset-x',
  offsetY = '--mg-offset-y',
}

export default class Block extends Base {
  constructor() {
    super();
  }

  /**
   * Attributes to observe
   */
  static observedAttributes = [
    Attributes.disabled,
    Attributes.unmovable,
  ];

  /**
   * Calculate attraction from {source} to {target}
   */
  static calcAttraction(
    source: RectableSource,
    target: RectableSource,
    {
      alignments = objValues(this.ALIGNMENT),
      absDistance = true,
      ...options
    }: CalcAttractionOption = {},
  ): CalcAttractionResult {
    return calcAttraction(source, target, {
      ...options,
      alignments,
      absDistance,
    });
  }

  /**
   * Calculate attractions from {source} to multiple targets
   */
  static calcMultiAttractions(
    source: HTMLElement,
    targets: Array<HTMLElement> = [],
    {
      alignments = objValues(this.ALIGNMENT),
      absDistance = true,
      ...options
    }: CalcMultiAttractionsOption = {},
  ): CalcMultiAttractionsResult {
    return calcMultiAttractions(source, targets, {
      ...options,
      alignments,
      absDistance,
    });
  }

  /**
   * Callback on changing attributes
   */
  attributeChangedCallback(attrName: Attributes, oldVal: string, newVal: string): void {
    switch (attrName) {
      default:
        break;

      case Attributes.disabled:
        if (newVal) {
          removeEventListener(this, EVENT_DRAGSTART, this.dragStartHandler);
        } else if (!this.unmovable) {
          addEventListener(this, EVENT_DRAGSTART, this.dragStartHandler);
        }
        break;

      case Attributes.unmovable:
        if (newVal) {
          removeEventListener(this, EVENT_DRAGSTART, this.dragStartHandler);
        } else if (!this.disabled) {
          addEventListener(this, EVENT_DRAGSTART, this.dragStartHandler);
        }
        break;
    }
  }

  /**
   * Get attractable magnets
   */
  getMagnetTargets(): Array<Block> {
    const { group } = this;
    const groupSelector = (isstr(group)
      ? `[${Attributes.group}="${group}"]`
      : ''
    );
    const notDisabledSelector = `:not([${Attributes.disabled}])`;
    const notUnattractableSelector = `:not([${Attributes.unattractable}])`;
    const selector = `${groupSelector}${notDisabledSelector}${notUnattractableSelector}`;
    const magnetSelector = `${this.localName}${selector}`;

    return toarray(document.querySelectorAll(magnetSelector) || [])
      .concat(toarray(document.querySelectorAll(`${new Base().localName}${selector} ${magnetSelector}`) || []))
      .filter((tgt, tgtIndex, tgts) => (
        tgt !== this // should not include me
        && tgts.indexOf(tgt) === tgtIndex // no repeat
      )) as Array<Block>;
  }

  /**
   * Calculate attraction to {target}
   *
   * @param {Rectable} target
   * @param {object} options for calculating
   * @returns {object} summary of results
   */
  calcAttraction(target, options) {
    return Block.calcAttraction(this, target, options);
  }

  /**
   * Calculate attractions to multiple targets
   *
   * @param {array} targets
   * @param {object} options for calculating
   * @returns {object} summary of results
   */
  calcMultiAttractions(targets, options) {
    return Block.calcMultiAttractions(this, targets, options);
  }

  /**
   * Judge if {distance} is acceptable
   */
  judgeDistance(distance: Distance): boolean {
    return distance.absVal <= this.attractDistance;
  }

  /**
   * Judge if {summary} is acceptable
   */
  // eslint-disable-next-line class-methods-use-this
  judgeAttractSummary(summary: Summary) {
    return summary.
  }

  /**
   * Judge if {distance} of {parent} is acceptable
   */
  judgeParentDistance(distance: Distance, parent: HTMLElement) {
    return this.judgeDistance(distance);
  }

  /**
   * Judge if {summary} of {parent} is acceptable
   */
  judgeParentAttractSummary(summary: Summary, parent: HTMLElement) {
    return this.judgeAttractSummary(summary);
  }

  /**
   * Move position to (x, y) (unit: px)
   */
  handleMagnetOffset(x: number, y: number): void {
    this.style.setProperty(Styles.offsetX, `${x}px`);
    this.style.setProperty(Styles.offsetY, `${y}px`);
  }

  /**
   * Reset offset
   */
  resetMagnetOffset(): void {
    this.style.removeProperty(Styles.offsetX);
    this.style.removeProperty(Styles.offsetY);
    this.style.removeProperty('transform');
  }

  /**
   * Handler on start of dragging magnet
   */
  handleMagnetStart(evt: MouseEvent | TouchEvent, magnetConfig: MagnetConfig): void {
    const resultOfHandler = handleMagnetStart(this, evt, magnetConfig);

    if (isset(resultOfHandler)) {
      HiddenCfgMap.set(this, resultOfHandler);
    }

    handleMagnetMove(this, evt, magnetConfig);
  }

  /**
   * Handler on move of dragging magnet
   */
  handleMagnetMove(): void {
  }

  /**
   * Handler on end of dragging magnet
   */
  handleMagnetEnd(): void {
  }
}
