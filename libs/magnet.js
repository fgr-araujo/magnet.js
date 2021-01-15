'use strict';

import {
  isset, tobool, tonum, tostr, isarray, isstr,
  isbool, iselem, isfunc,
  objForEach, objMap,
  getStyle, stdDoms, objValues, objKeys,
} from './stdlib';
import Rect, {
  isRect, stdRect,
  diff as diffRect,
} from './rect';


const PROP_ALIGN_TOP_TO_TOP = 'topToTop';
const PROP_ALIGN_TOP_TO_BOTTOM = 'topToBottom';
const PROP_ALIGN_RIGHT_TO_RIGHT = 'rightToRight';
const PROP_ALIGN_RIGHT_TO_LEFT = 'rightToLeft';
const PROP_ALIGN_BOTTOM_TO_BOTTOM = 'bottomToBottom';
const PROP_ALIGN_BOTTOM_TO_TOP = 'bottomToTop';
const PROP_ALIGN_LEFT_TO_LEFT = 'leftToLeft';
const PROP_ALIGN_LEFT_TO_RIGHT = 'leftToRight';
const PROP_ALIGN_X_CENTER_TO_X_CENTER = 'xCenter';
const PROP_ALIGN_Y_CENTER_TO_Y_CENTER = 'yCenter';
const ALIGNMENT_X = [
  PROP_ALIGN_RIGHT_TO_RIGHT,
  PROP_ALIGN_RIGHT_TO_LEFT,
  PROP_ALIGN_LEFT_TO_LEFT,
  PROP_ALIGN_LEFT_TO_RIGHT,
  PROP_ALIGN_X_CENTER_TO_X_CENTER,
];
const ALIGNMENT_Y = [
  PROP_ALIGN_TOP_TO_TOP,
  PROP_ALIGN_TOP_TO_BOTTOM,
  PROP_ALIGN_BOTTOM_TO_BOTTOM,
  PROP_ALIGN_BOTTOM_TO_TOP,
  PROP_ALIGN_Y_CENTER_TO_Y_CENTER,
];
const EVENT_NAME = {
  start: 'magnetstart',
  move: 'magnetmove',
  end: 'magnetend',
  mounting: 'magnetmounting',
  mount: 'magnetmount',
  unmount: 'magnetunmount',
  beingMounted: 'magnetbeingmounted',
  beMounted: 'magnetbemounted',
  beUnmounted: 'magnetbeunmounted',

  // attractStart: 'attractstart',
  // attractMove: 'attractmove',
  // attractEnd: 'attractend',
  // attract: 'attract',
  // unattract: 'unattract',
  // attracted: 'attracted',
  // unattracted: 'unattracted',
};

const EVENT = {
  append: 'magnet',
  attract: 'attract',
  unattract: 'unattract',
  attracted: 'attracted',
  unattracted: 'unattracted',
  attractStart: 'attractstart',
  attractMove: 'attractmove',
  attractEnd: 'attractend',
  magnetStart: ['magnetenter', 'magnetstart', 'enter', 'start'],
  magnetChange: ['magnetchange', 'change'],
  magnetEnd: ['magnetend', 'magnetleave', 'end', 'leave'],
  dragStart: ['mousedown', 'touchstart'],
  dragMove: ['mousemove', 'touchmove'],
  dragEnd: ['mouseup', 'touchend'],
  keyDown: 'keydown',
  keyUp: 'keyup',
};

function addEventListener(dom, names, func) {
  (isarray(names) ?names :[names]).forEach((name) => {
    dom.addEventListener(name, func);
  });
}
function removeEventListener(dom, names, func) {
  (isarray(names) ?names :[names]).forEach((name) => {
    dom.removeEventListener(name, func);
  });
}


// const toPx = (p) => `${p}px`;
// const toPreg = (p) => `${100*p}%`;
// const getEventXY = ({ clientX, clientY, touches: [{ clientX: x = clientX, clientY: y = clientY } = {}] = []}) => ({ x, y });
// const bindEventNames = (this, ...names) => {
//   const { [MAGNET_PROPS.id]: id } = this;
//   return names.reduce((arr, name) => (isarray(name)
//     ?arr.concat(bindEventNames(this, ...name))
//     :arr.concat(name.split(' ').map((name) => `${name}.${id}`))
//   ), []);
// };
// const getParent = (d) => {
//   for (let r=d.parentElement; r; r=r.parentElement) {
//     if ('static' !== getStyle(r).position) {
//       return r;
//     }
//   }
//   return document;
// };


// // ===================================================================
// //  Magnet start

// const MAGNET_PROPS = {
//   id: '_id',
//   temp: '_temp',
//   targets: '_targets',
//   eventHandler: '_eventHandler',
//   manualHandler: '_manualHandler',
//   distance: '_distance',
//   attractable: '_attractable',
//   allowCtrlKey: '_allowCtrlKey',
//   allowDrag: '_allowDrag',
//   useRelativeUnit: '_useRelativeUnit',
//   stayInParent: '_stayInParent',
//   alignOuter: '_alignOuter',
//   alignInner: '_alignInner',
//   alignCenter: '_alignCenter',
//   alignParentCenter: '_alignParentCenter',
// };

// export const MAGNET_DEFAULTS = {
//   distance: 0,
//   attractable: true,
//   allowCtrlKey: true,
//   allowDrag: true,
//   useRelativeUnit: false,
//   stayInParent: false,
//   alignOuter: true,
//   alignInner: true,
//   alignCenter: true,
//   alignParentCenter: false,
// };

// function Magnet(...doms) {
//   if (!this instanceof Magnet) {
//     return new Magnet(...arguments);
//   }
//   Object.defineProperties(this, {
//     [MAGNET_PROPS.id]: { value: `magnet_${Date.now()}` },
//     [MAGNET_PROPS.temp]: { value: [], writable: true },
//     [MAGNET_PROPS.targets]: { value: [], writable: true },
//     [MAGNET_PROPS.eventHandler]: { value: new EventHandler(this) },
//     [MAGNET_PROPS.manualHandler]: { value: {}, writable: true },
//     [MAGNET_PROPS.distance]: { value: MAGNET_DEFAULTS.distance, writable: true },
//     [MAGNET_PROPS.attractable]: { value: MAGNET_DEFAULTS.attractable, writable: true },
//     [MAGNET_PROPS.allowCtrlKey]: { value: MAGNET_DEFAULTS.allowCtrlKey, writable: true },
//     [MAGNET_PROPS.allowDrag]: { value: MAGNET_DEFAULTS.allowDrag, writable: true },
//     [MAGNET_PROPS.useRelativeUnit]: { value: MAGNET_DEFAULTS.useRelativeUnit, writable: true },
//     [MAGNET_PROPS.stayInParent]: { value: MAGNET_DEFAULTS.stayInParent, writable: true },
//     [MAGNET_PROPS.alignOuter]: { value: MAGNET_DEFAULTS.alignOuter, writable: true },
//     [MAGNET_PROPS.alignInner]: { value: MAGNET_DEFAULTS.alignInner, writable: true },
//     [MAGNET_PROPS.alignCenter]: { value: MAGNET_DEFAULTS.alignCenter, writable: true },
//     [MAGNET_PROPS.alignParentCenter]: { value: MAGNET_DEFAULTS.alignParentCenter, writable: true },
//   });
//   objForEach(MAGNET_DEFAULTS, (value, prop) => (isset(this[prop])&&this[prop](value)));
//   if (doms.length) {
//     this.add(doms);
//   }
// }

