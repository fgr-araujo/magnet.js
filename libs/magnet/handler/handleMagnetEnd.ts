import { isset } from '../../stdlib';
import { MagnetHandler } from './MagnetHandler';

const handleMagnetEnd: MagnetHandler = function handleMagnetEnd(source, evt, magnetConfig) {
  const {
    originStyle: {
      position,
      zIndex,
      tranform,
    } = {},
  } = this || {};

  if (isset(position)) {
    this.style.setProperty('position', position);
  }
  if (isset(zIndex)) {
    this.style.setProperty('z-index', zIndex);
  }

  return undefined;
};

export default handleMagnetEnd;
