import Block from '../block-n';
import Point from '../../Rect/Point';
import { isarray } from '../../stdlib';
import Base from '../Base';

export type MagnetConfig = {
};

export type MagnetHandler = (
  src: HTMLElement,
  evt: MouseEvent | TouchEvent,
  cfg: MagnetConfig,
) => void;

/**
 * Get clientX/clientY of event
 */
 type EventWithClientXY = {
  clientX?: number;
  clientY?: number;
  touches?: Array<EventWithClientXY>;
};

export function getEvtClientXY({
  clientX, clientY,
  touches: [{
    clientX: x = clientX,
    clientY: y = clientY,
  }] = [],
}: EventWithClientXY): Point {
  return new Point(x, y);
}

/**
 * Add event listener to {src}
 */
type EventListenerProps = (
  src: Block,
  evtNames: string | Array<string>,
  caller: () => unknown,
) => Block;

export const addEventListener: EventListenerProps = function addEventListener(
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
export const removeEventListener: EventListenerProps = function removeEventListener(
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