// // distance
// Magnet.prototype.getDistance = function() {
//   return this[MAGNET_PROPS.distance];
// };
// Magnet.prototype.setDistance = function(distance) {
//   if (isNaN(distance)) {
//     throw new Error(`Invalid distance: ${tostr(distance)}`);
//   } else if (distance < 0) {
//     throw new Error(`Illegal distance: ${distance}`);
//   }
//   this[MAGNET_PROPS.distance] = tonum(distance);
//   return this;
// };
// Magnet.prototype.distance = function(distance) {
//   return (isset(distance) ?this.setDistance(distance) :this.getDistance());
// };

// // attractable
// Magnet.prototype.getAttractable = function() {
//   return this[MAGNET_PROPS.attractable];
// };
// Magnet.prototype.setAttractable = function(enabled) {
//   this[MAGNET_PROPS.attractable] = tobool(enabled);
//   return this;
// };
// Magnet.prototype.attractable = function(enabled) {
//   return (isset(enabled) ?this.setAttractable(enabled) :this.getAttractable());
// };

// // allow ctrl key
// Magnet.prototype.getAllowCtrlKey = function() {
//   return this[MAGNET_PROPS.allowCtrlKey];
// };
// Magnet.prototype.setAllowCtrlKey = function(enabled) {
//   this[MAGNET_PROPS.allowCtrlKey] = tobool(enabled);
//   return this;
// };
// Magnet.prototype.allowCtrlKey = function(enabled) {
//   return (isset(enabled) ?this.setAllowCtrlKey(enabled) :this.getAllowCtrlKey());
// };

// // allow drag
// Magnet.prototype.getAllowDrag = function() {
//   return this[MAGNET_PROPS.allowDrag];
// };
// Magnet.prototype.setAllowDrag = function(enabled) {
//   this[MAGNET_PROPS.allowDrag] = tobool(enabled);
//   return this;
// };
// Magnet.prototype.allowDrag = function(enabled) {
//   return (isset(enabled) ?this.setAllowDrag(enabled) :this.getAllowDrag());
// };

// // use relative unit
// Magnet.prototype.getUseRelativeUnit = function() {
//   return this[MAGNET_PROPS.useRelativeUnit];
// };
// Magnet.prototype.setUseRelativeUnit = function(enabled) {
//   enabled = tobool(enabled);
//   if (this[MAGNET_PROPS.useRelativeUnit] !== enabled) {
//     stdDoms(this[MAGNET_PROPS.targets]).forEach((dom) => this.setMemberRectangle(dom));
//     this[MAGNET_PROPS.useRelativeUnit] = enabled;
//   }
//   return this;
// };
// Magnet.prototype.useRelativeUnit = function(enabled) {
//   return (isset(enabled) ?this.setUseRelativeUnit(enabled) :this.getUseRelativeUnit());
// };


// // stay in parent
// Magnet.prototype.getStayInParent = function() {
//   return this[MAGNET_PROPS.stayInParent];
// };
// Magnet.prototype.setStayInParent = function(enabled) {
//   this[MAGNET_PROPS.stayInParent] = tobool(enabled);
//   return this;
// };
// Magnet.prototype.stayInParent = 
// Magnet.prototype.stayInParentEdge = 
// Magnet.prototype.stayInParentElem = function(enabled) {
//   return (isset(enabled) ?this.setStayInParent(enabled) :this.getStayInParent());
// };


// // align
// ['Outer', 'Inner', 'Center', 'ParentCenter'].forEach((name) => {
//   const propName = `align${name}`;
//   const funcName = `Align${name}`;
//   Magnet.prototype[`get${funcName}`] = function() {
//     return this[MAGNET_PROPS[propName]];
//   };
//   Magnet.prototype[`set${funcName}`] = function(enabled) {
//     this[MAGNET_PROPS[propName]] = tobool(enabled);
//     return this;
//   };
//   Magnet.prototype[propName] = 
//     Magnet.prototype[`enabled${funcName}`] = function(enabled) {
//     return (isset(enabled) ?this[`set${funcName}`](enabled) :this[`get${funcName}`]());
//   };
// });


// // on/off
// ['on', 'off'].forEach((prop) => {
//   Magnet.prototype[prop] = function(...args) {
//     this[MAGNET_PROPS.eventHandler][prop](...args);
//     return this;
//   };
// });


// // check
// Magnet.prototype.check = function(
//   refDom,
//   refRect = stdRect(refDom),
//   alignmentProps = [].concat(
//     (this.getAlignOuter() ?ALIGNMENT_OUTER :[]),
//     (this.getAlignInner() ?ALIGNMENT_INNER :[]),
//     (this.getAlignCenter() ?ALIGNMENT_CENTER :[]),
//   )
// ) {
//   if (!iselem(refDom)) {
//     throw new Error(`Invalid DOM: ${tostr(refDom)}`);
//   }
//   if (isarray(refRect)) {
//     alignmentProps = refRect;
//     refRect = stdRect(refDom);
//   }
//   const parentDom = getParent(refDom);
//   const parentRect = stdRect(parentDom);
//   const targets = this[MAGNET_PROPS.targets]
//     .filter((dom) => (dom!==refDom))
//     .map((dom) => diffRect(refRect, dom, { alignments: alignmentProps, }));
//   const results = targets.reduce((results, diff) => {
//     objForEach(diff.results, (_, prop) => {
//       results[prop] = (results[prop]||[]);
//       results[prop].push(diff);
//     });
//     return results;
//   }, {});
//   const rankings = objMap(results, (arr, prop) => arr.concat().sort((a, b) => (a.results[prop]-b.results[prop])));
//   return {
//     source: { rect: refRect, element: refDom },
//     parent: { rect: parentRect, element: parentDom },
//     targets,
//     results,
//     rankings,
//     mins: objMap(rankings, (arr) => arr[0]),
//     maxs: objMap(rankings, (arr) => arr[arr.length-1]),
//   };
// };


