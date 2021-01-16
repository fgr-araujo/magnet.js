'use strict';

import {
  isset, tonum, isarray, isstr,
  objMap, objValues, objKeys,
  getStyle,
} from './stdlib';
import Rect, {
  stdRect,
} from './rect';


const PROP_ALIGN_TOP_TO_TOP = 'topToTop';
const PROP_ALIGN_TOP_TO_BOTTOM = 'topToBottom';
const PROP_ALIGN_RIGHT_TO_RIGHT = 'rightToRight';
const PROP_ALIGN_RIGHT_TO_LEFT = 'rightToLeft';
const PROP_ALIGN_BOTTOM_TO_BOTTOM = 'bottomToBottom';
const PROP_ALIGN_BOTTOM_TO_TOP = 'bottomToTop';
const PROP_ALIGN_LEFT_TO_LEFT = 'leftToLeft';
const PROP_ALIGN_LEFT_TO_RIGHT = 'leftToRight';
const PROP_ALIGN_X_CENTER_TO_X_CENTER = 'xCenter';
const PROP_ALIGN_Y_CENTER_TO_Y_CENTER = 'yCenter';
const ALIGNMENT_X = [
  PROP_ALIGN_RIGHT_TO_RIGHT,
  PROP_ALIGN_RIGHT_TO_LEFT,
  PROP_ALIGN_LEFT_TO_LEFT,
  PROP_ALIGN_LEFT_TO_RIGHT,
  PROP_ALIGN_X_CENTER_TO_X_CENTER,
];
const ALIGNMENT_Y = [
  PROP_ALIGN_TOP_TO_TOP,
  PROP_ALIGN_TOP_TO_BOTTOM,
  PROP_ALIGN_BOTTOM_TO_BOTTOM,
  PROP_ALIGN_BOTTOM_TO_TOP,
  PROP_ALIGN_Y_CENTER_TO_Y_CENTER,
];
const EVENT = {
  dragStart: ['mousedown', 'touchstart'],
  dragMove: ['mousemove', 'touchmove'],
  dragEnd: ['mouseup', 'touchend'],
};

const PROP_MAGNET_ROOT = '__magnet';
const PROP_ORIGIN_STYLES = 'originStyles';
const PROP_LAST_ATTRACT = 'lastNearest';
const STYLE_PROPS = {
  x: '--magnet-offset-x',
  y: '--magnet-offset-y',
};
const SYMBOL_SPLIT = /[|;,\s]/;
const ATTRIBUTE_PROPS = {
  disabled: 'disabled',
  group: 'group',
  alignTo: 'alignTo',
  crossPrevent: 'crossPrevent',
  unattractable: 'unattract',
  attractDistance: 'attractDistance',
};


function addEventListener(dom, names, func) {
  (isarray(names) ?names :[names]).forEach((name) => {
    dom.addEventListener(name, func);
  });
}
function removeEventListener(dom, names, func) {
  (isarray(names) ?names :[names]).forEach((name) => {
    dom.removeEventListener(name, func);
  });
}
function triggerMagnetEvent(target, eventName, options) {
  return target instanceof Magnet
    ?target.triggerCustomEvent(eventName, options)
    :false;
}


/**
 * Get clientX and clientY of mouse/touch event
 */
function getEventClientXY(evt) {
  const {
    clientX: mx,
    clientY: my,
    touches: [
      {
        clientX: x = mx,
        clientY: y = my,
      } = {},
    ] = [],
  } = evt;

  return { x, y };
}


