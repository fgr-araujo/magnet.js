'use strict';

import {
  packRect,
} from './rect';
import {
  ALIGN_TOP_TO_TOP,
  ALIGN_TOP_TO_BOTTOM,
  ALIGN_RIGHT_TO_RIGHT,
  ALIGN_RIGHT_TO_LEFT,
  ALIGN_BOTTOM_TO_BOTTOM,
  ALIGN_BOTTOM_TO_TOP,
  ALIGN_LEFT_TO_LEFT,
  ALIGN_LEFT_TO_RIGHT,
  ALIGN_X_CENTER_TO_X_CENTER,
  ALIGN_Y_CENTER_TO_Y_CENTER,
} from './prop/alignment';
import { isset } from '../stdlib';


// alignment on x-axis
export const ALIGNMENT_X = [
  ALIGN_RIGHT_TO_RIGHT,
  ALIGN_RIGHT_TO_LEFT,
  ALIGN_LEFT_TO_LEFT,
  ALIGN_LEFT_TO_RIGHT,
  ALIGN_X_CENTER_TO_X_CENTER,
];

// alignment on y-axis
export const ALIGNMENT_Y = [
  ALIGN_TOP_TO_TOP,
  ALIGN_TOP_TO_BOTTOM,
  ALIGN_BOTTOM_TO_BOTTOM,
  ALIGN_BOTTOM_TO_TOP,
  ALIGN_Y_CENTER_TO_Y_CENTER,
];

/**
 * Calculate distance of alignment between source and target
 */
export function calcDistance(alignment, sourceRect, targetRect) {
  switch (alignment) {
    case ALIGN_TOP_TO_TOP:
      return targetRect.top - sourceRect.top;

    case ALIGN_TOP_TO_BOTTOM:
      return targetRect.bottom - sourceRect.top;

    case ALIGN_RIGHT_TO_RIGHT:
      return targetRect.right - sourceRect.right;

    case ALIGN_RIGHT_TO_LEFT:
      return targetRect.left - sourceRect.right;

    case ALIGN_BOTTOM_TO_BOTTOM:
      return targetRect.bottom - sourceRect.bottom;

    case ALIGN_BOTTOM_TO_TOP:
      return targetRect.top - sourceRect.bottom;

    case ALIGN_LEFT_TO_LEFT:
      return targetRect.left - sourceRect.left;

    case ALIGN_LEFT_TO_RIGHT:
      return targetRect.right - sourceRect.left;

    case ALIGN_X_CENTER_TO_X_CENTER:
      return .5 * ((targetRect.right - sourceRect.right) + (targetRect.left - sourceRect.left));

    case ALIGN_Y_CENTER_TO_Y_CENTER:
      return .5 * ((targetRect.top - sourceRect.top) + (targetRect.bottom - sourceRect.bottom));
  }

  return Infinity;
}

/**
 * Get bias gap of alignment
 */
export function getAlignmentBiasGap(source) {
  return .33 * (source?.attractDistance || 0);
}

/**
 * Calculate attraction from source to target
 */
export function calcAttractionOfTarget(source, target, {
  alignments = [],
  absDistance = false,
  onJudgeDistance,
}) {
  const sourcePack = packRect(source);
  const targetPack = packRect(target);
  const sourceRect = sourcePack.rectangle;
  const targetRect = targetPack.rectangle;
  const judgePack = onJudgeDistance && {
    source: sourcePack,
    target: targetPack,
  };
  const biasGap = getAlignmentBiasGap(source);
  const stdNum = absDistance
    ?Math.abs
    :(n) => n;
  const summary = alignments.reduce((summary, alignment) => {
    const raw = calcDistance(alignment, sourceRect, targetRect);
    const value = stdNum(raw);
    const distance = { raw, value };

    if (!onJudgeDistance || onJudgeDistance(distance, alignment, judgePack)) {
      // compare distances

      const { distances, min } = summary;
      const { x, y } = min;

      if (ALIGNMENT_X.includes(alignment)) {
        // x-axis
        const distanceValueX = x.distance.value;

        do {
          if (value < distanceValueX) {
            // to be new min.x
          } else if (value > distanceValueX) {
            // larger than min.x
            break;
          } else {
            // check which edge is nearer to original x offset
            const diffX = sourceRect.left - targetRect.left;
            
            if (diffX > biasGap) { // right
              if (alignment !== ALIGN_RIGHT_TO_RIGHT) {
                break;
              }
            } else if (diffX < -biasGap) { // left
              if (alignment !== ALIGN_LEFT_TO_LEFT) {
                break;
              }
            } else { // x center
              if (alignment !== ALIGN_X_CENTER_TO_X_CENTER) {
                break;
              }
            }
          }
          
          min.x = {
            target: targetPack,
            alignment,
            distance: distance,
          };
        } while (false);
      } else if (ALIGNMENT_Y.includes(alignment)) {
        // y-axis
        const distanceValueY = y.distance.value;

        do {
          if (value < distanceValueY) {
            // to be new min.y
          } else if (value > distanceValueY) {
            // larger than min.y
            break;
          } else {
            // check which edge is nearer to original y offset
            const diffY = sourceRect.top - targetRect.top;

            if (diffY > biasGap) { // bottom
              if (alignment !== ALIGN_BOTTOM_TO_BOTTOM) {
                break;
              }
            } else if (diffY < -biasGap) { // top
              if (alignment !== ALIGN_TOP_TO_TOP) {
                break;
              }
            } else { // x center
              if (alignment !== ALIGN_Y_CENTER_TO_Y_CENTER) {
                break;
              }
            }
          }

          min.y = {
            target: targetPack,
            alignment,
            distance: distance,
          };
        } while (false);
      }

      distances[alignment] = distance;
    }

    return summary;
  }, {
    source: sourcePack,
    target: targetPack,
    distances: {},
    min: {
      x: {
        // alignment,
        distance: {
          // raw,
          value: Infinity,
        },
      },
      y: {
        // alignment,
        distance: {
          // raw,
          value: Infinity,
        },
      },
      // any: {
      //   alignment,
      //   distance: {
      //     raw,
      //     value: Infinity,
      //   },
      // },
    },
  });
  const { min } = summary;
  const { x, y } = min;

  min.any = x.distance.value < y.distance.value
    ?x
    :y;

  return summary;
}