// // handle
// const pushDomToEvent = (arr, dom) => (!arr.includes(dom)&&arr.push(dom));
// const stdMagentEventTarget = (ref) => {
//   if (ref) {
//     const { prop, target: { rect, element } } = ref;
//     const parentRect = stdRect(getParent(element));
//     const [position, diff] = (({ top, right, bottom, left }, { top: y, left: x }) => {
//       switch (prop) {
//         case ALIGNMENT_PROPS.tt:
//         case ALIGNMENT_PROPS.bt: return [top, y];
//         case ALIGNMENT_PROPS.bb:
//         case ALIGNMENT_PROPS.tb: return [bottom, y];
//         case ALIGNMENT_PROPS.rr:
//         case ALIGNMENT_PROPS.lr: return [right, x];
//         case ALIGNMENT_PROPS.ll:
//         case ALIGNMENT_PROPS.rl: return [left, x];
//         case ALIGNMENT_PROPS.xx: return [((right+left)/2), x];
//         case ALIGNMENT_PROPS.yy: return [((top+bottom)/2), y];
//       }
//     })(rect, parentRect);
//     return {
//       type: prop,
//       rect,
//       element,
//       position,
//       offset: (position-diff),
//     };
//   } else {
//     return null;
//   }
// };
// const cmpAttractedResult = (a, b) => {
//   if ((a ?true :false) !== (b ?true :false)) {
//     return true;
//   } else if ((a ?a.target.element :null) !== (b ?b.target.element :null)) {
//     return true;
//   }
//   return false;
// };
// Magnet.prototype.handle = function(dom, refRect = stdRect(dom), toAttract = this.getAttractable()) {
//   if (!iselem(dom)) {
//     throw new Error(`Invalid DOM: ${tostr(dom)}`);
//   }
//   const domIndex = indexOfMember(this, dom);
//   if (-1 === domIndex) {
//     throw new Error(`Invalid member: ${tostr(dom)}`);
//   }
//   if (isbool(refRect)) {
//     toAttract = refRect;
//     refRect = dom;
//   }
//   refRect = stdRect(refRect);
//   const { _lastAttractedX, _lastAttractedY } = this[MAGNET_PROPS.temp][domIndex];
//   const { top, left, width, height } = refRect;
//   const distance = (toAttract ?this.getDistance() :0);
//   const { parent, targets } = this.check(dom, refRect, (toAttract ?undefined :[]));
//   const { rect: parentRect, element: parentElement } = parent;
//   const newPosition = { x: left, y: top };
//   const { x: attractedX, y: attractedY } = targets
//     .concat(
//       (this.getStayInParent() ?diffRect(refRect, parentElement, { alignments: ALIGNMENT_INNER, absDistance: false }) :[]),
//       (this.getAlignParentCenter() ?diffRect(refRect, parentElement, { alignments: ALIGNMENT_CENTER }) :[]),
//     )
//     .reduce(({ x, y }, diff) => {
//       const { target, results, ranking } = diff;
//       return ranking.reduce(({ x, y }, prop) => {
//         let value = results[prop];
//         if (value <= distance) {
//           switch (prop) {
//             case ALIGNMENT_PROPS.rr:
//             case ALIGNMENT_PROPS.ll:
//             case ALIGNMENT_PROPS.rl:
//             case ALIGNMENT_PROPS.lr:
//             case ALIGNMENT_PROPS.xx:
//             if (!x || value < x.value) {
//               x = { prop, value, target };
//             }
//             break;

//             case ALIGNMENT_PROPS.tt:
//             case ALIGNMENT_PROPS.bb:
//             case ALIGNMENT_PROPS.tb:
//             case ALIGNMENT_PROPS.bt:
//             case ALIGNMENT_PROPS.yy:
//             if (!y || value < y.value) {
//               y = { prop, value, target };
//             }
//             break;
//           }
//         }
//         return { x, y };
//       }, { x, y });
//     }, { x: null, y: null });
    
//   // be attracted by nearest target
//   const eventsAttracted = [];
//   const eventsUnattracted = [];
//   if (attractedX) {
//     const { prop, target: { rect } } = attractedX;
//     switch (prop) {
//       case ALIGNMENT_PROPS.rr: newPosition.x = (rect.right-width); break;
//       case ALIGNMENT_PROPS.ll: newPosition.x = rect.left; break;
//       case ALIGNMENT_PROPS.rl: newPosition.x = (rect.left-width); break;
//       case ALIGNMENT_PROPS.lr: newPosition.x = rect.right; break;
//       case ALIGNMENT_PROPS.xx: newPosition.x = ((rect.left+rect.right-width)/2); break;
//     }
//   }
//   if (attractedY) {
//     const { prop, target: { rect } } = attractedY;
//     switch (prop) {
//       case ALIGNMENT_PROPS.tt: newPosition.y = rect.top; break;
//       case ALIGNMENT_PROPS.bb: newPosition.y = (rect.bottom-height); break;
//       case ALIGNMENT_PROPS.tb: newPosition.y = rect.bottom; break;
//       case ALIGNMENT_PROPS.bt: newPosition.y = (rect.top-height); break;
//       case ALIGNMENT_PROPS.yy: newPosition.y = ((rect.top+rect.bottom-height)/2); break;
//     }
//   }
  
//   // trigger events
//   const diffAttractedX = cmpAttractedResult(_lastAttractedX, attractedX);
//   const diffAttractedY = cmpAttractedResult(_lastAttractedY, attractedY);
//   if (diffAttractedX) {
//     (attractedX&&pushDomToEvent(eventsAttracted, attractedX.target.element));
//     (_lastAttractedX&&pushDomToEvent(eventsUnattracted, _lastAttractedX.target.element));
//   }
//   if (diffAttractedY) {
//     (attractedY&&pushDomToEvent(eventsAttracted, attractedY.target.element));
//     (_lastAttractedY&&pushDomToEvent(eventsUnattracted, _lastAttractedY.target.element));
//   }
//   eventsAttracted.forEach((element) => EventHandler.trigger(element, EVENT.attracted, dom));
//   eventsUnattracted.forEach((element) => EventHandler.trigger(element, EVENT.unattracted, dom));
  
//   const currentAttract = (attractedX||attractedY ?true :false);
//   const lastAttract = (_lastAttractedX||_lastAttractedY ?true :false);
//   const eventHandler = this[MAGNET_PROPS.eventHandler];
//   const currData = {
//     x: stdMagentEventTarget(attractedX),
//     y: stdMagentEventTarget(attractedY),
//   };
//   const lastData = {
//     x: stdMagentEventTarget(_lastAttractedX),
//     y: stdMagentEventTarget(_lastAttractedY),
//   };

