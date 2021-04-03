import {
  isset, isnull, isnum, isstr, tonum, objMap, toarray,
} from '../stdlib';

// prepend prefix for attribute name
export const attrPrefix = (str) => `mg-${str}`;

// attributes
const ATTR_DISABLED = attrPrefix('disabled');
const ATTR_GROUP = attrPrefix('group');
const ATTR_UNATTRABLE = attrPrefix('unattractable');
const ATTR_UNMOVABLE = attrPrefix('unmovable');
const ATTR_ATTRACT_DISTANCE = attrPrefix('attract-distance');
const ATTR_ALIGN_TO = attrPrefix('align-to');
const ATTR_ALIGN_TO_PARENT = attrPrefix('align-to-parent');
const ATTR_CROSS_PREVENT = attrPrefix('cross-prevent');

// values of alignment
const ALIGNMENT_TOP_TO_TOP = 'topToTop';
const ALIGNMENT_TOP_TO_BOTTOM = 'topToBottom';
const ALIGNMENT_RIGHT_TO_RIGHT = 'rightToRight';
const ALIGNMENT_RIGHT_TO_LEFT = 'rightToLeft';
const ALIGNMENT_BOTTOM_TO_TOP = 'bottomToTop';
const ALIGNMENT_BOTTOM_TO_BOTTOM = 'bottomToBottom';
const ALIGNMENT_LEFT_TO_RIGHT = 'leftToRight';
const ALIGNMENT_LEFT_TO_LEFT = 'leftToLeft';
const ALIGNMENT_X_CENTER_TO_X_CENTER = 'xCenterToXCenter';
const ALIGNMENT_Y_CENTER_TO_Y_CENTER = 'yCenterToYCenter';

// values of align to
const ALIGN_TO_OUTER = 'outer';
const ALIGN_TO_INNER = 'inner';
const ALIGN_TO_CENTER = 'center';
const ALIGN_TO_OUTERLINE = 'outerline';

// values of cross prevent
const CROSS_PREVENT_PARENT = 'parent';

// default values
const DEF_ATTRACT_DISTANCE = 0;
const DEF_ALIGN_TO = [
  ALIGN_TO_OUTER,
  ALIGN_TO_INNER,
  ALIGN_TO_CENTER,
  ALIGN_TO_OUTERLINE,
];
const DEF_ALIGN_TO_PARENT = [
  ALIGN_TO_INNER,
  ALIGN_TO_CENTER,
];
const DEF_CROSS_PREVENT = [
  CROSS_PREVENT_PARENT,
];

/**
 * Standardize property values for class static member
 *
 * @param {object} props
 * @returns {object}
 */
const stdPropValues = (props) => Object.defineProperties({}, objMap(props, (value) => ({
  value,
  enumerable: true,
})));

/**
 * Standardize multiple values assigned to attribute value
 *
 * @param {string|array} val
 * @param {object} ref
 * @returns {string}
 */
const REGEXP_ATTR_SPLIT = /[|;,\s]/;
const stdMultiValToAttrVal = (val, ref) => (isstr(val)
  ? val.split(REGEXP_ATTR_SPLIT)
  : toarray(val)
)
  .filter((member) => member in ref)
  .join('|');

/**
 * Standardize attribute value to multiple value
 *
 * @param {string} val
 * @param {object} ref
 * @param {array} def
 * @returns {array}
 */
const stdAttrValToMultiVal = (val, ref, def) => (isstr(val)
  ? val
    .split(REGEXP_ATTR_SPLIT)
    .filter((member) => member in ref)
  : def
);

// template HTML for <magnet-*>
const template = document.createElement('template');
template.innerHTML = `
<style>
  :host {
    position: relative;
    display: inline-block;
  }
</style>
<slot>
</slot>
`;