class Magnet extends HTMLElement {
  constructor() {
    super();

    const onDragStart = (evt) => {
      if (this.disabled) {
        // not able to drag
        return;
      }
  
      const {
        x: startX,
        y: startY,
      } = getEventClientXY(evt);
      const lastAttract = this[PROP_MAGNET_ROOT][PROP_LAST_ATTRACT];
      const rectangle = stdRect(this);
      const lastOffsetX = tonum(this.style.getPropertyValue(STYLE_PROPS.x) || 0);
      const lastOffsetY = tonum(this.style.getPropertyValue(STYLE_PROPS.y) || 0);
      const alignTo = this.alignTo;
      const alignToOuterline = alignTo.includes(Magnet.ALIGN_TO.outerline);
      const crossPrevent = this.crossPrevent;
      const attractDistance = this.attractDistance;
      const alignments = [];

      if (alignTo.includes(Magnet.ALIGN_TO.outer)) {
        alignments.push(Magnet.ALIGNMENT.topToBottom);
        alignments.push(Magnet.ALIGNMENT.rightToLeft);
        alignments.push(Magnet.ALIGNMENT.bottomToTop);
        alignments.push(Magnet.ALIGNMENT.leftToRight);
      }
      if (alignTo.includes(Magnet.ALIGN_TO.inner)) {
        alignments.push(Magnet.ALIGNMENT.topToTop);
        alignments.push(Magnet.ALIGNMENT.rightToRight);
        alignments.push(Magnet.ALIGNMENT.bottomToBottom);
        alignments.push(Magnet.ALIGNMENT.leftToLeft);
      }
      if (alignTo.includes(Magnet.ALIGN_TO.center)) {
        alignments.push(Magnet.ALIGNMENT.xCenterToXCenter);
        alignments.push(Magnet.ALIGNMENT.yCenterToYCenter);
      }

      const isInAlignRange = (selfA, selfB, targetA, targetB) => {
        const targetRangeA = targetA - attractDistance;
        const targetRangeB = targetB + attractDistance;

        if (selfA >= targetRangeA && selfA <= targetRangeB) {
          return true;
        } else if (selfB >= targetRangeA && selfB <= targetRangeB) {
          return true;
        }

        return false;
      };
      const pack = {
        lastAttract,
        source: {
          raw: this,
          rectangle,
        },
        startX,
        startY,
        lastOffsetX,
        lastOffsetY,
        targets: this.getMagnetTargets({
          converter: (dom) => {
            return {
              raw: dom,
              rectangle: stdRect(dom),
            };
          },
        }),
        unattractable: this.unattractable,
        attractDistance,
        alignTo,
        alignToOuterline,
        alignments,
        crossPrevent,
        crossPreventParent: crossPrevent.includes(Magnet.PREVENT_CROSS.parent),
        crossPreventTarget: crossPrevent.includes(Magnet.PREVENT_CROSS.target),
        parentRectangle: stdRect(this.parentElement),
        optionsForGettingDistances: {
          alignments,
          absDistance: true,
          sort: true,
          onJudgeDistance: ({ value }, alignment, pack) => {
            if (value > attractDistance) {
              return false;
            } else if (!alignToOuterline) {
              const {
                source: sourceRect,
                target: {
                  rectangle: targetRect,
                },
              } = pack;

              switch (alignment) {
                case PROP_ALIGN_RIGHT_TO_RIGHT:
                case PROP_ALIGN_LEFT_TO_LEFT:
                case PROP_ALIGN_RIGHT_TO_LEFT:
                case PROP_ALIGN_LEFT_TO_RIGHT:
                  {
                    const {
                      top: sourceTop,
                      bottom: sourceBottom,
                    } = sourceRect;
                    const {
                      top: targetTop,
                      bottom: targetBottom,
                    } = targetRect;

                    return (
                      isInAlignRange(sourceTop, sourceBottom, targetTop, targetBottom)
                      || isInAlignRange(targetTop, targetBottom, sourceTop, sourceBottom)
                    );
                  }

                case PROP_ALIGN_TOP_TO_TOP:
                case PROP_ALIGN_BOTTOM_TO_BOTTOM:
                case PROP_ALIGN_TOP_TO_BOTTOM:
                case PROP_ALIGN_BOTTOM_TO_TOP:
                  {
                    const {
                      right: sourceRight,
                      left: sourceLeft,
                    } = sourceRect;
                    const {
                      right: targetRight,
                      left: targetLeft,
                    } = targetRect;

                    return (
                      isInAlignRange(sourceLeft, sourceRight, targetLeft, targetRight)
                      || isInAlignRange(targetLeft, targetRight, sourceLeft, sourceRight)
                    );
                  }
              }
            }
            
            return true;
          },
          onJudgeResult: ({ minDistance }) => {
            return isset(minDistance); 
          },
        },
        nears: [],
        nearest: null,
      };
      const cancelled = triggerMagnetEvent(this, EVENT.start, {
        detail: pack,
      });

      if (!cancelled) {
        const onDragMove = (evt) => {
          const cancelled = triggerMagnetEvent(this, Magnet.EVENT.move, {
            detail: pack,
          });

          if (!cancelled) {
            this.onMagnetDragMove(evt, pack);
          }
        };
        const onDragEnd = (evt) => {
          const cancelled = triggerMagnetEvent(this, Magnet.EVENT.end, {
            detail: pack,
          });

          removeEventListener(document.body, EVENT.dragMove, onDragMove);
          removeEventListener(document.body, EVENT.dragEnd, onDragEnd);
          if (!cancelled) {
            this.onMagnetDragEnd(evt, pack);
          }
        };

        addEventListener(document.body, EVENT.dragMove, onDragMove);
        addEventListener(document.body, EVENT.dragEnd, onDragEnd);
        this.onMagnetDragStart(evt, pack);
      }
    };

    addEventListener(this, EVENT.dragStart, onDragStart);
    Object.defineProperty(this, PROP_MAGNET_ROOT, {
      value: {},
    });
  }

