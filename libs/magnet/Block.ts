import { Pack, RectableSource, toRect } from '../Rect';
import Point from '../Rect/Point';
import Rect from '../Rect/Rect';
import {
  getStyle,
  isnull, isnum, isset, isstr,
  objValues, toarray, toint, tonum, tostr,
} from '../stdlib';
import Base, { Attributes } from './Base';
import {
  OnJudgeOptions, OnJudgeDistance, OnJudgeAttractSummary,
  calcAttraction, CalcAttractionOption, CalcAttractionResult,
  calcMultiAttractions, CalcMultiAttractionsOption, CalcMultiAttractionsResult,
  getOffsetOfAttractResult,
  isinAttractRange,
} from './calc';
import Attraction from './calc/Attraction';
import Distance from './calc/Distance';
import {
  addEventListener, removeEventListener,
  generateDragEventDetail, generateAttractEventDetail,
  getEvtClientXY, MagnetEventParams,
} from './handler';

const EVENT_DRAGSTART = ['mousedown', 'touchstart'];
const EVENT_DRAGMOVE = ['mousemove', 'touchmove'];
const EVENT_DRAGEND = ['mouseup', 'touchend'];

const dragPassData = new WeakMap<Base, MagnetEventParams>();

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
  static calcMagnetAttraction(
    source: RectableSource,
    target: RectableSource,
    {
      alignments = objValues(this.MAGNET_ALIGNMENT),
      absDistance = true,
      ...options
    }: CalcAttractionOption = {},
    attachOptions: OnJudgeOptions,
  ): CalcAttractionResult {
    return calcAttraction(
      source,
      target,
      {
        ...options,
        alignments,
        absDistance,
      },
      attachOptions,
    );
  }

  /**
   * Calculate attractions from {source} to multiple targets
   */
  static calcMagnetMultiAttractions(
    source: RectableSource,
    targets: Array<RectableSource> = [],
    {
      alignments = objValues(this.MAGNET_ALIGNMENT),
      absDistance = true,
      ...options
    }: CalcMultiAttractionsOption,
    attachOptions: OnJudgeOptions,
  ): CalcMultiAttractionsResult {
    return calcMultiAttractions(
      source,
      targets,
      {
        ...options,
        alignments,
        absDistance,
      },
      attachOptions,
    );
  }

  /**
   * Callback on changing attributes
   */
  attributeChangedCallback(attrName: Attributes): void {
    switch (attrName) {
      default:
        break;

      case Attributes.disabled:
        if (this.mgDisabled) {
          removeEventListener(this, EVENT_DRAGSTART, this.handleMagnetDragStart);
        } else if (!this.mgUnmovable) {
          addEventListener(this, EVENT_DRAGSTART, this.handleMagnetDragStart);
        }
        break;

      case Attributes.unmovable:
        if (this.mgUnmovable) {
          removeEventListener(this, EVENT_DRAGSTART, this.handleMagnetDragStart);
        } else if (!this.mgDisabled) {
          addEventListener(this, EVENT_DRAGSTART, this.handleMagnetDragStart);
        }
        break;
    }
  }

  /**
   * Get attractable magnets
   */
  getMagnetTargets(): Array<Block> {
    const {
      mgGroup: group,
    } = this;
    const nodeName = this.localName;
    const notDisabledSelector = `:not([${Attributes.disabled}])`;
    const notUnattractableSelector = `:not([${Attributes.unattractable}])`;
    const rawSelector = `${notDisabledSelector}${notUnattractableSelector}`;
    const magnets = toarray(
      (document.querySelectorAll(`${nodeName}${rawSelector}`) || []),
    ) as Array<Block>;

    return magnets.filter((magnet) => {
      if (isstr(group) && group !== magnet.mgGroup) {
        return false;
      }

      return magnet !== this;
    });
  }

  /**
   * Calculate attraction to {target}
   */
  calcMagnetAttraction(
    target: RectableSource,
    options: CalcAttractionOption,
    attachOptions: OnJudgeOptions,
  ): CalcAttractionResult {
    return Block.calcMagnetAttraction(this, target, options, attachOptions);
  }

  /**
   * Calculate attractions to multiple targets
   */
  calcMagnetMultiAttractions(
    targets: Array<RectableSource>,
    options: CalcAttractionOption,
    attachOptions: OnJudgeOptions,
  ): CalcMultiAttractionsResult {
    return Block.calcMagnetMultiAttractions(
      this,
      targets,
      options,
      attachOptions,
    );
  }

  /**
   * Judge if {distance} is acceptable
   */
  judgeMagnetDistance: OnJudgeDistance = (distance, targetPack, srcPack, options) => {
    const { absVal } = distance;
    const { attractDistance } = options;

    if (absVal > attractDistance) {
      return false;
    }

    const { rawVal, alignment } = distance;
    const {
      rectangle: srcRect,
    } = srcPack;

    if (options.crossPreventParent && options.parentPack) {
      const {
        parentPack: {
          rectangle: parentRect,
        },
      } = options;

      // refuse when target is out of parent edges
      switch (alignment) {
        default:
          return false; // unknown alignment

        case Block.MAGNET_ALIGNMENT.topToTop:
        case Block.MAGNET_ALIGNMENT.topToBottom:
          if (parentRect.top > srcRect.top + rawVal) {
            return false;
          }
          break;

        case Block.MAGNET_ALIGNMENT.rightToRight:
        case Block.MAGNET_ALIGNMENT.rightToLeft:
          if (parentRect.right < srcRect.right + rawVal) {
            return false;
          }
          break;

        case Block.MAGNET_ALIGNMENT.bottomToTop:
        case Block.MAGNET_ALIGNMENT.bottomToBottom:
          if (parentRect.bottom < srcRect.bottom + rawVal) {
            return false;
          }
          break;

        case Block.MAGNET_ALIGNMENT.leftToLeft:
        case Block.MAGNET_ALIGNMENT.leftToRight:
          if (parentRect.left > srcRect.left + rawVal) {
            return false;
          }
          break;

        case Block.MAGNET_ALIGNMENT.xCenterToXCenter:
          if (
            parentRect.right < srcRect.right + rawVal
            || parentRect.left > srcRect.left + rawVal
          ) {
            return false;
          }
          break;

        case Block.MAGNET_ALIGNMENT.yCenterToYCenter:
          if (
            parentRect.top > srcRect.top + rawVal
            || parentRect.bottom < srcRect.bottom + rawVal
          ) {
            return false;
          }
          break;
      }
    }
    if (options.alignToExtend) {
      return true;
    }

    const {
      rectangle: targetRect,
    } = targetPack;

    // check if attracted on edge of target
    switch (alignment) {
      default:
        return true; // unknown alignment

      case Block.MAGNET_ALIGNMENT.xCenterToXCenter:
      case Block.MAGNET_ALIGNMENT.yCenterToYCenter:
        return true;

      case Block.MAGNET_ALIGNMENT.rightToRight:
      case Block.MAGNET_ALIGNMENT.leftToLeft:
      case Block.MAGNET_ALIGNMENT.rightToLeft:
      case Block.MAGNET_ALIGNMENT.leftToRight:
      {
        const {
          top: srcTop,
          bottom: srcBottom,
        } = srcRect;
        const {
          top: targetTop,
          bottom: targetBottom,
        } = targetRect;

        if (isinAttractRange(attractDistance, srcTop, srcBottom, targetTop, targetBottom)) {
          return true;
        }
        if (isinAttractRange(attractDistance, targetTop, targetBottom, srcTop, srcBottom)) {
          return true;
        }

        return false;
      }

      case Block.MAGNET_ALIGNMENT.topToTop:
      case Block.MAGNET_ALIGNMENT.bottomToBottom:
      case Block.MAGNET_ALIGNMENT.topToBottom:
      case Block.MAGNET_ALIGNMENT.bottomToTop:
      {
        const {
          right: srcRight,
          left: srcLeft,
        } = srcRect;
        const {
          right: targetRight,
          left: targetLeft,
        } = targetRect;

        if (isinAttractRange(attractDistance, srcLeft, srcRight, targetLeft, targetRight)) {
          return true;
        }
        if (isinAttractRange(attractDistance, targetLeft, targetRight, srcLeft, srcRight)) {
          return true;
        }

        return false;
      }
    }
  }

  /**
   * Judge if {summary} is acceptable
   */
  // eslint-disable-next-line class-methods-use-this
  judgeMagnetAttractSummary: OnJudgeAttractSummary = (summary) => (
    isset(summary.best.any)
  )

  /**
   * Judge if {distance} of {parent} is acceptable
   */
  judgeMagnetParentDistance: OnJudgeDistance = (...args) => (
    this.judgeMagnetDistance(...args)
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
   * Last offset
   */
  getLastMagnetOffset(): Point {
    return new Point(
      tonum(this.style.getPropertyValue(Styles.offsetX) || 0),
      tonum(this.style.getPropertyValue(Styles.offsetY) || 0),
    );
  }

  /**
   * Move offset to (x + dx, y + dy) (unit: px)
   */
  handleMagnetOffset(ref: Point | number, dy?: number): void {
    if (Point.isPoint(ref)) {
      this.style.setProperty(Styles.offsetX, `${ref.x}px`);
      this.style.setProperty(Styles.offsetY, `${ref.y}px`);

      return;
    }
    if (!isnum(dy)) {
      throw new ReferenceError('Must assign y');
    }

    const dx = ref as number;

    this.style.setProperty(Styles.offsetX, `${dx}px`);
    this.style.setProperty(Styles.offsetY, `${dy}px`);
  }

  /**
   * Move offset to (x, y) (unit: px)
   */
  handleMagnetPosition(ref: Point | number, y?: number): void {
    const { left, top } = toRect(this);

    if (Point.isPoint(ref)) {
      return this.handleMagnetOffset(ref.x - left, ref.y - top);
    }
    if (!isnum(y)) {
      throw new ReferenceError('Must assign y');
    }

    const x = ref as number;

    return this.handleMagnetOffset(x - left, y - top);
  }

  /**
   * Move position basing on attraction of (x, y)
   */
  handleMagnetPositionWithAttract(
    x: number,
    y: number,
    data?: MagnetEventParams,
  ): CalcMultiAttractionsResult | undefined {
    const {
      crossPreventParent = this.mgCrossPrevent.includes(Block.MAGNET_CROSS_PREVENT.parent),
      alignments = Block.getMagnetAlignmentsOfAlignTo(this.mgAlignTo),
      parentAlignments = Block.getMagnetAlignmentsOfAlignTo(this.mgAlignToParent),
      onJudgeDistance = this.judgeMagnetDistance.bind(this),
      onJudgeAttractSummary = this.judgeMagnetAttractSummary.bind(this),
      onJudgeParentDistance = this.judgeMagnetParentDistance.bind(this),
      unattractable = this.mgUnattractable,
      parent = (isnull(this.parentElement) ? undefined : new Pack(this.parentElement)),
      targets = this.getMagnetTargets()
        .map((target) => new Pack(target)),
      self = new Pack(this),
      lastOffset = this.getLastMagnetOffset(),
      lastAttractSummary,
      attachOptions: {
        attractDistance = this.mgAttractDistance,
        alignToExtend = this.mgAlignTo.includes(Block.MAGNET_ALIGN_TO.extend),
      } = {},
    } = data || {};
    const attachOptions = {
      attractDistance,
      alignToExtend,
      crossPreventParent,
      parentPack: parent,
    };
    const {
      rectangle: selfRect,
    } = self;
    const {
      rectangle: parentRect,
    } = parent || {};
    const {
      x: selfX,
      y: selfY,
      width: selfWidth,
      height: selfHeight,
    } = selfRect;
    const currRect = new Rect(selfRect).moveTo(x, y);

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
      currAttractSummary = Block.calcMagnetMultiAttractions(
        new Pack(this, currRect),
        targets,
        {
          alignments,
          onJudgeDistance,
          onJudgeAttractSummary,
          bindAttraction: (parentAlignments.length > 0 && parent
            ? Block.calcMagnetAttraction(
              currRect,
              parent,
              {
                alignments: parentAlignments,
                onJudgeDistance: onJudgeParentDistance,
              },
              attachOptions,
            )
            : undefined
          ),
        },
        attachOptions,
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
      const lastTargetX = (lastAttractX?.target as Pack)?.raw;
      const lastTargetY = (lastAttractY?.target as Pack)?.raw;
      const currTargetX = (currMinX?.target as Pack)?.raw;
      const currTargetY = (currMinY?.target as Pack)?.raw;
      const diffTargetX = lastTargetX !== currTargetX;
      const diffTargetY = lastTargetY !== currTargetY;
      const nextOffset = getOffsetOfAttractResult(currAttractBest);
      const nextRect = new Rect(currRect).offset(nextOffset);
      const evtOptions = generateAttractEventDetail(currAttractSummary, nextRect);

      console.log(currAttractSummary);
      if (!diffTargetX || !diffTargetY) {
        // trigger attractmove of this
        if (this.triggerMagnetEvent(Block.MAGNET_EVENT.attractmove, evtOptions)) {
          break;
        }

        // trigger attractedmove of target x
        if (!diffTargetX && currTargetX instanceof Base) {
          if (currTargetX.triggerMagnetEvent(Block.MAGNET_EVENT.attractedmove, evtOptions)) {
            break;
          }
        }

        // trigger attractedmove of target y
        if (!diffTargetY && currTargetY instanceof Base) {
          if (currTargetY.triggerMagnetEvent(Block.MAGNET_EVENT.attractedmove, evtOptions)) {
            break;
          }
        }
      }

      // handle unattraction
      console.log(111, {lastTargetX, diffTargetX, currTargetX});
      if (lastTargetX || lastTargetY) {
        const unattractX = lastTargetX && diffTargetX;
        const unattractY = lastTargetY && diffTargetY;

        if (unattractX || unattractY) {
          // trigger unattract of this
          if (this.triggerMagnetEvent(Block.MAGNET_EVENT.unattract, evtOptions)) {
            // cancel all unattract results
            const emptyAttraction = new Attraction(self, undefined, new Distance());

            currAttractSummary.best.x = emptyAttraction;
            currAttractSummary.best.y = emptyAttraction.clone();
            break;
          }

          if (unattractX && lastTargetX instanceof Base) {
            // trigger unattracted of last target x
            if (lastTargetX.triggerMagnetEvent(Block.MAGNET_EVENT.unattracted, evtOptions)) {
              // cancel being unattracted of target x
              nextOffset.x = 0;
              currAttractSummary.best.x = new Attraction(self, undefined, new Distance());
            }
          }
          if (unattractY && lastTargetY instanceof Base) {
            // trigger unattracted of last target y
            if (lastTargetY.triggerMagnetEvent(Block.MAGNET_EVENT.unattracted, evtOptions)) {
              // cancel being unattracted of target y
              nextOffset.y = 0;
              currAttractSummary.best.y = new Attraction(self, undefined, new Distance());
            }
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
          if (this.triggerMagnetEvent(Block.MAGNET_EVENT.attract, evtOptions)) {
            // cancel all attract results
            const emptyAttraction = new Attraction(self, undefined, new Distance());

            currAttractSummary.best.x = emptyAttraction;
            currAttractSummary.best.y = emptyAttraction.clone();
            break;
          }

          if (currAttractX && currTargetX instanceof Base) {
            // trigger attracted of target x
            if (currTargetX.triggerMagnetEvent(Block.MAGNET_EVENT.attracted, evtOptions)) {
              // cancel being attracted of target x
              nextOffset.x = 0;
              currAttractSummary.best.x = new Attraction(self, undefined, new Distance());
            }
          }
          if (currAttractY && currTargetY instanceof Base) {
            // trigger attracted of target y
            if (currTargetY.triggerMagnetEvent(Block.MAGNET_EVENT.attracted, evtOptions)) {
              // cancel being attracted of target y
              nextOffset.y = 0;
              currAttractSummary.best.y = new Attraction(self, undefined, new Distance());
            }
          }
        }
      }

      finalRect.offset(nextOffset);

    // eslint-disable-next-line no-constant-condition
    } while (false);

    const finalOffsetX = finalRect.x - selfX + lastOffset.x;
    const finalOffsetY = finalRect.y - selfY + lastOffset.y;

    this.handleMagnetOffset(finalOffsetX, finalOffsetY);

    return currAttractSummary;
  }

  /**
   * Move position basing on attraction of (dx, dy)
   */
  handleMagnetOffsetWithAttract(
    dx: number,
    dy: number,
    data?: MagnetEventParams,
  ): CalcMultiAttractionsResult | undefined {
    const {
      self: {
        rectangle: selfRect,
      } = new Pack(this),
    } = data || {};

    return this.handleMagnetPositionWithAttract(
      selfRect.x + dx,
      selfRect.y + dy,
      data,
    );
  }

  /**
   * Handler of dragging start
   */
  handleMagnetDragStart(evt: Event): void {
    if (this.mgDisabled || this.mgUnmovable) {
      // no action if it's disabled/unmovable
      return;
    }

    const {
      position,
      zIndex,
      transform,
    } = getStyle(this);
    const {
      mgDisabled: disabled,
      mgUnattractable: unattractable,
      mgUnmovable: unmovable,
      mgGroup: group,
      mgAlignTo: alignTo,
      mgAlignToParent: alignToParent,
      mgCrossPrevent: crossPrevent,
      mgAttractDistance: attractDistance,
      parentElement,
    } = this;
    const lastOffset = this.getLastMagnetOffset();
    const self = new Pack(this);
    const parent = (isnull(parentElement)
      ? undefined
      : new Pack(parentElement)
    );
    const crossPreventParent = crossPrevent.includes(Block.MAGNET_CROSS_PREVENT.parent);
    const alignToExtend = alignTo.includes(Block.MAGNET_ALIGN_TO.extend);
    const attachOptions = {
      attractDistance,
      alignToExtend,
      crossPreventParent,
      parentPack: parent,
    };
    const data: MagnetEventParams = {
      attractDistance,
      alignTo,
      alignToOuter: alignTo.includes(Block.MAGNET_ALIGN_TO.outer),
      alignToInner: alignTo.includes(Block.MAGNET_ALIGN_TO.inner),
      alignToCenter: alignTo.includes(Block.MAGNET_ALIGN_TO.center),
      alignToExtend: alignTo.includes(Block.MAGNET_ALIGN_TO.extend),
      alignToParent,
      alignToParentInner: alignToParent.includes(Block.MAGNET_ALIGN_TO_PARENT.inner),
      alignToParentCenter: alignToParent.includes(Block.MAGNET_ALIGN_TO_PARENT.center),
      crossPrevent,
      crossPreventParent,
      alignments: Block.getMagnetAlignmentsOfAlignTo(alignTo),
      parentAlignments: Block.getMagnetAlignmentsOfAlignTo(alignToParent),
      onJudgeDistance: this.judgeMagnetDistance.bind(this),
      onJudgeAttractSummary: this.judgeMagnetAttractSummary.bind(this),
      onJudgeParentDistance: this.judgeMagnetParentDistance.bind(this),
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
      attachOptions,
    };

    if (this.triggerMagnetEvent(
      Block.MAGNET_EVENT.start,
      generateDragEventDetail(evt, data),
    )) {
      return;
    }

    dragPassData.set(this, data);

    const onMove = (e: Event): void => {
      const passData = dragPassData.get(this) as MagnetEventParams;

      if (this.triggerMagnetEvent(
        Block.MAGNET_EVENT.move,
        generateDragEventDetail(e, passData),
      )) {
        return;
      }

      dragPassData.set(this, this.handleMagnetDragMove(e, passData));
    };
    const onEnd = (e: Event): void => {
      const passData = dragPassData.get(this) as MagnetEventParams;

      if (this.triggerMagnetEvent(
        Block.MAGNET_EVENT.end,
        generateDragEventDetail(e, passData),
      )) {
        return;
      }

      this.handleMagnetDragEnd(e, passData);

      removeEventListener(window, EVENT_DRAGMOVE, onMove);
      removeEventListener(window, EVENT_DRAGEND, onEnd);
      dragPassData.delete(this);
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
  }

  /**
   * Handler of dragging move
   */
  handleMagnetDragMove(evt: Event, data: MagnetEventParams): MagnetEventParams {
    const currXY = getEvtClientXY(evt);
    const {
      self: {
        rectangle: {
          x: selfX,
          y: selfY,
        },
      },
      startXY,
    } = data;
    const attractSummary = this.handleMagnetPositionWithAttract(
      currXY.x - startXY.x + selfX,
      currXY.y - startXY.y + selfY,
      data,
    );

    return {
      ...data,
      lastAttractSummary: attractSummary,
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
