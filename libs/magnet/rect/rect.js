class Rect {
  __top = 0
  __right = 0
  __bottom = 0
  __left = 0
  __width = 0
  __height = 0

  constructor(source) {
    const rect = isRectPack(source)
      ?source.rectangle
      :isRect(source, {
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

  get top() { return this.__top; }
  get right() { return this.__right; }
  get bottom() { return this.__bottom; }
  get left() { return this.__left; }

  get x() { return this.left; }
  get y() { return this.top; }
  
  get width() { return this.__width; }
  get height() { return this.__height; }

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
