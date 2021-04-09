'use strict';

import {
  isset, tonum, isarray, isstr,
  objMap, objValues,
  getStyle,
  toarray,
} from '../stdlib';
import Rect, {
  packRect, stdRect,
} from './rect';
import PROP from './prop';
import {
  calcAttractionOfTarget,
  calcAttractionOfMultipleTargets,
  calcOffsetOfAttraction,
} from './distance';
import MagnetGroup from './group';


const EVENT = {
  dragStart: ['mousedown', 'touchstart'],
  dragMove: ['mousemove', 'touchmove'],
  dragEnd: ['mouseup', 'touchend'],
};


class Magnet extends MagnetGroup {
  constructor() {
    super();

    // trigger disabled checker
    this.attributeChangedCallback(PROP.ATTRIBUTE.DISTABLED, null, this.disabled);

    // trigger unmovable checker
    this.attributeChangedCallback(PROP.ATTRIBUTE.UNMOVABLE, null, this.unmovable);
  }

  /**
   * Node name of <magnet-block>
   */
  static get nodeName() {
    return 'magnet-block';
  }

  // /**
  //  * Observed attributes
  //  */
  // static get observedAttributes() {
  //   return [
  //     PROP.ATTRIBUTE.DISTABLED,
  //     PROP.ATTRIBUTE.UNMOVABLE,
  //   ];
  // }

  // /**
  //  * Callback on attribute changed
  //  */
  // attributeChangedCallback(attributeName, oldValue, newValue) {
  //   switch (attributeName) {
  //     case PROP.ATTRIBUTE.DISTABLED:
  //     case PROP.ATTRIBUTE.UNMOVABLE:
  //       if (newValue || isstr(newValue)) {
  //         removeEventListener(this, EVENT.dragStart, dragStartListener);
  //       } else {
  //         addEventListener(this, EVENT.dragStart, dragStartListener);
  //       }
  //       break;
  //   }
  // }

  // connectedCallback() {}
  // disconnectedCallback() {}
  // adoptedCallback() {}

  // /**
  //  * Get distance of target element
  //  */
  // static getAttractionOfTarget(source, target, {
  //   alignments = objValues(Magnet.ALIGNMENT),
  //   absDistance = false,
  //   onJudgeDistance,
  // }) {
  //   return calcAttractionOfTarget(source, target, {
  //     alignments,
  //     absDistance,
  //     onJudgeDistance,
  //   });
  // }

  // /**
  //  * Get distances of target elements
  //  */
  // static getAttractionOfMultipleTargets(
  //   source,
  //   targets = [],
  //   {
  //     alignments = objValues(Magnet.ALIGNMENT),
  //     absDistance = false,
  //     onJudgeDistance,
  //     onJudgeAttraction,
  //   } = {},
  //   initAttraction,
  // ) {
  //   return calcAttractionOfMultipleTargets(source, targets, {
  //     alignments,
  //     absDistance,
  //     onJudgeDistance,
  //     onJudgeAttraction,
  //   }, initAttraction);
  // }

  // /**
  //  * Event names
  //  */
  // static EVENT = Object.defineProperties({}, objMap({
  //   start: 'start',                 // start to drag
  //   move: 'move',                   // dragging
  //   end: 'end',                     // end of dragging
  //   attract: 'attract',             // attract to target
  //   attractMove: 'attractmove',     // attract and move by target
  //   unattract: 'unattract',         // escape from attracted target
  //   attracted: 'attracted',         // be attracted by source
  //   attractedMove: 'attractedmove', // be attracted and source is moving
  //   unattracted: 'unattracted',     // source escape
  // }, (value) => ({
  //   value: `mg-${value}`, // prefix
  //   enumerable: true,
  // })))

  // /**
  //  * Handler of magnet dragging start
  //  */
  // onMagnetDragStart = magnetDragStartHandler.bind(this)

  /**
   * Handler of magnet dragging move
   */
  onMagnetDragMove = magnetDragMoveHandler.bind(this)

  /**
   * Handler of magnet dragging end
   */
  onMagnetDragEnd = magnetDragEndHandler.bind(this)

