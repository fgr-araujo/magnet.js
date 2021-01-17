'use strict';

import {
  isset, tonum, isarray, isstr,
  objMap, objValues, objKeys,
  getStyle,
  isfunc,
} from './stdlib';
import Rect, {
  stdRect,
} from './rect';
import PROP from './prop';
import {
  calcDistanceOfTarget,
  calcDistanceOfMultipleTargets,
} from './distance';

import onDragStart from './caller/onDragStart';


const PROP_MAGNET_ROOT = '__magnet';
const PROP_ELEM_MAGNET_RECTANGLE = '__magnetRectangle';
const PROP_ORIGIN_STYLES = 'originStyles';
const STYLE_PROPS = {
  x: '--magnet-offset-x',
  y: '--magnet-offset-y',
};
const SYMBOL_SPLIT = /[|;,\s]/;

const EVENT = {
  dragStart: ['mousedown', 'touchstart'],
  dragMove: ['mousemove', 'touchmove'],
  dragEnd: ['mouseup', 'touchend'],
};


/**
 * Add event listeners of target
 */
function addEventListener(target, names, func) {
  (isarray(names) ?names :[names]).forEach((name) => {
    target.addEventListener(name, func);
  });
}

/**
 * Remove event listeners of target
 */
function removeEventListener(target, names, func) {
  (isarray(names) ?names :[names]).forEach((name) => {
    target.removeEventListener(name, func);
  });
}

/**
 * Trigger event with options only if target is Magnet element
 */
function triggerMagnetEvent(target, eventName, options) {
  return target instanceof Magnet
    ?target.triggerCustomEvent(eventName, options)
    :false;
}

/**
 * Get clientX and clientY of mouse/touch event
 */
