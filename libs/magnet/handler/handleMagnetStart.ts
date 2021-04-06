import { getStyle, toint, tostr } from '../../stdlib';
import {
  addEventListener, getEvtClientXY, MagnetHandler, removeEventListener,
} from './MagnetHandler';
import Block, { Styles } from '../block-n';
import { Pack } from '../../Rect';
import handleDragMove from './handleMagnetMove';
import handleDragEnd from './handleMagnetEnd';

export function handleDragStart(this: Block, evt: MouseEvent | TouchEvent): void {
  if (this.disabled || this.unmovable) {
    // it's disabled/unmovable, so no action
    return;
  }
  if (this.handleMagnetDragStart(evt)) {
    // stop here if got {true}
    return;
  }

  const {
    position,
    zIndex,
    transform,
  } = getStyle(this);

  evt.preventDefault();
  evt.stopImmediatePropagation();

  // initialize position base
  switch (position) {
    case 'relative':
    case 'fixed':
    case 'absolute':
      break;

    default:
      this.style.setProperty('position', 'relative');
      break;
  }

  // move block to top
  this.style.setProperty('z-index', tostr(toint(Date.now() / 1000)));

  // TODO: combine with original transform?
  this.style.setProperty('transform', `translate(var(${Styles.offsetX}), var(${Styles.offsetY}))`, 'important');

  const notToAttract = this.triggerMagnetEvent(Block.EVENT.start);
  const tempStoreOfStart = this.handleMagnetStart(evt);
  const tempStoreMap = new WeakMap();

  tempStoreMap.set(this, tempStoreOfStart);

  // add listaner of move/end
  // trigger magnet start
  const onMove = (evt): void => {
    if (this.handleMagnetDragMove(evt)) {
      // stop here if got {true}
      return;
    }
    if (!notToAttract || this.triggerMagnetEvent(Block.EVENT.move)) {

    }
  };
  const onEnd = (evt): void => {
    if (this.handleMagnetDragEnd(evt)) {
      // stop here if got {true}
      return;
    }
  };
}

export function handleMangetStart(this: Block, evt: MouseEvent | TouchEvent): void {

}


const handleMagnetStart: MagnetHandler = function handleMagnetStart(evt, magnetConfig) {
  evt.preventDefault();
  evt.stopImmediatePropagation();

  const {
    position,
    zIndex,
    transform,
  } = getStyle(this);
  const {
    x: startX,
    y: startY,
  } = getEvtClientXY(evt);
  const {
    disabled,
    group,
    unattractable,
    unmovable,
    alignTo,
    alignToParent,
    crossPrevent,
    attractDistance,
  } = this;
  const data = {
    attractDistance,
    alignTo,
    alignToOuter: alignTo.includes(Block.ALIGN_TO.outer),
    alignToInner: alignTo.includes(Block.ALIGN_TO.inner),
    alignToCenter: alignTo.includes(Block.ALIGN_TO.center),
    alignToOuterline: alignTo.includes(Block.ALIGN_TO.outerline),
    alignToParent,
    alignToParentInner: alignToParent.includes(Block.ALIGN_TO_PARENT.inner),
    alignToParentCenter: alignToParent.includes(Block.ALIGN_TO_PARENT.center),
    crossPrevent,
    crossPreventParent: crossPrevent.includes(Block.CROSS_PREVENT.parent),
    alignments: Block.getAlignmentsOfAlignTo(alignTo),
    parentAlignments: Block.getAlignmentsOfAlignTo(alignToParent),
    disabled,
    group,
    unattractable,
    unmovable,
    parent: new Pack(this.parentElement),
    targets: this.getMagnetTargets()
      .map((target) => new Pack(target)),
    this: new Pack(this),
  };
  const evtOptions = {
    detail: data,
  };

  if (!this.triggerMagnetEvent(Block.EVENT.start, evtOptions)) {
    // start of drag event

    const onMove = () => {
      if (!this.triggerMagnetEvent(Block.EVENT.move, evtOptions)) {
        // move of drag event
      }
    };
    const onEnd = () => {
      removeEventListener(document, Block.EVENT.move, onMove);
      removeEventListener(document, Block.EVENT.end, onEnd);

      if (!this.triggerMagnetEvent(Block.EVENT.end, evtOptions)) {
        // end of drag event
      }
    };

    addEventListener(document, Block.EVENT.move, onMove);
    addEventListener(document, Block.EVENT.end, onEnd);
  }

  // initialize position base
  switch (position) {
    case 'relative':
    case 'fixed':
    case 'absolute':
      break;

    default:
      this.style.setProperty('position', 'relative');
      break;
  }

  // move block to top
  this.style.setProperty('z-index', tostr(toint(Date.now() / 1000)));

  // TODO: combine with original transform?
  this.style.setProperty('transform', `translate(var(${Styles.offsetX}), var(${Styles.offsetY}))`, 'important');

  return {
    originStyle: {
      position,
      zIndex,
      transform,
    },
  };
};

export default handleMagnetStart;
