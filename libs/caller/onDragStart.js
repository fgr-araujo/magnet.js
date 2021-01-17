'use strict';

import {
  tonum,
} from '../stdlib';
import {
  RectPack,
} from '../rect';
import {
  getEventClientXY,
} from '../event';
import Magnet from '../magnet';


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
      source: sourceRect,
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
 * Judge target result
 */
function judgeTargetResult({ min: { any } }) {
  return isset(any.alignment);
}

/**
 * Judge parent distance
 */
function judgeParentDistance({ value }) {
  return value <= this.attractDistance;
}

/**
 * Judge parent result
 */
function judgeParentResult(...args) {
  return judgeTargetResult(...args);
}


/**
 * Listener of touchstart/mousedown
 */
export default function onDragStart(event) {
  const self = event.target;
  const {
    x: startX,
    y: startY,
  } = getEventClientXY(event);
  const targets = self.getMagnetTargets()
    .map((target) => new RectPack(target));
  const alignTo = self.alignTo;
  const alignToParent = self.alignToParent;
  const alignToOuterline = alignTo.includes(Magnet.ALIGN_TO.outerline);
  const crossPrevent = self.crossPrevent;
  const attractDistance = self.attractDistance;
  const alignments = getAlignmentsFromAlignTo(alignTo);
  const parentAlignments = getAlignmentsFromAlignTo(alignToParent);
  const onJudgeTargetDistance = judgeTargetDistance.bind({ attractDistance, alignToOuterline });
  const onJudgeTargetResult = judgeTargetResult;
  const onJudgeParentDistance = judgeParentDistance.bind({ attractDistance });
  const onJudgeParentResult = judgeParentResult;
  const pack = {
    lastAttract: null,
    source: new RectPack(self),
    targets,
    startX,
    startY,
    lastOffsetX: tonum(self.style.getPropertyValue(STYLE_PROPS.x) || 0),
    lastOffsetY: tonum(self.style.getPropertyValue(STYLE_PROPS.y) || 0),
    unattractable: self.unattractable,
    attractDistance,
    alignTo,
    alignToParent,
    alignToOuterline,
    alignments,
    parentAlignments,
    crossPrevent,
    crossPreventParent: crossPrevent.includes(Magnet.PREVENT_CROSS.parent),
    // crossPreventTarget: crossPrevent.includes(Magnet.PREVENT_CROSS.target), // yet to support
    parent: new RectPack(self.parentElement),
    optionsForTargetDistances: {
      alignments,
      absDistance: true,
      sort: true,
      onJudgeDistance: onJudgeTargetDistance,
      onJudgeResult: onJudgeTargetResult,
    },
    optionsForParentDistances: {
      alignments: parentAlignments,
      absDistance: true,
      sort: true,
      onJudgeDistance: onJudgeParentDistance,
      onJudgeResult: onJudgeParentResult,
    },
  };
  const options = {
    detail: pack,
  };

  if (!triggerMagnetEvent(self, EVENT.start, options)) {
    function onDragMove(event) {
      if (!triggerMagnetEvent(self, Magnet.EVENT.move, options)) {
        self.onMagnetDragMove(event, pack);
      }
    }

    function onDragEnd(event) {
      removeEventListener(document.body, EVENT.dragMove, onDragMove);
      removeEventListener(document.body, EVENT.dragEnd, onDragEnd);

      if (!triggerMagnetEvent(self, Magnet.EVENT.end, options)) {
        self.onMagnetDragEnd(event, pack);
      }
      
      targets.forEach((target) => {
        delete target[PROP_ELEM_MAGNET_RECTANGLE];
      });
    };

    addEventListener(document.body, EVENT.dragMove, onDragMove);
    addEventListener(document.body, EVENT.dragEnd, onDragEnd);
    self.onMagnetDragStart(event, pack);
  }
}