  static get nodeName() {
    return 'magnet-block';
  }

  static get observedAttributes() {
    return objValues(ATTRIBUTE_PROPS);
  }

  /**
   * Get distance of target element
   */
  static getDistanceOfTarget(source, target, {
    alignments = objValues(Magnet.ALIGNMENT),
    absDistance = false,
    onJudgeDistance = () => true,
  }) {
    const rectSource = stdRect(source);
    const rectTarget = target.rectangle
      ?stdRect(target.rectangle)
      :stdRect(target);
    const objectSource = {
      rectangle: rectSource,
      raw: source,
    };
    const objectTarget = {
      rectangle: rectTarget,
      raw: target.raw || target,
    };
    const pack = {
      source,
      target,
    };
    const stdNum = absDistance
      ?Math.abs
      :(n) => n;
    const calcDistance = (alignment) => {
      switch (alignment) {
        case PROP_ALIGN_TOP_TO_TOP:
          return rectTarget.top - rectSource.top;

        case PROP_ALIGN_TOP_TO_BOTTOM:
          return rectTarget.bottom - rectSource.top;

        case PROP_ALIGN_RIGHT_TO_RIGHT:
          return rectTarget.right - rectSource.right;

        case PROP_ALIGN_RIGHT_TO_LEFT:
          return rectTarget.left - rectSource.right;

        case PROP_ALIGN_BOTTOM_TO_BOTTOM:
          return rectTarget.bottom - rectSource.bottom;

        case PROP_ALIGN_BOTTOM_TO_TOP:
          return rectTarget.top - rectSource.bottom;

        case PROP_ALIGN_LEFT_TO_LEFT:
          return rectTarget.left - rectSource.left;

        case PROP_ALIGN_LEFT_TO_RIGHT:
          return rectTarget.right - rectSource.left;

        case PROP_ALIGN_X_CENTER_TO_X_CENTER:
          return .5 * ((rectTarget.right - rectSource.right) + (rectTarget.left - rectSource.left));

        case PROP_ALIGN_Y_CENTER_TO_Y_CENTER:
          return .5 * ((rectTarget.top - rectSource.top) + (rectTarget.bottom - rectSource.bottom));
      }
    };
    const distances = alignments.reduce((distances, alignment) => {
      const raw = calcDistance(alignment);
      const result = {
        raw,
        value: stdNum(raw),
      };

      if (onJudgeDistance(result, alignment, pack)) {
        distances[alignment] = result;
      }
      
      return distances;
    }, {});
    const ranking = objKeys(distances).sort((a, b) => {
      return distances[a].value - distances[b].value;
    });
    const minAlignment = ranking[0];
    const maxAlignment = ranking[ranking.length - 1];
    const minDistance = distances[minAlignment];
    const maxDistance = distances[maxAlignment];
    const result = {
      source: objectSource,
      target: objectTarget,
      distances,
      ranking,
      minAlignment,
      minDistance,
      maxAlignment,
      maxDistance,
    };

    return result;
  }