//   if (currentAttract) {
//     const anyDiff = (diffAttractedX||diffAttractedY);
//     if (!lastAttract) {
//       // magnet start: start of any attract event
//       eventHandler.trigger(EVENT.magnetChange, { source: dom, ...currData });
//       eventHandler.trigger(EVENT.magnetStart, { source: dom, ...currData });
//       EventHandler.trigger(dom, EVENT.attract, currData);
//     } else if (anyDiff ||
//       (!diffAttractedX && attractedX && _lastAttractedX && attractedX.prop !== _lastAttractedX.prop) ||
//       (!diffAttractedY && attractedY && _lastAttractedY && attractedY.prop !== _lastAttractedY.prop)
//     ) {
//       // magnet change: change of any attract event
//       eventHandler.trigger(EVENT.magnetChange, { source: dom, ...currData });
//       EventHandler.trigger(dom, EVENT.attract, currData);
//     } else if (anyDiff) {
//       eventHandler.trigger(EVENT.magnetChange, { source: dom, ...currData });
//     }
//     if (anyDiff) {
//       EventHandler.trigger(dom, EVENT.unattract, lastData);
//     }
//   } else if (lastAttract) {
//     // magnet end: end of all attract event
//     eventHandler.trigger(EVENT.magnetChange, { source: dom, x: null, y: null });
//     eventHandler.trigger(EVENT.magnetEnd, { source: dom, ...lastData });
//     EventHandler.trigger(dom, EVENT.unattract, lastData);
//   }

//   const manualHandler = this[MAGNET_PROPS.manualHandler];
//   const { beforeAttract, afterAttract, doAttract } = manualHandler;
//   let targetRect = ((x, y) => stdRect({
//     top: y,
//     right: (x+width),
//     bottom: (y+height),
//     left: x,
//     width,
//     height,
//   }))((newPosition.x-parentRect.left), (newPosition.y-parentRect.top));

//   // before attract
//   if (isfunc(beforeAttract)) {
//     const rect = beforeAttract.bind(this)(dom, {
//       origin: stdRect(refRect),
//       target: stdRect(targetRect),
//     }, {
//       current: currData,
//       last: lastData,
//     });
//     if (isRect(rect)) {
//       targetRect = rect;
//     } else if (isbool(rect) && false === rect) {
//       targetRect = refRect;
//     } else if (isset(rect)) {
//       throw new Error(`Invalid return value: ${tostr(rect)}`);
//     }
//   }

//   // attract move event
//   EventHandler.trigger(dom, EVENT.attractMove, {
//     rects: {
//       origin: stdRect(refRect),
//       target: stdRect(targetRect),
//     },
//     attracts: {
//       current: currData,
//       last: lastData,
//     },
//   }, () => {
//     targetRect = refRect;
//   });

//   if (isfunc(doAttract)) {
//     // do attract
//     doAttract.bind(this)(dom, {
//       origin: stdRect(refRect),
//       target: stdRect(targetRect),
//     }, {
//       current: currData,
//       last: lastData,
//     });
//   } else {
//     // move dom
//     this.setMemberRectangle(dom, targetRect);
//   }

//   // after attract
//   if (isfunc(afterAttract)) {
//     afterAttract.bind(this)(dom, {
//       origin: stdRect(refRect),
//       target: stdRect(targetRect),
//     }, {
//       current: currData,
//       last: lastData,
//     });
//   }
  
//   this[MAGNET_PROPS.temp][domIndex] = {
//     _lastAttractedX: attractedX,
//     _lastAttractedY: attractedY,
//   };

//   return this;
// };


// // set member rectangle
// Magnet.prototype.setMemberRectangle = function(dom, rect = stdRect(dom), useRelativeUnit = this.getUseRelativeUnit()) {
//   if (!iselem(dom)) {
//     throw new Error(`Invalid DOM: ${tostr(dom)}`);
//   }
//   if (!this.hasMember(dom)) {
//     throw new Error(`Invalid member: ${tostr(dom)}`);
//   }
//   if (isbool(rect)) {
//     useRelativeUnit = rect;
//     rect = stdRect(dom);
//   }
//   //rect = stdRect(rect);
//   rect = stdRect({
//     right: rect.right,
//     bottom: rect.bottom,
//     width: rect.width,
//     height: rect.height,
//   });
//   const { top, left, width, height } = rect;
//   if (useRelativeUnit) {
//     const { width: parentWidth, height: parentHeight } = stdRect(getParent(dom));
//     dom.style.top = toPreg(top/parentHeight);
//     dom.style.left = toPreg(left/parentWidth);
//     dom.style.width = toPreg(width/parentWidth);
//     dom.style.height = toPreg(height/parentHeight);
//   } else {
//     dom.style.top = toPx(top);
//     dom.style.left = toPx(left);
//     dom.style.width = toPx(width);
//     dom.style.height = toPx(height);
//   }
//   dom.style.position = 'absolute';
//   dom.style.right = 'auto';
//   dom.style.bottom = 'auto';
//   return this;
// };


// // manual handler
// ['before', 'after', 'do'].forEach((prop) => {
//   const funcName = `${prop}Attract`;
//   Object.defineProperty(Magnet.prototype, funcName, {
//     get: function() {
//       return this[MAGNET_PROPS.manualHandler][funcName];
//     },
//     set: function(func) {
//       this[MAGNET_PROPS.manualHandler][funcName] = func;
//     },
//   });
// });


// // add
// Magnet.prototype.add = function(...doms) {
//   doms = stdDoms(...doms);
  
//   // reject special elements
//   [window, document, document.body].forEach((elm) => {
//     if (doms.includes(elm)) {
//       throw new Error(`Illegal element: ${tostr(src)}`);
//     }
//   });

//   doms.forEach((dom) => {
//     if (this[MAGNET_PROPS.targets].includes(dom)) {
//       return;
//     }
//     EventHandler.on(dom, bindEventNames(this, EVENT.mouseDown), (evt) => {
//       if (!this.getAllowDrag()) {
//         return;
//       }
//       evt.preventDefault();

//       let _toAttract = !evt.ctrlKey;
//       let _lastEvent = evt;

