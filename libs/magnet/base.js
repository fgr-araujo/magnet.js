'use strict';

import {
  isset, tonum, isstr,
  objMap, objValues,
} from '../stdlib';
import PROP from './prop';


const SYMBOL_SPLIT = /[|;,\s]/;
const DEFAULT_VALUE = {
  get attractDistance() { return 0; },
  get alignTo() { return objValues(MagnetBase.ALIGN_TO); },
  get alignToParent() { return []; },
  get crossPrevent() { return []; },
}


// const template = document.createElement('template');

// template.innerHTML = `
// <style>
//   :host {
//     position: relative;
//     display: inline-block;
//   }
// </style>
// <slot>
// </slot>
// `;
class MagnetBase extends HTMLElement {
  // constructor() {
  //   super();

  //   this.attachShadow({
  //     mode: 'open',
  //   });
  //   this.shadowRoot.appendChild(template.content.cloneNode(true));
  // }

  // /**
  //  * Disabled
  //  * 
  //  * Set to be no action for dragging and attraction
  //  */
  // get disabled() {
  //   return isstr(this.traceMagnetAttributeValue(PROP.ATTRIBUTE.DISTABLED));
  // }
  // set disabled(disabled) {
  //   if (disabled) {
  //     this.setAttribute(PROP.ATTRIBUTE.DISTABLED, '');
  //   } else {
  //     this.removeAttribute(PROP.ATTRIBUTE.DISTABLED);
  //   }
  // }

  // /**
  //  * Group
  //  * 
  //  * By default only attractable to magnets with the same group
  //  * If not assign any group, it would attract to all magnets 
  //  * but not attractable for grouped magnets
  //  */
  // get group() {
  //   return this.traceMagnetAttributeValue(PROP.ATTRIBUTE.GROUP);
  // }
  // set group(group) {
  //   this.setAttribute(PROP.ATTRIBUTE.GROUP, group);
  // }

  // /**
  //  * Unattractable
  //  * 
  //  * Set to be no attraction as source or target
  //  */
  // get unattractable() {
  //   return isstr(this.traceMagnetAttributeValue(PROP.ATTRIBUTE.UNATTRACTABLE));
  // }
  // set unattractable(unattractable) {
  //   if (unattractable) {
  //     this.setAttribute(PROP.ATTRIBUTE.UNATTRACTABLE, '');
  //   } else {
  //     this.removeAttribute(PROP.ATTRIBUTE.UNATTRACTABLE);
  //   }
  // }

  // /**
  //  * Unmovable
  //  * 
  //  * Set to be not able to be dragged
  //  */
  // get unmovable() {
  //   return isstr(this.traceMagnetAttributeValue(PROP.ATTRIBUTE.UNMOVABLE));
  // }
  // set unmovable(unmovable) {
  //   if (unmovable) {
  //     this.setAttribute(PROP.ATTRIBUTE.UNMOVABLE, '');
  //   } else {
  //     this.removeAttribute(PROP.ATTRIBUTE.UNMOVABLE);
  //   }
  // }

  // /**
  //  * Attract distance
  //  * 
  //  * Unit: px
  //  */
  // get attractDistance() {
  //   return tonum(this.traceMagnetAttributeValue(PROP.ATTRIBUTE.ATTRACT_DISTANCE) || DEFAULT_VALUE.attractDistance);
  // }
  // set attractDistance(distance) {
  //   if (isnum(distance)) {
  //     this.setAttribute(PROP.ATTRIBUTE.ATTRACT_DISTANCE, distance);
  //   }
  // }

  // /**
  //  * Alignment
  //  */
  // static ALIGNMENT = Object.defineProperties({}, objMap({
  //   topToTop: PROP.ALIGNMENT.ALIGN_TOP_TO_TOP,
  //   topToBottom: PROP.ALIGNMENT.ALIGN_TOP_TO_BOTTOM,
  //   rightToRight: PROP.ALIGNMENT.ALIGN_RIGHT_TO_RIGHT,
  //   rightToLeft: PROP.ALIGNMENT.ALIGN_RIGHT_TO_LEFT,
  //   bottomToBottom: PROP.ALIGNMENT.ALIGN_BOTTOM_TO_BOTTOM,
  //   bottomToTop: PROP.ALIGNMENT.ALIGN_BOTTOM_TO_TOP,
  //   leftToLeft: PROP.ALIGNMENT.ALIGN_LEFT_TO_LEFT,
  //   leftToRight: PROP.ALIGNMENT.ALIGN_LEFT_TO_RIGHT,
  //   xCenterToXCenter: PROP.ALIGNMENT.ALIGN_X_CENTER_TO_X_CENTER,
  //   yCenterToYCenter: PROP.ALIGNMENT.ALIGN_Y_CENTER_TO_Y_CENTER,
  // }, (value) => ({
  //   value,
  //   enumerable: true,
  // })))

