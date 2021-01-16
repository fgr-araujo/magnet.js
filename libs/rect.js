'use strict';

import {
  isset, iselem, isfunc,
  isnum, tonum,
  getStyle,
} from './stdlib';

const isRealNum = (n) => isset(n) && isnum(n);

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
  __top = 0
  __right = 0
  __bottom = 0
  __left = 0
  __width = 0
  __height = 0

  constructor(source) {
    const rect = isRect(source, {
      afterFunc: (rect) => {
        return rect;
      },
    });

    if (rect) {
      this.__top = rect.top;
      this.__right = rect.right;
      this.__bottom = rect.bottom;
      this.__left = rect.left;
      this.__width = rect.width;
      this.__height = rect.height;
    }
  }

  /**
   * X
   */
  get x() { return this.left; }
  // set x(x) { return this.left = x; }
  
  /**
   * Y
   */
  get y() { return this.top; }
  // set y(y) { return this.top = y; }

  /**
   * Top
   */
  get top() { return this.__top; }
  // set top(top) {
  //   const bottom = this.bottom;
    
  //   if (!isRealNum(top)) {
  //     throw new Error(`Invalid top: ${top}`);
  //   } else if (top > bottom) {
  //     throw new Error(`Illegal top(${top}) > bottom(${bottom})`);
  //   }

  //   this.__top = top;
  //   this.__height = bottom - top;
  // }

  /**
   * Right
   */
  get right() { return this.__right; }
  // set right(right) {
  //   const left = this.left;

  //   if (!isRealNum(right)) {
  //     throw new Error(`Invalid right: ${right}`);
  //   } else if (right < left) {
  //     throw new Error(`Illegal right(${right}) < left(${left})`);
  //   }

  //   this.__right = right;
  //   this.__width = right - left;
  // }

  /**
   * Bottom
   */
  get bottom() { return this.__bottom; }
  // set bottom(bottom) {
  //   const top = this.top;

  //   if (!isRealNum(bottom)) {
  //     throw new Error(`Invalid bottom: ${bottom}`);
  //   } else if (bottom < top) {
  //     throw new Error(`Illegal bottom(${bottom}) < top(${top})`);
  //   }

  //   this.__bottom = bottom;
  //   this.__height = bottom - top;
  // }

  /**
   * Left
   */
  get left() { return this.__left; }
  // set left(left) {
  //   const right = this.right;

  //   if (!isRealNum(left)) {
  //     throw new Error(`Invalid left: ${left}`);
  //   } else if (left > right) {
  //     throw new Error(`Illegal left(${left}) > right(${right})`);
  //   }

  //   this.__left = left;
  //   this.__width = right - left;
  // }

  /**
   * Width
   */
  get width() { return this.__width; }
  // set width(width) {
  //   if (!isRealNum(width)) {
  //     throw new Error(`Invalid width: ${width}`);
  //   } else if (width < 0) {
  //     throw new Error(`Illegal width(${width}) < 0`);
  //   }

  //   this.__width = width;
  //   this.__right = this.left + width;
  // }

  /**
   * Height
   */
  get height() { return this.__height; }
  // set height(height) {
  //   if (!isRealNum(height)) {
  //     throw new Error(`Invalid height: ${height}`);
  //   } else if (height < 0) {
  //     throw new Error(`Illegal height(${height}) < 0`);
  //   }

  //   this.__height = height;
  //   this.__bottom = this.top + height;
  // }

  /**
   * Offset
   */
  offsetX(x = 0) {
    if (!isRealNum(x)) {
      throw new Error(`Invalid x: ${x}`);
    } else if (x) {
      this.__left += x;
      this.__right += x;
    }

    return this;
  }
  offsetY(y = 0) {
    if (!isRealNum(y)) {
      throw new Error(`Invalid y: ${y}`);
    } else if (y) {
      this.__top += y;
      this.__bottom += y;
    }
    
    return this;
  }
  offset(x, y) {
    this.offsetX(x);
    this.offsetY(y);

    return this;
  }

  /**
   * Move to
   */
  moveX(x = this.left) {
    if (!isRealNum(x)) {
      throw new Error(`Invalid x: ${x}`);
    }
    
    this.offsetX(x - this.left);

    return this;
  }
  moveY(y = this.top) {
    if (!isRealNum(y)) {
      throw new Error(`Invalid y: ${y}`);
    }

    this.offsetY(y - this.top);

    return this;
  }
  moveTo(x, y) {
    this.moveX(x);
    this.moveY(y);

    return this;
  }
}


export default Rect;
