import { Magnet, MagnetGroup } from './libs/Magnet';
import MagnetBase from './libs/Magnet/Base';

Promise.all(
  [
    {
      elem: Magnet,
      nodeName: 'magnet-block',
    },
    {
      elem: MagnetGroup,
      nodeName: 'magnet-group',
    },
  ]
    .map(({ elem, nodeName }) => {
      if (customElements.get(nodeName)) {
        return Promise.resolve();
      }

      customElements.define(nodeName, elem);

      return customElements.whenDefined(nodeName);
    }),
)
  .then(() => {
    // magnet.js ready
  });

export {
  MagnetBase,
  MagnetGroup,
};

export default Magnet;