/**
 * Calculate attractions from source to multiple targets
 */
export function calcAttractionOfMultipleTargets(
  source,
  targets = [],
  {
    alignments,
    absDistance,
    onJudgeDistance,
    onJudgeAttraction,
  } = {},
  initAttraction,
) {
  const sourcePack = packRect(source);
  const options = {
    alignments,
    absDistance,
    onJudgeDistance,
  };
  const summary = targets.reduce((summary, target) => {
    const targetPack = packRect(target);
    const attraction = calcAttractionOfTarget(sourcePack, targetPack, options);

    if (!onJudgeAttraction || onJudgeAttraction(attraction)) {
      // compare attractions

      const {
        attractions,
        min: summaryMin,
      } = summary;
      const {
        x: summaryMinX,
        y: summaryMinY,
      } = summaryMin;
      const summaryMinXValue = summaryMinX.distance.value;
      const summaryMinYValue = summaryMinY.distance.value;
      const {
        min: currentMin,
      } = attraction;
      const {
        x: currentMinX,
        y: currentMinY,
      } = currentMin;
      const currentMinXValue = currentMinX.distance.value;
      const currentMinYValue = currentMinY.distance.value;

      do {
        if (currentMinXValue < summaryMinXValue) {
          // to be new min.x
        } else if (currentMinXValue > summaryMinXValue) {
          // larger than min.x
          break;
        } else {
          // check which one is nearer on y-axis
          const currentDiffY = Math.abs(
            (sourcePack.rectangle.top + sourcePack.rectangle.bottom)
            -(targetPack.rectangle.top + targetPack.rectangle.bottom)
          );
          const summaryMinXTargetRect = summaryMinX.target?.rectangle;

          if (summaryMinXTargetRect) {
            if (!isset(summaryMinX._diffY)) {
              summaryMinX._diffY = Math.abs(
                (sourcePack.rectangle.top + sourcePack.rectangle.bottom)
                -(summaryMinXTargetRect.top + summaryMinXTargetRect.bottom)
              );
            }

            if (currentDiffY > summaryMinX._diffY) {
              break;
            }
          }

          currentMinX._diffY = currentDiffY;
          delete summaryMinX._diffY;
        }
        
        summaryMin.x = {
          ...currentMinX,
          target,
        };
      } while (false);

      do {
        if (currentMinYValue < summaryMinYValue) {
          // to be new min.y
        } else if (currentMinYValue > summaryMinYValue) {
          // larger than min.y
          break;
        } else {
          // check which one is nearer on x-axis
          const currentDiffX = Math.abs(
            (sourcePack.rectangle.left + sourcePack.rectangle.right)
            -(targetPack.rectangle.left + targetPack.rectangle.right)
          );
          const summaryMinYTargetRect = summaryMinY.target?.rectangle;

          if (summaryMinYTargetRect) {
            if (!isset(summaryMinY._diffX)) {
              summaryMinY._diffX = Math.abs(
                (sourcePack.rectangle.left + sourcePack.rectangle.right)
                -(summaryMinYTargetRect.left + summaryMinYTargetRect.right)
              );
            }

            if (currentDiffX > summaryMinY._diffX) {
              break;
            }
          }
        }

        summaryMin.y = {
          ...currentMinY,
          target,
        };
      } while (false);

      attractions.push(attraction);
    }

    summary.targets.push(targetPack);

    return summary;
  }, {
    source: sourcePack,
    targets: [],
    attractions: [],
    min: {
      x: {
        // target,
        // alignment,
        distance: {
          // raw,
          value: Infinity,
        },
      },
      y: {
        // target,
        // alignment,
        distance: {
          // raw,
          value: Infinity,
        },
      },
      // any: {
      //   target,
      //   alignment,
      //   distance: {
      //     raw,
      //     value: Infinity,
      //   },
      // },
    },
    ...initAttraction,
  });
  const { min } = summary;
  const { x, y } = min;

  min.any = x.distance.value < y.distance.value
    ?x
    :y;

  delete x._diffY;
  delete y._diffX;

  return summary;
}

/**
 * Calculate offset with attraction
 */
export function calcOffsetOfAttraction(attraction) {
  const {
    min: {
      x: minX,
      y: minY,
    },
  } = attraction;
  const offset = {
    x: 0,
    y: 0,
  };

  switch (minX.alignment) {
    case ALIGN_RIGHT_TO_RIGHT:
    case ALIGN_LEFT_TO_LEFT:
    case ALIGN_RIGHT_TO_LEFT:
    case ALIGN_LEFT_TO_RIGHT:
    case ALIGN_X_CENTER_TO_X_CENTER:
      offset.x = minX.distance.raw;
      break;
  }

  switch (minY.alignment) {
    case ALIGN_TOP_TO_TOP:
    case ALIGN_BOTTOM_TO_BOTTOM:
    case ALIGN_TOP_TO_BOTTOM:
    case ALIGN_BOTTOM_TO_TOP:
    case ALIGN_Y_CENTER_TO_Y_CENTER:
      offset.y = minY.distance.raw;
      break;
  }

  return offset;
}
