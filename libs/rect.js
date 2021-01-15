'use strict';

import {
  isset, iselem, isfunc,
  isnum, tonum,
  getStyle,
} from './stdlib';

const printLog = ()=>{};
// const printLog = console.log;

/**
 * Check if source is rectangle object
 */
export function isRect(
  source,
  {
    bias = .0000000001,
    afterFunc,
  }
) {
  try {
    const returnRectResult = (rect) => {
      if (isfunc(afterFunc)) {
        const result = afterFunc(rect, source);

        return isset(result) ?result :true;
      }

      return true;
    };
    // const printLog = ()=>{};

    if (!isset(source)) {
      throw new Error(`Not assign source`);
    } else if (source instanceof Rect) {
      return returnRectResult(source);
    }

    const {
      x, y,
      top,
      right,
      bottom,
      left,
      width,
      height,
    } = source;
    const isInBias = (a, b) => Math.abs(a - b) <= bias;
    const isRealNum = (n) => isset(n) && isnum(n);

    let finalTop;
    let finalRight;
    let finalBottom;
    let finalLeft;
    let finalWidth;
    let finalHeight;

    // assign left
    if (isset(x)) {
      if (!isRealNum(x)) {
        throw new Error(`Invalid x: ${x}`);
      } else if (isset(left)) {
        if (!isRealNum(left)) {
          throw new Error(`Invalid left: ${left}`);
        } else if (!isInBias(x, left)) {
          throw new Error(`x(${x}) <> left(${left})`);
        }
      }

      finalLeft = x;
    } else if (isset(left)) {
      if (!isRealNum(left)) {
        throw new Error(`Invalid left: ${left}`);
      }

      finalLeft = left;
    } else if (isset(right)) {
      if (!isRealNum(right)) {
        throw new Error(`Invalid right: ${right}`);
      }

      finalRight = right;
    } else {
      throw new Error(`Must have either one of x, left, or right`);
    }

    // assign top
    if (isset(y)) {
      if (!isRealNum(y)) {
        throw new Error(`Invalid y: ${y}`);
      } else if (isset(top)) {
        if (!isRealNum(top)) {
          throw new Error(`Invalid top: ${top}`);
        } else if (!isInBias(y, top)) {
          throw new Error(`y(${y}) <> top(${top})`);
        }
      }

      finalTop = y;
    } else if (isset(top)) {
      if (!isRealNum(top)) {
        throw new Error(`Invalid top: ${top}`);
      }

      finalTop = top;
    } else if (isset(bottom)) {
      if (!isRealNum(bottom)) {
        throw new Error(`Invalid bottom: ${bottom}`);
      }

      finalBottom = bottom;
    } else {
      throw new Error(`Must have either one of y, top, or bottom`);
    }
    
    // assign right
    if (!isset(finalRight)) {
      if (isset(right) && !isRealNum(right)) {
        throw new Error(`Invalid right: ${right}`);
      }
    } else if (isset(finalLeft) && finalRight < finalLeft) {
      throw new Error(`Illegal x|left(${finalLeft}) and right(${finalRight})`);
    }

    // assign bottom
    if (!isset(finalBottom)) {
      if (isset(bottom) && !isRealNum(bottom)) {
        throw new Error(`Invalid bottom: ${bottom}`);
      }
    } else if (isset(finalTop) && finalBottom < finalTop) {
      throw new Error(`Illegal y|top(${finalTop}) and bottom(${finalBottom})`);
    }

    // assign width
    if (isset(width)) {
      if (!isRealNum(width)) {
        throw new Error(`Invalid width: ${width}`);
      } else if (width < 0) {
        throw new Error(`Illegal width(${width}) < 0`);
      } else if (isset(finalLeft)) {
        if (!isset(finalRight)) {
          finalRight = finalLeft + width;
        } else if (!isInBias(finalLeft + width, finalRight)) {
          throw new Error(`Illegal width(${width}) <> right(${right}) - x|left(${left})`);
        }
      }

      finalWidth = width;
    } else if (!isset(finalLeft) || !isset(finalRight)) {
      throw new Error(`Must have information to build up width: x, left, right, or width`);
    } else {
      finalWidth = finalRight - finalLeft;
    }

    // assign height
    if (isset(height)) {
      if (!isRealNum(height)) {
        throw new Error(`Invalid height: ${height}`);
      } else if (height < 0) {
        throw new Error(`Illegal height(${height}) < 0`);
      } else if (isset(finalTop)) {
        if (!isset(finalBottom)) {
          finalBottom = finalTop + height;
        } else if (!isInBias(finalTop + height, finalBottom)) {
          throw new Error(`Illegal height(${height}) <> bottom(${bottom}) - y|top(${top})`);
        }
      }

      finalHeight = height;
    } else if (!isset(finalTop) || !isset(finalBottom)) {
      throw new Error(`Must have information to build up height: y, top, bottom, or height`);
    } else {
      finalHeight = finalBottom - finalTop;
    }
    
    return returnRectResult({
      x: finalLeft,
      y: finalTop,
      top: finalTop,
      right: finalRight,
      bottom: finalBottom,
      left: finalLeft,
      width: finalWidth,
      height: finalHeight,
    });
  } catch (err) {
    console.warn(`Failed on stdRect: ${err.message}`, source);

    return false;
  }
}