  /**
   * Get distances of target elements
   */
  static getDistanceOfTargets(
    source,
    targets = [],
    {
      alignments = objValues(Magnet.ALIGNMENT),
      absDistance = false,
      sort = false,
      onJudgeResult: refOnJudgeResult = () => true,
      onJudgeDistance,
    } = []
  ) {
    const options = {
      alignments,
      absDistance,
      onJudgeDistance,
    };
    const onJudgeResult = refOnJudgeResult.bind(this);

    return targets.reduce((results, target) => {
      const result = Magnet.getDistanceOfTarget(source, target, options);

      if (onJudgeResult(result, target)) {
        if (sort) {
          const {
            minDistance: currentMinDistance,
          } = result;
          const insertIndex = results.findIndex(({ minDistance }) => {
            return currentMinDistance <= minDistance;
          });

          results.splice(insertIndex, 0, result);
        } else {
          results.push(result);
        }
      }

      return results
    }, []);
  }

  // connectedCallback() {
  //   console.log('CONNECTED');
  // }
  // disconnectedCallback() {
  //   console.log('DISCONNECTED')
  // }
  // adoptedCallback() {
  //   console.log('ADOPTED')
  // }
  // attributeChangedCallback(attrName, oldVal, newVal) {
  //   // console.log('ATTRIBUTE CHANGED', attrName, oldVal, newVal);
  //   switch (attrName) {
  //     case ATTRIBUTE_PROPS.disabled:
  //     case ATTRIBUTE_PROPS.group:
  //     case ATTRIBUTE_PROPS.alignment:
  //   }
  // }
  
  /**
   * Disabled
   */
  get disabled() {
    return this.hasAttribute(ATTRIBUTE_PROPS.disabled);
  }
  set disabled(disabled) {
    if (disabled) {
      this.setAttribute(ATTRIBUTE_PROPS.disabled, '');
    } else {
      this.removeAttribute(ATTRIBUTE_PROPS.disabled);
    }
  }

  /**
   * Group
   */
  get group() {
    return this.getAttribute(ATTRIBUTE_PROPS.group);
  }
  set group(group) {
    this.setAttribute(ATTRIBUTE_PROPS.group, group);
  }

  /**
   * Event
   */
  static EVENT = Object.defineProperties({}, objMap({
    start: 'start', // start to drag
    move: 'move', // dragging
    end: 'end', // end of dragging
    attract: 'attract', // attract to target
    attractMove: 'attractmove', // attract and move by target
    unattract: 'unattract', // escape from attracted target
    attracted: 'attracted', // be attracted by source
    attractedMove: 'attractedmove', // be attracted and source is moving
    unattracted: 'unattracted', // source escape
  }, (value) => ({
    value: `magnet${value}`,
    enumerable: true,
  })))

  /**
   * Alignment
   */
  static ALIGNMENT = Object.defineProperties({}, objMap({
    topToTop: PROP_ALIGN_TOP_TO_TOP,
    topToBottom: PROP_ALIGN_TOP_TO_BOTTOM,
    rightToRight: PROP_ALIGN_RIGHT_TO_RIGHT,
    rightToLeft: PROP_ALIGN_RIGHT_TO_LEFT,
    bottomToBottom: PROP_ALIGN_BOTTOM_TO_BOTTOM,
    bottomToTop: PROP_ALIGN_BOTTOM_TO_TOP,
    leftToLeft: PROP_ALIGN_LEFT_TO_LEFT,
    leftToRight: PROP_ALIGN_LEFT_TO_RIGHT,
    xCenterToXCenter: PROP_ALIGN_X_CENTER_TO_X_CENTER,
    yCenterToYCenter: PROP_ALIGN_Y_CENTER_TO_Y_CENTER,
  }, (value) => ({
    value,
    enumerable: true,
  })))

  /**
   * Align to
   */
  static ALIGN_TO = Object.defineProperties({}, objMap({
    outerline: 'outerline',
    outer: 'outer',
    inner: 'inner',
    center: 'center',
  }, (value) => ({
    value,
    enumerable: true,
  })))
  get alignTo() {
    const validAlignTos = objValues(Magnet.ALIGN_TO);

    return this.hasAttribute(ATTRIBUTE_PROPS.alignTo)
      ?this.getAttribute(ATTRIBUTE_PROPS.alignTo)
        .split(SYMBOL_SPLIT)
        .filter((alignTo) => validAlignTos.includes(alignTo))
      :validAlignTos;
  }
  set alignTo(alignTo) {
    if (isstr(alignTo)) {
      const validAlignTos = objValues(Magnet.ALIGN_TO);

      this.setAttribute(ATTRIBUTE_PROPS.alignTo, alignTo
        .split(SYMBOL_SPLIT)
        .filter((alignTo) => validAlignTos.includes(alignTo))
        .join('|')
      );
    } else {
      this.removeAttribute(ATTRIBUTE_PROPS.alignTo);
    }
  }

