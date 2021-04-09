/* eslint-disable no-use-before-define */

import {
  isset, getStyle, tonum,
} from '../stdlib';
import Rect, { RectableObj } from './Rect';

const rectMap = new WeakMap();
const rawMap = new WeakMap();

export type RectableSource = RectableObj | Rect | Pack | Element | Window | Document;

export class Pack {
  constructor(src: RectableSource) {
    if (Pack.isPack(src)) {
      rectMap.set(this, src.rectangle);
      rawMap.set(this, src.raw);
    } else {
      rectMap.set(this, toRect(src));
      rawMap.set(this, src);
    }
  }

  /**
   * Check if {src} is pack
   */
  static isPack(src: unknown): src is Pack {
    return src instanceof this;
  }

  get raw(): unknown { return rawMap.get(this); }

  get rectangle(): Rect { return rectMap.get(this); }
}

/**
 * Convert {src} to rectangle
 */
export function toRect(src: RectableSource): Rect {
  if (!isset(src)) {
    // {src} is undefined
    throw new ReferenceError('Not assign source');
  } else if (Rect.isRect(src)) {
    // {src} is already a valid rectangle
    return src;
  } else if (Pack.isPack(src)) {
    // {src} includes a valid rectangle
    return src.rectangle;
  } else if (src instanceof Window || src instanceof Document) {
    // {src} is window/document

    const width = window.innerWidth;
    const height = window.innerHeight;

    src as Window | Document;

    return new Rect({
      x: 0,
      y: 0,
      top: 0,
      right: width,
      bottom: height,
      left: 0,
      width,
      height,
    });
  } else if (src instanceof Element) {
    // {src} is a element

    const {
      borderTopWidth,
      borderRightWidth,
      borderBottomWidth,
      borderLeftWidth,
      boxSizing,
    } = getStyle(src);
    const calcBorder = !/\bborder-box\b/i.test(boxSizing);
    const borderTop = calcBorder ? tonum(borderTopWidth) : 0;
    const borderRight = calcBorder ? tonum(borderRightWidth) : 0;
    const borderBottom = calcBorder ? tonum(borderBottomWidth) : 0;
    const borderLeft = calcBorder ? tonum(borderLeftWidth) : 0;
    const width = src.clientWidth - borderRight - borderLeft;
    const height = src.clientHeight - borderTop - borderBottom;

    src as Element;

    if (src === document.body) {
      // {src} is <body>
      return new Rect({
        top: borderTop,
        right: width,
        bottom: height,
        left: borderLeft,
        width,
        height,
      });
    }

    const {
      top, right, bottom, left,
    } = src.getBoundingClientRect();

    return new Rect({
      top: top + borderTop,
      right: right - borderRight,
      bottom: bottom - borderBottom,
      left: left + borderLeft,
      width,
      height,
    });
  }

  return new Rect(src as RectableObj);
}

/**
 * Pack {src}
 */
export function toPack(src: RectableSource): Pack {
  return (Pack.isPack(src)
    ? src
    : new Pack(src)
  );
}
