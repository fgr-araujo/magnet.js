import { Alignments, ALIGNMENT_X, ALIGNMENT_Y } from '../Base';
import Distance from './Distance';
import Attraction from './Attraction';
import Summary from './Summary';
import { Pack, RectableSource, toPack } from '../../Rect';
import Rect from '../../Rect/Rect';
import AttractResult from './AttractResult';
import Point from '../../Rect/Point';

// bias of attraction gap
const BIAS_ATTRACT_GAP = 0.33;

/**
 * Check if {srcStart} and {srcEnd} are in range of {tgtStart}
 * and {tgtEnd} with attract distance {attractDistance}
 */
export function isinAttractRange(
  attractDistance: number,
  srcStart: number,
  srcEnd: number,
  tgtStart: number,
  tgtEnd: number,
): boolean {
  const targetRangeStart = tgtStart - attractDistance;
  const targetRangeEnd = tgtEnd + attractDistance;

  if (srcStart >= targetRangeStart && srcStart <= targetRangeEnd) {
    return true;
  }
  if (srcEnd >= targetRangeStart && srcEnd <= targetRangeEnd) {
    return true;
  }

  return false;
}

/**
 * Function returning true
 */
export type OnJudgeOptions = {
  attractDistance: number;
  alignToOuterline: boolean;
  crossPreventParent: boolean;
  parentPack?: Pack;
};
type OnJudge<T> = (
  ref: T,
  tgtPack: Pack,
  srcPack: Pack,
  options: OnJudgeOptions,
) => boolean;

const trueGetter: OnJudge<unknown> = () => true;

/**
 * Calculate distance of alignment from source to target
 */
export type CalcDistance = (
  alignment: Alignments,
  srcRect: Rect,
  tgtRect: Rect,
) => number;

export const calcDistance: CalcDistance = function calcDistance(
  alignment,
  srcRect,
  tgtRect,
) {
  switch (alignment) {
    default:
      // unknown alignment
      return Infinity;

    case Alignments.topToTop:
      // source top to target top
      return tgtRect.top - srcRect.top;

    case Alignments.topToBottom:
      // source top to target bottom
      return tgtRect.bottom - srcRect.top;

    case Alignments.rightToRight:
      // source right to target right
      return tgtRect.right - srcRect.right;

    case Alignments.rightToLeft:
      // source right to target left
      return tgtRect.left - srcRect.right;

    case Alignments.bottomToTop:
      // source bottom to target top
      return tgtRect.top - srcRect.bottom;

    case Alignments.bottomToBottom:
      // source bottom to target bottom
      return tgtRect.bottom - srcRect.bottom;

    case Alignments.leftToRight:
      // source right to target left
      return tgtRect.right - srcRect.left;

    case Alignments.leftToLeft:
      // source left to target left
      return tgtRect.left - srcRect.left;

    case Alignments.xCenterToXCenter:
      // source x center to target x center
      return 0.5 * ((tgtRect.right + tgtRect.left) - (srcRect.right + srcRect.left));

    case Alignments.yCenterToYCenter:
      // source y center to target y center
      return 0.5 * ((tgtRect.top + tgtRect.bottom) - (srcRect.top + srcRect.bottom));
  }
};

/**
 * Getter of distance value
 */
type ValGetter = (distance?: Distance) => number;

const absValGetter: ValGetter = (distance) => distance?.absVal || Infinity;
const rawValGetter: ValGetter = (distance) => distance?.rawVal || Infinity;

/**
 * Judge distance
 */
export type OnJudgeDistance = OnJudge<Distance>;
export type CalcAttractionOption = {
  attractDistance?: number; // distance to attract {target}
  alignments?: Array<Alignments>; // alignments to calculate
  absDistance?: boolean; // judge distance with absolute value
  onJudgeDistance?: OnJudgeDistance; // return false if not accept
};

export type CalcAttractionResultTarget = Pack;
export type CalcAttractionResultList = Attraction;
export type CalcAttractionResult = Summary<
  CalcAttractionResultTarget,
  CalcAttractionResultList
>;

/**
 * Clone attraction result
 */
export function cloneAttractionResult(
  ref: CalcAttractionResult,
): CalcAttractionResult {
  return new Summary<
    CalcAttractionResultTarget,
    CalcAttractionResultList
  >(
    ref.source.clone(),
    ref.target.clone(),
    ref.results.map((result) => result.clone()),
    ref.best.clone(),
  );
}

/**
 * Calculate attraction from {source} to {target}
 */
export type CalcAttraction = (
  source: RectableSource,
  target: RectableSource,
  options: CalcAttractionOption,
  attachOptions: OnJudgeOptions,
) => CalcAttractionResult;

