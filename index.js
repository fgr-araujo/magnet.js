'use strict';

import { Magnet, MagnetGroup } from './libs/magnet';
import MagnetBase from './libs/magnet/base';


Promise.all([Magnet, MagnetGroup]
  .map((element) => {
    if (customElements.get(element.nodeName)) {
      return Promise.resolve();
    }

    customElements.define(element.nodeName, element);
    return customElements.whenDefined(element.nodeName);
  })
)
  .then(() => {
    console.log(`Magnet ready!`);
  });

if (self && self instanceof Object && self === self.self) {
  self.Magnet = Magnet;
  
  // might be useless
  self.MagnetGroup = MagnetGroup;
  self.MagnetBase = MagnetBase;
}

export {
  MagnetBase,
  MagnetGroup,
};


export default Magnet;