export default class Base extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  /**
   * Available alignments
   */
  static ALIGNMENT = stdPropValues({
    topToTop: ALIGNMENT_TOP_TO_TOP,
    topToBottom: ALIGNMENT_TOP_TO_BOTTOM,
    rightToRight: ALIGNMENT_RIGHT_TO_RIGHT,
    rightToLeft: ALIGNMENT_RIGHT_TO_LEFT,
    bottomToTop: ALIGNMENT_BOTTOM_TO_TOP,
    bottomToBottom: ALIGNMENT_BOTTOM_TO_BOTTOM,
    leftToRight: ALIGNMENT_LEFT_TO_RIGHT,
    leftToLeft: ALIGNMENT_LEFT_TO_LEFT,
    xCenterToXCenter: ALIGNMENT_X_CENTER_TO_X_CENTER,
    yCenterToYCenter: ALIGNMENT_Y_CENTER_TO_Y_CENTER,
  })

  /**
   * Available types to sense to align magnets
   */
  static ALIGN_TO = stdPropValues({
    outer: ALIGN_TO_OUTER,
    inner: ALIGN_TO_INNER,
    center: ALIGN_TO_CENTER,
    outerline: ALIGN_TO_OUTERLINE,
  })

  /**
   * Available types to sense to align parent
   */
  static ALIGN_TO_PARENT = stdPropValues({
    inner: ALIGN_TO_INNER,
    center: ALIGN_TO_CENTER,
  })

  /**
   * Available types to prevent crossing
   */
  static CROSS_PREVENT = stdPropValues({
    parent: CROSS_PREVENT_PARENT,
  })

  /**
   * Get attribute value
   *
   * @param {string} attrName
   * @returns {string?}
   */
  traceAttributeValue(attrName) {
    const val = this.getAttribute(attrName);

    return isnull(val) ? val : undefined;
  }

  /**
   * Trigger custom event
   *
   * @param {string} evtName
   * @param {object?} options
   * @member {any?} detail
   * @member {boolean?} composed
   * @member {boolean?} cancelable
   * @member {boolean?} bubbles
   * @returns {boolean} is event canceled
   */
  triggerCustomEvent(evtName, {
    detail,
    composed = false,
    cancelable = true,
    bubbles = false,
  } = {}) {
    const evt = new CustomEvent(evtName, {
      detail,
      composed,
      cancelable,
      bubbles,
    });

    return !this.dispatchEvent(evt); // true if canceled
  }

  /**
   * Disabled
   *
   * Set to be both unattractable and unmovable
   */
  set disabled(val) {
    if (val) {
      this.setAttribute(ATTR_DISABLED, '');
    } else {
      this.removeAttribute(ATTR_DISABLED);
    }

    return this;
  }

  get disabled() {
    return isstr(this.traceAttributeValue(ATTR_DISABLED));
  }

  /**
   * Group
   *
   * Be attractable to magnets with the same group
   * If no group, would be seen as non-group magnets
   */
  set group(val) {
    this.setAttribute(ATTR_GROUP, val);

    return this;
  }

  get group() {
    return this.traceAttributeValue(ATTR_GROUP);
  }

  /**
   * Unattractable
   *
   * Set to be no attraction for magnets
   */
  set unattractable(val) {
    if (val) {
      this.setAttribute(ATTR_UNATTRABLE, '');
    } else {
      this.removeAttribute(ATTR_UNATTRABLE);
    }

    return this;
  }

  get unattractable() {
    return isstr(this.traceAttributeValue(ATTR_UNATTRABLE));
  }

  /**
   * Unmovable
   *
   * Set to be unable for dragging
   */
  set unmovable(val) {
    if (val) {
      this.setAttribute(ATTR_UNMOVABLE, '');
    } else {
      this.removeAttribute(ATTR_UNMOVABLE);
    }

    return this;
  }

  get unmovable() {
    return isstr(this.traceAttributeValue(ATTR_UNMOVABLE));
  }

  /**
   * Attract distance (unit: px)
   *
   * Distance to sense magnets
   */
  set attractDistance(val) {
    if (isnum(val)) {
      this.setAttribute(ATTR_ATTRACT_DISTANCE, val);
    }

    return this;
  }

  get attractDistance() {
    const val = this.traceAttributeValue(ATTR_ATTRACT_DISTANCE);

    return tonum(isset(val) ? val : DEF_ATTRACT_DISTANCE);
  }

  /**
   * Types for sensing to align magnets
   */
  set alignTo(val) {
    const attrVal = stdMultiValToAttrVal(val, Base.ALIGN_TO);

    this.setAttribute(ATTR_ALIGN_TO, attrVal);

    return this;
  }

  get alignTo() {
    const val = this.traceAttributeValue(ATTR_ALIGN_TO);

    return stdAttrValToMultiVal(val, Base.ALIGN_TO, DEF_ALIGN_TO);
  }

  /**
   * Types for sensing to align parent
   */
  set alignToParent(val) {
    const attrVal = stdMultiValToAttrVal(val, Base.ALIGN_TO_PARENT);

    this.setAttribute(ATTR_ALIGN_TO_PARENT, attrVal);

    return this;
  }

  get alignToParent() {
    const val = this.traceAttributeValue(ATTR_ALIGN_TO_PARENT);

    return stdAttrValToMultiVal(val, Base.ALIGN_TO_PARENT, DEF_ALIGN_TO_PARENT);
  }

  /**
   * Types to prevent crossing
   */
  set crossPrevent(val) {
    const attrVal = stdMultiValToAttrVal(val, Base.CROSS_PREVENT);

    this.setAttribute(ATTR_CROSS_PREVENT, attrVal);

    return this;
  }

  get crossPrevent() {
    const val = this.traceAttributeValue(ATTR_CROSS_PREVENT);

    return stdAttrValToMultiVal(val, Base.CROSS_PREVENT, DEF_CROSS_PREVENT);
  }
}