export const calcAttraction: CalcAttraction = function calcAttraction(
  source,
  target,
  {
    attractDistance = Infinity,
    alignments = [],
    absDistance = true,
    onJudgeDistance = trueGetter,
  } = {},
  attachOptions,
) {
  const srcPack = new Pack(source);
  const tgtPack = new Pack(target);
  const srcRect = srcPack.rectangle;
  const tgtRect = tgtPack.rectangle;
  const biasGap: number = BIAS_ATTRACT_GAP * attractDistance;
  const valGetter: ValGetter = absDistance ? absValGetter : rawValGetter;
  const initialAttraction = new Attraction(srcPack, tgtPack, new Distance());

  // summarize result of results
  const summary: CalcAttractionResult = alignments.reduce((currSummary, alignment) => {
    const rawVal = calcDistance(alignment, srcRect, tgtRect);
    const distance = new Distance(alignment, rawVal, absDistance);

    if (onJudgeDistance(distance, tgtPack, srcPack, attachOptions)) {
      const { results, best } = currSummary;
      const { x, y } = best;
      const distanceVal = valGetter(distance);
      const attraction = new Attraction(srcPack, tgtPack, distance);

      results.push(attraction);

      if (ALIGNMENT_X.includes(alignment)) {
        // compare result on x

        const distanceXVal = valGetter(x);

        do { // jump out in any failure
          if (distanceVal > distanceXVal) {
            // larger than minimal
            break;
          } else if (distanceVal === distanceXVal) {
            /**
             * Equal to minimal
             *
             * This happens when {srcRect} and {tgtRect} are already attracted
             * together and both of them have the same size of horizontal edge,
             * which causes different alignments get the same results.
             *
             * Another situation is {srcRect} locates horizontally between
             * 2 {tgtRect}s with the same distance. However this is nearly
             * impossible so we don't deal with that here.
             */
            const diffX = srcRect.left - tgtRect.left;

            if (diffX > biasGap) {
              // rectangle is dragged nearer to the right edge
              if (alignment !== Alignments.rightToRight) {
                break;
              }
            } else if (diffX < -biasGap) {
              // rectangle is dragged nearer to the left edge
              if (alignment !== Alignments.leftToLeft) {
                break;
              }
            }
            // rectangle is dragged nearer to the x center
            if (alignment !== Alignments.xCenterToXCenter) {
              break;
            }
          }

          best.x = attraction;

        // eslint-disable-next-line no-constant-condition
        } while (false);
      } else if (ALIGNMENT_Y.includes(alignment)) {
        // compare result on y

        const distanceYVal = valGetter(y);

        do { // jump out in any failure
          if (distanceVal > distanceYVal) {
            // larger than minimal
            break;
          } else if (distanceVal === distanceYVal) {
            /**
             * Equal to minimal
             *
             * This happens when {srcRect} and {tgtRect} are already attracted
             * together and both of them have the same size of vertical edge,
             * which causes different alignments get the same results.
             *
             * Another situation is {srcRect} locates vertically between
             * 2 {tgtRect}s with the same distance. However this is nearly
             * impossible so we don't deal with that here.
             */
            const diffY = srcRect.top - tgtRect.top;

            if (diffY > biasGap) {
              // rectangle is dragged nearer to the bottom edge
              if (alignment !== Alignments.bottomToBottom) {
                break;
              }
            } else if (diffY < -biasGap) {
              // rectangle is dragged nearer to the top edge
              if (alignment !== Alignments.topToTop) {
                break;
              }
            }
            // rectangle is dragged nearer to the y center
            if (alignment !== Alignments.yCenterToYCenter) {
              break;
            }
          }

          best.y = attraction;

          // eslint-disable-next-line no-constant-condition
        } while (false);
      }
    }

    return currSummary;
  }, new Summary<Pack, Attraction>(
    srcPack,
    tgtPack,
    undefined,
    new AttractResult(
      initialAttraction,
      initialAttraction,
    ),
  ));

  return summary;
};

/**
 * Judge attraction summary
 */
export type OnJudgeAttractSummary = OnJudge<CalcAttractionResult>;
export type CalcMultiAttractionsOption = CalcAttractionOption & {
  onJudgeAttractSummary?: OnJudgeAttractSummary; // return false if not accept
  bindAttraction?: CalcAttractionResult; // initial attraction to bind
};

export type CalcMultiAttractionsResultTarget = Array<Pack>;
export type CalcMultiAttractionsResultList = CalcAttractionResult;
export type CalcMultiAttractionsResult = Summary<
  CalcMultiAttractionsResultTarget,
  CalcMultiAttractionsResultList
>;

/**
 * Clone multiple attractions result
 */
