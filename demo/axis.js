setTimeout(function() {
  'use strict';

  const magnetNodeName = 'magnet-block';
  const Magnet = customElements.get(magnetNodeName);
  const domForX = document.createElement('div');
  const domForY = document.createElement('div');
  const observer = new MutationObserver(checkMutations);
  const observerConfig = {
    childList: true,
    subtree: true,
  };

  // hide axis x/y
  function hideAxisX() {
    domForX.style.opacity = 0;
  }
  function hideAxisY() {
    domForY.style.opacity = 0;
  }
  function hideAxis() {
    hideAxisX();
    hideAxisY();
  }

  // show axis x/y with position info
  function showAxisX(x) {
    domForX.style.left = (x || 0) + 'px';
    domForX.style.opacity = 1;
    domForX.style.zIndex = Date.now();
  }
  function showAxisY(y) {
    domForY.style.top = (y || 0) + 'px';
    domForY.style.opacity = 1;
    domForY.style.zIndex = Date.now();
  }
  function showAxis(event) {
    const ALIGNMENT = Magnet.ALIGNMENT;
    const detail = event.detail;
    const best = detail.attractSummary.best;
    const minX = best.x;
    const minY = best.y;
    const nextRect = detail.nextStep.rectangle;
    const alignmentX = minX.alignment;
    const alignmentY = minY.alignment;

    switch (alignmentX) {
      default:
        hideAxisX();
        break;

      case ALIGNMENT.leftToRight:
      case ALIGNMENT.leftToLeft:
        showAxisX(nextRect.left);
        break;

      case ALIGNMENT.rightToRight:
      case ALIGNMENT.rightToLeft:
        showAxisX(nextRect.right);
        break;

      case ALIGNMENT.xCenterToXCenter:
        showAxisX((nextRect.right + nextRect.left) / 2);
        break;
    }

    switch (alignmentY) {
      default:
        hideAxisY();
        break;

      case ALIGNMENT.topToTop:
      case ALIGNMENT.topToBottom:
        showAxisY(nextRect.top);
        break;

      case ALIGNMENT.bottomToBottom:
      case ALIGNMENT.bottomToTop:
        showAxisY(nextRect.bottom);
        break;

      case ALIGNMENT.yCenterToYCenter:
        showAxisY((nextRect.top + nextRect.bottom) / 2);
        break;
    }
  }

  // watch magnet for attract/unattract event
  function watchMagnetBlock(node) {
    node.addEventListener(Magnet.EVENT.attract, showAxis);
    node.addEventListener(Magnet.EVENT.unattract, hideAxis);
    node.addEventListener(Magnet.EVENT.end, hideAxis);
  }

  // check mutation doms
  function checkMutations(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (magnetNodeName === node.localName) {
          watchMagnetBlock(node);
        }
      });
    });
  }

  [domForX, domForY].forEach(function(dom) {
    dom.style.position = 'fixed';
    dom.style.backgroundColor = 'rgba(0, 0, 0, .25)';
    dom.style.pointerEvents = 'none';
    dom.style.zIndex = 1000;
    dom.style.top = 0;
    dom.style.left = 0;
    dom.style.width = '100vw';
    dom.style.height = '100vh';
  });

  domForX.style.width = '1px';
  domForX.style.transform = 'translateX(-50%)';
  domForY.style.height = '1px';
  domForY.style.transform = 'translateY(-50%)';

  Array.from(document.querySelectorAll(magnetNodeName))
    .forEach(function(node) {
      watchMagnetBlock(node);
    });

  hideAxis();
  document.body.appendChild(domForX);
  document.body.appendChild(domForY);
  observer.observe(document.body, observerConfig);
}, 0);