  /**
   * Prevent cross
   */
  static PREVENT_CROSS = Object.defineProperties({}, objMap({
    parent: 'parent',
    // target: 'target', // yet to support
  }, (value) => ({
    value,
    enumerable: true,
  })))
  get crossPrevent() {
    const validCrossPrevents = objValues(Magnet.PREVENT_CROSS);

    return this.hasAttribute(ATTRIBUTE_PROPS.crossPrevent)
      ?this.getAttribute(ATTRIBUTE_PROPS.crossPrevent)
        .split(SYMBOL_SPLIT)
        .filter((crossPrevent) => validCrossPrevents.includes(crossPrevent))
      :[];
  }
  set crossPrevent(crossPrevent) {
    if (isstr(alignment)) {
      const validCrossPrevents = objValues(Magnet.PREVENT_CROSS);

      this.setAttribute(ATTRIBUTE_PROPS.crossPrevent, crossPrevent
        .split(SYMBOL_SPLIT)
        .filter((crossPrevent) => validCrossPrevents.includes(crossPrevent))
        .join('|')
      );
    } else {
      this.removeAttribute(ATTRIBUTE_PROPS.crossPrevent);
    }
  }

  /**
   * Unattractable
   */
  get unattractable() {
    return this.hasAttribute(ATTRIBUTE_PROPS.unattractable);
  }
  set unattractable(unattractable) {
    if (unattractable) {
      this.setAttribute(ATTRIBUTE_PROPS.unattractable, '');
    } else {
      this.removeAttribute(ATTRIBUTE_PROPS.unattractable);
    }
  }

  /**
   * Attract distance
   */
  get attractDistance() {
    return tonum(this.getAttribute(ATTRIBUTE_PROPS.attractDistance) || 0);
  }
  set attractDistance(distance) {
    if (isnum(distance)) {
      this.setAttribute(ATTRIBUTE_PROPS.attractDistance, distance);
    }
  }

  /**
   * Trigger custom event
   * 
   * @return boolean of cancelled
   */
  triggerCustomEvent(eventName, {
    detail,
    composed = false,
    cancelable = true,
    bubbles = false,
  } = {}) {
    const event = new CustomEvent(eventName, {
      detail,
      composed,
      cancelable,
      bubbles,
    });

    return !this.dispatchEvent(event);
  }


