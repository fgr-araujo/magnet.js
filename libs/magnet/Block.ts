import { Pack, RectableSource } from '../Rect';
import Point from '../Rect/Point';
import Rect from '../Rect/Rect';
import {
  getStyle,
  isnull,
  isset, isstr, objValues, toarray, toint, tonum, tostr,
} from '../stdlib';
import Base, { Alignments, Attributes } from './Base';
import {
  OnJudgeDistance, OnJudgeAttractSummary,
  calcAttraction, CalcAttractionOption, CalcAttractionResult,
  calcMultiAttractions, CalcMultiAttractionsOption, CalcMultiAttractionsResult,
  getOffsetOfAttractResult,
} from './calc';
import {
  addEventListener, removeEventListener,
  generateDragEventDetail, generateAttractEventDetail,
  getEvtClientXY, MagnetEventParams,
} from './handler';

const EVENT_DRAGSTART = ['mousedown', 'touchstart'];
const EVENT_DRAGMOVE = ['mousemove', 'touchmove'];
const EVENT_DRAGEND = ['mouseup', 'touchend'];

// style properties
export enum Styles {
  offsetX = '--mg-offset-x',
  offsetY = '--mg-offset-y',
}
export default class Block extends Base {
  constructor() {
    super();

    this.attributeChangedCallback(Attributes.disabled);
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
    source: RectableSource,
    targets: Array<RectableSource> = [],
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
  attributeChangedCallback(attrName: Attributes): void {
    switch (attrName) {
      default:
        break;

      case Attributes.disabled:
        if (this.disabled) {
          removeEventListener(this, EVENT_DRAGSTART, this.handleMagnetDragStart);
        } else if (!this.unmovable) {
          addEventListener(this, EVENT_DRAGSTART, this.handleMagnetDragStart);
        }
        break;

      case Attributes.unmovable:
        if (this.unmovable) {
          removeEventListener(this, EVENT_DRAGSTART, this.handleMagnetDragStart);
        } else if (!this.disabled) {
          addEventListener(this, EVENT_DRAGSTART, this.handleMagnetDragStart);
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
    const magnetQueryResults = document.querySelectorAll(magnetSelector);
    const groupMagnetQueryResults = document.querySelectorAll(`${new Base().localName}${selector} ${magnetSelector}`);

    return toarray(magnetQueryResults || [])
      .concat(toarray(groupMagnetQueryResults || []))
      .filter((tgt, tgtIndex, tgts) => (
        tgt !== this // should not include me
        && tgts.indexOf(tgt) === tgtIndex // no repeat
      )) as Array<Block>;
  }

  /**
   * Calculate attraction to {target}
   */
  calcAttraction(
    target: RectableSource,
    options?: CalcAttractionOption,
  ): CalcAttractionResult {
    return Block.calcAttraction(this, target, options);
  }

  /**
   * Calculate attractions to multiple targets
   */
  calcMultiAttractions(
    targets: Array<RectableSource>,
    options?: CalcAttractionOption,
  ): CalcMultiAttractionsResult {
    return Block.calcMultiAttractions(this, targets, options);
  }

  /**
   * Judge if {distance} is acceptable
   */
  judgeDistance: OnJudgeDistance = (distance) => (
    distance.absVal <= this.attractDistance
  )

  /**
   * Judge if {summary} is acceptable
   */
  // eslint-disable-next-line class-methods-use-this
  judgeAttractSummary: OnJudgeAttractSummary = (summary) => (
    isset(summary.best.any)
  )

  /**
   * Judge if {distance} of {parent} is acceptable
   */
  judgeParentDistance: OnJudgeDistance = (...args) => (
    this.judgeDistance(...args)
  )

  /**
   * Reset offset
   */
  resetMagnetOffset(): void {
    this.style.removeProperty(Styles.offsetX);
    this.style.removeProperty(Styles.offsetY);
    this.style.removeProperty('transform');
  }

  /**
   * Move position to (x, y) (unit: px)
   */
  handleMagnetOffset(ref: Point | number, y: number): void {
    if (Point.isPoint(ref)) {
      this.style.setProperty(Styles.offsetX, `${ref.x}px`);
      this.style.setProperty(Styles.offsetY, `${ref.y}px`);
    }

    const x = ref as number;

    this.style.setProperty(Styles.offsetX, `${x}px`);
    this.style.setProperty(Styles.offsetY, `${y}px`);
  }

  /**
   * Handler of dragging start
   */
  handleMagnetDragStart(evt: Event): void {
    if (this.disabled || this.unmovable) {
      // no action if it's disabled/unmovable
      return;
    }

    const {
      position,
      zIndex,
      transform,
    } = getStyle(this);
    const {
      disabled, unattractable, unmovable,
      group, alignTo, alignToParent, crossPrevent, attractDistance,
      parentElement,
    } = this;
    const lastOffset = new Point(
      tonum(this.style.getPropertyValue(Styles.offsetX) || 0),
      tonum(this.style.getPropertyValue(Styles.offsetY) || 0),
    );
    const self = new Pack(this);
    const parent = (isnull(parentElement)
      ? undefined
      : new Pack(parentElement)
    );
    const parentRect = parent?.rectangle;
    const crossPreventParent = crossPrevent.includes(Block.CROSS_PREVENT.parent);
    const onJudgeDistance: OnJudgeDistance = (crossPreventParent && parentRect
      ? (distance, _, srcPack) => {
        const { rawVal, absVal } = distance;
        const {
          rectangle: srcRect,
        } = srcPack;

        if (absVal > this.attractDistance) {
          return false;
        }

        switch (distance.alignment) {
          default:
            return true;

          case Alignments.topToTop:
          case Alignments.topToBottom:
            return parentRect.top <= srcRect.top + rawVal;

          case Alignments.rightToRight:
          case Alignments.rightToLeft:
            return parentRect.right >= srcRect.right + rawVal;

          case Alignments.bottomToTop:
          case Alignments.bottomToBottom:
            return parentRect.bottom >= srcRect.bottom + rawVal;

          case Alignments.leftToRight:
          case Alignments.leftToLeft:
            return parentRect.left <= srcRect.left + rawVal;

          case Alignments.xCenterToXCenter:
            return (
              parentRect.right >= srcRect.right + rawVal
              && parentRect.left <= srcRect.left + rawVal
            );

          case Alignments.yCenterToYCenter:
            return (
              parentRect.top <= srcRect.top + rawVal
              && parentRect.bottom >= srcRect.bottom + rawVal
            );
        }
      }
      : this.judgeDistance.bind(this)
    );
    const data: MagnetEventParams = {
      attractDistance,
      alignTo,
      alignToOuter: alignTo.includes(Block.ALIGN_TO.outer),
      alignToInner: alignTo.includes(Block.ALIGN_TO.inner),
      alignToCenter: alignTo.includes(Block.ALIGN_TO.center),
      alignToOuterline: alignTo.includes(Block.ALIGN_TO.outerline),
      alignToParent,
      alignToParentInner: alignToParent.includes(Block.ALIGN_TO_PARENT.inner),
      alignToParentCenter: alignToParent.includes(Block.ALIGN_TO_PARENT.center),
      crossPrevent,
      crossPreventParent,
      alignments: Block.getAlignmentsOfAlignTo(alignTo),
      parentAlignments: Block.getAlignmentsOfAlignTo(alignToParent),
      onJudgeDistance,
      onJudgeAttractSummary: this.judgeAttractSummary.bind(this),
      onJudgeParentDistance: this.judgeParentDistance.bind(this),
      disabled,
      group,
      unattractable,
      unmovable,
      parent,
      targets: this.getMagnetTargets()
        .map((target) => new Pack(target)),
      self,
      originStyle: {
        position,
        zIndex,
        transform,
      },
      startXY: getEvtClientXY(evt),
      lastOffset,
    };

    let tempStore: MagnetEventParams = data;

    if (this.triggerMagnetEvent(Block.EVENT.start, generateDragEventDetail(evt, tempStore))) {
      return;
    }

    const onMove = (e: Event): void => {
      if (this.triggerMagnetEvent(Block.EVENT.move, generateDragEventDetail(e, tempStore))) {
        return;
      }

      tempStore = this.handleMagnetDragMove(e, tempStore);
    };
    const onEnd = (e: Event): void => {
      if (this.triggerMagnetEvent(Block.EVENT.end, generateDragEventDetail(e, tempStore))) {
        return;
      }

      this.handleMagnetDragEnd(e, tempStore);

      removeEventListener(window, EVENT_DRAGMOVE, onMove);
      removeEventListener(window, EVENT_DRAGEND, onEnd);
    };

    evt.preventDefault();
    evt.stopImmediatePropagation();

    // initialize position base
    switch (position) {
      case 'relative':
      case 'fixed':
      case 'absolute':
        break;

      default:
        this.style.setProperty('position', 'relative');
        break;
    }

    // move block to top
    this.style.setProperty('z-index', tostr(toint(Date.now() / 1000)));

    // TODO: combine with original transform?
    this.style.setProperty('transform', `translate(var(${Styles.offsetX}), var(${Styles.offsetY}))`, 'important');

    addEventListener(window, EVENT_DRAGMOVE, onMove);
    addEventListener(window, EVENT_DRAGEND, onEnd);
    tempStore = this.handleMagnetDragMove(evt, tempStore);
  }

  /**
   * Handler of dragging move
   */
  handleMagnetDragMove(evt: Event, data: MagnetEventParams): MagnetEventParams {
    const {
      crossPreventParent,
      alignments, parentAlignments,
      onJudgeDistance,
      onJudgeAttractSummary,
      onJudgeParentDistance,
      unattractable,
      parent,
      targets,
      self: {
        rectangle: selfRect,
      },
      startXY,
      lastOffset,
      lastAttractSummary,
    } = data;
    const {
      rectangle: parentRect,
    } = parent || {};
    const {
      x: selfX,
      y: selfY,
      width: selfWidth,
      height: selfHeight,
    } = selfRect;
    const currXY = getEvtClientXY(evt);
    const currOffset = new Point(
      currXY.x - startXY.x,
      currXY.y - startXY.y,
    );
    const oriRect = new Rect(selfRect).offset(currOffset);
    const currRect = new Rect(oriRect);

    if (crossPreventParent && parentRect) {
      // prevent from going out of parent edges

      if (currRect.left < parentRect.left) {
        currRect.moveToX(parentRect.left);
      } else if (currRect.left + selfWidth > parentRect.right) {
        currRect.moveToX(parentRect.right - selfWidth);
      }
      if (currRect.top < parentRect.top) {
        currRect.moveToY(parentRect.top);
      } else if (currRect.top + selfHeight > parentRect.bottom) {
        currRect.moveToY(parentRect.bottom - selfHeight);
      }
    }
    // if (crossPreventTarget) {
    //   TODO: prevent from crossing targets
    // }

    const finalRect = new Rect(currRect);

    let currAttractSummary: CalcMultiAttractionsResult | undefined;

    do {
      // would break if any of this or target cancelled

      if (unattractable) {
        // keep {currAttractSummary} to be null
        break;
      }

      // check current attracted targets
      currAttractSummary = Block.calcMultiAttractions(
        currRect,
        targets,
        {
          alignments,
          onJudgeDistance,
          onJudgeAttractSummary,
          bindAttraction: (parentAlignments.length > 0 && parent
            ? Block.calcAttraction(
              currRect,
              parent,
              {
                alignments: parentAlignments,
                onJudgeDistance: onJudgeParentDistance,
              },
            )
            : undefined
          ),
        },
      );
      const {
        best: currAttractBest,
      } = currAttractSummary;
      const {
        x: currMinX,
        y: currMinY,
      } = currAttractBest;
      const lastAttractX = lastAttractSummary?.best?.x;
      const lastAttractY = lastAttractSummary?.best?.y;
      const lastTargetX = lastAttractX?.target;
      const lastTargetY = lastAttractY?.target;
      const currTargetX = currMinX?.target;
      const currTargetY = currMinY?.target;
      const diffTargetX = lastTargetX !== currTargetX;
      const diffTargetY = lastTargetY !== currTargetY;
      const nextOffset = getOffsetOfAttractResult(currAttractBest);
      const nextRect = new Rect(currRect).offset(nextOffset);
      const evtOptions = generateAttractEventDetail(currAttractSummary, nextRect);

      if (!diffTargetX || !diffTargetY) {
        // trigger attractmove of this
        if (this.triggerMagnetEvent(Block.EVENT.attractmove, evtOptions)) {
          break;
        }

        // trigger attractedmove of target x
        if (!diffTargetX && currTargetX instanceof Base) {
          if (currTargetX.triggerMagnetEvent(Block.EVENT.attractedmove, evtOptions)) {
            break;
          }
        }

        // trigger attractedmove of target y
        if (!diffTargetY && currTargetY instanceof Base) {
          if (currTargetY.triggerMagnetEvent(Block.EVENT.attractedmove, evtOptions)) {
            break;
          }
        }
      }

      // handle unattraction
      if (lastTargetX || lastTargetY) {
        const unattractX = lastTargetX && diffTargetX;
        const unattractY = lastTargetY && diffTargetY;

        if (unattractX || unattractY) {
          // trigger unattract of this
          this.triggerMagnetEvent(Block.EVENT.unattract, evtOptions);

          if (unattractX && lastTargetX instanceof Base) {
            // trigger unattracted of last target x
            lastTargetX.triggerMagnetEvent(Block.EVENT.unattracted, evtOptions);
          }
          if (unattractY && lastTargetY instanceof Base) {
            // trigger unattracted of last target y
            lastTargetY.triggerMagnetEvent(Block.EVENT.unattracted, evtOptions);
          }
        }
      }

      // handle attraction
      if (currTargetX || currTargetY) {
        const lastAlignX = lastAttractX?.alignment;
        const lastAlignY = lastAttractY?.alignment;
        const currAlignX = currMinX?.alignment;
        const currAlignY = currMinY?.alignment;
        const currAttractX = currTargetX && (diffTargetX || lastAlignX !== currAlignX);
        const currAttractY = currTargetY && (diffTargetY || lastAlignY !== currAlignY);

        if (currAttractX || currAttractY) {
          // trigger attract of this
          if (this.triggerMagnetEvent(Block.EVENT.attract, evtOptions)) {
            break;
          }

          if (currAttractX && currTargetX instanceof Base) {
            // trigger attracted of target x
            if (currTargetX.triggerMagnetEvent(Block.EVENT.attracted, evtOptions)) {
              // cancel being attracted on x-axis of target
              nextOffset.x = 0;
            }
          }
          if (currAttractY && currTargetY instanceof Base) {
            // trigger attracted of target y
            if (currTargetY.triggerMagnetEvent(Block.EVENT.attracted, evtOptions)) {
              // cancel being attracted on y-axis of target
              nextOffset.y = 0;
            }
          }
        }
      }

      finalRect.offset(nextOffset);

    // eslint-disable-next-line no-constant-condition
    } while (false);

    const finalX = finalRect.x - selfX + lastOffset.x;
    const finalY = finalRect.y - selfY + lastOffset.y;

    this.handleMagnetOffset(finalX, finalY);

    return {
      ...data,
      lastAttractSummary: currAttractSummary,
    };
  }

  /**
   * Handler of dragging end
   */
  handleMagnetDragEnd(evt: Event, data: MagnetEventParams): void {
    const {
      originStyle: {
        position,
        zIndex,
      },
    } = data;

    if (isset(position)) {
      this.style.setProperty('position', position);
    }
    if (isset(zIndex)) {
      this.style.setProperty('z-index', zIndex);
    }
  }
}
