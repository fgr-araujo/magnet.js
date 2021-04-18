# Magnet.js

Magnet.js is a JavaScript library making HTML elements attractable with others in the same group.

## Demo

## Install

### Node.js

Install with npm:

```bash
npm install @lf2com/magnet.js

# Or install from GitHub
npm install https://github.com/lf2com/magnet.js
# The same as above
npm install lf2com/magnet.js
```

Then we can use `@lf2com/magnet.js`:

```js
import '@lf2com/magnet.js';
// Or
require('@lf2com/magnet.js');
```

### Browser

Download the [**lastest build**][lastest-build] or directly link [magnet.min.js][lastest-js] from GitHub:

```html
<head>
  ...
  <script src="PATH/TO/magnet.min.js"></script>
  ...
</head>

<body>
  ...
  <magnet-block>
    Here we go
  </magnet-block>
  ...
</body>
```

## Build

Here we use [**Browserify**][browserify] to build **magnet.js** and use [**UglifyJS**][uglifyjs] to minify as **magnet.min.js**:

```sh
# Build manget.js
npm run build:raw

# Build both magnet.js and magnet.min.js
npm run build
```

## Usage

There are 2 HTML custom elements declared in Magnet.js: [`<manget-block>`][magnet-block] and [`<magnet-pack>`][magnet-pack]:

### Magnet Block

`<magnet-block>` can be dragged and attract other `<manget-block>`.

[demo][demo-hello-block]

```html
<!-- simple magnet block -->
<magnet-block mg-attract-distance="10">
  <div style="padding:1em; background: #fcc; display: inline-block;">
    Hello Magnet.js
  </div>
</magnet-block>

<!-- has larger attract distance -->
<magnet-block mg-attract-distance="25">
  <div style="padding:1em; background: #cfc; display: inline-block;">
    Here is a larger magnet
  </div>
</magnet-block>

<!-- only for attracting due to "mg-unmovable" -->
<magnet-block mg-unmovable>
  <div style="padding:1em; background: #ccf; display: inline-block;">
    You cannot drag me
  </div>
</magnet-block>
```

### Magnet Pack

`<magnet-pack>` is a wrapper managing `<manget-block>` inside it.

If a `<magnet-block>` doesn't has specific [magnet attibute][magnet-attribute], it would reference to the nearest parent `<magnet-pack>` that has the attribute.

[demo][demo-hello-group]

```html
<magnet-pack
  style="width: 500px; height: 300px; border: 1px solid #000;"
  mg-group="A"
  mg-cross-prevent="parent"
  mg-attract-distance="10"
>
  <!-- group member and reference attrs from parent -->
  <magnet-block>
    <div style="padding:1em; background: #fcc; display: inline-block;">
      Group member
    </div>
  </magnet-block>

  <!-- group member not walled -->
  <magnet-block mg-cross-prevent="">
    <div style="padding:1em; background: #cfc; display: inline-block;">
      I can break wall
    </div>
  </magnet-block>
  
  <!-- no other group member for attracting -->
  <magnet-block mg-group="B" mg-attract-distance="25">
    <div style="padding:1em; background: #ccc; display: inline-block;">
      Never attract anyone
    </div>
  </magnet-block>
</magnet-pack>
  
<!-- not wrapped by group so it can break the wall -->
<magnet-block mg-group="A" mg-attract-distance="15">
  <div style="padding:1em; background: #ccf; display: inline-block;">
    Outside member
  </div>
</magnet-block>
```

## Attributes

We can assign features for both [`<manget-block>`][magnet-block] and [`<magnet-pack>`][magnet-pack] with following attributes:

| Name |  Description |
| :-: | :- |
| [mg-disabled][mg-attr-disabled] | No dragging and attracting |
| [mg-group][mg-attr-group] | Group of magnet |
| [mg-unattractable][mg-attr-unattractable] | No attracting |
| [mg-unmovable][mg-attr-unmovable]| No dragging |
| [mg-attract-distance][mg-attr-attract-distance] | Distance to attract others |
| [mg-align-to][mg-attr-align-to] | Alignment of this block |
| [mg-align-to-parent][mg-attr-align-to-parent] | Alignment to parent element |
| [mg-cross-prevent][mg-attr-cross-prevent] | Targets not allow to cross |

### mg-disabled

> Type: _any_
>
> Default: _**null**_

Once we assign `mg-disabled` to `<magnet-block>`, it would be unable to be dragged and attract others. Also, it could not be attracted by others.

If we assign `mg-disabled` to `<magnet-pack>`, all the `<magnet-block>` of it would be unable to do anything.

_**`mg-disabled` effects as the same as setting both [`mg-unattractable`][mg-attr-unattractable] and [`mg-unmovable`][mg-attr-unmovable].**_