  // /**
  //  * Align to
  //  */
  // static ALIGN_TO = Object.defineProperties({}, objMap({
  //   outerline: 'outerline', // align outside of source to extended line of outer/inner
  //   outer: 'outer',         // align outside of source to that of target
  //   inner: 'inner',         // align outside of source to inside of target
  //   center: 'center',       // align x/y center of source to that of target
  // }, (value) => ({
  //   value,
  //   enumerable: true,
  // })))
  // get alignTo() {
  //   const alignToValue = this.traceMagnetAttributeValue(PROP.ATTRIBUTE.ALIGN_TO);

  //   return isstr(alignToValue)
  //     ?alignToValue
  //       .split(SYMBOL_SPLIT)
  //       .filter((alignTo) => alignTo in MagnetBase.ALIGN_TO)
  //     :DEFAULT_VALUE.alignTo;
  // }
  // set alignTo(alignTo) {
  //   if (isstr(alignTo)) {
  //     this.setAttribute(PROP.ATTRIBUTE.ALIGN_TO, alignTo
  //       .split(SYMBOL_SPLIT)
  //       .filter((alignTo) => alignTo in MagnetBase.ALIGN_TO)
  //       .join('|')
  //     );
  //   } else {
  //     this.removeAttribute(PROP.ATTRIBUTE.ALIGN_TO);
  //   }
  // }

  // static ALIGN_TO_PARENT = Object.defineProperties({}, objMap({
  //   inner: MagnetBase.ALIGN_TO.inner,
  //   center: MagnetBase.ALIGN_TO.center,
  // }, (value) => ({
  //   value,
  //   enumerable: true,
  // })))
  // get alignToParent() {
  //   const alignToParentValue = this.traceMagnetAttributeValue(PROP.ATTRIBUTE.ALIGN_TO_PARENT);

  //   return isstr(alignToParentValue)
  //     ?alignToParentValue
  //       .split(SYMBOL_SPLIT)
  //       .filter((alignToParent) => alignToParent in MagnetBase.ALIGN_TO_PARENT)
  //     :DEFAULT_VALUE.alignToParent;
  // }
  // set alignToParent(alignToParent) {
  //   if (isset(alignToParent)) {
  //     this.setAttribute(PROP.ATTRIBUTE.ALIGN_TO_PARENT, alignToParent
  //       .split(SYMBOL_SPLIT)
  //       .filter((alignToParent) => alignToParent in MagnetBase.ALIGN_TO_PARENT)
  //       .join('|')
  //     );
  //   } else {
  //     this.removeAttribute(PROP.ATTRIBUTE.ALIGN_TO_PARENT);
  //   }
  // }

  // /**
  //  * Prevent cross
  //  */
  // static CROSS_PREVENT = Object.defineProperties({}, objMap({
  //   parent: 'parent',
  //   // target: 'target',  // yet to support
  // }, (value) => ({
  //   value,
  //   enumerable: true,
  // })))
  get crossPrevent() {
    const crossPreventValue = this.traceMagnetAttributeValue(PROP.ATTRIBUTE.CROSS_PREVENT);

    return isstr(crossPreventValue)
      ?crossPreventValue
        .split(SYMBOL_SPLIT)
        .filter((crossPrevent) => crossPrevent in MagnetBase.CROSS_PREVENT)
      :DEFAULT_VALUE.crossPrevent;
  }
  set crossPrevent(crossPrevent) {
    if (isstr(alignment)) {
      this.setAttribute(PROP.ATTRIBUTE.CROSS_PREVENT, crossPrevent
        .split(SYMBOL_SPLIT)
        .filter((crossPrevent) => crossPrevent in MagnetBase.CROSS_PREVENT)
        .join('|')
      );
    } else {
      this.removeAttribute(PROP.ATTRIBUTE.CROSS_PREVENT);
    }
  }

  // /**
  //  * Trigger custom event
  //  * 
  //  * @return boolean of cancelled
  //  */
  // triggerCustomEvent(eventName, {
  //   detail,
  //   composed = false,
  //   cancelable = true,
  //   bubbles = false,
  // } = {}) {
  //   const event = new CustomEvent(eventName, {
  //     detail,
  //     composed,
  //     cancelable,
  //     bubbles,
  //   });

  //   return !this.dispatchEvent(event); // true if cancelled
  // }

  // /**
  //  * Get attribute value
  //  */
  // traceMagnetAttributeValue(attributeName) {
  //   return this.getAttribute(attributeName);
  // }
}


export default MagnetBase;
