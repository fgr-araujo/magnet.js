import {
  isset, isnum,
} from '../stdlib';

/**
 * Check if {a} and {b} is almost to be the same nubmer
 *
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
const BIAS = 0.0000000001;
const isInBias = (a, b) => Math.abs(a - b) <= BIAS;

// weak map for info of rectangle
const topMap = new WeakMap();
const rightMap = new WeakMap();
const bottomMap = new WeakMap();
const leftMap = new WeakMap();
const widthMap = new WeakMap();
const heightMap = new WeakMap();

export default class Rect {
  constructor(src) {
    const {
      x, y,
      top, right, bottom, left,
      width, height,
    } = src;

    let finalTop;
    let finalRight;
    let finalBottom;
    let finalLeft;
    let finalWidth;
    let finalHeight;

    // check horzontal
    if (isset(right)) {
      // check {right}
      if (!isnum(right)) {
        throw new TypeError(`Invalid right: ${right}`);
      }

      finalRight = right;
    }
    if (isset(x)) {
      // check {x}
      if (!isnum(x)) {
        throw new TypeError(`Invalid x: ${x}`);
      } else if (isset(left)) {
        // check {left}
        if (!isnum(left)) {
          throw new TypeError(`Invalid left: ${left}`);
        } else if (!isInBias(x, left)) {
          // {x} and {left} should be equal
          throw new RangeError(`x(${x}) <> left(${left})`);
        }
      }

      finalLeft = x;
    } else if (isset(left)) {
      // check {left}
      if (!isnum(left)) {
        throw new TypeError(`Invalid left: ${left}`);
      }

      finalLeft = left;
    }
    if (isset(finalRight)) {
      if (isset(finalLeft) && finalLeft > finalRight) {
        // {x|left} and {right} should be equal
        throw new RangeError(`x|left(${finalLeft}) > right(${finalRight})`);
      }
    } else if (!isset(finalLeft)) {
      // either {x|left} or {right} should be assigned
      throw new ReferenceError('Must assign either x, left or right');
    }

    // check vertical
    if (isset(bottom)) {
      // check {bottom}
      if (!isnum(bottom)) {
        throw new TypeError(`Invalid bottom: ${bottom}`);
      }

      finalBottom = bottom;
    }
    if (isset(y)) {
      // check {y}
      if (!isnum(y)) {
        throw new TypeError(`Invalid y: ${y}`);
      } else if (isset(top)) {
        // check {top}
        if (!isnum(top)) {
          throw new TypeError(`Invalid top: ${top}`);
        } else if (!isInBias(y, top)) {
          // {y} and {top} should be equal
          throw new RangeError(`y(${y}) <> top(${top})`);
        }
      }

      finalTop = y;
    } else if (isset(top)) {
      // check {top}
      if (!isnum(top)) {
        throw new TypeError(`Invalid top: ${top}`);
      }

      finalTop = top;
    }
    if (isset(finalTop)) {
      if (isset(finalBottom) && finalTop > finalBottom) {
        // {y|top} and {bottom} should be equal
        throw new RangeError(`y|top(${finalTop}) > bottom(${finalBottom})`);
      }
    } else if (!isset(finalBottom)) {
      // either {y|top} or {bottom} should be assigned
      throw new ReferenceError('Must have either y, top or bottom');
    }

    // check width
    if (isset(width)) {
      // check {width}
      if (!isnum(width)) {
        throw new TypeError(`Invalid width: ${width}`);
      } else if (width < 0) {
        throw new RangeError(`width(${width}) < 0`);
      } else if (!isset(finalRight)) {
        finalRight = finalLeft + width;
      } else if (!isset(finalLeft)) {
        finalLeft = finalRight - width;
      } else if (!isInBias(finalLeft + width, finalRight)) {
        throw new RangeError(`right(${finalRight}) - x|left(${finalLeft}) <> width(${width})`);
      }

      finalWidth = width;
    } else if (!isset(finalRight) || !isset(finalLeft)) {
      throw new ReferenceError('Not enough info for width');
    } else {
      finalWidth = finalRight - finalLeft;
    }

    // check height
    if (isset(height)) {
      // check {height}
      if (!isnum(height)) {
        throw new TypeError(`Invalid height: ${height}`);
      } else if (height < 0) {
        throw new RangeError(`height(${height}) < 0`);
      } else if (!isset(finalTop)) {
        finalTop = finalBottom - height;
      } else if (!isset(finalBottom)) {
        finalBottom = finalTop + height;
      } else if (!isInBias(finalTop + height, finalBottom)) {
        throw new RangeError(`bottom(${finalBottom}) - y|top(${finalTop}) <> height(${height})`);
      }

      finalHeight = height;
    } else if (!isset(finalTop) || !isset(finalBottom)) {
      throw new ReferenceError('Not enough info for height');
    } else {
      finalHeight = finalBottom - finalTop;
    }

    topMap.set(this, finalTop);
    rightMap.set(this, finalRight);
    bottomMap.set(this, finalBottom);
    leftMap.set(this, finalLeft);
    widthMap.set(this, finalWidth);
    heightMap.set(this, finalHeight);
  }

  get top() { return topMap.get(this); }

  get right() { return rightMap.get(this); }

  get bottom() { return bottomMap.get(this); }

  get left() { return leftMap.get(this); }

  get x() { return leftMap.get(this); }

  get y() { return topMap.get(this); }

  /**
   * Move x|left and right by x
   *
   * @param {number} x
   * @returns {Rect}
   */
  offsetX(x = 0) {
    if (!isnum(x)) {
      throw new TypeError(`Invalid x: ${x}`);
    }

    leftMap.set(this, this.left + x);
    rightMap.set(this, this.right + x);

    return this;
  }

  /**
   * Move y|top and bottom by y
   *
   * @param {number} y
   * @returns {Rect}
   */
  offsetY(y = 0) {
    if (!isnum(y)) {
      throw new TypeError(`Invalid y: ${y}`);
    }

    topMap.set(this, this.top + y);
    bottomMap.set(this, this.bottom + y);

    return this;
  }

  /**
   * Move rectangle by x and y
   *
   * @param {number} x
   * @param {number} y
   * @returns {Rect}
   */
  offset(x, y) {
    this.offsetX(x);
    this.offsetY(y);

    return this;
  }

  /**
   * Move x|left to the new x
   *
   * @param {number} x
   * @returns {Rect}
   */
  moveToX(x = this.left) {
    if (!isnum(x)) {
      throw new TypeError(`Invalid x: ${x}`);
    }

    this.offsetX(x - this.left);

    return this;
  }

  /**
   * Move y|top to the new y
   *
   * @param {number} y
   * @returns {Rect}
   */
  moveToY(y = this.top) {
    if (!isnum(y)) {
      throw new TypeError(`Invalid y: ${y}`);
    }

    this.offsetY(y - this.top);

    return this;
  }

  /**
   * Move rectangle to the new (x, y)
   *
   * @param {number} x
   * @param {number} y
   * @returns {Rect}
   */
  moveTo(x, y) {
    this.moveToX(x);
    this.moveToY(y);

    return this;
  }
}