```html
<magnet-pack mg-attract-distance="15">
  <!-- block can be dragged and attract -->
  <magnet-block>
    <div style="padding: 1em; background: #fcc; display: inline-block;">
      Enabled block
    </div>
  </magnet-block>

  <!-- block can be dragged and attract -->
  <magnet-block>
    <div style="padding: 1em; background: #cfc; display: inline-block;">
      Enabled block
    </div>
  </magnet-block>

  <!-- unable to be dragged and attract -->
  <magnet-block mg-disabled>
    <div style="padding: 1em; background: #ccf; display: inline-block;">
      Disabled block
    </div>
  </magnet-block>
</magnet-pack>
```

### mg-group

> Type: _string_
>
> Default: _**null**_

To prevent from attracting `<magnet-block>` we don't want, we can specify groups for them.

Once a `<magnet-block>` belongs to a group, it could only interactive with others in the same group.

A `<magnet-block>` without group can attract any `<magnet-block>` even if they already have their own group.

```html
<magnet-pack mg-attract-distance="15">
  <!-- block in group A, only active with group A -->
  <magnet-block mg-group="A">
    <div style="padding: 1em; background: #fcc; display: inline-block;">
      Block A1
    </div>
  </magnet-block>

  <!-- block in group A, only active with group A -->
  <magnet-block mg-group="A">
    <div style="padding: 1em; background: #cfc; display: inline-block;">
      Block A2
    </div>
  </magnet-block>

  <!-- block in group B, only active with group B -->
  <magnet-block mg-group="B">
    <div style="padding: 1em; background: #ccf; display: inline-block;">
      Block B1
    </div>
  </magnet-block>

  <!-- block in no group, can attract others -->
  <magnet-block>
    <div style="padding: 1em; background: #ffc; display: inline-block;">
      Block any
    </div>
  </magnet-block>
</magnet-pack>
```

### mg-unattractable

> Type: _any_
>
> Default: **null**

This attribute makes `<magnet-block>` unable to attract others and be attracted by others. But it is still draggable.

```html
<magnet-pack mg-attract-distance="15">
  <!-- attractable -->
  <magnet-block>
    <div style="padding: 1em; background: #fcc; display: inline-block;">
      Block attractable
    </div>
  </magnet-block>

  <!-- attractable -->
  <magnet-block>
    <div style="padding: 1em; background: #cfc; display: inline-block;">
      Block attractable
    </div>
  </magnet-block>

  <!-- unattractable -->
  <magnet-block mg-unattractable>
    <div style="padding: 1em; background: #ccf; display: inline-block;">
      Block unattractable
    </div>
  </magnet-block>
</magnet-pack>
```

### mg-unmovable

> Type: _any_
>
> Default: **null**

Disallow `<magnet-block>` to be dragged. But it still can be attracted.

```html
<magnet-pack mg-attract-distance="15">
  <!-- movable -->
  <magnet-block>
    <div style="padding: 1em; background: #fcc; display: inline-block;">
      Block movable
    </div>
  </magnet-block>

  <!-- movable -->
  <magnet-block>
    <div style="padding: 1em; background: #cfc; display: inline-block;">
      Block movable
    </div>
  </magnet-block>

  <!-- unmovable -->
  <magnet-block mg-unmovable>
    <div style="padding: 1em; background: #ccf; display: inline-block;">
      Block unmovable
    </div>
  </magnet-block>
</magnet-pack>
```

### mg-attract-distance

> Type: _number (px)_
>
> Default: **0**

Define the distance a `<magnet-block>` can attract others on being dragged. This distance only effects how far it sense others.

_**If assign a negative value, it would be the same as setting `0`, which has no attract effect when drag it.**_

```html
<magnet-pack mg-attract-distance="15">
  <!-- inherit attract distance 15 -->
  <magnet-block>
    <div style="padding: 1em; background: #fcc; display: inline-block;">
      Block default 15
    </div>
  </magnet-block>

  <!-- attract distance 30 -->
  <magnet-block mg-attract-distance="30">
    <div style="padding: 1em; background: #cfc; display: inline-block;">
      Block 30
    </div>
  </magnet-block>
  
  <!-- attract distance 10 -->
  <magnet-block mg-attract-distance="10">
    <div style="padding: 1em; background: #ccf; display: inline-block;">
      Block 10
    </div>
  </magnet-block>
  
  <!-- attract distance -10, unable to attract anyone -->
  <magnet-block mg-attract-distance="-10">
    <div style="padding: 1em; background: #ffc; display: inline-block;">
      Block -10
    </div>
  </magnet-block>
</magnet-pack>
```

### mg-align-to

> Type: **outer** | **inner** | **center** | **extend**
>
> Default: **outer|inner|center|extend**

Determine how `<magnet-block>` align to others.

| Name | Description |
| :-: | :- |
| outer | Align to edges from outside |
| inner | Align to edges from inside |
| center | Align to extending line of x/y center |
| extend | Align to extending line of outer/inner edges. **Must assign any of `outer`\|`inner` for reference** |

