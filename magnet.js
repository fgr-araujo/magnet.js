(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MagnetGroup = exports.MagnetBase = void 0;
const Magnet_1 = require("./libs/Magnet");
Object.defineProperty(exports, "MagnetGroup", { enumerable: true, get: function () { return Magnet_1.MagnetGroup; } });
const Base_1 = __importDefault(require("./libs/Magnet/Base"));
exports.MagnetBase = Base_1.default;
Promise.all([
    {
        elem: Magnet_1.Magnet,
        nodeName: 'magnet-block',
    },
    {
        elem: Magnet_1.MagnetGroup,
        nodeName: 'magnet-group',
    },
]
    .map(({ elem, nodeName }) => {
    if (customElements.get(nodeName)) {
        return Promise.resolve();
    }
    customElements.define(nodeName, elem);
    return customElements.whenDefined(nodeName);
}))
    .then(() => {
});
exports.default = Magnet_1.Magnet;

},{"./libs/Magnet":10,"./libs/Magnet/Base":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = exports.CrossPrevents = exports.AlignToParents = exports.AlignTos = exports.ALIGNMENT_Y = exports.ALIGNMENT_X = exports.Alignments = exports.Attributes = void 0;
const stdlib_1 = require("../stdlib");
var Attributes;
(function (Attributes) {
    Attributes["disabled"] = "mg-disabled";
    Attributes["group"] = "mg-group";
    Attributes["unattractable"] = "mg-unattractable";
    Attributes["unmovable"] = "mg-unmovable";
    Attributes["attractDistance"] = "mg-attract-distance";
    Attributes["alignTo"] = "mg-align-to";
    Attributes["alignToParent"] = "mg-align-to-parent";
    Attributes["crossPrevent"] = "mg-cross-prevent";
})(Attributes = exports.Attributes || (exports.Attributes = {}));
var Alignments;
(function (Alignments) {
    Alignments["topToTop"] = "topToTop";
    Alignments["topToBottom"] = "topToBottom";
    Alignments["rightToRight"] = "rightToRight";
    Alignments["rightToLeft"] = "rightToLeft";
    Alignments["bottomToTop"] = "bottomToTop";
    Alignments["bottomToBottom"] = "bottomToBottom";
    Alignments["leftToRight"] = "leftToRight";
    Alignments["leftToLeft"] = "leftToLeft";
    Alignments["xCenterToXCenter"] = "xCenterToXCenter";
    Alignments["yCenterToYCenter"] = "yCenterToYCenter";
})(Alignments = exports.Alignments || (exports.Alignments = {}));
exports.ALIGNMENT_X = [
    Alignments.rightToRight,
    Alignments.rightToLeft,
    Alignments.leftToRight,
    Alignments.leftToLeft,
    Alignments.xCenterToXCenter,
];
exports.ALIGNMENT_Y = [
    Alignments.topToTop,
    Alignments.topToBottom,
    Alignments.bottomToTop,
    Alignments.bottomToBottom,
    Alignments.yCenterToYCenter,
];
var AlignTos;
(function (AlignTos) {
    AlignTos["outer"] = "outer";
    AlignTos["inner"] = "inner";
    AlignTos["center"] = "center";
    AlignTos["outerline"] = "outerline";
})(AlignTos = exports.AlignTos || (exports.AlignTos = {}));
var AlignToParents;
(function (AlignToParents) {
    AlignToParents["inner"] = "inner";
    AlignToParents["center"] = "center";
})(AlignToParents = exports.AlignToParents || (exports.AlignToParents = {}));
var CrossPrevents;
(function (CrossPrevents) {
    CrossPrevents["parent"] = "parent";
})(CrossPrevents = exports.CrossPrevents || (exports.CrossPrevents = {}));
var Events;
(function (Events) {
    Events["start"] = "mg-start";
    Events["move"] = "mg-move";
    Events["end"] = "mg-end";
    Events["attract"] = "mg-attract";
    Events["attractmove"] = "mg-attractmove";
    Events["unattract"] = "mg-unattract";
    Events["attracted"] = "mg-attracted";
    Events["attractedmove"] = "mg-attractedmove";
    Events["unattracted"] = "mg-unattracted";
})(Events = exports.Events || (exports.Events = {}));
function stdPropValues(props) {
    const config = stdlib_1.objMap(props, (value) => ({
        value,
        enumerable: true,
    }));
    return Object.defineProperties({}, config);
}
const REGEXP_ATTR_SPLIT = /[|;,\s]/;
function stdMultiValToAttrVal(val, ref) {
    return (stdlib_1.isstr(val)
        ? val.split(REGEXP_ATTR_SPLIT)
        : stdlib_1.toarray(val).filter(stdlib_1.isstr))
        .filter((member) => member in ref)
        .join('|');
}
function stdAttrValToMultiVal(val, ref, def) {
    return (stdlib_1.isstr(val)
        ? val
            .split(REGEXP_ATTR_SPLIT)
            .filter((member) => member in ref)
        : def);
}
const DEF_ATTRACT_DISTANCE = 0;
const DEF_ALIGN_TO = [
    AlignTos.outer,
    AlignTos.inner,
    AlignTos.center,
    AlignTos.outerline,
];
const DEF_ALIGN_TO_PARENT = [];
const DEF_CROSS_PREVENT = [];
const template = document.createElement('template');
template.innerHTML = `
<style>
  :host {
    position: relative;
    display: inline-block;
  }
</style>
<slot>
</slot>
`;
class Base extends HTMLElement {
    constructor() {
        var _a;
        super();
        this.attachShadow({ mode: 'open' });
        (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.appendChild(template.content.cloneNode(true));
    }
    static getAlignmentsOfAlignTo(alignTo = []) {
        const alignments = [];
        if (alignTo.includes(this.ALIGN_TO.outer)) {
            alignments.push(this.ALIGNMENT.topToBottom);
            alignments.push(this.ALIGNMENT.rightToLeft);
            alignments.push(this.ALIGNMENT.bottomToTop);
            alignments.push(this.ALIGNMENT.leftToRight);
        }
        if (alignTo.includes(this.ALIGN_TO.inner)) {
            alignments.push(this.ALIGNMENT.topToTop);
            alignments.push(this.ALIGNMENT.rightToRight);
            alignments.push(this.ALIGNMENT.bottomToBottom);
            alignments.push(this.ALIGNMENT.leftToLeft);
        }
        if (alignTo.includes(this.ALIGN_TO.center)) {
            alignments.push(this.ALIGNMENT.xCenterToXCenter);
            alignments.push(this.ALIGNMENT.yCenterToYCenter);
        }
        return alignments;
    }
    set disabled(val) {
        if (val) {
            this.setAttribute(Attributes.disabled, '');
        }
        else {
            this.removeAttribute(Attributes.disabled);
        }
    }
    get disabled() {
        return stdlib_1.isstr(this.traceMagnetAttributeValue(Attributes.disabled));
    }
    set group(val) {
        if (stdlib_1.isstr(val)) {
            this.setAttribute(Attributes.group, val);
        }
        else {
            this.removeAttribute(Attributes.group);
        }
    }
    get group() {
        return this.traceMagnetAttributeValue(Attributes.group);
    }
    get groupNode() {
        let parent = this.parentElement;
        while (parent) {
            if (parent instanceof Base) {
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    }
    set unattractable(val) {
        if (val) {
            this.setAttribute(Attributes.unattractable, '');
        }
        else {
            this.removeAttribute(Attributes.unattractable);
        }
    }
    get unattractable() {
        return stdlib_1.isstr(this.traceMagnetAttributeValue(Attributes.unattractable));
    }
    set unmovable(val) {
        if (val) {
            this.setAttribute(Attributes.unmovable, '');
        }
        else {
            this.removeAttribute(Attributes.unmovable);
        }
    }
    get unmovable() {
        return stdlib_1.isstr(this.traceMagnetAttributeValue(Attributes.unmovable));
    }
    set attractDistance(val) {
        if (stdlib_1.isnum(val)) {
            this.setAttribute(Attributes.attractDistance, stdlib_1.tostr(val));
        }
    }
    get attractDistance() {
        const val = this.traceMagnetAttributeValue(Attributes.attractDistance);
        const result = stdlib_1.tonum(stdlib_1.isstr(val) ? val : DEF_ATTRACT_DISTANCE);
        return Number.NaN === result ? DEF_ATTRACT_DISTANCE : result;
    }
    set alignTo(val) {
        const attrVal = stdMultiValToAttrVal(val, Base.ALIGN_TO);
        this.setAttribute(Attributes.alignTo, attrVal);
    }
    get alignTo() {
        const val = this.traceMagnetAttributeValue(Attributes.alignTo);
        return stdAttrValToMultiVal(val, Base.ALIGN_TO, DEF_ALIGN_TO);
    }
    set alignToParent(val) {
        const attrVal = stdMultiValToAttrVal(val, Base.ALIGN_TO_PARENT);
        this.setAttribute(Attributes.alignToParent, attrVal);
    }
    get alignToParent() {
        const val = this.traceMagnetAttributeValue(Attributes.alignToParent);
        return stdAttrValToMultiVal(val, Base.ALIGN_TO_PARENT, DEF_ALIGN_TO_PARENT);
    }
    set crossPrevent(val) {
        const attrVal = stdMultiValToAttrVal(val, Base.CROSS_PREVENT);
        this.setAttribute(Attributes.crossPrevent, attrVal);
    }
    get crossPrevent() {
        const val = this.traceMagnetAttributeValue(Attributes.crossPrevent);
        return stdAttrValToMultiVal(val, Base.CROSS_PREVENT, DEF_CROSS_PREVENT);
    }
    traceMagnetAttributeValue(attrName) {
        const val = this.getAttribute(attrName);
        if (stdlib_1.isstr(val)) {
            return val;
        }
        const { groupNode } = this;
        return (groupNode
            ? groupNode.traceMagnetAttributeValue(attrName)
            : null);
    }
    triggerMagnetEvent(evtName, { detail, composed = false, cancelable = true, bubbles = false, } = {}) {
        const evt = new CustomEvent(evtName, {
            detail,
            composed,
            cancelable,
            bubbles,
        });
        return !this.dispatchEvent(evt);
    }
}
exports.default = Base;
Base.ALIGNMENT = stdPropValues({
    topToTop: Alignments.topToTop,
    topToBottom: Alignments.topToBottom,
    rightToRight: Alignments.rightToRight,
    rightToLeft: Alignments.rightToLeft,
    bottomToTop: Alignments.bottomToTop,
    bottomToBottom: Alignments.bottomToBottom,
    leftToRight: Alignments.leftToRight,
    leftToLeft: Alignments.leftToLeft,
    xCenterToXCenter: Alignments.xCenterToXCenter,
    yCenterToYCenter: Alignments.yCenterToYCenter,
});
Base.ALIGN_TO = stdPropValues({
    outer: AlignTos.outer,
    inner: AlignTos.inner,
    center: AlignTos.center,
    outerline: AlignTos.outerline,
});
Base.ALIGN_TO_PARENT = stdPropValues({
    inner: AlignToParents.inner,
    center: AlignToParents.center,
});
Base.CROSS_PREVENT = stdPropValues({
    parent: CrossPrevents.parent,
});
Base.EVENT = stdPropValues({
    start: Events.start,
    move: Events.move,
    end: Events.end,
    attract: Events.attract,
    attractmove: Events.attractmove,
    unattract: Events.unattract,
    attracted: Events.attracted,
    attractedmove: Events.attractedmove,
    unattracted: Events.unattracted,
});

},{"../stdlib":14}],3:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Styles = void 0;
const Rect_1 = require("../Rect");
const Point_1 = __importDefault(require("../Rect/Point"));
const Rect_2 = __importDefault(require("../Rect/Rect"));
const stdlib_1 = require("../stdlib");
const Base_1 = __importStar(require("./Base"));
const calc_1 = require("./calc");
const handler_1 = require("./handler");
const EVENT_DRAGSTART = ['mousedown', 'touchstart'];
const EVENT_DRAGMOVE = ['mousemove', 'touchmove'];
const EVENT_DRAGEND = ['mouseup', 'touchend'];
var Styles;
(function (Styles) {
    Styles["offsetX"] = "--mg-offset-x";
    Styles["offsetY"] = "--mg-offset-y";
})(Styles = exports.Styles || (exports.Styles = {}));
class Block extends Base_1.default {
    constructor() {
        super();
        this.judgeDistance = (distance) => (distance.absVal <= this.attractDistance);
        this.judgeAttractSummary = (summary) => (stdlib_1.isset(summary.best.any));
        this.judgeParentDistance = (...args) => (this.judgeDistance(...args));
        this.attributeChangedCallback(Base_1.Attributes.disabled);
    }
    static calcAttraction(source, target, _a = {}) {
        var { alignments = stdlib_1.objValues(this.ALIGNMENT), absDistance = true } = _a, options = __rest(_a, ["alignments", "absDistance"]);
        return calc_1.calcAttraction(source, target, Object.assign(Object.assign({}, options), { alignments,
            absDistance }));
    }
    static calcMultiAttractions(source, targets = [], _a = {}) {
        var { alignments = stdlib_1.objValues(this.ALIGNMENT), absDistance = true } = _a, options = __rest(_a, ["alignments", "absDistance"]);
        return calc_1.calcMultiAttractions(source, targets, Object.assign(Object.assign({}, options), { alignments,
            absDistance }));
    }
    attributeChangedCallback(attrName) {
        switch (attrName) {
            default:
                break;
            case Base_1.Attributes.disabled:
                if (this.disabled) {
                    handler_1.removeEventListener(this, EVENT_DRAGSTART, this.handleMagnetDragStart);
                }
                else if (!this.unmovable) {
                    handler_1.addEventListener(this, EVENT_DRAGSTART, this.handleMagnetDragStart);
                }
                break;
            case Base_1.Attributes.unmovable:
                if (this.unmovable) {
                    handler_1.removeEventListener(this, EVENT_DRAGSTART, this.handleMagnetDragStart);
                }
                else if (!this.disabled) {
                    handler_1.addEventListener(this, EVENT_DRAGSTART, this.handleMagnetDragStart);
                }
                break;
        }
    }
    getMagnetTargets() {
        const { group } = this;
        const groupSelector = (stdlib_1.isstr(group)
            ? `[${Base_1.Attributes.group}="${group}"]`
            : '');
        const notDisabledSelector = `:not([${Base_1.Attributes.disabled}])`;
        const notUnattractableSelector = `:not([${Base_1.Attributes.unattractable}])`;
        const selector = `${groupSelector}${notDisabledSelector}${notUnattractableSelector}`;
        const magnetSelector = `${this.localName}${selector}`;
        const magnetQueryResults = document.querySelectorAll(magnetSelector);
        const groupMagnetQueryResults = document.querySelectorAll(`${new Base_1.default().localName}${selector} ${magnetSelector}`);
        return stdlib_1.toarray(magnetQueryResults || [])
            .concat(stdlib_1.toarray(groupMagnetQueryResults || []))
            .filter((tgt, tgtIndex, tgts) => (tgt !== this
            && tgts.indexOf(tgt) === tgtIndex));
    }
    calcAttraction(target, options) {
        return Block.calcAttraction(this, target, options);
    }
    calcMultiAttractions(targets, options) {
        return Block.calcMultiAttractions(this, targets, options);
    }
    resetMagnetOffset() {
        this.style.removeProperty(Styles.offsetX);
        this.style.removeProperty(Styles.offsetY);
        this.style.removeProperty('transform');
    }
    handleMagnetOffset(ref, y) {
        if (Point_1.default.isPoint(ref)) {
            this.style.setProperty(Styles.offsetX, `${ref.x}px`);
            this.style.setProperty(Styles.offsetY, `${ref.y}px`);
        }
        const x = ref;
        this.style.setProperty(Styles.offsetX, `${x}px`);
        this.style.setProperty(Styles.offsetY, `${y}px`);
    }
    handleMagnetDragStart(evt) {
        if (this.disabled || this.unmovable) {
            return;
        }
        const { position, zIndex, transform, } = stdlib_1.getStyle(this);
        const { disabled, unattractable, unmovable, group, alignTo, alignToParent, crossPrevent, attractDistance, parentElement, } = this;
        const lastOffset = new Point_1.default(stdlib_1.tonum(this.style.getPropertyValue(Styles.offsetX) || 0), stdlib_1.tonum(this.style.getPropertyValue(Styles.offsetY) || 0));
        const self = new Rect_1.Pack(this);
        const parent = (stdlib_1.isnull(parentElement)
            ? undefined
            : new Rect_1.Pack(parentElement));
        const parentRect = parent === null || parent === void 0 ? void 0 : parent.rectangle;
        const crossPreventParent = crossPrevent.includes(Block.CROSS_PREVENT.parent);
        const onJudgeDistance = (crossPreventParent && parentRect
            ? (distance, _, srcPack) => {
                const { rawVal, absVal } = distance;
                const { rectangle: srcRect, } = srcPack;
                if (absVal > this.attractDistance) {
                    return false;
                }
                switch (distance.alignment) {
                    default:
                        return true;
                    case Base_1.Alignments.topToTop:
                    case Base_1.Alignments.topToBottom:
                        return parentRect.top <= srcRect.top + rawVal;
                    case Base_1.Alignments.rightToRight:
                    case Base_1.Alignments.rightToLeft:
                        return parentRect.right >= srcRect.right + rawVal;
                    case Base_1.Alignments.bottomToTop:
                    case Base_1.Alignments.bottomToBottom:
                        return parentRect.bottom >= srcRect.bottom + rawVal;
                    case Base_1.Alignments.leftToRight:
                    case Base_1.Alignments.leftToLeft:
                        return parentRect.left <= srcRect.left + rawVal;
                    case Base_1.Alignments.xCenterToXCenter:
                        return (parentRect.right >= srcRect.right + rawVal
                            && parentRect.left <= srcRect.left + rawVal);
                    case Base_1.Alignments.yCenterToYCenter:
                        return (parentRect.top <= srcRect.top + rawVal
                            && parentRect.bottom >= srcRect.bottom + rawVal);
                }
            }
            : this.judgeDistance.bind(this));
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
            crossPreventParent,
            alignments: Block.getAlignmentsOfAlignTo(alignTo),
            parentAlignments: Block.getAlignmentsOfAlignTo(alignToParent),
            onJudgeDistance,
            onJudgeAttractSummary: this.judgeAttractSummary.bind(this),
            onJudgeParentDistance: this.judgeParentDistance.bind(this),
            disabled,
            group,
            unattractable,
            unmovable,
            parent,
            targets: this.getMagnetTargets()
                .map((target) => new Rect_1.Pack(target)),
            self,
            originStyle: {
                position,
                zIndex,
                transform,
            },
            startXY: handler_1.getEvtClientXY(evt),
            lastOffset,
        };
        let tempStore = data;
        if (this.triggerMagnetEvent(Block.EVENT.start, handler_1.generateDragEventDetail(evt, tempStore))) {
            return;
        }
        const onMove = (e) => {
            if (this.triggerMagnetEvent(Block.EVENT.move, handler_1.generateDragEventDetail(e, tempStore))) {
                return;
            }
            tempStore = this.handleMagnetDragMove(e, tempStore);
        };
        const onEnd = (e) => {
            if (this.triggerMagnetEvent(Block.EVENT.end, handler_1.generateDragEventDetail(e, tempStore))) {
                return;
            }
            this.handleMagnetDragEnd(e, tempStore);
            handler_1.removeEventListener(window, EVENT_DRAGMOVE, onMove);
            handler_1.removeEventListener(window, EVENT_DRAGEND, onEnd);
        };
        evt.preventDefault();
        evt.stopImmediatePropagation();
        switch (position) {
            case 'relative':
            case 'fixed':
            case 'absolute':
                break;
            default:
                this.style.setProperty('position', 'relative');
                break;
        }
        this.style.setProperty('z-index', stdlib_1.tostr(stdlib_1.toint(Date.now() / 1000)));
        this.style.setProperty('transform', `translate(var(${Styles.offsetX}), var(${Styles.offsetY}))`, 'important');
        handler_1.addEventListener(window, EVENT_DRAGMOVE, onMove);
        handler_1.addEventListener(window, EVENT_DRAGEND, onEnd);
        tempStore = this.handleMagnetDragMove(evt, tempStore);
    }
    handleMagnetDragMove(evt, data) {
        var _a, _b;
        const { crossPreventParent, alignments, parentAlignments, onJudgeDistance, onJudgeAttractSummary, onJudgeParentDistance, unattractable, parent, targets, self: { rectangle: selfRect, }, startXY, lastOffset, lastAttractSummary, } = data;
        const { rectangle: parentRect, } = parent || {};
        const { x: selfX, y: selfY, width: selfWidth, height: selfHeight, } = selfRect;
        const currXY = handler_1.getEvtClientXY(evt);
        const currOffset = new Point_1.default(currXY.x - startXY.x, currXY.y - startXY.y);
        const oriRect = new Rect_2.default(selfRect).offset(currOffset);
        const currRect = new Rect_2.default(oriRect);
        if (crossPreventParent && parentRect) {
            if (currRect.left < parentRect.left) {
                currRect.moveToX(parentRect.left);
            }
            else if (currRect.left + selfWidth > parentRect.right) {
                currRect.moveToX(parentRect.right - selfWidth);
            }
            if (currRect.top < parentRect.top) {
                currRect.moveToY(parentRect.top);
            }
            else if (currRect.top + selfHeight > parentRect.bottom) {
                currRect.moveToY(parentRect.bottom - selfHeight);
            }
        }
        const finalRect = new Rect_2.default(currRect);
        let currAttractSummary;
        do {
            if (unattractable) {
                break;
            }
            currAttractSummary = Block.calcMultiAttractions(currRect, targets, {
                alignments,
                onJudgeDistance,
                onJudgeAttractSummary,
                bindAttraction: (parentAlignments.length > 0 && parent
                    ? Block.calcAttraction(currRect, parent, {
                        alignments: parentAlignments,
                        onJudgeDistance: onJudgeParentDistance,
                    })
                    : undefined),
            });
            const { best: currAttractBest, } = currAttractSummary;
            const { x: currMinX, y: currMinY, } = currAttractBest;
            const lastAttractX = (_a = lastAttractSummary === null || lastAttractSummary === void 0 ? void 0 : lastAttractSummary.best) === null || _a === void 0 ? void 0 : _a.x;
            const lastAttractY = (_b = lastAttractSummary === null || lastAttractSummary === void 0 ? void 0 : lastAttractSummary.best) === null || _b === void 0 ? void 0 : _b.y;
            const lastTargetX = lastAttractX === null || lastAttractX === void 0 ? void 0 : lastAttractX.target;
            const lastTargetY = lastAttractY === null || lastAttractY === void 0 ? void 0 : lastAttractY.target;
            const currTargetX = currMinX === null || currMinX === void 0 ? void 0 : currMinX.target;
            const currTargetY = currMinY === null || currMinY === void 0 ? void 0 : currMinY.target;
            const diffTargetX = lastTargetX !== currTargetX;
            const diffTargetY = lastTargetY !== currTargetY;
            const nextOffset = calc_1.getOffsetOfAttractResult(currAttractBest);
            const nextRect = new Rect_2.default(currRect).offset(nextOffset);
            const evtOptions = handler_1.generateAttractEventDetail(currAttractSummary, nextRect);
            if (!diffTargetX || !diffTargetY) {
                if (this.triggerMagnetEvent(Block.EVENT.attractmove, evtOptions)) {
                    break;
                }
                if (!diffTargetX && currTargetX instanceof Base_1.default) {
                    if (currTargetX.triggerMagnetEvent(Block.EVENT.attractedmove, evtOptions)) {
                        break;
                    }
                }
                if (!diffTargetY && currTargetY instanceof Base_1.default) {
                    if (currTargetY.triggerMagnetEvent(Block.EVENT.attractedmove, evtOptions)) {
                        break;
                    }
                }
            }
            if (lastTargetX || lastTargetY) {
                const unattractX = lastTargetX && diffTargetX;
                const unattractY = lastTargetY && diffTargetY;
                if (unattractX || unattractY) {
                    this.triggerMagnetEvent(Block.EVENT.unattract, evtOptions);
                    if (unattractX && lastTargetX instanceof Base_1.default) {
                        lastTargetX.triggerMagnetEvent(Block.EVENT.unattracted, evtOptions);
                    }
                    if (unattractY && lastTargetY instanceof Base_1.default) {
                        lastTargetY.triggerMagnetEvent(Block.EVENT.unattracted, evtOptions);
                    }
                }
            }
            if (currTargetX || currTargetY) {
                const lastAlignX = lastAttractX === null || lastAttractX === void 0 ? void 0 : lastAttractX.alignment;
                const lastAlignY = lastAttractY === null || lastAttractY === void 0 ? void 0 : lastAttractY.alignment;
                const currAlignX = currMinX === null || currMinX === void 0 ? void 0 : currMinX.alignment;
                const currAlignY = currMinY === null || currMinY === void 0 ? void 0 : currMinY.alignment;
                const currAttractX = currTargetX && (diffTargetX || lastAlignX !== currAlignX);
                const currAttractY = currTargetY && (diffTargetY || lastAlignY !== currAlignY);
                if (currAttractX || currAttractY) {
                    if (this.triggerMagnetEvent(Block.EVENT.attract, evtOptions)) {
                        break;
                    }
                    if (currAttractX && currTargetX instanceof Base_1.default) {
                        if (currTargetX.triggerMagnetEvent(Block.EVENT.attracted, evtOptions)) {
                            nextOffset.x = 0;
                        }
                    }
                    if (currAttractY && currTargetY instanceof Base_1.default) {
                        if (currTargetY.triggerMagnetEvent(Block.EVENT.attracted, evtOptions)) {
                            nextOffset.y = 0;
                        }
                    }
                }
            }
            finalRect.offset(nextOffset);
        } while (false);
        const finalX = finalRect.x - selfX + lastOffset.x;
        const finalY = finalRect.y - selfY + lastOffset.y;
        this.handleMagnetOffset(finalX, finalY);
        return Object.assign(Object.assign({}, data), { lastAttractSummary: currAttractSummary });
    }
    handleMagnetDragEnd(evt, data) {
        const { originStyle: { position, zIndex, }, } = data;
        if (stdlib_1.isset(position)) {
            this.style.setProperty('position', position);
        }
        if (stdlib_1.isset(zIndex)) {
            this.style.setProperty('z-index', zIndex);
        }
    }
}
exports.default = Block;
Block.observedAttributes = [
    Base_1.Attributes.disabled,
    Base_1.Attributes.unmovable,
];

},{"../Rect":13,"../Rect/Point":11,"../Rect/Rect":12,"../stdlib":14,"./Base":2,"./calc":8,"./handler":9}],4:[function(require,module,exports){
"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _x, _y;
Object.defineProperty(exports, "__esModule", { value: true });
const stdlib_1 = require("../../stdlib");
const Attraction_1 = __importDefault(require("./Attraction"));
class AttractResult {
    constructor(src, y) {
        _x.set(this, void 0);
        _y.set(this, void 0);
        if (AttractResult.isAttractResult(src)) {
            return src;
        }
        const x = src;
        this.x = x;
        this.y = y;
    }
    static isAttractResult(src) {
        return src instanceof AttractResult;
    }
    get x() { return __classPrivateFieldGet(this, _x); }
    set x(src) {
        if (stdlib_1.isset(src) && !Attraction_1.default.isAttraction(src)) {
            throw new TypeError(`Invalid attraction of x: ${src}`);
        }
        __classPrivateFieldSet(this, _x, src);
    }
    get y() { return __classPrivateFieldGet(this, _y); }
    set y(src) {
        if (stdlib_1.isset(src) && !Attraction_1.default.isAttraction(src)) {
            throw new TypeError(`Invalid attraction of y: ${src}`);
        }
        __classPrivateFieldSet(this, _y, src);
    }
    get any() {
        const { x, y } = this;
        if (!stdlib_1.isset(x)) {
            return y;
        }
        if (!stdlib_1.isset(y)) {
            return x;
        }
        return x.distance.rawVal < y.distance.rawVal ? x : y;
    }
    clone() {
        var _a, _b;
        return new AttractResult((_a = this.x) === null || _a === void 0 ? void 0 : _a.clone(), (_b = this.y) === null || _b === void 0 ? void 0 : _b.clone());
    }
}
exports.default = AttractResult;
_x = new WeakMap(), _y = new WeakMap();

},{"../../stdlib":14,"./Attraction":5}],5:[function(require,module,exports){
"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _source, _target, _distance;
Object.defineProperty(exports, "__esModule", { value: true });
const stdlib_1 = require("../../stdlib");
const Distance_1 = __importDefault(require("./Distance"));
class Attraction extends Distance_1.default {
    constructor(src, target, distance = new Distance_1.default()) {
        super(distance.alignment, distance.rawVal, stdlib_1.isset(distance.absVal));
        _source.set(this, void 0);
        _target.set(this, void 0);
        _distance.set(this, void 0);
        if (Attraction.isAttraction(src)) {
            __classPrivateFieldSet(this, _source, src.source);
            __classPrivateFieldSet(this, _target, src.target);
            __classPrivateFieldSet(this, _distance, src.distance);
        }
        else {
            __classPrivateFieldSet(this, _source, src);
            __classPrivateFieldSet(this, _target, target);
            __classPrivateFieldSet(this, _distance, distance);
        }
    }
    static isAttraction(src) {
        return src instanceof this;
    }
    get source() { return __classPrivateFieldGet(this, _source); }
    get target() { return __classPrivateFieldGet(this, _target); }
    get distance() { return __classPrivateFieldGet(this, _distance); }
    clone() {
        return new Attraction(this.source, this.target, this.distance);
    }
}
exports.default = Attraction;
_source = new WeakMap(), _target = new WeakMap(), _distance = new WeakMap();

},{"../../stdlib":14,"./Distance":6}],6:[function(require,module,exports){
"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _alignment, _rawVal, _absVal;
Object.defineProperty(exports, "__esModule", { value: true });
const stdlib_1 = require("../../stdlib");
const Base_1 = require("../Base");
class Distance {
    constructor(src, ...args) {
        _alignment.set(this, void 0);
        _rawVal.set(this, NaN);
        _absVal.set(this, NaN);
        if (Distance.isDistance(src)) {
            return src;
        }
        const alignment = src;
        const [val = Infinity, abs = true] = args;
        if (stdlib_1.isset(alignment) && !stdlib_1.isinEnum(alignment, Base_1.Alignments)) {
            throw new TypeError(`Invalid alignment: ${alignment}`);
        }
        __classPrivateFieldSet(this, _alignment, alignment);
        __classPrivateFieldSet(this, _rawVal, val);
        if (abs) {
            __classPrivateFieldSet(this, _absVal, Math.abs(val));
        }
    }
    static isDistance(src) {
        return src instanceof this;
    }
    get alignment() { return __classPrivateFieldGet(this, _alignment); }
    get rawVal() { return __classPrivateFieldGet(this, _rawVal); }
    get absVal() { return __classPrivateFieldGet(this, _absVal); }
    clone() {
        return new Distance(this.alignment, this.rawVal, stdlib_1.isset(this.absVal));
    }
}
exports.default = Distance;
_alignment = new WeakMap(), _rawVal = new WeakMap(), _absVal = new WeakMap();

},{"../../stdlib":14,"../Base":2}],7:[function(require,module,exports){
"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _source, _target, _results, _best;
Object.defineProperty(exports, "__esModule", { value: true });
const stdlib_1 = require("../../stdlib");
const AttractResult_1 = __importDefault(require("./AttractResult"));
class Summary {
    constructor(source, target, results = [], best) {
        _source.set(this, void 0);
        _target.set(this, void 0);
        _results.set(this, void 0);
        _best.set(this, void 0);
        __classPrivateFieldSet(this, _source, source);
        __classPrivateFieldSet(this, _target, target);
        __classPrivateFieldSet(this, _results, []);
        __classPrivateFieldSet(this, _best, (AttractResult_1.default.isAttractResult(best)
            ? best
            : new AttractResult_1.default()));
        if (stdlib_1.isset(results)) {
            if (!stdlib_1.isarray(results)) {
                throw new Error(`Invalid result list: ${results}`);
            }
            results.forEach((result) => this.addResult(result));
        }
    }
    get source() { return __classPrivateFieldGet(this, _source); }
    get target() { return __classPrivateFieldGet(this, _target); }
    get results() { return __classPrivateFieldGet(this, _results); }
    get best() { return __classPrivateFieldGet(this, _best); }
    set best(src) { __classPrivateFieldSet(this, _best, src); }
    addResult(result) {
        this.results.push(result);
    }
}
exports.default = Summary;
_source = new WeakMap(), _target = new WeakMap(), _results = new WeakMap(), _best = new WeakMap();

},{"../../stdlib":14,"./AttractResult":4}],8:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOffsetOfAttractResult = exports.calcMultiAttractions = exports.cloneMultiAttractionsResult = exports.calcAttraction = exports.cloneAttractionResult = exports.calcDistance = void 0;
const Base_1 = require("../Base");
const Distance_1 = __importDefault(require("./Distance"));
const Attraction_1 = __importDefault(require("./Attraction"));
const Summary_1 = __importDefault(require("./Summary"));
const Rect_1 = require("../../Rect");
const AttractResult_1 = __importDefault(require("./AttractResult"));
const Point_1 = __importDefault(require("../../Rect/Point"));
const BIAS_ATTRACT_GAP = 0.33;
const trueGetter = () => true;
const calcDistance = function calcDistance(alignment, srcRect, tgtRect) {
    switch (alignment) {
        default:
            return Infinity;
        case Base_1.Alignments.topToTop:
            return tgtRect.top - srcRect.top;
        case Base_1.Alignments.topToBottom:
            return tgtRect.bottom - srcRect.top;
        case Base_1.Alignments.rightToRight:
            return tgtRect.right - srcRect.right;
        case Base_1.Alignments.rightToLeft:
            return tgtRect.left - srcRect.right;
        case Base_1.Alignments.bottomToTop:
            return tgtRect.top - srcRect.bottom;
        case Base_1.Alignments.bottomToBottom:
            return tgtRect.bottom - srcRect.bottom;
        case Base_1.Alignments.leftToRight:
            return tgtRect.right - srcRect.left;
        case Base_1.Alignments.leftToLeft:
            return tgtRect.left - srcRect.left;
        case Base_1.Alignments.xCenterToXCenter:
            return 0.5 * ((tgtRect.right + tgtRect.left) - (srcRect.right + srcRect.left));
        case Base_1.Alignments.yCenterToYCenter:
            return 0.5 * ((tgtRect.top + tgtRect.bottom) - (srcRect.top + srcRect.bottom));
    }
};
exports.calcDistance = calcDistance;
const absValGetter = (distance) => (distance === null || distance === void 0 ? void 0 : distance.absVal) || Infinity;
const rawValGetter = (distance) => (distance === null || distance === void 0 ? void 0 : distance.rawVal) || Infinity;
function cloneAttractionResult(ref) {
    return new Summary_1.default(ref.source.clone(), ref.target.clone(), ref.results.map((result) => result.clone()), ref.best.clone());
}
exports.cloneAttractionResult = cloneAttractionResult;
const calcAttraction = function calcAttraction(source, target, { attractDistance = Infinity, alignments = [], absDistance = true, onJudgeDistance = trueGetter, } = {}) {
    const srcPack = new Rect_1.Pack(source);
    const tgtPack = new Rect_1.Pack(target);
    const srcRect = srcPack.rectangle;
    const tgtRect = tgtPack.rectangle;
    const biasGap = BIAS_ATTRACT_GAP * attractDistance;
    const valGetter = absDistance ? absValGetter : rawValGetter;
    const initialAttraction = new Attraction_1.default(srcPack, tgtPack, new Distance_1.default());
    const summary = alignments.reduce((currSummary, alignment) => {
        const rawVal = exports.calcDistance(alignment, srcRect, tgtRect);
        const distance = new Distance_1.default(alignment, rawVal, absDistance);
        if (onJudgeDistance(distance, tgtPack, srcPack)) {
            const { results, best } = currSummary;
            const { x, y } = best;
            const distanceVal = valGetter(distance);
            const attraction = new Attraction_1.default(srcPack, tgtPack, distance);
            results.push(attraction);
            if (Base_1.ALIGNMENT_X.includes(alignment)) {
                const distanceXVal = valGetter(x);
                do {
                    if (distanceVal > distanceXVal) {
                        break;
                    }
                    else if (distanceVal === distanceXVal) {
                        const diffX = srcRect.left - tgtRect.left;
                        if (diffX > biasGap) {
                            if (alignment !== Base_1.Alignments.rightToRight) {
                                break;
                            }
                        }
                        else if (diffX < -biasGap) {
                            if (alignment !== Base_1.Alignments.leftToLeft) {
                                break;
                            }
                        }
                        if (alignment !== Base_1.Alignments.xCenterToXCenter) {
                            break;
                        }
                    }
                    best.x = attraction;
                } while (false);
            }
            else if (Base_1.ALIGNMENT_Y.includes(alignment)) {
                const distanceYVal = valGetter(y);
                do {
                    if (distanceVal > distanceYVal) {
                        break;
                    }
                    else if (distanceVal === distanceYVal) {
                        const diffY = srcRect.top - tgtRect.top;
                        if (diffY > biasGap) {
                            if (alignment !== Base_1.Alignments.bottomToBottom) {
                                break;
                            }
                        }
                        else if (diffY < -biasGap) {
                            if (alignment !== Base_1.Alignments.topToTop) {
                                break;
                            }
                        }
                        if (alignment !== Base_1.Alignments.yCenterToYCenter) {
                            break;
                        }
                    }
                    best.y = attraction;
                } while (false);
            }
        }
        return currSummary;
    }, new Summary_1.default(srcPack, tgtPack, undefined, new AttractResult_1.default(initialAttraction, initialAttraction)));
    return summary;
};
exports.calcAttraction = calcAttraction;
function cloneMultiAttractionsResult(ref) {
    return new Summary_1.default(ref.source.clone(), ref.target.map((tgt) => tgt.clone()), ref.results.map((result) => cloneAttractionResult(result)), ref.best.clone());
}
exports.cloneMultiAttractionsResult = cloneMultiAttractionsResult;
const calcMultiAttractions = function calcMultiAttractions(source, targets = [], { attractDistance, alignments, absDistance, onJudgeDistance, onJudgeAttractSummary = trueGetter, bindAttraction, } = {}) {
    const srcPack = new Rect_1.Pack(source);
    const calcAttractionOptions = {
        attractDistance,
        alignments,
        absDistance,
        onJudgeDistance,
    };
    const valGetter = absDistance ? absValGetter : rawValGetter;
    const initialTargets = bindAttraction ? [Rect_1.toPack(bindAttraction.target)] : [];
    const initialresults = bindAttraction ? [bindAttraction] : [];
    const initialAttraction = bindAttraction === null || bindAttraction === void 0 ? void 0 : bindAttraction.best;
    const summary = targets.reduce((currSummary, target) => {
        const tgtPack = new Rect_1.Pack(target);
        const attractSummary = exports.calcAttraction(srcPack, tgtPack, calcAttractionOptions);
        const { best } = attractSummary;
        const minXAttraction = best.x;
        const minYAttraction = best.y;
        const minXVal = valGetter(minXAttraction);
        const minYVal = valGetter(minYAttraction);
        const { best: recMinAttraction, } = currSummary;
        const { x: recMinXAttraction, y: recMinYAttraction, } = recMinAttraction;
        const recMinXVal = valGetter(recMinXAttraction);
        const recMinYVal = valGetter(recMinYAttraction);
        currSummary.target.push(tgtPack);
        currSummary.results.push(attractSummary);
        if (onJudgeAttractSummary(attractSummary, tgtPack, srcPack)) {
            do {
                if (minXVal > recMinXVal) {
                    break;
                }
                else if (minXVal === recMinXVal) {
                    if (minYVal > recMinYVal) {
                        break;
                    }
                }
                recMinAttraction.x = minXAttraction;
            } while (false);
            do {
                if (minYVal > recMinYVal) {
                    break;
                }
                else if (minYVal === recMinYVal) {
                    if (minXVal > recMinXVal) {
                        break;
                    }
                }
                recMinAttraction.y = minYAttraction;
            } while (false);
        }
        return currSummary;
    }, new Summary_1.default(srcPack, initialTargets, initialresults, initialAttraction));
    return summary;
};
exports.calcMultiAttractions = calcMultiAttractions;
const getOffsetOfAttractResult = function getOffsetOfAttractResult(result) {
    const { x: { alignment: xAlignment, rawVal: xRawVal, } = {}, y: { alignment: yAlignment, rawVal: yRawVal, } = {}, } = result;
    const offset = new Point_1.default(0, 0);
    if (Base_1.ALIGNMENT_X.includes(xAlignment)) {
        offset.x = xRawVal;
    }
    if (Base_1.ALIGNMENT_Y.includes(yAlignment)) {
        offset.y = yRawVal;
    }
    return offset;
};
exports.getOffsetOfAttractResult = getOffsetOfAttractResult;

},{"../../Rect":13,"../../Rect/Point":11,"../Base":2,"./AttractResult":4,"./Attraction":5,"./Distance":6,"./Summary":7}],9:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerEvent = exports.removeEventListener = exports.addEventListener = exports.getEvtClientXY = exports.generateAttractEventDetail = exports.generateDragEventDetail = void 0;
const Point_1 = __importDefault(require("../Rect/Point"));
const stdlib_1 = require("../stdlib");
const Base_1 = __importDefault(require("./Base"));
const calc_1 = require("./calc");
function generateDragEventDetail(dragEvent, data) {
    const { lastAttractSummary } = data;
    return {
        detail: {
            dragEvent,
            last: (stdlib_1.isset(lastAttractSummary)
                ? {
                    offset: data.lastOffset.clone(),
                    rectangle: data.self.rectangle.clone(),
                    attraction: lastAttractSummary.best.clone(),
                }
                : undefined),
        },
    };
}
exports.generateDragEventDetail = generateDragEventDetail;
function generateAttractEventDetail(attractSummary, nextRect = attractSummary.source.rectangle) {
    return {
        detail: {
            attractSummary: calc_1.cloneMultiAttractionsResult(attractSummary),
            nextStep: {
                offset: new Point_1.default(nextRect),
                rectangle: nextRect.clone(),
                attraction: attractSummary.best.clone(),
            },
        },
    };
}
exports.generateAttractEventDetail = generateAttractEventDetail;
function getEvtClientXY(evt) {
    if (evt instanceof MouseEvent) {
        return new Point_1.default(evt.clientX, evt.clientY);
    }
    if (evt instanceof TouchEvent) {
        const touch = evt.touches[0];
        return new Point_1.default(touch.clientX, touch.clientY);
    }
    throw new ReferenceError(`Invalid event: ${evt}`);
}
exports.getEvtClientXY = getEvtClientXY;
const addEventListener = function addEventListener(src, evtNames, caller) {
    (stdlib_1.isarray(evtNames) ? evtNames : [evtNames])
        .forEach((evtName) => {
        src.addEventListener(evtName, caller);
    });
    return src;
};
exports.addEventListener = addEventListener;
const removeEventListener = function removeEventListener(src, evtNames, caller) {
    (stdlib_1.isarray(evtNames) ? evtNames : [evtNames])
        .forEach((evtName) => {
        src.removeEventListener(evtName, caller);
    });
    return src;
};
exports.removeEventListener = removeEventListener;
const triggerEvent = function triggerEvent(src, evtName, options) {
    return (src instanceof Base_1.default
        ? src.triggerMagnetEvent(evtName, options)
        : false);
};
exports.triggerEvent = triggerEvent;

},{"../Rect/Point":11,"../stdlib":14,"./Base":2,"./calc":8}],10:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MagnetGroup = exports.Magnet = void 0;
const Base_1 = __importDefault(require("./Base"));
exports.MagnetGroup = Base_1.default;
const Block_1 = __importDefault(require("./Block"));
exports.Magnet = Block_1.default;

},{"./Base":2,"./Block":3}],11:[function(require,module,exports){
"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _x, _y;
Object.defineProperty(exports, "__esModule", { value: true });
const stdlib_1 = require("../stdlib");
const Rect_1 = __importDefault(require("./Rect"));
class Point {
    constructor(src = 0, y = 0) {
        _x.set(this, NaN);
        _y.set(this, NaN);
        if (Point.isPoint(src)) {
            return src.clone();
        }
        if (Rect_1.default.isRect(src)) {
            this.x = src.x;
            this.y = src.y;
        }
        else {
            const x = src;
            this.x = stdlib_1.isnum(x) ? x : 0;
            this.y = stdlib_1.isnum(y) ? y : 0;
        }
    }
    static isPoint(src) {
        return src instanceof this;
    }
    get x() { return __classPrivateFieldGet(this, _x); }
    set x(x) {
        if (!stdlib_1.isnum(x)) {
            throw new TypeError(`Invalid x: ${x}`);
        }
        __classPrivateFieldSet(this, _x, x);
    }
    get y() { return __classPrivateFieldGet(this, _y); }
    set y(y) {
        if (!stdlib_1.isnum(y)) {
            throw new TypeError(`Invalid y: ${y}`);
        }
        __classPrivateFieldSet(this, _y, y);
    }
    clone() {
        return new Point(this.x, this.y);
    }
}
exports.default = Point;
_x = new WeakMap(), _y = new WeakMap();

},{"../stdlib":14,"./Rect":12}],12:[function(require,module,exports){
"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _top, _right, _bottom, _left, _width, _height;
Object.defineProperty(exports, "__esModule", { value: true });
const stdlib_1 = require("../stdlib");
const Point_1 = __importDefault(require("./Point"));
const BIAS = 0.0000000001;
function isInBias(a, b) {
    return Math.abs(a - b) <= BIAS;
}
class Rect {
    constructor(src) {
        _top.set(this, NaN);
        _right.set(this, NaN);
        _bottom.set(this, NaN);
        _left.set(this, NaN);
        _width.set(this, NaN);
        _height.set(this, NaN);
        if (Rect.isRect(src)) {
            return src.clone();
        }
        const { x, y, top, right, bottom, left, width, height, } = src;
        let finalTop = 0;
        let finalRight = 0;
        let finalBottom = 0;
        let finalLeft = 0;
        let finalWidth = 0;
        let finalHeight = 0;
        if (stdlib_1.isset(right)) {
            if (!stdlib_1.isnum(right)) {
                throw new TypeError(`Invalid right: ${right}`);
            }
            finalRight = right;
        }
        if (stdlib_1.isset(x)) {
            if (!stdlib_1.isnum(x)) {
                throw new TypeError(`Invalid x: ${x}`);
            }
            else if (stdlib_1.isset(left)) {
                if (!stdlib_1.isnum(left)) {
                    throw new TypeError(`Invalid left: ${left}`);
                }
                else if (!isInBias(x, left)) {
                    throw new RangeError(`x(${x}) <> left(${left})`);
                }
            }
            finalLeft = x;
        }
        else if (stdlib_1.isset(left)) {
            if (!stdlib_1.isnum(left)) {
                throw new TypeError(`Invalid left: ${left}`);
            }
            finalLeft = left;
        }
        if (stdlib_1.isset(finalRight)) {
            if (stdlib_1.isset(finalLeft) && finalLeft > finalRight) {
                throw new RangeError(`x|left(${finalLeft}) > right(${finalRight})`);
            }
        }
        else if (!stdlib_1.isset(finalLeft)) {
            throw new ReferenceError('Must assign either x, left or right');
        }
        if (stdlib_1.isset(bottom)) {
            if (!stdlib_1.isnum(bottom)) {
                throw new TypeError(`Invalid bottom: ${bottom}`);
            }
            finalBottom = bottom;
        }
        if (stdlib_1.isset(y)) {
            if (!stdlib_1.isnum(y)) {
                throw new TypeError(`Invalid y: ${y}`);
            }
            else if (stdlib_1.isset(top)) {
                if (!stdlib_1.isnum(top)) {
                    throw new TypeError(`Invalid top: ${top}`);
                }
                else if (!isInBias(y, top)) {
                    throw new RangeError(`y(${y}) <> top(${top})`);
                }
            }
            finalTop = y;
        }
        else if (stdlib_1.isset(top)) {
            if (!stdlib_1.isnum(top)) {
                throw new TypeError(`Invalid top: ${top}`);
            }
            finalTop = top;
        }
        if (stdlib_1.isset(finalTop)) {
            if (stdlib_1.isset(finalBottom) && finalTop > finalBottom) {
                throw new RangeError(`y|top(${finalTop}) > bottom(${finalBottom})`);
            }
        }
        else if (!stdlib_1.isset(finalBottom)) {
            throw new ReferenceError('Must have either y, top or bottom');
        }
        if (stdlib_1.isset(width)) {
            if (!stdlib_1.isnum(width)) {
                throw new TypeError(`Invalid width: ${width}`);
            }
            else if (width < 0) {
                throw new RangeError(`width(${width}) < 0`);
            }
            else if (!stdlib_1.isset(finalRight)) {
                finalRight = finalLeft + width;
            }
            else if (!stdlib_1.isset(finalLeft)) {
                finalLeft = finalRight - width;
            }
            else if (!isInBias(finalLeft + width, finalRight)) {
                throw new RangeError(`right(${finalRight}) - x|left(${finalLeft}) <> width(${width})`);
            }
            finalWidth = width;
        }
        else if (!stdlib_1.isset(finalRight) || !stdlib_1.isset(finalLeft)) {
            throw new ReferenceError('Not enough info for width');
        }
        else {
            finalWidth = finalRight - finalLeft;
        }
        if (stdlib_1.isset(height)) {
            if (!stdlib_1.isnum(height)) {
                throw new TypeError(`Invalid height: ${height}`);
            }
            else if (height < 0) {
                throw new RangeError(`height(${height}) < 0`);
            }
            else if (!stdlib_1.isset(finalTop)) {
                finalTop = finalBottom - height;
            }
            else if (!stdlib_1.isset(finalBottom)) {
                finalBottom = finalTop + height;
            }
            else if (!isInBias(finalTop + height, finalBottom)) {
                throw new RangeError(`bottom(${finalBottom}) - y|top(${finalTop}) <> height(${height})`);
            }
            finalHeight = height;
        }
        else if (!stdlib_1.isset(finalTop) || !stdlib_1.isset(finalBottom)) {
            throw new ReferenceError('Not enough info for height');
        }
        else {
            finalHeight = finalBottom - finalTop;
        }
        __classPrivateFieldSet(this, _top, finalTop);
        __classPrivateFieldSet(this, _right, finalRight);
        __classPrivateFieldSet(this, _bottom, finalBottom);
        __classPrivateFieldSet(this, _left, finalLeft);
        __classPrivateFieldSet(this, _width, finalWidth);
        __classPrivateFieldSet(this, _height, finalHeight);
    }
    static isRect(src) {
        return src instanceof this;
    }
    get top() { return __classPrivateFieldGet(this, _top); }
    get right() { return __classPrivateFieldGet(this, _right); }
    get bottom() { return __classPrivateFieldGet(this, _bottom); }
    get left() { return __classPrivateFieldGet(this, _left); }
    get width() { return __classPrivateFieldGet(this, _width); }
    get height() { return __classPrivateFieldGet(this, _height); }
    get x() { return this.left; }
    get y() { return this.top; }
    offsetX(x = 0) {
        if (!stdlib_1.isnum(x)) {
            throw new TypeError(`Invalid x: ${x}`);
        }
        __classPrivateFieldSet(this, _left, this.left + x);
        __classPrivateFieldSet(this, _right, this.right + x);
        return this;
    }
    offsetY(y = 0) {
        if (!stdlib_1.isnum(y)) {
            throw new TypeError(`Invalid y: ${y}`);
        }
        __classPrivateFieldSet(this, _top, this.top + y);
        __classPrivateFieldSet(this, _bottom, this.bottom + y);
        return this;
    }
    offset(ref, y) {
        if (Point_1.default.isPoint(ref)) {
            this.offsetX(ref.x);
            this.offsetY(ref.y);
            return this;
        }
        const x = ref;
        this.offsetX(x);
        this.offsetY(y);
        return this;
    }
    moveToX(x = this.left) {
        if (!stdlib_1.isnum(x)) {
            throw new TypeError(`Invalid x: ${x}`);
        }
        this.offsetX(x - this.left);
        return this;
    }
    moveToY(y = this.top) {
        if (!stdlib_1.isnum(y)) {
            throw new TypeError(`Invalid y: ${y}`);
        }
        this.offsetY(y - this.top);
        return this;
    }
    moveTo(ref, y) {
        if (Point_1.default.isPoint(ref)) {
            this.moveToX(ref.x);
            this.moveToY(ref.y);
            return this;
        }
        const x = ref;
        this.moveToX(x);
        this.moveToY(y);
        return this;
    }
    clone() {
        return new Rect({
            top: this.top,
            right: this.right,
            bottom: this.bottom,
            left: this.left,
            width: this.width,
            height: this.height,
        });
    }
}
exports.default = Rect;
_top = new WeakMap(), _right = new WeakMap(), _bottom = new WeakMap(), _left = new WeakMap(), _width = new WeakMap(), _height = new WeakMap();

},{"../stdlib":14,"./Point":11}],13:[function(require,module,exports){
"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _rect, _raw;
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPack = exports.toRect = exports.Pack = void 0;
const stdlib_1 = require("../stdlib");
const Rect_1 = __importDefault(require("./Rect"));
class Pack {
    constructor(src, clone = false) {
        _rect.set(this, void 0);
        _raw.set(this, void 0);
        if (Pack.isPack(src)) {
            const { rectangle } = src;
            __classPrivateFieldSet(this, _rect, clone ? rectangle.clone() : rectangle);
            __classPrivateFieldSet(this, _raw, src.raw);
        }
        else {
            __classPrivateFieldSet(this, _rect, toRect(src));
            __classPrivateFieldSet(this, _raw, src);
        }
    }
    static isPack(src) {
        return src instanceof this;
    }
    get raw() { return __classPrivateFieldGet(this, _raw); }
    get rectangle() { return __classPrivateFieldGet(this, _rect); }
    clone() {
        return new Pack(this, true);
    }
}
exports.Pack = Pack;
_rect = new WeakMap(), _raw = new WeakMap();
function toRect(src) {
    if (!stdlib_1.isset(src)) {
        throw new ReferenceError('Not assign source');
    }
    else if (Rect_1.default.isRect(src)) {
        return src;
    }
    else if (Pack.isPack(src)) {
        return src.rectangle;
    }
    else if (src instanceof Window || src instanceof Document) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        return new Rect_1.default({
            x: 0,
            y: 0,
            top: 0,
            right: width,
            bottom: height,
            left: 0,
            width,
            height,
        });
    }
    else if (src instanceof Element) {
        const { borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth, boxSizing, } = stdlib_1.getStyle(src);
        const { top, right, bottom, left, width: fullWidth, height: fullHeight, } = src.getBoundingClientRect();
        const calcBorder = !/\bborder-box\b/i.test(boxSizing);
        const borderTop = calcBorder ? stdlib_1.tonum(borderTopWidth) : 0;
        const borderRight = calcBorder ? stdlib_1.tonum(borderRightWidth) : 0;
        const borderBottom = calcBorder ? stdlib_1.tonum(borderBottomWidth) : 0;
        const borderLeft = calcBorder ? stdlib_1.tonum(borderLeftWidth) : 0;
        const width = fullWidth - borderRight - borderLeft;
        const height = fullHeight - borderTop - borderBottom;
        src;
        if (src === document.body) {
            return new Rect_1.default({
                top: borderTop,
                right: width,
                bottom: height,
                left: borderLeft,
                width,
                height,
            });
        }
        return new Rect_1.default({
            top: top + borderTop,
            right: right - borderRight,
            bottom: bottom - borderBottom,
            left: left + borderLeft,
            width,
            height,
        });
    }
    return new Rect_1.default(src);
}
exports.toRect = toRect;
function toPack(src) {
    return (Pack.isPack(src)
        ? src
        : new Pack(src));
}
exports.toPack = toPack;

},{"../stdlib":14,"./Rect":12}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isinEnum = exports.getStyle = exports.objMap = exports.objReduce = exports.objValues = exports.objKeys = exports.toarray = exports.arrayable = exports.isarray = exports.isobj = exports.isfunc = exports.toint = exports.isint = exports.tonum = exports.isnum = exports.tostr = exports.isstr = exports.isnull = exports.isset = void 0;
function isset(src) {
    return src !== undefined;
}
exports.isset = isset;
function isnull(src) {
    return src === null;
}
exports.isnull = isnull;
function isstr(src) {
    return (typeof src === 'string'
        || (isset(src) && src instanceof String));
}
exports.isstr = isstr;
function tostr(src) {
    return `${src}`;
}
exports.tostr = tostr;
function isnum(src) {
    return !Number.isNaN(src);
}
exports.isnum = isnum;
function tonum(src) {
    return parseFloat(src);
}
exports.tonum = tonum;
function isint(src) {
    return isnum(src) && src === (src | 0);
}
exports.isint = isint;
function toint(src) {
    return (isnum(src)
        ? (src | 0)
        : parseInt(src, 10));
}
exports.toint = toint;
function isfunc(src) {
    return typeof src === 'function';
}
exports.isfunc = isfunc;
function isobj(src) {
    return typeof src === 'object';
}
exports.isobj = isobj;
function isarray(src) {
    return Array.isArray(src);
}
exports.isarray = isarray;
function arrayable(src) {
    return (isobj(src)
        && isint(src.length)
        && src.length >= 0);
}
exports.arrayable = arrayable;
function toarray(src) {
    return (isstr(src) || arrayable(src)
        ? [...src]
        : [src]);
}
exports.toarray = toarray;
function objKeys(obj) {
    return Object.keys(obj);
}
exports.objKeys = objKeys;
function objValues(obj) {
    return objKeys(obj).map((key) => obj[key]);
}
exports.objValues = objValues;
function objReduce(obj, func, initial) {
    return objKeys(obj).reduce((past, key) => (func(past, obj[key], key, obj)), initial);
}
exports.objReduce = objReduce;
function objMap(obj, func, self = this) {
    return objReduce(obj, (past, val, key) => (Object.assign(Object.assign({}, past), { [key]: func.call(self, val, key, obj) })), {});
}
exports.objMap = objMap;
function getStyle(dom) {
    return ((dom === null || dom === void 0 ? void 0 : dom.currentStyle)
        || (window === null || window === void 0 ? void 0 : window.getComputedStyle(dom))
        || (dom === null || dom === void 0 ? void 0 : dom.style));
}
exports.getStyle = getStyle;
function isinEnum(src, e) {
    return isobj(e) && src in e;
}
exports.isinEnum = isinEnum;

},{}]},{},[1]);