function getEventClientXY(event) {
  if (event?.touches?.length) {
    const touch = event.touches[0];

    return {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  return {
    x: event.clientX,
    y: event.clientY,
  };
}

class Magnet extends HTMLElement {
  constructor() {
    super();

    Object.defineProperty(this, PROP_MAGNET_ROOT, {
      value: {},
    });

    // trigger enabled action
    this.attributeChangedCallback(PROP.ATTRIBUTE.DISTABLED, null, this.disabled);
  }

  /**
   * Node name of <magnet-block>
   */
  static get nodeName() {
    return 'magnet-block';
  }

  /**
   * Observed attributes
   */
  static get observedAttributes() {
    return objValues(PROP.ATTRIBUTE);
  }
  
  /**
   * Callback on attribute changed
   */
  attributeChangedCallback(attributeName, oldValue, newValue) {
    switch (attributeName) {
      case PROP.ATTRIBUTE.DISTABLED:
        if (newValue) {
          removeEventListener(this, EVENT.dragStart, onDragStart);
        } else {
          addEventListener(this, EVENT.dragStart, onDragStart);
        }
        break;
    }
  }

  // connectedCallback() {}
  // disconnectedCallback() {}
  // adoptedCallback() {}

  /**
   * Get distance of target element
   */
  static getDistanceOfTarget(source, target, {
    alignments = objValues(Magnet.ALIGNMENT),
    absDistance = false,
    onJudgeDistance,
  }) {
    return calcDistanceOfTarget(source, target, {
      alignments,
      absDistance,
      onJudgeDistance,
    });
  }
  
  /**
   * Get distances of target elements
   */
  static getDistanceOfMultipleTargets(
    source,
    targets = [],
    {
      alignments = objValues(Magnet.ALIGNMENT),
      absDistance = false,
      sort = true,
      onJudgeDistance,
      onJudgeResult,
    } = {},
    bindResults = [],
  ) {
    return calcDistanceOfMultipleTargets(source, targets, {
      alignments,
      absDistance,
      sort,
      onJudgeDistance,
      onJudgeResult,
    }, bindResults);
  }
  
  /**
   * Event names
   */
  static EVENT = Object.defineProperties({}, objMap({
    start: 'start',                 // start to drag
    move: 'move',                   // dragging
    end: 'end',                     // end of dragging
    attract: 'attract',             // attract to target
    attractMove: 'attractmove',     // attract and move by target
    unattract: 'unattract',         // escape from attracted target
    attracted: 'attracted',         // be attracted by source
    attractedMove: 'attractedmove', // be attracted and source is moving
    unattracted: 'unattracted',     // source escape
  }, (value) => ({
    value: `magnet${value}`, // prefix
    enumerable: true,
  })))

  /**
   * Disabled
   * 
   * Set to be no action for dragging and attraction
   */
  get disabled() {
    return this.hasAttribute(PROP.ATTRIBUTE.DISTABLED);
  }
  set disabled(disabled) {
    if (disabled) {
      this.setAttribute(PROP.ATTRIBUTE.DISTABLED, '');
    } else {
      this.removeAttribute(PROP.ATTRIBUTE.DISTABLED);
    }
  }

  /**
   * Group
   * 
   * By default only attractable to magnets with the same group
   * If not assign any group, it would attract to all magnets 
   * but not attractable for grouped magnets
   */
  get group() {
    return this.getAttribute(PROP.ATTRIBUTE.GROUP);
  }
  set group(group) {
    this.setAttribute(PROP.ATTRIBUTE.GROUP, group);
  }

  /**
   * Unattractable
   * 
   * Set to be no attraction as source or target
   */
  get unattractable() {
    return this.hasAttribute(PROP.ATTRIBUTE.UNATTRACTABLE);
  }
  set unattractable(unattractable) {
    if (unattractable) {
      this.setAttribute(PROP.ATTRIBUTE.UNATTRACTABLE, '');
    } else {
      this.removeAttribute(PROP.ATTRIBUTE.UNATTRACTABLE);
    }
  }

  /**
   * Attract distance
   * 
   * Unit: px
   */
  get attractDistance() {
    return tonum(this.getAttribute(PROP.ATTRIBUTE.ATTRACT_DISTANCE) || 0);
  }
  set attractDistance(distance) {
    if (isnum(distance)) {
      this.setAttribute(PROP.ATTRIBUTE.ATTRACT_DISTANCE, distance);
    }
  }

  /**
   * Alignment
   */
  static ALIGNMENT = Object.defineProperties({}, objMap({
    topToTop: PROP.ALIGNMENT.ALIGN_TOP_TO_TOP,
    topToBottom: PROP.ALIGNMENT.ALIGN_TOP_TO_BOTTOM,
    rightToRight: PROP.ALIGNMENT.ALIGN_RIGHT_TO_RIGHT,
    rightToLeft: PROP.ALIGNMENT.ALIGN_RIGHT_TO_LEFT,
    bottomToBottom: PROP.ALIGNMENT.ALIGN_BOTTOM_TO_BOTTOM,
    bottomToTop: PROP.ALIGNMENT.ALIGN_BOTTOM_TO_TOP,
    leftToLeft: PROP.ALIGNMENT.ALIGN_LEFT_TO_LEFT,
    leftToRight: PROP.ALIGNMENT.ALIGN_LEFT_TO_RIGHT,
    xCenterToXCenter: PROP.ALIGNMENT.ALIGN_X_CENTER_TO_X_CENTER,
    yCenterToYCenter: PROP.ALIGNMENT.ALIGN_Y_CENTER_TO_Y_CENTER,
  }, (value) => ({
    value,
    enumerable: true,
  })))

  /**
   * Align to
   */
  static ALIGN_TO = Object.defineProperties({}, objMap({
    outerline: 'outerline', // align outside of source to extended line of outer/inner
    outer: 'outer',         // align outside of source to that of target
    inner: 'inner',         // align outside of source to inside of target
    center: 'center',       // align x/y center of source to that of target
  }, (value) => ({
    value,
    enumerable: true,
  })))
  get alignTo() {
    const validAlignTos = objValues(Magnet.ALIGN_TO);

    return this.hasAttribute(PROP.ATTRIBUTE.ALIGN_TO)
      ?this.getAttribute(PROP.ATTRIBUTE.ALIGN_TO)
        .split(SYMBOL_SPLIT)
        .filter((alignTo) => validAlignTos.includes(alignTo))
      :validAlignTos;
  }
  set alignTo(alignTo) {
    if (isstr(alignTo)) {
      const validAlignTos = objValues(Magnet.ALIGN_TO);

      this.setAttribute(PROP.ATTRIBUTE.ALIGN_TO, alignTo
        .split(SYMBOL_SPLIT)
        .filter((alignTo) => validAlignTos.includes(alignTo))
        .join('|')
      );
    } else {
      this.removeAttribute(PROP.ATTRIBUTE.ALIGN_TO);
    }
  }

  static ALIGN_TO_PARENT = Object.defineProperties({}, objMap({
    inner: Magnet.ALIGN_TO.inner,
    center: Magnet.ALIGN_TO.center,
  }, (value) => ({
    value,
    enumerable: true,
  })))
  get alignToParent() {
    const validAlignToParents = objValues(Magnet.ALIGN_TO_PARENT);

    return this.hasAttribute(PROP.ATTRIBUTE.ALIGN_TO_PARENT)
      ?this.getAttribute(PROP.ATTRIBUTE.ALIGN_TO_PARENT)
        .split(SYMBOL_SPLIT)
        .filter((alignToParent) => validAlignToParents.includes(alignToParent))
      :validAlignToParents;
  }
  set alignToParent(alignToParent) {
    if (isset(alignToParent)) {
      const validAlignToParents = objValues(Magnet.ALIGN_TO_PARENT);
      
      this.setAttribute(PROP.ATTRIBUTE.ALIGN_TO_PARENT, alignToParent
        .split(SYMBOL_SPLIT)
        .filter((alignToParent) => validAlignToParents.includes(alignToParent))
        .join('|')
      );
    } else {
      this.removeAttribute(PROP.ATTRIBUTE.ALIGN_TO_PARENT);
    }
  }

  /**
   * Prevent cross
   */
  static PREVENT_CROSS = Object.defineProperties({}, objMap({
    parent: 'parent',
    // target: 'target',  // yet to support
  }, (value) => ({
    value,
    enumerable: true,
  })))
  get crossPrevent() {
    const validCrossPrevents = objValues(Magnet.PREVENT_CROSS);

    return this.hasAttribute(PROP.ATTRIBUTE.CROSS_PREVENT)
      ?this.getAttribute(PROP.ATTRIBUTE.CROSS_PREVENT)
        .split(SYMBOL_SPLIT)
        .filter((crossPrevent) => validCrossPrevents.includes(crossPrevent))
      :[];
  }
  set crossPrevent(crossPrevent) {
    if (isstr(alignment)) {
      const validCrossPrevents = objValues(Magnet.PREVENT_CROSS);

      this.setAttribute(PROP.ATTRIBUTE.CROSS_PREVENT, crossPrevent
        .split(SYMBOL_SPLIT)
        .filter((crossPrevent) => validCrossPrevents.includes(crossPrevent))
        .join('|')
      );
    } else {
      this.removeAttribute(PROP.ATTRIBUTE.CROSS_PREVENT);
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

    return !this.dispatchEvent(event); // true if cancelled
  }

  /**
   * Handler of magnet dragging start
   */
  onMagnetDragStart(event, pack) {
    const {
      position,
      zIndex,
      transform,
    } = getStyle(this);

    event.preventDefault();
    event.stopImmediatePropagation();

    this.style.setProperty('position', 'relative');
    this.style.setProperty('z-index', Date.now(), 'important');

    // TODO: handle origin transform?
    this.style.setProperty('transform', `translate(var(${STYLE_PROPS.x}), var(${STYLE_PROPS.y}))`, 'important');

    this[PROP_MAGNET_ROOT][PROP_ORIGIN_STYLES] = {
      position,
      zIndex,
      transform,
    };
    this.onMagnetDragMove(event, pack);
  }

  /**
   * Handler of magnet dragging move
   */
  onMagnetDragMove(event, pack) {
    const {
      lastAttract,
      source,
      startX,
      startY,
      lastOffsetX,
      lastOffsetY,
      targets,
      unattractable,
      // attractDistance,     // not use
      // alignTo,             // not use
      // alignToParent,       // not use
      // alignToOuterline,    // not use
      parentAlignments,
      // alignments,          // not use
      // crossPrevent,        // not use
      crossPreventParent,
      crossPreventTarget,     // yet to support
      parent,
      optionsForTargetDistances,
      optionsForParentDistances,
    } = pack;
    const { rectangle } = source;
    const {
      rectangle: parentRect,
    } = parent;
    const {
      top: originY,
      left: originX,
      width,
      height,
    } = rectangle;
    const {
      x: cx,
      y: cy,
    } = getEventClientXY(event);
    const offsetX = cx - startX;
    const offsetY = cy - startY;
    const currentRect = new Rect(rectangle).offset(offsetX, offsetY);

    if (crossPreventParent) {
      // prevent from going out of parent edges

      if (currentRect.x < parentRect.left) {
        currentRect.moveX(parentRect.left);
      } else if (currentRect.x + width > parentRect.right) {
        currentRect.moveX(parentRect.right - width);
      }
      if (currentRect.y < parentRect.top) {
        currentRect.moveY(parentRect.top);
      } else if (currentRect.y + height > parentRect.bottom) {
        currentRect.moveY(parentRect.bottom - height);
      }
    }
    if (crossPreventTarget) {
      // TODO: prevent from crossing targets
    }
    
    // if (unattractable) {
    //   break;
    // }

    const finalRect = new Rect(currentRect);
    
    do {
      if (unattractable) {
        break;
      }
      
      // check current attracted targets
      const distanceResult = Magnet.getDistanceOfMultipleTargets(
        currentRect,
        targets,
        optionsForTargetDistances,
        parentAlignments.length > 0
          ?Magnet.getDistanceOfMultipleTargets(
            currentRect,
            [parentRect],
            optionsForParentDistances
          )
          :undefined
      );
      const {
        results: distances,
        min: {
          x: minX,
          y: minY,
        },
      } = distanceResult;
      const hasAttractX = isset(minX.alignment);
      const hasAttractY = isset(minY.alignment);
      const hasAttract = hasAttractX || hasAttractY;
      const lastTarget = lastAttract?.nearest.target;
      // const lastTargetRaw = lastTarget?.raw;
      const currentXTarget = minX.target;
      const currentYTarget = minY.target;
      const originDetail = {
        source,
        // target: { raw, rectangle },
        targets,
        distances,
        // min: {
        //   x: {
        //     target,
        //     alignment,
        //     distance,
        //   },
        //   y: {
        //     target,
        //     alignment,
        //     distance,
        //   },
        //   any: {
        //     target,
        //     alignment,
        //     distance,
        //   },
        // },
      };

      if (!hasAttract) {
        // not attract to anyone

        if (lastAttract) {
          // not attract to last attracted target

          const options = {
            detail: {
              ...originDetail,
              target: lastTarget,
              min: {
                x: {
                  // target: undefined,
                  // alignment: undefined,
                  distance: Infinity,
                },
                y: {
                  // target: undefined,
                  // alignment: undefined,
                  distance: Infinity,
                },
                any: {
                  // target: undefined,
                  // alignment: undefined,
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
          const targetCancelled = triggerMagnetEvent(lastTarget.raw, Magnet.EVENT.unattracted, options);

          if (targetCancelled) {
            break;
          }

          pack.lastAttract = null;
        }

        break;
      }
      // at least 1 attracted target

      if (hasAttractX) {
        // attract someone on x

        const {
          target: minXTarget,
          alignment: minXAlignment,
          distance: minXDistance,
        } = minX;

        finalRect.offsetX(minXDistance.raw);
      }

      if (hasAttractY) {
        // attract someone on y

        finalRect.offsetY(minYDistance.raw);
      }

      const {
        source,
        target,
        ranking,
        // distances,
      } = nearest;
      const {
        raw: targetRaw,
      } = target;
      const minXAlignment = ranking.find((alignment) => ALIGNMENT_X.includes(alignment));
      const minYAlignment = ranking.find((alignment) => ALIGNMENT_Y.includes(alignment));
      const minXDistance = distances[minXAlignment];
      const minYDistance = distances[minYAlignment];
      
      // align on x direction
      switch (minXAlignment) {
        case PROP.ALIGNMENT.ALIGN_RIGHT_TO_RIGHT:
        case PROP.ALIGNMENT.ALIGN_LEFT_TO_LEFT:
        case PROP.ALIGNMENT.ALIGN_RIGHT_TO_LEFT:
        case PROP.ALIGNMENT.ALIGN_LEFT_TO_RIGHT:
        case PROP.ALIGNMENT.ALIGN_X_CENTER_TO_X_CENTER:
          finalRect.offsetX(minXDistance.raw);
          break;
      }

      // align on y direction
      switch (minYAlignment) {
        case PROP.ALIGNMENT.ALIGN_TOP_TO_TOP:
        case PROP.ALIGNMENT.ALIGN_BOTTOM_TO_BOTTOM:
        case PROP.ALIGNMENT.ALIGN_TOP_TO_BOTTOM:
        case PROP.ALIGNMENT.ALIGN_BOTTOM_TO_TOP:
        case PROP.ALIGNMENT.ALIGN_Y_CENTER_TO_Y_CENTER:
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
                from: currentRect,
                to: finalRect,
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

  /**
   * Handler of magnet dragging end
   */
  onMagnetDragEnd(event, pack) {
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
  }

  /**
   * Get group targets
   */
  getMagnetTargets() {
    const group = this.group;
    const selector = isstr(group)
      ?`[group="${group}"]`
      :'';
    const targets = [];

    Array
      .from(document.querySelectorAll(`${this.nodeName}${selector}:not([${PROP.ATTRIBUTE.UNATTRACTABLE}])`) || [])
      .forEach((dom) => {
        if (dom === this) {
          return;
        }

        targets.push(dom);
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
  getDistanceOfMultipleTargets(
    targets = this.getMagnetTargets(),
    options
  ) {
    return Magnet.getDistanceOfMultipleTargets(this, targets, options);
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


export default Magnet;