```html
<magnet-pack mg-attract-distance="15">
  <!-- align to inner -->
  <magnet-block mg-align-to="inner">
    <div style="padding: 1em; background: #fcc; display: inline-block;">
      Block inner
    </div>
  </magnet-block>
  
  <!-- align to outer -->
  <magnet-block mg-align-to="outer">
    <div style="padding: 1em; background: #cfc; display: inline-block;">
      Block outer
    </div>
  </magnet-block>
  
  <!-- align to center -->
  <magnet-block mg-align-to="center">
    <div style="padding: 1em; background: #ccf; display: inline-block;">
      Block center
    </div>
  </magnet-block>

  <!-- align to outer with extending line -->
  <magnet-block mg-align-to="outerline|outer">
    <div style="padding: 1em; background: #ffc; display: inline-block;">
      Block outer extend
    </div>
  </magnet-block>
</magnet-pack>
```

### mg-align-to-parent

> Type: **inner** | **center**
>
> Default: **null**

Define how `<magnet-block>` align to its parent element.

_**Since the target is parent element, only accept `inner`|`center` for aligning.**_

| Name | Description |
| :-: | :- |
| inner | Align to edges from inside |
| center | Align to x/y center |

```html
<!-- disable blocks to attract each other -->
<magnet-pack mg-attract-distance="15" mg-align-to="">
  <div style="width: 500px; height: 300px; border: 1px solid #000;">
    <!-- align to parent inner -->
    <magnet-block mg-align-to-parent="inner">
      <div style="padding: 1em; background: #fcc; display: inline-block;">
        Block inner
      </div>
    </magnet-block>
    
    <!-- align to parent center -->
    <magnet-block mg-align-to-parent="center">
      <div style="padding: 1em; background: #cfc; display: inline-block;">
        Block center
      </div>
    </magnet-block>
    
    <!-- align to parent inner and center -->
    <magnet-block mg-align-to-parent="inner|center">
      <div style="padding: 1em; background: #ccf; display: inline-block;">
        Block all
      </div>
    </magnet-block>
  </div>
</magnet-pack>
```

### mg-cross-prevent

> Type: **parent**
>
> Default: **null**

Prevent `<magnet-block>` to cross specific targets on being dragged.

_**Currently only support `parent`**_

| Name | Description |
| :-: | :- |
| parent | Not to go out of parent element |

```html
<!-- prevent children blocks to go out -->
<magnet-pack
  mg-attract-distance="15"
  mg-align-to=""
  mg-cross-prevent="parent"
>
  <div style="width: 500px; height: 300px; border: 1px solid #000">
    <!-- align to parent inner -->
    <magnet-block mg-align-to-parent="inner">
      <div style="padding: 1em; background: #fcc; display: inline-block;">
        Block inner
      </div>
    </magnet-block>
    
    <!-- align to parent center -->
    <magnet-block mg-align-to-parent="center">
      <div style="padding: 1em; background: #cfc; display: inline-block;">
        Block center
      </div>
    </magnet-block>
    
    <!-- align to parent inner and center -->
    <magnet-block mg-align-to-parent="inner|center">
      <div style="padding: 1em; background: #ccf; display: inline-block;">
        Block all
      </div>
    </magnet-block>
  </div>
</magnet-pack>
```

## Events

We defined custom events of actions for `<magnet-block>`:

### Drag Events

Include actions relative to drag:

| Name | Description |
| :-: | :- |
| [mg-start][mg-evt-start] | Start dragging |
| [mg-move][mg-evt-move] | Move on dragging |
| [mg-end][mg-evt-end] | End of dragging |

`event.detail` of drag events:

| Name | Type | Description |
| :-: | :-: | :- |
| originEvent | _Event_ | Origin mouse/touch event |
| last | [_BlockState_][mg-type-BlockState] | Info of last state |

#### mg-start

This event would be triggered when mouse/touch start of dragging.

#### mg-move

Trigger on moving with dragging.

#### mg-end

When end of mouse/touch drag event.

```js
const onMgMove = (evt) => {
  console.log('mg-move', evt.detail);
};
const onMgEnd = ({ target, detail }) => {
  target.removeEventListener('mg-move', onMgMove);
  target.removeEventListener('mg-end', onMgEnd);

  console.log('mg-end', detail);
};

const block = document.getElementById('block-id');

block.addEventListener('mg-start', ({ target, detail }) => {
  target.addEventListener('mg-move', onMgMove);
  target.addEventListener('mg-end', onMgEnd);

  console.log('mg-start', detail);
});
```

### Attract Events

Define actions of attracting and being attracted.

_**Some event can be canceled by calling `event.preventDefault()` and the default action would not execute.**_

| Name | Cancelable | Description |
| :-: | :-: | :- |
| [mg-attract][mg-evt-attract] | yes | Someone is in range of sense |
| [mg-attracted][mg-evt-attracted] | yes | In range of someone |
| [mg-unattract][mg-evt-unattract] | yes | Away from sensed target |
| [mg-unattracted][mg-evt-unattracted] | yes | Away from the range it last in |
| [mg-attractmove][mg-evt-attractmove] | no | Someone has been in range and we still move |
| [mg-attractedmove][mg-evt-attractedmove] | no | We have been in range of someone and it still moves |

