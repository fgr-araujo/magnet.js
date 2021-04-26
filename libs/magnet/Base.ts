import {
  isnum, isstr, tonum, objMap, toarray, tostr,
} from '../stdlib';

// attributes
export enum Attributes {
  disabled = 'mg-disabled',
  group = 'mg-group',
  unattractable = 'mg-unattractable',
  unmovable = 'mg-unmovable',
  attractDistance = 'mg-attract-distance',
  alignTo = 'mg-align-to',
  alignToParent = 'mg-align-to-parent',
  crossPrevent = 'mg-cross-prevent',
}

// values of alignment
export enum Alignments {
  topToTop = 'topToTop',
  topToBottom = 'topToBottom',
  rightToRight = 'rightToRight',
  rightToLeft = 'rightToLeft',
  bottomToTop = 'bottomToTop',
  bottomToBottom = 'bottomToBottom',
  leftToRight = 'leftToRight',
  leftToLeft = 'leftToLeft',
  xCenterToXCenter = 'xCenterToXCenter',
  yCenterToYCenter = 'yCenterToYCenter',
}

export const ALIGNMENT_X: Array<unknown> = [
  Alignments.rightToRight,
  Alignments.rightToLeft,
  Alignments.leftToRight,
  Alignments.leftToLeft,
  Alignments.xCenterToXCenter,
];
export const ALIGNMENT_Y: Array<unknown> = [
  Alignments.topToTop,
  Alignments.topToBottom,
  Alignments.bottomToTop,
  Alignments.bottomToBottom,
  Alignments.yCenterToYCenter,
];

// values of align to
export enum AlignTos {
  outer = 'outer',
  inner = 'inner',
  center = 'center',
  extend = 'extend',
}
export enum AlignToParents {
  inner = 'inner',
  center = 'center',
}

// values of cross prevent
export enum CrossPrevents {
  parent = 'parent',
}

// names of event
export enum Events {
  start = 'mg-start',
  move = 'mg-move',
  end = 'mg-end',
  attract = 'mg-attract',
  attractmove = 'mg-attractmove',
  unattract = 'mg-unattract',
  attracted = 'mg-attracted',
  attractedmove = 'mg-attractedmove',
  unattracted = 'mg-unattracted',
}

/**
 * Standardize property values for class static member
 */
function stdPropValues<T extends Record<string, string>>(props: T): T {
  const config = objMap(props, (value) => ({
    value,
    enumerable: true,
  }));

  return Object.defineProperties({}, config as PropertyDescriptorMap);
}

/**
 * Standardize multiple values assigned to attribute value
 */
const REGEXP_ATTR_SPLIT = /[|;,\s]/;

function stdMultiValToAttrVal<T extends string>(
  val: Array<T>,
  ref: Record<T, unknown>,
): string {
  return (isstr(val)
    ? val.split(REGEXP_ATTR_SPLIT)
    : toarray(val).filter(isstr)
  )
    .filter((member) => member in ref)
    .join('|');
}

/**
 * Standardize attribute value to multiple value
 */
function stdAttrValToMultiVal<T extends string>(
  val: unknown,
  ref: Record<T, unknown>,
  def: Array<T>,
): Array<T> {
  return (isstr(val)
    ? val
      .split(REGEXP_ATTR_SPLIT)
      .filter((member) => member in ref)
    : def
  ) as Array<T>;
}

