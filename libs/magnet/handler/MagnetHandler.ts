import Block from '../block-n';
import Point from '../../Rect/Point';
import { isarray } from '../../stdlib';
import Base, {
  Alignments, AlignToParents, AlignTos, CrossPrevents,
} from '../Base';
import {
  CalcAttractionResult, CalcMultiAttractionsResult,
  OnJudgeAttractSummary, OnJudgeDistance,
} from '../calc';
import { Pack } from '../../Rect';
import Rect from '../../Rect/Rect';

export type HandleMagnetDragData = {
  attractDistance: number;
  alignTo: Array<AlignTos>;
  alignToOuter: boolean;
  alignToInner: boolean;
  alignToCenter: boolean;
  alignToOuterline: boolean;
  alignToParent: Array<AlignToParents>;
  alignToParentInner: boolean;
  alignToParentCenter: boolean;
  crossPrevent: Array<CrossPrevents>;
  crossPreventParent: boolean;
  alignments: Array<Alignments>;
  parentAlignments: Array<Alignments>;
  onJudgeDistance: OnJudgeDistance;
  onJudgeAttractSummary: OnJudgeAttractSummary;
  disabled: boolean;
  group: string | null;
  unattractable: boolean;
  unmovable: boolean;
  parent: Pack;
  targets: Array<Pack>;
  self: Pack;
  originStyle: Record<'position'|'zIndex'|'transform', string>;
  startXY: Point;
  lastOffset: Point;
  lastAttractSummary?: CalcAttractionResult;
};

/**
 * Event detail
 */
export type EventDetail = {
  detail: {
    attractSummary: CalcMultiAttractionsResult;
    nextStep: Rect;
  };
};
export function getEventDetail(
  attractSummary: CalcMultiAttractionsResult,
  nextStep: Rect = attractSummary.source.rectangle,
): EventDetail {
  return {
    detail: {
      attractSummary,
      nextStep,
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
    const [touch] = evt.touches;

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
*
* @param {Block} src
* @param {string} evtName
* @param {object} options
* @returns {boolean} is event canceled
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