`event.detail` of drag events:

| Name | Type | Description |
| :-: | :-: | :- |
| attractSummary | [_MultiAttractResult_][mg-type-multiAttractResult] | Summary of attractions |
| next | [_BlockState_][mg-type-BlockState] | Info of next state |

#### mg-attract

Trigger when a block gets a new position and there is someone in the range of [attract distance][mg-attr-attract-distance].

```js
block.addEventListener('mg-attract', (evt) => {
  if (DONT_WANT_TO_ATTRACT) {
    evt.preventDefault(); // not to attract someone
  }
});
```

#### mg-attracted

When a block is in the range of someone's [attract distance][mg-attr-attract-distance].

```js
block.addEventListener('mg-attracted', (evt) => {
  if (DONT_WANT_TO_BE_ATTRACTED) {
    evt.preventDefault(); // not to be attracted by someone
  }
});
```

#### mg-unattract

#### mg-unattracted

#### mg-attractmove

#### mg-attractedmove





TODO:

* inner alignment not check the nearer dragging point

* walled blocks not show attract line when trying to break the wall

* should change handleMagnetDragMove to a handler of judging attraction

* preventDefault on attractmove and attractedmove, should do nothing?

* preventDefault on unattract and unattracted, should keep attach on last target




#### BlockState

Define state of `<magnet-block>`:

| Name | Type | Description |
| :-: | :-: | :- |
| offset | [_Point_][mg-type-point] | Offset from origin position |
| rectangle | [_Rect_][mg-type-rect] | Rectangle info |
| attraction | [_Attraction_][mg-type-attraction] | Attraction info |

#### Point

#### Rect

#### Attraction

#### MultiAttractResult



### Events of Magnet

Magnet supports the following events:

| _Name_ | _Description_ | _Alias_ |
| :-: | :- | :-: |
| **magnetstart** | when the last result has no any attract but now it does | `start`, `magnetenter`, `enter` |
| **magnetend** | when the last result has any attract but now it doesn't | `end`, `magnetleave`, `leave` |
| **magnetchange** | when any change of attract, including start/end and the changes of attracted alignment properties | `change` |

#### Arguments of Magnet Event

Each event has the following members in the detail of event object:

| _Property_ | _Type_ | _Description_ |
| :-: | :-: | :- |
| **source** | _DOM_ | HTML element that is dragged |
| **x** | _Object_ | [Attract info](#attract-info) of x-axis, `null` if no attract |
| **y** | _Object_ | [Attract info](#attract-info) of y-axis, `null` if no attract |

#### .on(eventNames, functions)

Add event listener

```js
magnet.on('magnetenter', function(evt) {
  let detail = evt.detail;
  console.log('magnetenter', detail); // detail info of attract elements
  console.log('source', detail.source); // current HTML element
  console.log('targets', detail.x, detail.y); // current attracted of both axises
});

magnet.on('magnetleave', function(evt) {
  let detail = evt.detail;
  console.log('magnetleave', detail);
  console.log('source', detail.source);
  console.log('targets', detail.x, detail.y); // the last attracted of both axises
});

magnet.on('magnetchange', function(evt) {
  let detail = evt.detail;
  console.log('magnetchange', detail);
  console.log('source', detail.source);
  console.log('targets', detail.x, detail.y); // the newest attracted of both axises
});

// the same as above
magnet.on('magnetstart', function(evt) {
  // do something
}).on('magnetchange', function(evt) {
  // do something
}).on('magnetend', function(evt) {
  // do something
});
```

> _**jQuery**_
>
> #### [$magnet.on(eventNames, functions)](#oneventnames-functions)

#### .off(eventNames)

Remove event listeners

```js
magnet.off('magnetenter magnetleave magnetchange'); // remove event listeners

// the same as above
magnet
  .off('magnetenter')
  .off('magnetleave')
  .off('magnetchange');
```

> _**jQuery**_
>
> #### [$magnet.off(eventNames)](#offeventnames)

### Events of magnet members

Magnet members supports the following events:

| _Name_ | _Target_ | _description_ |
| :-: | :-: | :- |
| [**attract**](#arguments-of-attractunattract) | forcused | Attract to other members |
| [**unattract**](#arguments-of-attractunattract) | focused | Unattract from other members |
| [**attracted**](#arguments-of-attractedunattracted) | others | Attracted by the focused member |
| [**unattracted**](#arguments-of-attractedunattracted) | others | Unattracted by the focused member |
| [**attractstart**](#arguments-of-attractstartattractend) | focused | Start of dragging |
| [**attractend**](#arguments-of-attractstartattractend) | focused | End of dragging |
| [**attractmove**](#arguments-of-attractmove) | focused | Moving of dragging |

#### Arguments of `attract`/`unattract`

Events of `attract` and `unattract` have the following members in the detail of event object:

| _Property_ | _Type_ | _Description_ |
| :-: | :-: | :- |
| **x** | _Object_ | [Attract info](#attract-info) of x-axis, `null` if no attract |
| **y** | _Object_ | [Attract info](#attract-info) of y-axis, `null` if no attract |

```js
let elem = document.querySelector('.block');
magnet.add(elem);

function onAttract(evt) {
  let detail = evt.detail;
  console.log('attract', detail); // detail info of attract elements
  console.log('targets', detail.x, detail.y); // current attracted of both axises
}
function onUnattract(evt) {
  let detail = evt.detail;
  console.log('unattract', detail);
  console.log('targets', detail.x, detail.y); // the last attracted of both axises
}

// add event listener
elem.addEventListener('attract', onAttract);
elem.addEventListener('unattract', onUnattract);

// remove event listener
elem.removeEventListener('attract', onAttract);
elem.removeEventListener('unattract', onUnattract);
```

> _**jQuery**_
>
> ```js
> // the same as above
> $(elem)
>   .on('attract', onAttract)
>   .on('unattract', onUnattract);
>
> $(elem)
>   .off('attract unattract');
> ```

#### Arguments of `attracted`/`unattracted`

Events of `attracted` and `unattracted` have the target member in the detail of event object

```js
function onAttracted(evt) {
  let dom = evt.detail;
  console.log('attracted', dom); // be attracted by dom
}
function onUnattracted(evt) {
  let dom = evt.detail;
  console.log('unattracted', dom); // be unattracted by dom
}

// add event listener
elem.addEventListener('attracted', onAttracted);
elem.addEventListener('unattracted', onUnattracted);

// remove event listener
elem.removeEventListener('attracted', onAttracted);
elem.removeEventListener('unattracted', onUnattracted);
```

> _**jQuery**_
>
> ```js
> // the same as above
> $(elem)
>   .on('attracted', onAttracted)
>   .on('unattracted', onUnattracted);
>
> $(elem).off('attracted unattracted');
> ```

#### Arguments of `attractstart`/`attractend`

```js
function onAttractStart(evt) {
  let rect = evt.detail;
  console.log('attract start', rect); // rectangle of dom
}
function onAttractEnd(evt) {
  let rect = evt.detail;
  console.log('attract end', rect); // rectangle of dom
}

// add event listener
elem.addEventListener('attractstart', onAttractStart);
elem.addEventListener('attractend', onAttractEnd;

// remove event listener
elem.removeEventListener('attractstart', onAttractStart);
elem.removeEventListener('attractend', onAttractEnd
```

> _**jQuery**_
>
> ```js
> // the same as above
> $(elem)
>   .on('attractstart', onAttractStart)
>   .on('attractend', onAttractEnd);
>
> $(elem).off('attractstart attractend');
> ```

#### Arguments of `attractmove`

> **NOTICE: Call `preventDefault()` to ignore attraction if need**

```js
function onAttractMove(evt) {
  let { rects, attracts } = evt.detail;
  let { origin, target } = rects;
  let { current, last } = attracts;
  
  // do something
  // ...

  evt.preventDefault(); // call this to ignore attraction if need
}

elem.addEventListener('attractmove', onAttractMove); // add event listener
elem.removeEventListener('attractmove', onAttractMove); // remove event listener
```

> _**jQuery**_
>
> ```js
> // the same as above
> $(elem).on('attractmove', onAttractMove);
>
> $(elem).off('attractmove');
> ```

### Check Attracting Result

Check the relationships between `source` and all the other group members

#### .check(sourceDOM[, sourceRect[, alignments]])

> _Default `sourceRect` is the [rectangle](#rectangle-object) of `sourceDOM`_
>
> _Default `alignments` is the [outer/inner/center](#alignments) settings of magnet_

#### Parameter of Check Result

| _Property_ | _Type_ | _Description_ |
| :-: | :-: | :- |
| **source** | _Object_ | [Element object](#element-object) |
| **parent** | _Object_ | [Element object](#element-object) |
| **targets** | _Array_ | Array of [measurement result object](#measurement-result-object) |
| **results** | _Object_ | Object with [alignment properties](#alignment-properties) and the values are array of [measurement results](#measurement-result-object) |
| **rankings** | _Object_ | Object as `results` but each property is sorted from near to far |
| **mins** | _Object_ | Object with [alignment properties](#alignment-properties) and the values are the minimum value of distance |
| **maxs** | _Object_ | Object with [alignment properties](#alignment-properties) and the values are the maximum value of distance |

```js
magnet.add(elem);
magnet.check(elem, ['topToTop', 'bottomToBottom']); // get the result of 'topToTop' and 'bottomToBottom' between the other members

// the same as above
magnet.check(elem, elem.getBoundingClientRect(), ['topToTop', 'bottomToBottom']);
```

> _**jQuery**_
>
> #### [$magnet.check(sourceDOM[, sourceRect[, alignments]])](#checksourcedom-sourcerect-alignments)

### Handle Rectangle Position of Element

Change the position of target member for the input position with checking the attracting relationships between `source` and all the other group members

#### .handle(sourceDOM[, sourceRect[, attractable]])

> _Default `sourceRect` is the [rectangle](#rectangle-object) of `sourceDOM`_
>
> _Default `attractable` is the value of [attractable](#attractable)_

```js
let { top, right, bottom, left } = elem.getBoundingClientRect();
let offset = {
  x: 15,
  y: 10
};
let rect = {
  top: (top-offset.y),
  right: (right-offset.x),
  bottom: (bottom-offset.y),
  left: (left-offset.x),
};
magnet.add(elem);
magnet.handle(elem, rect, true); // move the member to the new rectangle position with the attracting relationship, return this
```

> _**jQuery**_
>
> #### [$magnet.handle(sourceDOM[, sourceRect[, attractable]])](#handlesourcedom-sourcerect-attractable)

### Set Rectangle Position of Member

Directly change the position of member that is faster than `.handle(...)`

#### .setMemberRectangle(sourceDOM[, sourceRect[, useRelativeUnit]])

> _Default `sourceRect` is the [rectangle](#rectangle-object) of `sourceDOM`_
>
> _Default `useRelativeUnit` is the value of [`.getUseRelativeUnit()`](#use-relative-unit)_

```js
let { top, right, bottom, left } = elem.getBoundingClientRect();

magnet.setMemberRectangle(elem, rect);
```

### Before/After/Do Applying Rectangle Position

The group passes the info to target function before/after/do applying the change to target element

> **NOTICE: The function will be called with [rectangle infos](#rectangle-infos) and [attract infos](#attract-infos) as long as dragging the target element**

#### Rectangle Infos

| _Property_ | _Type_ | _Description_ |
| :-: | :-: | :- |
| **origin** | _Object_ | Origin [rectangle object](#rectangle-object) |
| **target** | _Object_ | Target [rectangle object](#rectangle-object) |

#### Attract Infos

| _Property_ | _Type_ | _Description_ |
| :-: | :-: | :- |
| **current** | _Object_ | Current [attract info](#attract-info)s of x/y axises |
| **last** | _Object_ | Last [attract info](#attract-info)s of x/y axises |

#### .beforeAttract = function(targetDom rectangleInfos, attractInfos)

Set to a function for confirming the change

| _Value_ | _Description_ |
| :-: | :- |
| `false` | Apply the original rectangle without attraction |
| `rectangle` | [Rectangle object](#rectangle-object) to apply on the target element |

```js
function beforeAttractFunc(dom, { origin, target }, { current, last }) {
  console.log(this); // manget

  if (MAKE_SOME_CHANGES) {
    // apply other rectangle info
    return {
      top: (target.top - 1),
      right: (target.right + 1),
      bottom: (target.bottom + 1),
      left: (target.left - 1),
    };
  } else if (NO_ATTRACTION) {
    return false; // ignore attraction
  } else if (STILL_NO_ATTRACTION) {
    return origin; // the same as no attraction
  }

  // if went here, it would apply default change
};

magnet.beforeAttract = beforeAttractFunc; // set function
console.log(magnet.beforeAttract); // print function

magnet.beforeAttract = null; // unset function
```

> _**jQuery**_
>
> #### [$magnet.beforeAttract(function(targetDom, rectangleInfos, attractInfos)?)](#beforeattract--functiontargetdom-rectangleinfos-attractinfos)
>
> ```js
> $magnet.beforeAttract(beforeAttractFunc); // set function
> $magnet.beforeAttract(); // get beforeAttractFunc
>
> $magnet.beforeAttract(null); // unset function (input non-function value)
> ```

#### .doAttract = function(targetDom, rectangleInfos, attractInfos)

Set the displacement handly which means the user has to set the style of DOM to apply the position change if need

```js
magnet.doAttract = function(dom, { origin, target }, { current, last }) {
  const { top, right, bottom, left } = origin;
  const { x, y } = current;
  const px = (p) => `${p}px`;

  if (x && y && x.element === y.element) {
    // attract current targets
    const elem = x.element;
    const { width, height } = x.rect;
    const move = (type) => {
      switch (type) {
        case 'topToTop': return elem.style.top = px(top);
        case 'rightToRight': return elem.style.left = px(right-width);
        case 'bottomToBottom': return elem.style.top = px(bottom-height);
        case 'leftToLeft': return elem.style.left = px(left);
        case 'topToBottom': return elem.style.top = px(top-height);
        case 'bottomToTop': return elem.style.top = px(bottom);
        case 'rightToLeft': return elem.style.left = px(right);
        case 'LeftToRight': return elem.style.left = px(left-width);
        case 'xCenter': return elem.style.left = px((right+left-width)/2);
        case 'yCenter': return elem.style.top = px((top+bottom-height)/2);
      }
    }
    move(x.type);
    move(y.type);
  }

  // keep original position
  dom.style.top = px(top);
  dom.style.left = px(left);
});
```

> _**jQuery**_
>
> #### [$magnet.doAttract(function(targetDom, rectangleInfos, attractInfos)?)](#doattract--functiontargetdom-rectangleinfos-attractinfos)

#### .afterAttract = function(targetDom, rectangleInfos, attractInfos)

See what changed after attracting

> _**jQuery**_
>
> #### [$magnet.afterAttract(function(targetDom, rectangleInfos, attractInfos)?)](#afterattract--functiontargetdom-rectangleinfos-attractinfos)

## Usage of Rectangle

### Check Rectangle

#### Magnet.isRect(rect)

Check if `rect` is a rectangle like object with the following object members and rules:

| _Property_ | _Rule_ |
| :-: | :-: |
| **top** | `<= bottom` |
| **right** | `>= left` |
| **bottom** | `>= top` |
| **left** | `<= right` |
| **width** | `= right - left` |
| **height** | `= bottom - top` |
| **x** _(optional)_ | `= left` |
| **y** _(optional)_ | `= top` |

> **NOTICE: Default use `0.0000000001` for bias of calculation**

```js
let rect = { top: 1, right: 2, bottom: 3, left: 4 };
Magnet.isRect(rect); // false: right < left
rect.right = 5;
Magnet.isRect(rect); // true

rect.x = 3;
Magnet.isRect(rect); // false: x != left
rect.x = rect.left;

rect.width = 2;
Magnet.isRect(rect); // false: width != (right - left)
```

### Standardize Rectangle

#### Magnet.stdRect(rect)

Return a [rectangle object](#rectangle-object) if `rect` is a HTML element or a valid rectangle like object:

| _Property_ | _Rule_ |
| :-: | :- |
| **top** | Inherit from `rect` |
| **right** | Inherit from `rect` |
| **bottom** | Inherit from `rect` |
| **left** | Inherit from `rect` |
| **width** | Inherit from `rect` or set to `right - left` |
| **height** | Inherit from `rect` or set to `bottom - top` |
| **x** | Inherit from `rect` or set to `left` |
| **y** | Inherit from `rect` or set to `top` |

```js
Magnet.stdRect(rect); // get a rectangle object
```

### Measure Distance between Rectangles

#### Magnet.measure(source, target[, options])

Measure distance between 2 elements/rectangles

#### Options

Options of measurement:

| _Property_ | _Type_ | _Description_ |
| :-: | :-: | :- |
| **alignments** | _Array_ | Array of [alignment properties](#alignment-properties). Default is **ALL** alignment properties |
| **absDistance** | _Boolean_ | `false` to allow negative value of distance. Default is `true` |

```javascript
let rectA = { top: 0, right: 3, bottom: 1, left: 2 };
let rectB = { top: 10, right: 13, bottom: 11, left: 12 };
Magnet.measure(rectA, rectB); // MeasureResult object
```

> _Alias_
>
> #### Magnet.diffRect(source, target[, options])
>
> ```js
> Magnet.diffRect(rectA, rectB);
> ```

#### Result of Measurement

> See [measurement result object](#measurement-result-object)

### _DEPRECATED_ Methods

#### Magnet.nearby(...)

> To reduce the usless calculations of measurement, it's recommended to call `Magnet.measure`/`Magnet.diffRect` independently and handle the results handly to get what you really want.

## References

### Magnet Default Values

| _Property_ | _Type_ | _Description_ | _Default_ |
| :-: | :-: | :- | :-: |
| **distance** | _Number_ | Distance to attract | `0` |
| **attractable** | _Boolean_ | Ability to attract | `true` |
| **allowCtrlKey** | _Boolean_ | Ability to use `ctrl` key to unattract | `true` |
| **stayInParent** | _Boolean_ | Stay in parent element | `false` |
| **alignOuter** | _Boolean_ | Align outer edges to that of the others | `true` |
| **alignInner** | _Boolean_ | Align inner edges to that of the others | `true` |
| **alignCenter** | _Boolean_ | Align x/y center to that of the others | `true` |
| **alignParentCenter** | _Boolean_ | Align x/y center to that of parent element | `false` |

### Alignment Properties

| _Value_ | _Description_ |
| :-: | :- |
| **topToTop** | Source `top` to target `top` _(inner)_ |
| **rightToRight** | Source `right` to target `right` _(inner)_ |
| **bottomToBottom** | Source `bottom` to target `bottom` _(inner)_ |
| **leftToLeft** | Source `left` to target `left` _(inner)_ |
| **topToBottom** | Source `top` to target `bottom` _(outer)_ |
| **bottomToTop** | Source `bottom` to target `top` _(outer)_ |
| **rightToLeft** | Source `right` to target `left` _(outer)_ |
| **leftToright** | Source `left` to target `right` _(outer)_ |
| **xCenter** | Source `x` middle to target `x` middle _(center)_ |
| **yCenter** | Source `y` middle to target `y` middle _(center)_ |

### Attract Info

| _Property_ | _Type_ | _Description_ |
| :-: | :-: | :- |
| **type** | _String_ | [Alignment property name](#alignments) |
| **rect** | _Object_ | Rectangle object of element |
| **element** | _DOM_ | HTML element |
| **position** | _Number_ | Absolute offset `px` based on window's top/left |
| **offset** | _Number_ | Offset `px` based on parent element |

### Rectangle Object

| _Property_ | _Type_ | _Description_ |
| :-: | :-: | :- |
| **top** | _Number_ | The same as `y` |
| **right** | _Number_ | |
| **bottom** | _Number_ | |
| **left** | _Number_ | The same as `x` |
| **width** | _Number_ | The same as `right - left` |
| **height** | _Number_ | The same as `bottom - top` |
| **x** | _Number_ | The same as `left` |
| **y** | _Number_ | The same as `top` |

### Element Object

| _Property_ | _Type_ | _Description_ |
| :-: | :-: | :- |
| **rect** | _Object_ | [Rectangle object](#rectangle-object) |
| **element** _(optional)_ | _DOM_ | HTML element. `undefined` if the source is a pure rectangle like object |

### Measurement Value Object

> **NOTICE: All the properties inherit from [alignment properties](#alignment-properties)**

| _Value_ | _Type_ |
| :-: | :-: |
| **topToTop** _(optional)_ | _Number_ |
| **rightToRight** _(optional)_ | _Number_ |
| **bottomToBottom** _(optional)_ | _Number_ |
| **leftToLeft** _(optional)_ | _Number_ |
| **topToBottom** _(optional)_ | _Number_ |
| **bottomToTop** _(optional)_ | _Number_ |
| **rightToLeft** _(optional)_ | _Number_ |
| **leftToright** _(optional)_ | _Number_ |
| **xCenter** _(optional)_ | _Number_ |
| **yCenter** _(optional)_ | _Number_ |

### Measurement Result Object

| _Property_ | _Type_ | _Description_ |
| :-: | :-: | :- |
| **source** | _Object_ | [Element object](#element-object) |
| **target** | _Object_ | [Element object](#element-object) |
| **results** | _Object_ | [Measurement value object](#measurement-value-object). The properties follow the input [alignment properties](#alignment-properties) of measurement | **ranking** | _Array_ | Array of [alignment properties](#alignment-properties) sorted from near to far |
| **min** | _String_ | [Alignment property](#alignment-properties) with minimum distance |
| **max** | _String_ | [Alignment property](#alignment-properties) with maximum distance |

> **NOTICE: The following properties are DEPRECATED**
>
> | _Property_ | _Type_ | _Replacement_ |
> | :-: | :-: | :-: |
> | topToTop | _Number_ | `results.topToTop` |
> | topToBottom | _Number_ | `results.topToBottom` |
> | rightToRight | _Number_ | `results.rightToRight` |
> | rightToLeft | _Number_ | `results.rightToLeft` |
> | bottomToTop | _Number_ | `results.bottomToTop` |
> | bottomToBottom | _Number_ | `results.bottomToBottom` |
> | xCenter | _Number_ | `results.xCenter` |
> | yCenter | _Number_ | `results.yCenter` |

## License

[MIT](/LICENSE) Copyright @ Wan Wan


[lastest-build]: https://github.com/lf2com/magnet.js/releases
[lastest-js]: https://lf2com.github.io/magnet.js/magnet.min.js
[browserify]: http://browserify.org/
[uglifyjs]: https://github.com/mishoo/UglifyJS
[demo-hello-block]: ./demo/hello-magnet-block.html
[demo-hello-group]: ./demo/hello-magnet-group.html
[magnet-block]: #magnet-block
[magnet-pack]: #magnet-pack
[magnet-attribute]: #attributes
[mg-attr-disabled]: #mg-disabled
[mg-attr-group]: #mg-group
[mg-attr-unattractable]: #mg-unattractable
[mg-attr-unmovable]: #mg-unmovable
[mg-attr-attract-distance]: #mg-attract-disaance
[mg-attr-align-to]: #mg-align-to
[mg-attr-align-to-parent]: #mg-align-to-parent
[mg-attr-cross-prevent]: #mg-cross-prevent
[mg-evt-start]: #mg-start
[mg-evt-move]: #mg-move
[mg-evt-end]: #mg-end
[mg-evt-attract]: #mg-attract
[mg-evt-attractmove]: #mg-attractmove
[mg-evt-unattract]: #mg-unattract
[mg-evt-attracted]: #mg-attracted
[mg-evt-attractedmove]: #mg-attractedmove
[mg-evt-unattracted]: #mg-unattracted
[mg-type-blockState]: #blockState
[mg-type-point]: #point
[mg-type-rect]: #rect
[mg-type-attraction]: #attraction
[mg-type-multiAttractResult]: #multiAttractResult