/**
 * Standardize source to Rect object
 */
export function stdRect(source) {
  if (source instanceof Rect) {
    return source;
  } else if (source instanceof Element) {
    const {
      borderTopWidth,
      borderRightWidth,
      borderBottomWidth,
      borderLeftWidth,
      boxSizing,
    } = getStyle(source);
    const calcBorder = !/\bborder-box\b/i.test(boxSizing);
    const borderTop = calcBorder ?tonum(borderTopWidth) | 0 :0;
    const borderRight = calcBorder ?tonum(borderRightWidth) | 0 :0;
    const borderBottom = calcBorder ?tonum(borderBottomWidth) | 0 :0;
    const borderLeft = calcBorder ?tonum(borderLeftWidth) | 0 :0;
    const width = source.clientWidth - borderRight - borderLeft;
    const height = source.clientHeight - borderTop - borderBottom;

    if (source === document.body) {
      return new Rect({
        top: borderTop,
        right: width,
        bottom: height,
        left: borderLeft,
        width,
        height,
      });
    }
    const { top, right, bottom, left } = source.getBoundingClientRect();
    const t = top + borderTop;
    const r = right - borderRight;
    const b = bottom - borderBottom;
    const l = left + borderLeft;
    
    return new Rect({
      top: t,
      right: r,
      bottom: b,
      left: l,
      width,
      height,
    });
  } else if (source instanceof Window) {
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
      heigth,
    });
  }

  const result = isRect(source, {
    afterFunc: (rect) => {
      return rect;
    },
  });

  if (result) {
    // source is rectangle object
    return new Rect(result);
  } else if (!iselem(source)) {
    throw new Error(`Invalid source to convert to rectangle: ${source}`);
  }
}

class Rect {
  x = 0
  y = 0
  top = 0
  right = 0
  bottom = 0
  left = 0
  width = 0
  height = 0

  constructor(source) {
    printLog(660, source);

    const rect = isRect(source, {
      afterFunc: (rect) => {
        printLog(661, rect);
        return rect;
      },
    });
    printLog(662, rect, source);

    if (rect) {
      this.x = rect.x;
      this.y = rect.y;
      this.top = rect.top;
      this.right = rect.right;
      this.bottom = rect.bottom;
      this.left = rect.left;
      this.width = rect.width;
      this.height = rect.height;
    }
  }

  offset(x = 0, y = 0) {
    printLog('OFFSET-st', [this.x,this.y], [x,y]);

    if (x) {
      this.left = this.x = this.left + x;
      this.right += x;
    }
    if (y) {
      this.top = this.y = this.top + y;
      this.bottom += y;
    }

    printLog('OFFSET-ed', [this.x,this.y]);
    return this;
  }

  moveTo(x = this.left, y = this.top) {
    printLog('MOVE', [this.x,this.y], [x,y]);

    return this.offset(x - this.left, y - this.top);
  }
}


export default Rect;
