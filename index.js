'use strict';

import Magnet from './libs/magnet';


if (!customElements.get(Magnet.nodeName)) {
  customElements.define(
    Magnet.nodeName,
    Magnet
  );
  customElements.whenDefined(Magnet.nodeName)
    .then(() => {
      console.log(`Magnet ready!`);
    });
}

if (self && self instanceof Object && self === self.self) {
  self.Magnet = Magnet;
}

export default Magnet;