//       const { left: oriLeft, top: oriTop, width, height } = stdRect(dom);
//       const { x: oriX, y: oriY } = getEventXY(evt);
//       const handleDom = (evt) => {
//         const toAttract = (this.getAttractable()
//           ?(this.getAllowCtrlKey() ?_toAttract :true)
//           :false
//         );
//         const { x, y } = getEventXY(evt);
//         const diffX = (x-oriX);
//         const diffY = (y-oriY);
//         const newX = (oriLeft+diffX);
//         const newY = (oriTop+diffY);
//         const newRect = stdRect({
//           top: newY,
//           right: (newX+width),
//           bottom: (newY+height),
//           left: newX,
//         });
//         this.handle(dom, newRect, toAttract);
//       };

//       EventHandler.trigger(dom, EVENT.attractStart, stdRect(dom));
//       EventHandler.off(document.body, bindEventNames(this, EVENT.mouseMove, EVENT.mouseUp, EVENT.keyDown, EVENT.keyUp));
//       EventHandler.on(document.body, bindEventNames(this, EVENT.keyDown, EVENT.keyUp), (evt) => {
//         const toAttract = !evt.ctrlKey;
//         if (toAttract !== _toAttract) {
//           _toAttract = toAttract;
//           handleDom(_lastEvent);
//         }
//       });
//       EventHandler.on(document.body, bindEventNames(this, EVENT.mouseUp), () => {
//         const eventsUnattracted = [];
//         const domIndex = indexOfMember(this, dom);
//         const { _lastAttractedX, _lastAttractedY } = this[MAGNET_PROPS.temp][domIndex];
//         EventHandler.off(document.body, bindEventNames(this, EVENT.mouseMove, EVENT.mouseUp, EVENT.keyDown, EVENT.keyUp));
//         (_lastAttractedX&&pushDomToEvent(eventsUnattracted, _lastAttractedX.target.element));
//         (_lastAttractedY&&pushDomToEvent(eventsUnattracted, _lastAttractedY.target.element));
//         eventsUnattracted.forEach((element) => EventHandler.trigger(element, EVENT.unattracted, dom));
//         EventHandler.trigger(dom, EVENT.attractEnd, stdRect(dom));
//         if (_lastAttractedX || _lastAttractedY) {
//           const eventHandler = this[MAGNET_PROPS.eventHandler];
//           EventHandler.trigger(dom, EVENT.unattract);
//           eventHandler.trigger(EVENT.magnetChange, { source: dom, x: null, y: null });
//           eventHandler.trigger(EVENT.magnetEnd, { source: dom });
//         }
//         this[MAGNET_PROPS.temp][domIndex] = {};
//       });
//       EventHandler.on(document.body, bindEventNames(this, EVENT.mouseMove), (evt) => {
//         handleDom(evt);
//         _lastEvent = evt;
//       });
//     });
//     this[MAGNET_PROPS.targets].push(dom);
//     this[MAGNET_PROPS.temp].push({});
//     this.setMemberRectangle(dom);
//   });
//   return this;
// };




const PROP_MAGNET_ROOT = '__magnet';
const PROP_ORIGIN_STYLES = 'originStyles';
const PROP_CURRENT_NEAREST = 'currentNearest';
const PROP_LAST_NEAREST = 'lastNearest';
const STYLE_PROPS = {
  x: '--magnet-offset-x',
  y: '--magnet-offset-y',
};
const SYMBOL_SPLIT = /[|;,\s]/;
const ATTRIBUTE_PROPS = {
  disabled: 'disabled',
  group: 'group',
  alignTo: 'alignTo',
  crossPrevent: 'crossPrevent',
  unattractable: 'unattract',
  attractDistance: 'attractDistance',
};


/**
 * Get clientX and clientY of mouse/touch event
 */
function getEventClientXY(evt) {
  const {
    clientX: mx,
    clientY: my,
    touches: [
      {
        clientX: x = mx,
        clientY: y = my,
      } = {},
    ] = [],
  } = evt;

  return { x, y };
}


class Magnet extends HTMLElement {
  constructor() {
    super();

    const onDragStart = (evt) => {
      if (this.disabled) {
        // not able to drag
        return;
      }
  
      const {
        x: startX,
        y: startY,
      } = getEventClientXY(evt);
      const lastOffsetX = tonum(this.style.getPropertyValue(STYLE_PROPS.x) || 0);
      const lastOffsetY = tonum(this.style.getPropertyValue(STYLE_PROPS.y) || 0);
      const alignTo = this.alignTo;
      const alignOuterline = alignTo.includes(Magnet.ALIGN_TO.outerline);
      const crossPrevent = this.crossPrevent;
      const crossPreventParent = crossPrevent.includes(Magnet.PREVENT_CROSS.parent);
      const crossPreventTarget = crossPrevent.includes(Magnet.PREVENT_CROSS.target);
      const attractDistance = this.attractDistance;
      const alignments = [];

      if (alignTo.includes(Magnet.ALIGN_TO.outer)) {
        alignments.push(Magnet.ALIGNMENT.topToBottom);
        alignments.push(Magnet.ALIGNMENT.rightToLeft);
        alignments.push(Magnet.ALIGNMENT.bottomToTop);
        alignments.push(Magnet.ALIGNMENT.leftToRight);
      }
      if (alignTo.includes(Magnet.ALIGN_TO.inner)) {
        alignments.push(Magnet.ALIGNMENT.topToTop);
        alignments.push(Magnet.ALIGNMENT.rightToRight);
        alignments.push(Magnet.ALIGNMENT.bottomToBottom);
        alignments.push(Magnet.ALIGNMENT.leftToLeft);
      }
      if (alignTo.includes(Magnet.ALIGNMENT.center)) {
        alignments.push(Magnet.ALIGNMENT.xCenterToXCenter);
        alignments.push(Magnet.ALIGNMENT.yCenterToYCenter);
      }

      const pack = {
        rectangle: stdRect(this),
        startX,
        startY,
        lastOffsetX,
        lastOffsetY,
        targets: this.getMagnetTargets({
          convertRectangle: true,
        }),
        unattractable: this.unattractable,
        attractDistance,
        alignTo,
        alignOuterline,
        alignments,
        crossPrevent,
        crossPreventParent,
        crossPreventTarget,
        parentRectangle: stdRect(this.parentElement),
        optionsForGettingDistances: {
          alignments,
          absDistance: true,
          sort: true,
          onJudgeDistance: ({ value }) => {
            return value <= attractDistance;
          },
          onJudgeResult: ({ minDistance }) => {
            return isset(minDistance); 
          },
        },
      };
      const onDragMove = (evt) => {
        const cancelled = this.triggerCustomEvent(EVENT_NAME.move, {
          detail: pack,
        });

        if (!cancelled) {
          this.onMagnetDragMove(evt, pack);
        }
      };
      const onDragEnd = (evt) => {
        const cancelled = this.triggerCustomEvent(EVENT_NAME.end, {
          detail: pack,
        });

        removeEventListener(document.body, EVENT.dragMove, onDragMove);
        removeEventListener(document.body, EVENT.dragEnd, onDragEnd);
        if (!cancelled) {
          this.onMagnetDragEnd(evt, pack);
        }
      };
      const cancelled = this.triggerCustomEvent(EVENT_NAME.start, {
        detail: pack,
      });

      if (!cancelled) {
        addEventListener(document.body, EVENT.dragMove, onDragMove);
        addEventListener(document.body, EVENT.dragEnd, onDragEnd);
        this.onMagnetDragStart(evt, pack);
      }
    };

    addEventListener(this, EVENT.dragStart, onDragStart);
    Object.defineProperty(this, PROP_MAGNET_ROOT, {
      value: {},
    });
  }

