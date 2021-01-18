'use strict';

import {
  RectPack,
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
import { isset } from './stdlib';


// alignment on x-axis
const ALIGNMENT_X = [
  ALIGN_RIGHT_TO_RIGHT,
  ALIGN_RIGHT_TO_LEFT,
  ALIGN_LEFT_TO_LEFT,
  ALIGN_LEFT_TO_RIGHT,
  ALIGN_X_CENTER_TO_X_CENTER,
];

// alignment on y-axis
const ALIGNMENT_Y = [
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
 * Calculate attraction from source to target
 */
export function calcAttractionOfTarget(source, target, {
  alignments = [],
  absDistance = false,
  onJudgeDistance,
}) {
  const sourcePack = new RectPack(source);
  const targetPack = new RectPack(target);
  const sourceRect = sourcePack.rectangle;
  const targetRect = targetPack.rectangle;
  const judgePack = onJudgeDistance && {
    source: sourcePack,
    target: targetPack,
  };
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
        if (distance.value < x.distance.value) {
          min.x = {
            alignment,
            distance: distance,
          };
        }
      } else if (ALIGNMENT_Y.includes(alignment)) {
        if (distance.value < y.distance.value) {
          min.y = {
            alignment,
            distance: distance,
          };
        }
      }

      distances[alignment] = distance;
    }

    return summary;
  }, {
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

  return {
    ...summary, // { distances, min: { x, y, any } }
    source: sourcePack,
    target: targetPack,
  };
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
    sort = false,
    onJudgeDistance,
    onJudgeAttraction,
  } = {},
  bindAttractions = [],
) {
  const options = {
    alignments,
    absDistance,
    onJudgeDistance,
  };
  const summary = targets.reduce((summary, target) => {
    const attraction = calcAttractionOfTarget(source, target, options);

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
      const {
        min: currentMin,
      } = attraction;
      const {
        x: currentMinX,
        y: currentMinY,
        any: currentMinAny,
      } = currentMin;

      if (currentMinX.distance.value < summaryMinX.distance.value) {
        summaryMin.x = {
          ...currentMinX,
          target,
        };
      }
      if (currentMinY.distance.value < summaryMinY.distance.value) {
        summaryMin.y = {
          ...currentMinY,
          target,
        };
      }

      if (sort) {
        const insertIndex = attracions.findIndex(({ min: { any } }) => {
          return currentMinAny.distance.value < any.distance.value;
        });

        attractions.splice(insertIndex, 0, attraction);
      } else {
        attractions.push(attraction);
      }
    }

    return summary;
  }, {
    attractions: bindAttractions,
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
  });
  const { min } = summary;
  const { x, y } = min;

  min.any = x.distance.value < y.distance.value
    ?x
    :y;

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