  /**
   * Magnet drag event listeners
   */
  onMagnetDragStart(evt, pack) {
    const {
      lastAttract,
    } = pack;
    const {
      position,
      zIndex,
      transform,
    } = getStyle(this);

    evt.preventDefault();
    evt.stopImmediatePropagation();

    this.style.setProperty('position', 'relative');
    this.style.setProperty('z-index', Date.now(), 'important');

    // TODO: handle origin transform?
    this.style.setProperty('transform', `translate(var(${STYLE_PROPS.x}), var(${STYLE_PROPS.y}))`, 'important');

    this[PROP_MAGNET_ROOT][PROP_ORIGIN_STYLES] = {
      position,
      zIndex,
      transform,
    };

    if (lastAttract) {
      const {
        source,
      } = pack;
      const {
        nearest: {
          target: lastTarget,
        },
      } = lastAttract;
      const {
        raw: lastTargetRaw,
      } = lastTarget;
      const options = {
        detail: {
          source,
          target: lastTarget,
          result: lastAttract,
        },
      };

      // trigger attract of this
      triggerMagnetEvent(this, Magnet.EVENT.attract, options);

      // trigger attracted of last target
      triggerMagnetEvent(lastTargetRaw, Magnet.EVENT.attracted, options);
    }
  }
  onMagnetDragMove(evt, pack) {
    const {
      lastAttract,
      source,
      startX,
      startY,
      lastOffsetX,
      lastOffsetY,
      targets,
      unattractable,
      attractDistance,
      alignTo,
      alignToOuterline,
      alignments,
      crossPrevent,
      crossPreventParent,
      crossPreventTarget,
      parentRectangle,
      optionsForGettingDistances,
    } = pack;
    const { rectangle } = source;
    const {
      top: originY,
      left: originX,
      width,
      height,
    } = rectangle;
    const {
      x: cx,
      y: cy,
    } = getEventClientXY(evt);
    const offsetX = cx - startX;
    const offsetY = cy - startY;
    const currentRect = new Rect(rectangle).offset(offsetX, offsetY);

    if (crossPreventParent) {
      // prevent from going out of parent edges

      if (currentRect.x < parentRectangle.left) {
        currentRect.moveX(parentRectangle.left);
      } else if (currentRect.x + width > parentRectangle.right) {
        currentRect.moveX(parentRectangle.right - width);
      }
      if (currentRect.y < parentRectangle.top) {
        currentRect.moveY(parentRectangle.top);
      } else if (currentRect.y + height > parentRectangle.bottom) {
        currentRect.moveY(parentRectangle.bottom - height);
      }
    }

    const finalRect = new Rect(currentRect);
    
    handleAttract:
    do {
      if (unattractable) {
        break;
      }
        
      // check current attracted targets
      const nears = Magnet.getDistanceOfTargets(currentRect, targets, optionsForGettingDistances);
      
      const nearest = nears[0];
      const lastTarget = lastAttract && lastAttract.nearest.target;
      const lastTargetRaw = lastTarget && lastTarget.raw;
      const originDetail = {
        source,
        //target: { raw, rectangle },
        result: {
          targets,
          nears,
          nearest,
          //x: { alignment, distance },
          //y: { alignment, distance },
        },
      };

      pack.nears = nears;
      pack.nearest = nearest;

      if (!nearest) {
        // not attract to anyone

        if (lastAttract) {
          // not attract to last attracted target
          
          const options = {
            detail: {
              ...originDetail,
              target: lastTarget,
              result: {
                x: {
                  alignment: undefined,
                  distance: Infinity,
                },
                y: {
                  alignment: undefined,
                  distance: Infinity,
                },
              },
            },
          };

          // trigger unattrect of this
          const selfCancelled = triggerMagnetEvent(this, Magnet.EVENT.unattract, options);

          if (selfCancelled) {
            break;
          }

          // trigger unattracted of target
          const targetCancelled = triggerMagnetEvent(lastTargetRaw, Magnet.EVENT.unattracted, options);

          if (targetCancelled) {
            break;
          }

          delete pack.lastAttract;
        }
        break;
      }
      
      // at least 1 attracted target

      const {
        source,
        target,
        ranking,
        distances,
      } = nearest;
      const {
        rectangle: targetRect,
        raw: targetRaw,
      } = target;
      const minXAlignment = ranking.find((alignment) => ALIGNMENT_X.includes(alignment));
      const minYAlignment = ranking.find((alignment) => ALIGNMENT_Y.includes(alignment));
      const minXDistance = distances[minXAlignment];
      const minYDistance = distances[minYAlignment];
      
      // align on x direction
      switch (minXAlignment) {
        case PROP_ALIGN_RIGHT_TO_RIGHT:
        case PROP_ALIGN_LEFT_TO_LEFT:
        case PROP_ALIGN_RIGHT_TO_LEFT:
        case PROP_ALIGN_LEFT_TO_RIGHT:
          finalRect.offsetX(minXDistance.raw);
          break;

        case PROP_ALIGN_X_CENTER_TO_X_CENTER:
          finalRect.offsetX(minXDistance.raw);
          break;
      }

      // align on y direction
      switch (minYAlignment) {
        case PROP_ALIGN_TOP_TO_TOP:
        case PROP_ALIGN_BOTTOM_TO_BOTTOM:
        case PROP_ALIGN_TOP_TO_BOTTOM:
        case PROP_ALIGN_BOTTOM_TO_TOP:
          finalRect.offsetY(minYDistance.raw);
          break;

        case PROP_ALIGN_Y_CENTER_TO_Y_CENTER:
          finalRect.offsetY(minYDistance.raw);
          break;
      }

      // is this still attracts to last attracted target
      const stillLastTarget = lastTargetRaw === targetRaw;

      if (!stillLastTarget) {
        if (lastAttract) {
          // not attract to last attracted target
          
          const options = {
            detail: {
              ...originDetail,
              target: lastTarget,
              result: {
                x: {
                  alignment: undefined,
                  distance: Infinity,
                },
                y: {
                  alignment: undefined,
                  distance: Infinity,
                },
              },
            },
          };

          // trigger unattrect of this
          const selfCancelled = triggerMagnetEvent(this, Magnet.EVENT.unattract, options);

          if (selfCancelled) {
            break;
          }

          // trigger unattracted of target
          const targetCancelled = triggerMagnetEvent(lastTargetRaw, Magnet.EVENT.unattracted, options);

          if (targetCancelled) {
            break;
          }
        }

        delete pack.lastAttract;
      }
      
      const lastMinXAlignment = lastAttract && lastAttract.x.alignment;
      const lastMinYAlignment = lastAttract && lastAttract.y.alignment;
      const alignmentChanged = lastMinXAlignment !== minXAlignment || lastMinYAlignment !== minYAlignment;
      const triggerAttract = !stillLastTarget || alignmentChanged;
      const options = {
        detail: {
          ...originDetail,
          target,
          result: {
            ...originDetail.result,
            x: {
              alignment: minXAlignment,
              distance: minXDistance,
            },
            y: {
              alignment: minYAlignment,
              distance: minYDistance,
            },
            offset: {
              source: {
                from: new Rect(currentRect),
                to: new Rect(finalRect),
              },
            },
          },
        },
      };

      // trigger attract/move of this
      const selfCancelled = triggerMagnetEvent(
        this,
        triggerAttract
          ?Magnet.EVENT.attract
          :Magnet.EVENT.attractMove,
        options
      );

      if (selfCancelled) {
        break;
      }

      // trigger attracted/move of target
      const targetCancelled = triggerMagnetEvent(
        targetRaw,
        triggerAttract
          ?Magnet.EVENT.attracted
          :Magnet.EVENT.attractedMove,
        options
      );
      
      if (targetCancelled) {
        break;
      }

      pack.lastAttract = options.detail.result;
    } while (false);

    const finalX = finalRect.x - originX + lastOffsetX;
    const finalY = finalRect.y - originY + lastOffsetY;

    this.handleOffset(finalX, finalY);
  }
  onMagnetDragEnd(evt, pack) {
    const {
      lastAttract,
    } = pack;
    const {
      [PROP_ORIGIN_STYLES]: {
        position,
        zIndex,
        transform,
      } = {},
    } = this[PROP_MAGNET_ROOT];

    this.style.setProperty('position', position);
    this.style.setProperty('z-index', zIndex);

    // TODO: handle origin transform?

    this[PROP_MAGNET_ROOT][PROP_LAST_ATTRACT] = lastAttract;
  }


