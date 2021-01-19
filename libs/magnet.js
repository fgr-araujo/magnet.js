'use strict';

import {
  isset, tonum, isarray, isstr,
  objMap, objValues,
  getStyle,
} from './stdlib';
import Rect, {
  packRect, stdRect,
} from './rect';
import PROP from './prop';
import {
  calcAttractionOfTarget,
  calcAttractionOfMultipleTargets,
  calcOffsetOfAttraction,
} from './distance';


const SYMBOL_SPLIT = /[|;,\s]/;

const EVENT = {
  dragStart: ['mousedown', 'touchstart'],
  dragMove: ['mousemove', 'touchmove'],
  dragEnd: ['mouseup', 'touchend'],
};


class Magnet extends HTMLElement {
  constructor() {
    super();

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
          removeEventListener(this, EVENT.dragStart, dragStartListener);
        } else {
          addEventListener(this, EVENT.dragStart, dragStartListener);
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
  static getAttractionOfTarget(source, target, {
    alignments = objValues(Magnet.ALIGNMENT),
    absDistance = false,
    onJudgeDistance,
  }) {
    return calcAttractionOfTarget(source, target, {
      alignments,
      absDistance,
      onJudgeDistance,
    });
  }
  
  /**
   * Get distances of target elements
   */
  static getAttractionOfMultipleTargets(
    source,
    targets = [],
    {
      alignments = objValues(Magnet.ALIGNMENT),
      absDistance = false,
      sort = true,
      onJudgeDistance,
      onJudgeAttraction,
    } = {},
    initAttraction,
  ) {
    return calcAttractionOfMultipleTargets(source, targets, {
      alignments,
      absDistance,
      sort,
      onJudgeDistance,
      onJudgeAttraction,
    }, initAttraction);
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
      :[];
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
  onMagnetDragStart = magnetDragStartHandler.bind(this)

  /**
   * Handler of magnet dragging move
   */
  onMagnetDragMove = magnetDragMoveHandler.bind(this)

  /**
   * Handler of magnet dragging end
   */
  onMagnetDragEnd = magnetDragEndHandler.bind(this)

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
  getAttractionOfTarget(target, options) {
    return Magnet.getAttractionOfTarget(this, target, options);
  }
  
  /**
   * Get distance of targets
   */
  getAttractionOfMultipleTargets(
    targets = this.getMagnetTargets(),
    options
  ) {
    return Magnet.getAttractionOfMultipleTargets(this, targets, options);
  }

  /**
   * Move position to (x, y)
   */
  handleOffset(x, y) {
    this.style.setProperty(PROP.STYLE.VAR_MAGNET_OFFSET_X, `${x}px`, 'important');
    this.style.setProperty(PROP.STYLE.VAR_MAGNET_OFFSET_Y, `${y}px`, 'important');
  }

  /**
   * Reset position
   */
  resetPosition() {
    this.style.removeProperty(PROP.STYLE.VAR_MAGNET_OFFSET_X);
    this.style.removeProperty(PROP.STYLE.VAR_MAGNET_OFFSET_Y);
    this.style.removeProperty('transform');
  }
}


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

/**
 * Get alignments from alignTo
 */
function getAlignmentsFromAlignTo(alignTo) {
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

  return alignments;
}

/**
 * Check if source[L, R] is overlap on target[L, R]
 */
function isInBiasRange(bias, sourceL, sourceR, targetL, targetR) {
  const targetRangeL = targetL - bias;
  const targetRangeR = targetR + bias;

  if (sourceL >= targetRangeL && sourceL <= targetRangeR) {
    return true;
  } else if (sourceR >= targetRangeL && sourceR <= targetRangeR) {
    return true;
  }

  return false;
}

/**
 * Judge target distance
 */
function judgeTargetDistance({ value }, alignment, judgePack) {
  const {
    attractDistance,
    alignToOuterline,
  } = this;

  if (value > attractDistance) {
    return false;
  } else if (!alignToOuterline) {
    const {
      source: {
        rectangle: sourceRect,
      },
      target: {
        rectangle: targetRect,
      },
    } = judgePack;

    switch (alignment) {
      case Magnet.ALIGNMENT.rightToRight:
      case Magnet.ALIGNMENT.leftToLeft:
      case Magnet.ALIGNMENT.rightToLeft:
      case Magnet.ALIGNMENT.leftToRight:
        {
          const {
            top: sourceTop,
            bottom: sourceBottom,
          } = sourceRect;
          const {
            top: targetTop,
            bottom: targetBottom,
          } = targetRect;

          if (isInBiasRange(attractDistance, sourceTop, sourceBottom, targetTop, targetBottom)) {
            return true;
          } else if (isInBiasRange(attractDistance, targetTop, targetBottom, sourceTop, sourceBottom)) {
            return true;
          }

          return false;
        }

      case Magnet.ALIGNMENT.topToTop:
      case Magnet.ALIGNMENT.bottomToBottom:
      case Magnet.ALIGNMENT.topToBottom:
      case Magnet.ALIGNMENT.bottomToTop:
        {
          const {
            right: sourceRight,
            left: sourceLeft,
          } = sourceRect;
          const {
            right: targetRight,
            left: targetLeft,
          } = targetRect;

          if (isInBiasRange(attractDistance, sourceLeft, sourceRight, targetLeft, targetRight)) {
            return true;
          } else if (isInBiasRange(attractDistance, targetLeft, targetRight, sourceLeft, sourceRight)) {
            return true;
          }
          
          return false;
        }
    }
  }
  
  return true;
}

/**
 * Judge target attraction
 */
function judgeTargetAttraction({ min: { any } }) {
  return isset(any.alignment);
}

/**
 * Judge parent distance
 */
function judgeParentDistance({ value }) {
  return value <= this.attractDistance;
}

/**
 * Judge parent attraction
 */
function judgeParentAttraction(...args) {
  return judgeTargetAttraction(...args);
}

/**
 * Generate magnet event options for custom event to pass
 */
function genMagnetEventOptions(
  source,
  {
    targets = [],
    attractions = [],
    min: {
      x: {
        target: targetX,
        alignment: alignmentX,
        distance: {
          raw: distanceRawX = Infinity,
          value: distanceValueX = Infinity,
        } = {},
      } = {},
      y: {
        target: targetY,
        alignment: alignmentY,
        distance: {
          raw: distanceRawY = Infinity,
          value: distanceValueY = Infinity,
        } = {},
      } = {},
      any: {
        target: targetAny,
        alignment: alignmentAny,
        distance: {
          raw: distanceRawAny = Infinity,
          value: distanceValueAny = Infinity,
        } = {},
      } = {},
    } = {},
  },
  nextRect = stdRect(source),
) {
  return {
    detail: {
      source,
      targets,
      attractions,
      min: {
        x: {
          target: targetX,
          alignment: alignmentX,
          distance: {
            raw: distanceRawX,
            value: distanceValueX,
          },
        },
        y: {
          target: targetY,
          alignment: alignmentY,
          distance: {
            raw: distanceRawY,
            value: distanceValueY,
          },
        },
        any: {
          target: targetAny,
          alignment: alignmentAny,
          distance: {
            raw: distanceRawAny,
            value: distanceValueAny,
          },
        },
      },
      nextStep: {
        rectangle: nextRect,
        offset: {
          x: nextRect.x,
          y: nextRect.y,
        },
      },
    },
  };
}

/**
 * Listener of touchstart/mousedown
 */
function dragStartListener(event) {
  const {
    x: startX,
    y: startY,
  } = getEventClientXY(event);
  const targets = this.getMagnetTargets()
    .map((target) => packRect(target));
  const alignTo = this.alignTo;
  const alignToParent = this.alignToParent;
  const alignToOuterline = alignTo.includes(Magnet.ALIGN_TO.outerline);
  const crossPrevent = this.crossPrevent;
  const attractDistance = this.attractDistance;
  const alignments = getAlignmentsFromAlignTo(alignTo);
  const parentAlignments = getAlignmentsFromAlignTo(alignToParent);
  const onJudgeTargetDistance = judgeTargetDistance.bind({ attractDistance, alignToOuterline });
  const onJudgeTargetAttraction = judgeTargetAttraction;
  const onJudgeParentDistance = judgeParentDistance.bind({ attractDistance });
  const onJudgeParentAttraction = judgeParentAttraction;
  const pack = {
    lastAttraction: null,
    source: packRect(this),
    targets,
    startX,
    startY,
    lastOffsetX: tonum(this.style.getPropertyValue(PROP.STYLE.VAR_MAGNET_OFFSET_X) || 0),
    lastOffsetY: tonum(this.style.getPropertyValue(PROP.STYLE.VAR_MAGNET_OFFSET_Y) || 0),
    unattractable: this.unattractable,
    attractDistance,
    alignTo,
    alignToParent,
    alignToOuterline,
    alignments,
    parentAlignments,
    crossPrevent,
    crossPreventParent: crossPrevent.includes(Magnet.PREVENT_CROSS.parent),
    // crossPreventTarget: crossPrevent.includes(Magnet.PREVENT_CROSS.target), // yet to support
    parent: packRect(this.parentElement),
    optionsForTargetDistances: {
      alignments,
      absDistance: true,
      sort: true,
      onJudgeDistance: onJudgeTargetDistance,
      onJudgeAttraction: onJudgeTargetAttraction,
    },
    optionsForParentDistances: {
      alignments: parentAlignments,
      absDistance: true,
      sort: true,
      onJudgeDistance: onJudgeParentDistance,
      onJudgeAttraction: onJudgeParentAttraction,
    },
  };
  const options = {
    detail: pack,
  };

  if (!triggerMagnetEvent(this, Magnet.EVENT.start, options)) {
    const self = this;

    let passPack;

    function onDragMove(event) {
      if (!triggerMagnetEvent(self, Magnet.EVENT.move, options)) {
        passPack = self.onMagnetDragMove(event, pack, passPack);
      }
    }

    function onDragEnd(event) {
      removeEventListener(document.body, EVENT.dragMove, onDragMove);
      removeEventListener(document.body, EVENT.dragEnd, onDragEnd);

      if (!triggerMagnetEvent(self, Magnet.EVENT.end, options)) {
        passPack = self.onMagnetDragEnd(event, pack, passPack);
      }
    };

    addEventListener(document.body, EVENT.dragMove, onDragMove);
    addEventListener(document.body, EVENT.dragEnd, onDragEnd);
    passPack = this.onMagnetDragStart(event, pack, passPack);
  }
}

/**
 * Handler of magnet drag start
 */
function magnetDragStartHandler(event, pack) {
  const {
    position,
    zIndex,
    transform,
  } = getStyle(this);

  event.preventDefault();
  event.stopImmediatePropagation();

  switch (position) {
    case 'relative':
    case 'fixed':
    case 'absolute':
      break;

    default:
      this.style.setProperty('position', 'relative');
      break;
  }

  this.style.setProperty('z-index', (Date.now() / 1000) | 0);

  // TODO: handle origin transform?
  this.style.setProperty('transform', `translate(var(${PROP.STYLE.VAR_MAGNET_OFFSET_X}), var(${PROP.STYLE.VAR_MAGNET_OFFSET_Y}))`, 'important');
  
  return {
    originStyle: {
      position,
      transform,
      zIndex,
    },
    ...this.onMagnetDragMove(event, pack),
  };
}

/**
 * Handler of magnet drag move
 */
function magnetDragMoveHandler(event, pack, passPack) {
  const {
    lastAttraction, // not ready
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

  const finalRect = new Rect(currentRect);

  do {
    // would break if any of this or target cancelled
    if (unattractable) {
      pack.lastAttraction = null;
      break;
    }

    // check current attracted targets
    const attraction = Magnet.getAttractionOfMultipleTargets(
      currentRect,
      targets,
      optionsForTargetDistances,
      parentAlignments.length > 0
        ?Magnet.getAttractionOfTarget(
          currentRect,
          parent,
          optionsForParentDistances
        )
        :undefined
    );

    const {
      min: {
        x: minX,
        y: minY,
      },
    } = attraction;
    const lastAttractionX = lastAttraction?.min?.x;
    const lastAttractionY = lastAttraction?.min?.y;
    const lastTargetX = lastAttractionX?.target;
    const lastTargetY = lastAttractionY?.target;
    const targetX = minX.target;
    const targetY = minY.target;
    const diffTargetX = lastTargetX !== targetX;
    const diffTargetY = lastTargetY !== targetY;
    const offset = calcOffsetOfAttraction(attraction);
    const attractRect = new Rect(currentRect).offset(offset.x, offset.y);
    const eventOptions = genMagnetEventOptions(source, attraction, attractRect);

    // handle unattraction
    if (lastTargetX || lastTargetY) {
      const unattractX = lastTargetX && diffTargetX;
      const unattractY = lastTargetY && diffTargetY;
      const unattractAny = unattractX || unattractY;

      if (unattractAny) {
        const optionsForUnattract = eventOptions;

        // trigger unattract of this
        triggerMagnetEvent(this, Magnet.EVENT.unattract, optionsForUnattract);

        if (unattractX) {
          // trigger unattracted of last target x
          triggerMagnetEvent(lastTargetX, Magnet.EVENT.unattracted, optionsForUnattract);
        }
        if (unattractY) {
          // trigger unattracted of last target y
          triggerMagnetEvent(lastTargetY, Magnet.EVENT.unattracted, optionsForUnattract);
        }
      }
    }

    // handle attraction
    if (targetX || targetY) {
      const lastAlignmentX = lastAttractionX?.alignment;
      const lastAlignmentY = lastAttractionY?.alignment;
      const alignmentX = minX.alignment;
      const alignmentY = minY.alignment;
      const attractX = targetX && (diffTargetX || lastAlignmentX !== alignmentX);
      const attractY = targetY && (diffTargetY || lastAlignmentY !== alignmentY);
      const attractAny = attractX || attractY;

      if (attractAny) {
        const optionsForAttract = eventOptions;

        // trigger attract of this
        triggerMagnetEvent(this, Magnet.EVENT.attract, optionsForAttract);
      
        if (attractX) {
          // trigger attracted of target x
          triggerMagnetEvent(targetX, Magnet.EVENT.attracted, optionsForAttract);
        }
        if (attractY) {
          // trigger attracted of target y
          triggerMagnetEvent(targetY, Magnet.EVENT.attracted, optionsForAttract);
        }
      }
    }

    finalRect.offset(offset.x, offset.y);
    pack.lastAttraction = attraction;
  } while (false);

  const finalX = finalRect.x - originX + lastOffsetX;
  const finalY = finalRect.y - originY + lastOffsetY;

  this.handleOffset(finalX, finalY);

  return passPack;
}

/**
 * Handler of magnet drag end
 */
function magnetDragEndHandler(event, pack, passPack) {
  const {
    originStyle: {
      position,
      zIndex,
      transform,
    } = {},
  } = passPack;

  if (isset(position)) {
    // if assigned position, set it back
    this.style.setProperty('position', position);
  }

  if (isset(zIndex)) {
    // if assigned z-index, set it back
    this.style.setProperty('z-index', zIndex);
  }

  // TODO: handle origin transform?

  delete passPack.originStyle;

  return passPack;
}


export default Magnet;
