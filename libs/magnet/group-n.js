import { isset } from '../stdlib';
import Base from './base';

export default class Group extends Base {
  /**
   * Get attribute value
   *
   * If attribute is not defined, look forward to the nearest group
   *
   * @param {string} attrName
   * @returns {string?}
   */
  traceAttributeValue(attrName) {
    const val = super.traceAttributeValue(attrName);

    if (isset(val)) {
      return val;
    }

    const { groupNode } = this;

    return (groupNode
      ? groupNode.traceAttributeValue(attrName)
      : undefined
    );
  }

  /**
   * Group node
   *
   * Point to the nearest group node if exists
   */
  set groupNode(_) {
    // unable to assign

    return this;
  }

  get groupNode() {
    let parent = this.parentElement;

    while (parent) {
      if (parent instanceof Group) {
        return parent;
      }

      parent = parent.parentElement;
    }

    return undefined;
  }
}