  static get nodeName() {
    return 'magnet-block';
  }

  static get observedAttributes() {
    return objValues(ATTRIBUTE_PROPS);
  }

  /**
   * Get distance of target element
   */
  static getDistanceOfTarget(source, target, {
    alignments = objValues(Magnet.ALIGNMENT),
    absDistance = false,
    onJudgeDistance = () => true,
  }) {
    const rectSource = stdRect(source);
    const rectTarget = stdRect(target);
    const objectSource = {
      rectangle: rectSource,
      raw: source,
    };
    const objectTarget = {
      rectangle: rectTarget,
      raw: target,
    };
    const stdNum = absDistance
      ?Math.abs
      :(n) => n;
    const calcDistance = (alignment) => {
      switch (alignment) {
        case PROP_ALIGN_TOP_TO_TOP:
          return rectTarget.top - rectSource.top;

        case PROP_ALIGN_TOP_TO_BOTTOM:
          return rectTarget.bottom - rectSource.top;

        case PROP_ALIGN_RIGHT_TO_RIGHT:
          return rectTarget.right - rectSource.right;

        case PROP_ALIGN_RIGHT_TO_LEFT:
          return rectTarget.left - rectSource.right;

        case PROP_ALIGN_BOTTOM_TO_BOTTOM:
          return rectTarget.bottom - rectSource.bottom;

        case PROP_ALIGN_BOTTOM_TO_TOP:
          return rectTarget.top - rectSource.bottom;

        case PROP_ALIGN_LEFT_TO_LEFT:
          return rectTarget.left - rectSource.left;

        case PROP_ALIGN_LEFT_TO_RIGHT:
          return rectTarget.right - rectSource.left;

        case PROP_ALIGN_X_CENTER_TO_X_CENTER:
          return .5 * ((rectTarget.right - rectSource.right) + (rectTarget.left - rectSource.left));

        case PROP_ALIGN_Y_CENTER_TO_Y_CENTER:
          return .5 * ((rectTarget.top - rectSource.top) + (rectTarget.bottom - rectSource.bottom));
      }
    };
    const distances = alignments.reduce((distances, alignment) => {
      const raw = calcDistance(alignment);
      const result = {
        raw,
        value: stdNum(raw),
      };

      if (onJudgeDistance(result)) {
        distances[alignment] = result;
      }
      
      return distances;
    }, {});
    const ranking = objKeys(distances).sort((a, b) => {
      return distances[a].value - distances[b].value;
    });
    const minAlignment = ranking[0];
    const maxAlignment = ranking[ranking.length - 1];
    const minDistance = distances[minAlignment];
    const maxDistance = distances[maxAlignment];
    const result = {
      source: objectSource,
      target: objectTarget,
      distances,
      ranking,
      minAlignment,
      minDistance,
      maxAlignment,
      maxDistance,
    };

    return result;
  }

  /**
   * Get distances of target elements
   */
  static getDistanceOfTargets(
    source,
    targets = [],
    {
      alignments = objValues(Magnet.ALIGNMENT),
      absDistance = false,
      sort = false,
      onJudgeResult: refOnJudgeResult = () => true,
      onJudgeDistance,
    } = []
  ) {
    const options = {
      alignments,
      absDistance,
      onJudgeDistance,
    };
    const onJudgeResult = refOnJudgeResult.bind(this);

    return targets.reduce((results, target) => {
      const result = Magnet.getDistanceOfTarget(source, target, options);

      if (onJudgeResult(result, target)) {
        if (sort) {
          const {
            minDistance: currentMinDistance,
          } = result;
          const insertIndex = results.findIndex(({ minDistance }) => {
            return currentMinDistance <= minDistance;
          });

          results.splice(insertIndex, 0, result);
        } else {
          results.push(result);
        }
      }

      return results
    }, []);
  }

  connectedCallback() {
    console.log('CONNECTED');
  }
  disconnectedCallback() {
    console.log('DISCONNECTED')
  }
  adoptedCallback() {
    console.log('ADOPTED')
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    // console.log('ATTRIBUTE CHANGED', attrName, oldVal, newVal);
    switch (attrName) {
      case ATTRIBUTE_PROPS.disabled:
      case ATTRIBUTE_PROPS.group:
      case ATTRIBUTE_PROPS.alignment:
    }
  }
  
  /**
   * Disabled
   */
  get disabled() {
    return this.hasAttribute(ATTRIBUTE_PROPS.disabled);
  }
  set disabled(disabled) {
    if (disabled) {
      this.setAttribute(ATTRIBUTE_PROPS.disabled, '');
    } else {
      this.removeAttribute(ATTRIBUTE_PROPS.disabled);
    }
  }

  /**
   * Group
   */
  get group() {
    return this.getAttribute(ATTRIBUTE_PROPS.group);
  }
  set group(group) {
    this.setAttribute(ATTRIBUTE_PROPS.group, group);
  }

  /**
   * Alignment
   */
  static ALIGNMENT = Object.defineProperties({}, objMap({
    topToTop: PROP_ALIGN_TOP_TO_TOP,
    topToBottom: PROP_ALIGN_TOP_TO_BOTTOM,
    rightToRight: PROP_ALIGN_RIGHT_TO_RIGHT,
    rightToLeft: PROP_ALIGN_RIGHT_TO_LEFT,
    bottomToBottom: PROP_ALIGN_BOTTOM_TO_BOTTOM,
    bottomToTop: PROP_ALIGN_BOTTOM_TO_TOP,
    leftToLeft: PROP_ALIGN_LEFT_TO_LEFT,
    leftToRight: PROP_ALIGN_LEFT_TO_RIGHT,
    xCenterToXCenter: PROP_ALIGN_X_CENTER_TO_X_CENTER,
    yCenterToYCenter: PROP_ALIGN_Y_CENTER_TO_Y_CENTER,
  }, (value) => ({
    value,
    enumerable: true,
  })))

