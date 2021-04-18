import Block from './Block';
import Point from '../Rect/Point';
import { isarray } from '../stdlib';
import Base, {
  Alignments, AlignToParents, AlignTos, CrossPrevents,
} from './Base';
import {
  CalcMultiAttractionsResult, cloneMultiAttractionsResult,
  OnJudgeAttractSummary, OnJudgeDistance, OnJudgeOptions,
} from './calc';
import { Pack } from '../Rect';
import Rect from '../Rect/Rect';
import AttractResult from './calc/AttractResult';

/**
 * Event parameter
 */
export type MagnetEventParams = {
  attractDistance: number;
  alignTo: Array<AlignTos>;
  alignToOuter: boolean;
  alignToInner: boolean;
  alignToCenter: boolean;
  alignToExtend: boolean;
  alignToParent: Array<AlignToParents>;
  alignToParentInner: boolean;
  alignToParentCenter: boolean;
  crossPrevent: Array<CrossPrevents>;
  crossPreventParent: boolean;
  alignments: Array<Alignments>;
  parentAlignments: Array<Alignments>;
  onJudgeDistance: OnJudgeDistance;
  onJudgeAttractSummary: OnJudgeAttractSummary;
  onJudgeParentDistance: OnJudgeDistance;
  disabled: boolean;
  group: string | null;
  unattractable: boolean;
  unmovable: boolean;
  parent?: Pack;
  targets: Array<Pack>;
  self: Pack;
  originStyle: Record<'position'|'zIndex'|'transform', string>;
  startXY: Point;
  lastOffset: Point;
  lastAttractSummary?: CalcMultiAttractionsResult;
  attachOptions: OnJudgeOptions;
};

/**
 * Drag event detail
 */
export type BlockState = {
  offset: Point;
  rectangle: Rect;
  attraction?: AttractResult;
};
export type DragEventDetail = {
  detail: {
    originEvent: Event;
    last: BlockState;
  };
};

export function generateDragEventDetail(
  originEvent: Event,
  data: MagnetEventParams,
): DragEventDetail {
  return {
    detail: {
      originEvent,
      last: {
        offset: data.lastOffset.clone(),
        rectangle: data.self.rectangle.clone(),
        attraction: data.lastAttractSummary?.best.clone(),
      },
    },
  };
}

/**
 * Attract event detail
 */
export type AttractEventDetail = {
  detail: {
    attractSummary: CalcMultiAttractionsResult;
    next: BlockState;
  };
};
export function generateAttractEventDetail(
  attractSummary: CalcMultiAttractionsResult,
  nextRect: Rect = attractSummary.source.rectangle,
): AttractEventDetail {
  return {
    detail: {
      attractSummary: cloneMultiAttractionsResult(attractSummary),
      next: {
        offset: new Point(nextRect),
        rectangle: nextRect.clone(),
        attraction: attractSummary.best.clone(),
      },
    },
  };
}

/**
 * Get clientX/clientY of event
 */
export function getEvtClientXY(evt: Event): Point {
  if (evt instanceof MouseEvent) {
    return new Point(evt.clientX, evt.clientY);
  }
  if (evt instanceof TouchEvent) {
    const touch = evt.touches[0];

    return new Point(touch.clientX, touch.clientY);
  }

  throw new ReferenceError(`Invalid event: ${evt}`);
}

/**
 * Add event listener to {src}
 */
type DragEventListenerProps<T = Element | Window | Document> = (
  src: T,
  evtNames: string | Array<string>,
  caller: (evt: Event) => void,
) => T;

export const addEventListener: DragEventListenerProps = function addEventListener(
  src, evtNames, caller,
) {
  (isarray(evtNames) ? evtNames : [evtNames])
    .forEach((evtName) => {
      src.addEventListener(evtName, caller);
    });

  return src;
};

/**
* Remove event listener from {src}
*/
export const removeEventListener: DragEventListenerProps = function removeEventListener(
  src, evtNames, caller,
) {
  (isarray(evtNames) ? evtNames : [evtNames])
    .forEach((evtName) => {
      src.removeEventListener(evtName, caller);
    });

  return src;
};

/**
* Trigger event listener of {src}
*/
type TriggerEventProps = (
  src: Block,
  evtName: string,
  options: Record<string, unknown>,
) => boolean; // is event canceled

export const triggerEvent: TriggerEventProps = function triggerEvent(
  src, evtName, options,
) {
  return (src instanceof Base
    ? src.triggerMagnetEvent(evtName, options)
    : false
  );
};