export function cloneMultiAttractionsResult(
  ref: CalcMultiAttractionsResult,
): CalcMultiAttractionsResult {
  return new Summary<
    CalcMultiAttractionsResultTarget,
    CalcMultiAttractionsResultList
  >(
    ref.source.clone(),
    ref.target.map((tgt) => tgt.clone()),
    ref.results.map((result) => cloneAttractionResult(result)),
    ref.best.clone(),
  );
}

/**
 * Calculate attractions from {source} to multiple targets
 */
export type CalcMultiAttractions = (
  source: RectableSource,
  targets: Array<RectableSource>,
  options: CalcMultiAttractionsOption,
  attachOptions: OnJudgeOptions,
) => CalcMultiAttractionsResult;

export const calcMultiAttractions: CalcMultiAttractions = function calcMultiAttractions(
  source,
  targets = [],
  {
    attractDistance,
    alignments,
    absDistance,
    onJudgeDistance,
    onJudgeAttractSummary = trueGetter,
    bindAttraction,
  } = {},
  attachOptions,
) {
  const srcPack = new Pack(source);
  const calcAttractionOptions: CalcAttractionOption = {
    attractDistance,
    alignments,
    absDistance,
    onJudgeDistance,
  };
  const valGetter: ValGetter = absDistance ? absValGetter : rawValGetter;
  const initialTargets: Array<Pack> = bindAttraction ? [toPack(bindAttraction.target)] : [];
  const initialresults: Array<CalcAttractionResult> = bindAttraction ? [bindAttraction] : [];
  const initialAttraction: AttractResult | undefined = bindAttraction?.best;

  // collect result of attraction summaries
  const summary: CalcMultiAttractionsResult = targets.reduce((currSummary, target) => {
    const tgtPack = new Pack(target);
    const attractSummary = calcAttraction(srcPack, tgtPack, calcAttractionOptions, attachOptions);
    const { best } = attractSummary;
    const minXAttraction = best.x;
    const minYAttraction = best.y;
    const minXVal = valGetter(minXAttraction);
    const minYVal = valGetter(minYAttraction);
    const {
      best: recMinAttraction,
    } = currSummary;
    const {
      x: recMinXAttraction,
      y: recMinYAttraction,
    } = recMinAttraction;
    const recMinXVal = valGetter(recMinXAttraction);
    const recMinYVal = valGetter(recMinYAttraction);

    currSummary.target.push(tgtPack);
    currSummary.results.push(attractSummary);

    if (onJudgeAttractSummary(attractSummary, tgtPack, srcPack, attachOptions)) {
      do { // jump out in any failure
        if (minXVal > recMinXVal) {
          // larger than minimal
          break;
        } else if (minXVal === recMinXVal) {
          /**
           * Equal to minimal
           *
           * This happends when {srcRect} and {tgtRect}s get 0 distance horizontally
           * so we judge which one is nearer by the vertical distance.
           */
          if (minYVal > recMinYVal) {
            // larger than minimal vertically
            break;
          }
        }

        recMinAttraction.x = minXAttraction;

        // eslint-disable-next-line no-constant-condition
      } while (false);

      do { // jump out in any failure
        if (minYVal > recMinYVal) {
          // larger than minimal
          break;
        } else if (minYVal === recMinYVal) {
          /**
           * Equal to minimal
           *
           * This happends when {srcRect} and {tgtRect}s get 0 distance vertically
           * so we judge which one is nearer by the horizontal distance.
           */
          if (minXVal > recMinXVal) {
            // larger than minimal horizontally
            break;
          }
        }

        recMinAttraction.y = minYAttraction;

        // eslint-disable-next-line no-constant-condition
      } while (false);
    }

    return currSummary;
  }, new Summary<CalcMultiAttractionsResultTarget, CalcMultiAttractionsResultList>(
    srcPack,
    initialTargets,
    initialresults,
    initialAttraction,
  ));

  return summary;
};

/**
 * Get offset of attraction result
 */
export type GetOffsetOfAttractResult = (
  result: AttractResult,
) => Point;

export const getOffsetOfAttractResult: GetOffsetOfAttractResult = function getOffsetOfAttractResult(
  result,
) {
  const {
    x: {
      alignment: xAlignment,
      rawVal: xRawVal,
    } = {},
    y: {
      alignment: yAlignment,
      rawVal: yRawVal,
    } = {},
  } = result;
  const offset = new Point(0, 0);

  if (ALIGNMENT_X.includes(xAlignment)) {
    offset.x = xRawVal as number;
  }
  if (ALIGNMENT_Y.includes(yAlignment)) {
    offset.y = yRawVal as number;
  }

  return offset;
};