  /**
   * Align to
   */
  static ALIGN_TO = Object.defineProperties({}, objMap({
    outerline: 'outerline',
    outer: 'outer',
    inner: 'inner',
    center: 'center',
  }, (value) => ({
    value,
    enumerable: true,
  })))
  get alignTo() {
    const validAlignTos = objValues(Magnet.ALIGN_TO);

    return this.hasAttribute(ATTRIBUTE_PROPS.alignTo)
      ?this.getAttribute(ATTRIBUTE_PROPS.alignTo)
        .split(SYMBOL_SPLIT)
        .filter((alignTo) => validAlignTos.includes(alignTo))
      :validAlignTos;
  }
  set alignTo(alignTo) {
    if (isstr(alignTo)) {
      const validAlignTos = objValues(Magnet.ALIGN_TO);

      this.setAttribute(ATTRIBUTE_PROPS.alignTo, alignTo
        .split(SYMBOL_SPLIT)
        .filter((alignTo) => validAlignTos.includes(alignTo))
        .join('|')
      );
    } else {
      this.removeAttribute(ATTRIBUTE_PROPS.alignTo);
    }
  }

  /**
   * Prevent cross
   */
  static PREVENT_CROSS = Object.defineProperties({}, objMap({
    parent: 'parent',
    target: 'target',
  }, (value) => ({
    value,
    enumerable: true,
  })))
  get crossPrevent() {
    const validCrossPrevents = objValues(Magnet.PREVENT_CROSS);

    return this.hasAttribute(ATTRIBUTE_PROPS.crossPrevent)
      ?this.getAttribute(ATTRIBUTE_PROPS.crossPrevent)
        .split(SYMBOL_SPLIT)
        .filter((crossPrevent) => validCrossPrevents.includes(crossPrevent))
      :[];
  }
  set crossPrevent(crossPrevent) {
    if (isstr(alignment)) {
      const validCrossPrevents = objValues(Magnet.PREVENT_CROSS);

      this.setAttribute(ATTRIBUTE_PROPS.crossPrevent, crossPrevent
        .split(SYMBOL_SPLIT)
        .filter((crossPrevent) => validCrossPrevents.includes(crossPrevent))
        .join('|')
      );
    } else {
      this.removeAttribute(ATTRIBUTE_PROPS.crossPrevent);
    }
  }

  /**
   * Unattractable
   */
  get unattractable() {
    return this.hasAttribute(ATTRIBUTE_PROPS.unattractable);
  }
  set unattractable(unattractable) {
    if (unattractable) {
      this.setAttribute(ATTRIBUTE_PROPS.unattractable, '');
    } else {
      this.removeAttribute(ATTRIBUTE_PROPS.unattractable);
    }
  }

  /**
   * Attract distance
   */
  get attractDistance() {
    return tonum(this.getAttribute(ATTRIBUTE_PROPS.attractDistance) || 0);
  }
  set attractDistance(distance) {
    if (isnum(distance)) {
      this.setAttribute(ATTRIBUTE_PROPS.attractDistance, distance);
    }
  }

  /**
   * Trigger custom event
   * 
   * @return boolean of cancelled
   */
  triggerCustomEvent(eventName, {
    detail,
    composed = false,
    cancelable = true,
    bubbles = false,
  } = {}) {
    const event = new CustomEvent(eventName, {
      detail,
      composed,
      cancelable,
      bubbles,
    });

    return !this.dispatchEvent(event);
  }


