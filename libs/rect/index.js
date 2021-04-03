import {
  isset, getStyle, tonum,
} from '../stdlib';
import Rect from './rect';
import Pack from './pack';

/**
 * Convert {src} to rectangle
 *
 * @param {any} src
 * @returns {Rect}
 */
export function toRect(src) {
  if (!isset(src)) {
    // {src} is undefined
    throw new ReferenceError('Not assign source');
  } else if (src instanceof Rect) {
    // {src} is already a valid rectangle
    return src;
  } else if (src instanceof Pack) {
    // {src} includes a valid rectangle
    return src.rectangle;
  } else if (src instanceof Window || src instanceof Document) {
    // {src} is window/document

    const width = window.innerWidth;
    const height = window.innerHeight;

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

  return new Rect(src);
}

/**
 * Pack {src}
 *
 * @param {any} src
 * @returns {Pack}
 */
export function toPack(src) {
  return (Pack.isPack(src)
    ? src
    : new Pack(src)
  );
}