  // /**
  //  * Get group targets
  //  */
  // getMagnetTargets() {
  //   const group = this.group;
  //   const selectorGroup = isstr(group)
  //     ?`[${PROP.ATTRIBUTE.GROUP}="${group}"]`
  //     :'';
  //   const selectorNotDisabled = `:not([${PROP.ATTRIBUTE.DISTABLED}])`;
  //   const selectorNotUnattractable = `:not([${PROP.ATTRIBUTE.UNATTRACTABLE}])`;
  //   const selector = `${selectorGroup}${selectorNotDisabled}${selectorNotUnattractable}`;
  //   const magnetSelector = `${Magnet.nodeName}${selector}`;

  //   return toarray(document.querySelectorAll(magnetSelector) || [])
  //     .concat(toarray(document.querySelectorAll(`${MagnetGroup.nodeName}${selector} ${magnetSelector}`) || []))
  //     .filter((dom, domIndex, doms) => {
  //       if (dom === this) {
  //         return false;
  //       } else if (doms.indexOf(dom) !== domIndex) {
  //         return false;
  //       }

  //       return true;
  //     });
  // }

  // /**
  //  * Get distance of target element
  //  */
  // getAttractionOfTarget(target, options) {
  //   return Magnet.getAttractionOfTarget(this, target, options);
  // }
  
  // /**
  //  * Get distance of targets
  //  */
  // getAttractionOfMultipleTargets(
  //   targets = this.getMagnetTargets(),
  //   options
  // ) {
  //   return Magnet.getAttractionOfMultipleTargets(this, targets, options);
  // }

  // /**
  //  * Move position to (x, y)
  //  */
  // handleOffset(x, y) {
  //   this.style.setProperty(PROP.STYLE.VAR_MAGNET_OFFSET_X, `${x}px`, 'important');
  //   this.style.setProperty(PROP.STYLE.VAR_MAGNET_OFFSET_Y, `${y}px`, 'important');
  // }

  // /**
  //  * Reset position
  //  */
  // resetPosition() {
  //   this.style.removeProperty(PROP.STYLE.VAR_MAGNET_OFFSET_X);
  //   this.style.removeProperty(PROP.STYLE.VAR_MAGNET_OFFSET_Y);
  //   this.style.removeProperty('transform');
  // }
}


// /**
//  * Add event listeners of target
//  */
// function addEventListener(target, names, func) {
//   (isarray(names) ?names :[names]).forEach((name) => {
//     target.addEventListener(name, func);
//   });
// }

// /**
//  * Remove event listeners of target
//  */
// function removeEventListener(target, names, func) {
//   (isarray(names) ?names :[names]).forEach((name) => {
//     target.removeEventListener(name, func);
//   });
// }

// /**
//  * Trigger event with options only if target is Magnet element
//  */
// function triggerMagnetEvent(target, eventName, options) {
//   return target instanceof Magnet
//     ?target.triggerCustomEvent(eventName, options)
//     :false;
// }

// /**
//  * Get clientX and clientY of mouse/touch event
//  */
// function getEventClientXY(event) {
//   if (event?.touches?.length) {
//     const touch = event.touches[0];

//     return {
//       x: touch.clientX,
//       y: touch.clientY,
//     };
//   }

//   return {
//     x: event.clientX,
//     y: event.clientY,
//   };
// }

// /**
//  * Get alignments from alignTo
//  */
// function getAlignmentsFromAlignTo(alignTo) {
//   const alignments = [];

//   if (alignTo.includes(Magnet.ALIGN_TO.outer)) {
//     alignments.push(Magnet.ALIGNMENT.topToBottom);
//     alignments.push(Magnet.ALIGNMENT.rightToLeft);
//     alignments.push(Magnet.ALIGNMENT.bottomToTop);
//     alignments.push(Magnet.ALIGNMENT.leftToRight);
//   }
//   if (alignTo.includes(Magnet.ALIGN_TO.inner)) {
//     alignments.push(Magnet.ALIGNMENT.topToTop);
//     alignments.push(Magnet.ALIGNMENT.rightToRight);
//     alignments.push(Magnet.ALIGNMENT.bottomToBottom);
//     alignments.push(Magnet.ALIGNMENT.leftToLeft);
//   }
//   if (alignTo.includes(Magnet.ALIGN_TO.center)) {
//     alignments.push(Magnet.ALIGNMENT.xCenterToXCenter);
//     alignments.push(Magnet.ALIGNMENT.yCenterToYCenter);
//   }