  /**
   * Get group targets
   */
  getMagnetTargets({
    converter = (dom) => dom,
  }) {
    const group = this.group;
    const selector = isstr(group)
      ?`[group="${group}"]`
      :`:not([group])`;
    const targets = [];

    Array
      .from(document.querySelectorAll(`${this.nodeName}${selector}`) || [])
      .forEach((dom) => {
        if (dom === this) {
          return;
        }

        targets.push(converter(dom));
      });

    return targets;
  }

  /**
   * Get distance of target element
   */
  getDistanceOfTarget(target, options) {
    return Magnet.getDistanceOfTarget(this, target, options);
  }
  
  /**
   * Get distance of targets
   */
  getDistanceOfTargets(
    targets = this.getMagnetTargets(),
    options
  ) {
    return Magnet.getDistanceOfTargets(this, targets, options);
  }

  /**
   * Move position to (x, y)
   */
  handleOffset(x, y) {
    this.style.setProperty(STYLE_PROPS.x, `${x}px`, 'important');
    this.style.setProperty(STYLE_PROPS.y, `${y}px`, 'important');
  }

  /**
   * Reset position
   */
  resetPosition() {
    this.style.removeProperty(STYLE_PROPS.x);
    this.style.removeProperty(STYLE_PROPS.y);
    this.style.removeProperty('transform');
  }
}

if (!customElements.get(Magnet.nodeName)) {
  customElements.define(
    Magnet.nodeName,
    Magnet
  );
  customElements.whenDefined(Magnet.nodeName)
    .then(() => {
      console.log(`Magnet ready!`);
    });
}

window.Magnet = Magnet;

export default Magnet;
