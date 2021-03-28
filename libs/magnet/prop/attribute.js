'use strict';

const prefixValue = (val) => `mg-${val}`;

// common
export const DISTABLED = prefixValue('disabled');
export const GROUP = prefixValue('group');
export const UNATTRACTABLE = prefixValue('unattract');
export const UNMOVABLE = prefixValue('unmovable');
export const ATTRACT_DISTANCE = prefixValue('attractDistance');

export const ALIGN_TO = prefixValue('alignTo');
export const ALIGN_TO_PARENT = prefixValue('alignToParent');
export const CROSS_PREVENT = prefixValue('crossPrevent');