// default values
const DEF_ATTRACT_DISTANCE = 0;
const DEF_ALIGN_TO: Array<AlignTos> = [
  AlignTos.outer,
  AlignTos.inner,
  AlignTos.center,
  AlignTos.extend,
];
const DEF_ALIGN_TO_PARENT: Array<AlignToParents> = [
  // AlignToParents.inner,
  // AlignToParents.center,
];
const DEF_CROSS_PREVENT: Array<CrossPrevents> = [
  // CrossPrevents.parent,
];

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
    this.shadowRoot?.appendChild(template.content.cloneNode(true));
  }

  /**
   * Available alignments
   */
  static MAGNET_ALIGNMENT = stdPropValues({
    topToTop: Alignments.topToTop,
    topToBottom: Alignments.topToBottom,
    rightToRight: Alignments.rightToRight,
    rightToLeft: Alignments.rightToLeft,
    bottomToTop: Alignments.bottomToTop,
    bottomToBottom: Alignments.bottomToBottom,
    leftToRight: Alignments.leftToRight,
    leftToLeft: Alignments.leftToLeft,
    xCenterToXCenter: Alignments.xCenterToXCenter,
    yCenterToYCenter: Alignments.yCenterToYCenter,
  })

  /**
   * Available types to sense to align magnets
   */
  static MAGNET_ALIGN_TO = stdPropValues({
    outer: AlignTos.outer,
    inner: AlignTos.inner,
    center: AlignTos.center,
    extend: AlignTos.extend,
  })

  /**
   * Get types of alignment of types of align to
   */
  static getMagnetAlignmentsOfAlignTo(
    alignTo: Array<AlignTos | AlignToParents> = [],
  ): Array<Alignments> {
    const alignments = [];

    if (alignTo.includes(this.MAGNET_ALIGN_TO.outer)) {
      alignments.push(this.MAGNET_ALIGNMENT.topToBottom);
      alignments.push(this.MAGNET_ALIGNMENT.rightToLeft);
      alignments.push(this.MAGNET_ALIGNMENT.bottomToTop);
      alignments.push(this.MAGNET_ALIGNMENT.leftToRight);
    }
    if (alignTo.includes(this.MAGNET_ALIGN_TO.inner)) {
      alignments.push(this.MAGNET_ALIGNMENT.topToTop);
      alignments.push(this.MAGNET_ALIGNMENT.rightToRight);
      alignments.push(this.MAGNET_ALIGNMENT.bottomToBottom);
      alignments.push(this.MAGNET_ALIGNMENT.leftToLeft);
    }
    if (alignTo.includes(this.MAGNET_ALIGN_TO.center)) {
      alignments.push(this.MAGNET_ALIGNMENT.xCenterToXCenter);
      alignments.push(this.MAGNET_ALIGNMENT.yCenterToYCenter);
    }

    return alignments;
  }

  /**
   * Available types to sense to align parent
   */
  static MAGNET_ALIGN_TO_PARENT = stdPropValues({
    inner: AlignToParents.inner,
    center: AlignToParents.center,
  })

  /**
   * Available types to prevent crossing
   */
  static MAGNET_CROSS_PREVENT = stdPropValues({
    parent: CrossPrevents.parent,
  })

  /**
   * Available names of event
   */
  static MAGNET_EVENT = stdPropValues({
    start: Events.start,
    move: Events.move,
    end: Events.end,
    attract: Events.attract,
    attractmove: Events.attractmove,
    unattract: Events.unattract,
    attracted: Events.attracted,
    attractedmove: Events.attractedmove,
    unattracted: Events.unattracted,
  })

  /**
   * Disabled
   *
   * Set to be both unattractable and unmovable
   */
  set mgDisabled(val: boolean) {
    if (val) {
      this.setAttribute(Attributes.disabled, '');
    } else {
      this.removeAttribute(Attributes.disabled);
    }
  }

  get mgDisabled(): boolean {
    return isstr(this.traceMagnetAttributeValue(Attributes.disabled));
  }

  /**
   * Group
   *
   * Be attractable to magnets with the same group
   * If no group, would be seen as non-group magnets
   */
  set mgGroup(val: string | null) {
    if (isstr(val)) {
      this.setAttribute(Attributes.group, val);
    } else {
      this.removeAttribute(Attributes.group);
    }
  }

  get mgGroup(): string | null {
    return this.traceMagnetAttributeValue(Attributes.group);
  }

  /**
   * Parent group node
   *
   * Point to the nearest parent group node if exists
   */
  get mgParentGroupNode(): Base | null {
    const group = this.getAttribute(Attributes.group);

    let parent = this.parentElement;

    while (parent) {
      if (parent instanceof Base) {
        const parentGroup = parent.mgGroup;

        if (!isstr(group) || !isstr(parentGroup) || parentGroup === group) {
          return parent;
        }
      }

      parent = parent.parentElement;
    }

    return null;
  }

  /**
   * Unattractable
   *
   * Set to be no attraction for magnets
   */
  set mgUnattractable(val: boolean) {
    if (val) {
      this.setAttribute(Attributes.unattractable, '');
    } else {
      this.removeAttribute(Attributes.unattractable);
    }
  }

  get mgUnattractable(): boolean {
    return isstr(this.traceMagnetAttributeValue(Attributes.unattractable));
  }

  /**
   * Unmovable
   *
   * Set to be unable for dragging
   */
  set mgUnmovable(val: boolean) {
    if (val) {
      this.setAttribute(Attributes.unmovable, '');
    } else {
      this.removeAttribute(Attributes.unmovable);
    }
  }

  get mgUnmovable(): boolean {
    return isstr(this.traceMagnetAttributeValue(Attributes.unmovable));
  }

  /**
   * Attract distance (unit: px)
   *
   * Distance to sense magnets
   */
  set mgAttractDistance(val: number) {
    if (isnum(val)) {
      this.setAttribute(Attributes.attractDistance, tostr(val));
    }
  }

  get mgAttractDistance(): number {
    const val = this.traceMagnetAttributeValue(Attributes.attractDistance);
    const result = tonum(isstr(val) ? val : DEF_ATTRACT_DISTANCE);

    return Number.NaN === result ? DEF_ATTRACT_DISTANCE : result;
  }

  /**
   * Types for sensing to align magnets
   */
  set mgAlignTo(val: Array<AlignTos>) {
    const attrVal = stdMultiValToAttrVal<AlignTos>(val, Base.MAGNET_ALIGN_TO);

    this.setAttribute(Attributes.alignTo, attrVal);
  }

  get mgAlignTo(): Array<AlignTos> {
    const val = this.traceMagnetAttributeValue(Attributes.alignTo);

    return stdAttrValToMultiVal<AlignTos>(val, Base.MAGNET_ALIGN_TO, DEF_ALIGN_TO);
  }

  /**
   * Types for sensing to align parent
   */
  set mgAlignToParent(val: Array<AlignToParents>) {
    const attrVal = stdMultiValToAttrVal<AlignToParents>(val, Base.MAGNET_ALIGN_TO_PARENT);

    this.setAttribute(Attributes.alignToParent, attrVal);
  }

  get mgAlignToParent(): Array<AlignToParents> {
    const val = this.traceMagnetAttributeValue(Attributes.alignToParent);

    return stdAttrValToMultiVal<AlignToParents>(
      val,
      Base.MAGNET_ALIGN_TO_PARENT,
      DEF_ALIGN_TO_PARENT,
    );
  }

  /**
   * Types to prevent crossing
   */
  set mgCrossPrevent(val: Array<CrossPrevents>) {
    const attrVal = stdMultiValToAttrVal<CrossPrevents>(val, Base.MAGNET_CROSS_PREVENT);

    this.setAttribute(Attributes.crossPrevent, attrVal);
  }

  get mgCrossPrevent(): Array<CrossPrevents> {
    const val = this.traceMagnetAttributeValue(Attributes.crossPrevent);

    return stdAttrValToMultiVal<CrossPrevents>(val, Base.MAGNET_CROSS_PREVENT, DEF_CROSS_PREVENT);
  }

  /**
   * Get attribute value
   *
   * If attribute is not defined, look forward to the nearest group
   */
  traceMagnetAttributeValue(attrName: string): string | null {
    const val = this.getAttribute(attrName);

    if (isstr(val)) {
      return val;
    }

    const {
      mgParentGroupNode: parentGroupNode,
    } = this;

    return (parentGroupNode
      ? parentGroupNode.traceMagnetAttributeValue(attrName)
      : null
    );
  }

  /**
   * Trigger custom event
   */
  triggerMagnetEvent(
    evtName: string,
    {
      detail,
      composed = false,
      cancelable = true,
      bubbles = true,
    // eslint-disable-next-line no-undef
    }: CustomEventInit = {},
  ): boolean {
    const evt = new CustomEvent(evtName, {
      detail,
      composed,
      cancelable,
      bubbles,
    });

    return !this.dispatchEvent(evt); // true if canceled
  }
}
