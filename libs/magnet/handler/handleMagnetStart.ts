import { getStyle, toint, tostr } from '../../stdlib';
import { MagnetHandler } from './MagnetHandler';
import { Styles } from '../block-n';

const handleMagnetStart: MagnetHandler = function handleMagnetStart(source, evt, magnetConfig) {
  const {
    position,
    zIndex,
    transform,
  } = getStyle(source);

  evt.preventDefault();
  evt.stopImmediatePropagation();

  switch (position) {
    case 'relative':
    case 'fixed':
    case 'absolute':
      break;

    default:
      source.style.setProperty('position', 'relative');
      break;
  }

  source.style.setProperty('z-index', tostr(toint(Date.now() / 1000)));

  // TODO: combine with original transform?
  source.style.setProperty('transform', `translate(var(${Styles.offsetX}), var(${Styles.offsetY}))`, 'important');

  return {
    originStyle: {
      position,
      zIndex,
      transform,
    },
  };
};

export default handleMagnetStart;