  /**
   * Magnet drag event listeners
   */
  onMagnetDragStart(evt, pack) {
    const {
      position,
      zIndex,
      transform,
    } = getStyle(this);

    evt.preventDefault();
    evt.stopImmediatePropagation();

    this.style.setProperty('position', 'relative');
    this.style.setProperty('z-index', Date.now(), 'important');

    // TODO: handle origin transform?
    this.style.setProperty('transform', `translate(var(${STYLE_PROPS.x}), var(${STYLE_PROPS.y}))`, 'important');

    this[PROP_MAGNET_ROOT][PROP_ORIGIN_STYLES] = {
      position,
      zIndex,
      transform,
    };

    const {
      startX, startY,
      lastOffsetX, lastOffsetY,
    } = pack;
    console.log('START', [lastOffsetX,lastOffsetY], stdRect(this));
  }
  onMagnetDragMove(evt, pack) {
    const {
      [PROP_CURRENT_NEAREST]: currentNearest,
      rectangle,
      startX,
      startY,
      lastOffsetX,
      lastOffsetY,
      targets,
      unattractable,
      attractDistance,
      alignTo,
      alignOuterline,
      alignments,
      crossPrevent,
      crossPreventParent,
      crossPreventTarget,
      parentRectangle,
      optionsForGettingDistances,
    } = pack;
    const {
      x: cx,
      y: cy,
    } = getEventClientXY(evt);
    const originX = cx + lastOffsetX - startX;
    const originY = cy + lastOffsetY - startY;
    const currentX = originX;
    const currentY = originY;
    const { top, left, width, height } = rectangle;

    if (crossPreventParent) {
      if (currentX < parentRectangle.left) {
        currentX = parentRectangle.left;
      } else if (currentX + width > parentRectangle.right) {
        currentX = parentRectangle.right - width;
      }
      if (currentY < parentRectangle.top) {
        currentY = parentRectangle.top;
      } else if (currentY + height > parentRectangle.bottom) {
        currentY = parentRectangle.bottom - height;
      }
    }
    
    const currentRect = new Rect({
      top: top + currentY,
      left: left + currentX,
      width,
      height,
    });
    
    let finalX = currentX;
    let finalY = currentY;

    if (!unattractable) {
      const nears = Magnet.getDistanceOfTargets(currentRect, targets, optionsForGettingDistances);

      if (nears.length > 0) {
        const nearest = nears[0];
        const {
          source,
          target,
          ranking,
          distances,
        } = nearest;
        const {
          rectangle: targetRect,
          raw: targetRaw,
        } = target;
        const minXAlignment = ranking.find((alignment) => ALIGNMENT_X.includes(alignment));
        const minYAlignment = ranking.find((alignment) => ALIGNMENT_Y.includes(alignment));
        const minXDistance = distances[minXAlignment];
        const minYDistance = distances[minYAlignment];
        const selfCancelled = this.triggerCustomEvent(EVENT_NAME.mounting, {
          detail: {
            to: target,
            x: {
              alignment: minXAlignment,
              distance: minXDistance,
            },
            y: {
              alignment: minYAlignment,
              distance: minYDistance,
            },
            raw: nearest,
          },
        });

        delete pack[PROP_CURRENT_NEAREST];

        if (!selfCancelled) {
          const targetCancelled = targetRaw instanceof Magnet
            ?targetRaw.triggerCustomEvent(EVENT_NAME.beingMounted, {
              detail: {
                from: source,
                x: {
                  alignment: minXAlignment,
                  distance: minXDistance,
                },
                y: {
                  alignment: minYAlignment,
                  distance: minYDistance,
                },
                raw: nearest,
              },
            })
            :false;

          if (!targetCancelled) {
            // align on x direction
            switch (minXAlignment) {
              case PROP_ALIGN_RIGHT_TO_RIGHT:
              case PROP_ALIGN_LEFT_TO_LEFT:
                if (false && !alignOuterline) {
                  const {
                    top: selfTop,
                    bottom: selfBottom,
                  } = currentRect;
                  const {
                    top: targetTop,
                    bottom: targetBottom,
                  } = targetRect;

                  if (
                    selfTop < targetTop ||
                    targetBottom < selfTop ||
                    selfBottom < targetTop ||
                    targetBottom < selfBottom
                  ) {
                    break;
                  }
                }

                finalX += minXDistance.raw;
                break;

              case PROP_ALIGN_RIGHT_TO_LEFT:
              case PROP_ALIGN_LEFT_TO_RIGHT:
                if (true || alignOuterline) {
                  finalX += minXDistance.raw;
                } else {
                  const diffTopToBottom = distances[PROP_ALIGN_TOP_TO_BOTTOM];
                  const diffBottomToTop = distances[PROP_ALIGN_BOTTOM_TO_TOP];

                  if (diffTopToBottom.value <= attractDistance) {
                    finalY += diffTopToBottom.raw;
                  } else if (diffBottomToTop.value <= attractDistance) {
                    finalY += diffBottomToTop.raw;
                  }
                }
                break;

              case PROP_ALIGN_X_CENTER_TO_X_CENTER:
                finalX += minXDistance.raw;
                break;
            }

            // align on y direction
            switch (minYAlignment) {
              case PROP_ALIGN_TOP_TO_TOP:
              case PROP_ALIGN_BOTTOM_TO_BOTTOM:
                if (false && !alignOuterline) {
                  const {
                    right: selfRight,
                    left: selfLeft,
                  } = currentRect;
                  const {
                    right: targetRight,
                    left: targetLeft,
                  } = targetRect;

                  if (
                    selfLeft < targetLeft ||
                    targetRight < selfLeft ||
                    selfRight < targetLeft ||
                    targetRight < selfRight
                  ) {
                    break;
                  }
                }

                finalY += minYDistance.raw;
                break;

              case PROP_ALIGN_TOP_TO_BOTTOM:
              case PROP_ALIGN_BOTTOM_TO_TOP:
                if (true || alignOuterline) {
                  finalY += minYDistance.raw;
                } else {
                  const diffRightToLeft = distances[PROP_ALIGN_RIGHT_TO_LEFT];
                  const diffLeftToRight = distances[PROP_ALIGN_LEFT_TO_RIGHT];
                  
                  if (diffRightToLeft.value <= attractDistance) {
                    finalX += diffRightToLeft.raw;
                  } else if (diffLeftToRight.value <= attractDistance) {
                    finalX += diffLeftToRight.raw;
                  }
                }
                break;

              case PROP_ALIGN_Y_CENTER_TO_Y_CENTER:
                finalY += minYDistance.raw;
                break;
            }

            pack[PROP_CURRENT_NEAREST] = nearest;
          }
        }
      }
    }

    console.log('MOVE', [originX,originY],[finalX,finalY], currentRect);

    this.handleOffset(finalX, finalY);
  }
  onMagnetDragEnd(evt, pack) {
    const {
      [PROP_CURRENT_NEAREST]: currentNearest,
      [PROP_LAST_NEAREST]: lastNearest,
    } = pack;
    const {
      [PROP_ORIGIN_STYLES]: {
        position,
        zIndex,
        transform,
      } = {},
    } = this[PROP_MAGNET_ROOT];

    if (currentNearest) {
      const {
        target: {
          raw: currentTargetRaw,
        },
      } = currentNearest;

      if (lastNearest) {
        const {
          target: {
            raw: lastTargetRaw,
          },
        } = lastNearest;

        if (currentTargetRaw !== lastTargetRaw) {
          // unmount from last target
          this.triggerCustomEvent(EVENT_NAME.unmount);
          lastTargetRaw.triggerCustomEvent(EVENT_NAME.beUnmounted);
        }
      }
      
      // mount to current target
      this.triggerCustomEvent(EVENT_NAME.mount);
      currentTargetRaw.triggerCustomEvent(EVENT_NAME.beMounted);
    } else if (lastNearest) {
      const {
        target: {
          raw: lastTargetRaw,
        },
      } = lastNearest;

      // unmount from last target
      this.triggerCustomEvent(EVENT_NAME.unmount);
      lastTargetRaw.triggerCustomEvent(EVENT_NAME.beUnmounted);
    }

    this.style.setProperty('position', position);
    this.style.setProperty('z-index', zIndex);

    // TODO: handle origin transform?

    console.log('END', stdRect(this));
  }


  /**
   * Get group targets
   */
  getMagnetTargets({
    convertRectangle = false,
  }) {
    const group = this.group;
    const selector = isstr(group)
      ?`[group="${group}"]`
      :`:not([group])`;
    const targets = [];

    Array
      .from(document.querySelectorAll(`${this.nodeName}${selector}`) || [])
      .forEach((dom) => {
        if (dom === this) {
          return;
        }

        targets.push(convertRectangle
          ?stdRect(dom)
          :dom
        );
      });

    return targets;
  }

  /**
   * Get distance of target element
   */
  getDistanceOfTarget(target, options) {
    return Magnet.getDistanceOfTarget(this, target, options);
  }
  
  /**
   * Get distance of targets
   */
  getDistanceOfTargets(
    targets = this.getMagnetTargets(),
    options
  ) {
    return Magnet.getDistanceOfTargets(this, targets, options);
  }

  /**
   * Move position to (x, y)
   */
  handleOffset(x, y) {
    this.style.setProperty(STYLE_PROPS.x, `${x}px`, 'important');
    this.style.setProperty(STYLE_PROPS.y, `${y}px`, 'important');
  }

  /**
   * Reset position
   */
  resetPosition() {
    this.style.removeProperty(STYLE_PROPS.x);
    this.style.removeProperty(STYLE_PROPS.y);
    this.style.removeProperty('transform');
  }
}

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

window.Magnet = Magnet;

export default Magnet;