//   return alignments;
// }

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
  } = this;

  // check if source is too far to be attracted
  if (value > attractDistance) {
    return false;
  }

  const {
    alignToOuterline,
    crossPreventParent,
  } = this;
  const {
    source: {
      rectangle: sourceRect,
    },
  } = judgePack;

  if (crossPreventParent) {
    const {
      parent: {
        rectangle: parentRect,
      },
    } = this;

    switch (alignment) {
      case Magnet.ALIGNMENT.topToTop:
      case Magnet.ALIGNMENT.topToBottom:
        if (value > Math.abs(parentRect.top - sourceRect.top)) {
          return false;
        }
        break;

      case Magnet.ALIGNMENT.rightToRight:
      case Magnet.ALIGNMENT.rightToLeft:
        if (value > Math.abs(parentRect.right - sourceRect.right)) {
          return false;
        }
        break;

      case Magnet.ALIGNMENT.bottomToTop:
      case Magnet.ALIGNMENT.bottomToBottom:
        if (value > Math.abs(parentRect.bottom - sourceRect.bottom)) {
          return false;
        }
        break;

      case Magnet.ALIGNMENT.leftToLeft:
      case Magnet.ALIGNMENT.leftToRight:
        if (value > Math.abs(parentRect.left - sourceRect.left)) {
          return false;
        }
        break;
    }
  }
  
  // check if source is attracted to outerline of target
  if (alignToOuterline) {
    return true;
  }

  const {
    target: {
      rectangle: targetRect,
    },
  } = judgePack;

  // check if source is attracted on edge of target
  switch (alignment) {
    default:
      return true;

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

// /**
//  * Judge target attraction
//  */
// function judgeTargetAttraction({ min: { any } }) {
//   return isset(any.alignment);
// }

// /**
//  * Judge parent distance
//  */
// function judgeParentDistance({ value }) {
//   return value <= this.attractDistance;
// }

// /**
//  * Judge parent attraction
//  */
// function judgeParentAttraction(...args) {
//   return judgeTargetAttraction(...args);
// }

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
  // const {
  //   x: startX,
  //   y: startY,
  // } = getEventClientXY(event);
  // const targets = this.getMagnetTargets()
  //   .map((target) => packRect(target));
  // const alignTo = this.alignTo;
  // const alignToParent = this.alignToParent;
  // const alignToOuterline = alignTo.includes(Magnet.ALIGN_TO.outerline);
  // const crossPrevent = this.crossPrevent;
  // const crossPreventParent = crossPrevent.includes(Magnet.CROSS_PREVENT.parent);
  // const attractDistance = this.attractDistance;
  // const alignments = getAlignmentsFromAlignTo(alignTo);
  // const parentAlignments = getAlignmentsFromAlignTo(alignToParent);
  // const parent = packRect(this.parentElement);
  const onJudgeTargetDistance = judgeTargetDistance.bind({
    attractDistance,
    alignToOuterline,
    crossPrevent,
    crossPreventParent,
    parent,
  });
  const onJudgeTargetAttraction = judgeTargetAttraction;
  const onJudgeParentDistance = judgeParentDistance.bind({
    attractDistance,
  });
  const onJudgeParentAttraction = judgeParentAttraction;
  const pack = {
    lastAttraction: null,
    // source: packRect(this),
    // targets,
    startX,
    startY,
    lastOffsetX: tonum(this.style.getPropertyValue(PROP.STYLE.VAR_MAGNET_OFFSET_X) || 0),
    lastOffsetY: tonum(this.style.getPropertyValue(PROP.STYLE.VAR_MAGNET_OFFSET_Y) || 0),
    // unattractable: this.unattractable,
    // attractDistance,
    // alignTo,
    // alignToParent,
    // alignToOuterline,
    // alignments,
    // parentAlignments,
    // crossPrevent,
    // crossPreventParent,
    // crossPreventTarget: crossPrevent.includes(Magnet.CROSS_PREVENT.target), // yet to support
    // parent,
    optionsForTargetDistances: {
      alignments,
      absDistance: true,
      onJudgeDistance: onJudgeTargetDistance,
      onJudgeAttraction: onJudgeTargetAttraction,
    },
    optionsForParentDistances: {
      alignments: parentAlignments,
      absDistance: true,
      onJudgeDistance: onJudgeParentDistance,
      onJudgeAttraction: onJudgeParentAttraction,
    },
  // };
  // const options = {
  //   detail: pack,
  // };

  // if (!triggerMagnetEvent(this, Magnet.EVENT.start, options)) {
  //   const self = this;

  //   let passPack;

  //   function onDragMove(event) {
  //     if (!triggerMagnetEvent(self, Magnet.EVENT.move, options)) {
  //       passPack = self.onMagnetDragMove(event, pack, passPack);
  //     }
  //   }

  //   function onDragEnd(event) {
  //     removeEventListener(document, EVENT.dragMove, onDragMove);
  //     removeEventListener(document, EVENT.dragEnd, onDragEnd);

  //     if (!triggerMagnetEvent(self, Magnet.EVENT.end, options)) {
  //       passPack = self.onMagnetDragEnd(event, pack, passPack);
  //     }
  //   };

  //   addEventListener(document, EVENT.dragMove, onDragMove);
  //   addEventListener(document, EVENT.dragEnd, onDragEnd);
  //   passPack = this.onMagnetDragStart(event, pack, passPack);
  // }
// }

// /**
//  * Handler of magnet drag start
//  */
// function magnetDragStartHandler(event, pack) {
//   const {
//     position,
//     zIndex,
//     transform,
//   } = getStyle(this);

//   event.preventDefault();
//   event.stopImmediatePropagation();

//   switch (position) {
//     case 'relative':
//     case 'fixed':
//     case 'absolute':
//       break;

//     default:
//       this.style.setProperty('position', 'relative');
//       break;
//   }

//   this.style.setProperty('z-index', (Date.now() / 1000) | 0);

//   // TODO: handle origin transform?
//   this.style.setProperty('transform',
//    `translate(var(${PROP.STYLE.VAR_MAGNET_OFFSET_X}), var(${PROP.STYLE.VAR_MAGNET_OFFSET_Y}))`,
//    'important');

//   return {
//     originStyle: {
//       position,
//       transform,
//       zIndex,
//     },
//     ...this.onMagnetDragMove(event, pack),
//   };
// }

// /**
//  * Handler of magnet drag move
//  */
// function magnetDragMoveHandler(event, pack, passPack) {
//   const {
//     lastAttraction, // not ready
//     source,
//     startX,
//     startY,
//     lastOffsetX,
//     lastOffsetY,
//     targets,
//     unattractable,
//     // attractDistance,     // not use
//     // alignTo,             // not use
//     // alignToParent,       // not use
//     // alignToOuterline,    // not use
//     parentAlignments,
//     // alignments,          // not use
//     // crossPrevent,        // not use
//     crossPreventParent,
//     crossPreventTarget,     // yet to support
//     parent,
//     optionsForTargetDistances,
//     optionsForParentDistances,
//   } = pack;
//   const { rectangle } = source;
//   const {
//     rectangle: parentRect,
//   } = parent;
//   const {
//     top: originY,
//     left: originX,
//     width,
//     height,
//   } = rectangle;
//   const {
//     x: cx,
//     y: cy,
//   } = getEventClientXY(event);
//   const offsetX = cx - startX;
//   const offsetY = cy - startY;
//   const originRect = new Rect(rectangle).offset(offsetX, offsetY);
//   const currentRect = new Rect(originRect);

//   if (crossPreventParent) {
//     // prevent from going out of parent edges

//     if (currentRect.x < parentRect.left) {
//       currentRect.moveX(parentRect.left);
//     } else if (currentRect.x + width > parentRect.right) {
//       currentRect.moveX(parentRect.right - width);
//     }
//     if (currentRect.y < parentRect.top) {
//       currentRect.moveY(parentRect.top);
//     } else if (currentRect.y + height > parentRect.bottom) {
//       currentRect.moveY(parentRect.bottom - height);
//     }
//   }
//   if (crossPreventTarget) {
//     // TODO: prevent from crossing targets
//   }

//   const finalRect = new Rect(currentRect);

//   do {
//     // would break if any of this or target cancelled
//     if (unattractable) {
//       pack.lastAttraction = null;
//       break;
//     }

//     // check current attracted targets
//     const attraction = Magnet.getAttractionOfMultipleTargets(
//       currentRect,
//       targets,
//       optionsForTargetDistances,
//       parentAlignments.length > 0
//         ?Magnet.getAttractionOfTarget(
//           currentRect,
//           parent,
//           optionsForParentDistances
//         )
//         :undefined
//     );

//     const {
//       min: {
//         x: minX,
//         y: minY,
//       },
//     } = attraction;
//     const lastAttractionX = lastAttraction?.min?.x;
//     const lastAttractionY = lastAttraction?.min?.y;
//     const lastTargetX = lastAttractionX?.target;
//     const lastTargetY = lastAttractionY?.target;
//     const targetX = minX.target;
//     const targetY = minY.target;
//     const diffTargetX = lastTargetX !== targetX;
//     const diffTargetY = lastTargetY !== targetY;
//     const offset = calcOffsetOfAttraction(attraction);
//     const attractRect = new Rect(currentRect).offset(offset.x, offset.y);
//     const eventOptions = genMagnetEventOptions(source, attraction, attractRect);

//     // handle unattraction
//     if (lastTargetX || lastTargetY) {
//       const unattractX = lastTargetX && diffTargetX;
//       const unattractY = lastTargetY && diffTargetY;
//       const unattractAny = unattractX || unattractY;

//       if (unattractAny) {
//         const optionsForUnattract = eventOptions;

//         // trigger unattract of this
//         triggerMagnetEvent(this, Magnet.EVENT.unattract, optionsForUnattract);

//         if (unattractX) {
//           // trigger unattracted of last target x
//           triggerMagnetEvent(lastTargetX, Magnet.EVENT.unattracted, optionsForUnattract);
//         }
//         if (unattractY) {
//           // trigger unattracted of last target y
//           triggerMagnetEvent(lastTargetY, Magnet.EVENT.unattracted, optionsForUnattract);
//         }
//       }
//     }

//     // handle attraction
//     if (targetX || targetY) {
//       const lastAlignmentX = lastAttractionX?.alignment;
//       const lastAlignmentY = lastAttractionY?.alignment;
//       const alignmentX = minX.alignment;
//       const alignmentY = minY.alignment;
//       const attractX = targetX && (diffTargetX || lastAlignmentX !== alignmentX);
//       const attractY = targetY && (diffTargetY || lastAlignmentY !== alignmentY);
//       const attractAny = attractX || attractY;

//       if (attractAny) {
//         const optionsForAttract = eventOptions;

//         // trigger attract of this
//         if (triggerMagnetEvent(this, Magnet.EVENT.attract, optionsForAttract)) {
//           break;
//         }
      
//         if (attractX) {
//           // trigger attracted of target x
//           if (triggerMagnetEvent(targetX, Magnet.EVENT.attracted, optionsForAttract)) {
//             // cancel being attracted on x-axis of target
//             offset.x = 0;
//           }
//         }
//         if (attractY) {
//           // trigger attracted of target y
//           if (triggerMagnetEvent(targetY, Magnet.EVENT.attracted, optionsForAttract)) {
//             // cancel being attracted on y-axis of target
//             offset.y = 0;
//           }
//         }
//       }
//     }

//     finalRect.offset(offset.x, offset.y);
//     pack.lastAttraction = attraction;
//   } while (false);

//   const finalX = finalRect.x - originX + lastOffsetX;
//   const finalY = finalRect.y - originY + lastOffsetY;

//   this.handleOffset(finalX, finalY);

//   return passPack;
// }

// /**
//  * Handler of magnet drag end
//  */
// function magnetDragEndHandler(event, pack, passPack) {
//   const {
//     originStyle: {
//       position,
//       zIndex,
//       transform,
//     } = {},
//   } = passPack;

//   if (isset(position)) {
//     // if assigned position, set it back
//     this.style.setProperty('position', position);
//   }

//   if (isset(zIndex)) {
//     // if assigned z-index, set it back
//     this.style.setProperty('z-index', zIndex);
//   }

//   // TODO: handle origin transform?

//   delete passPack.originStyle;

//   return passPack;
// }

export default Magnet;
