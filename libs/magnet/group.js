import PROP from './prop';
import { isstr } from '../stdlib';
import MagnetBase from './base';


class MagnetGroup extends MagnetBase {
  constructor() {
    super();
  }

  /**
   * Node name of <magnet-group>
   */
  static get nodeName() {
    return 'magnet-group';
  }

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
  //  * Get magnet group
  //  */
  // get groupNode() {
  //   let parent = this.parentElement;

  //   while (parent) {
  //     if (parent instanceof MagnetGroup) {
  //       return parent;
  //     }

  //     parent = parent.parentElement;
  //   }

  //   return null;
  // }
  // set groupNode(_) { /* unassignable */ }

  // /**
  //  * Get attribute value
  //  * 
  //  * If not assign attribute on this node, look forward to
  //  * the nearest group that has the attribute
  //  * 
  //  * return undefined if no value traced
  //  */
  // traceMagnetAttributeValue(attributeName) {
  //   const selfValue = this.getAttribute(attributeName);
    
  //   if (isstr(selfValue)) {
  //     // found attribute on this
  //     return selfValue;
  //   }

  //   const groupNode = this.groupNode;

  //   if (!groupNode) {
  //     // no attribute found
  //     return null;
  //   }

  //   return groupNode.traceMagnetAttributeValue(attributeName);
  // }
}


export default MagnetGroup;
