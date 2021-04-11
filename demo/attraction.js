setTimeout(function() {
  'use strict';

  const magnetNodeName = 'magnet-block';
  const style = document.createElement('style');
  const css = magnetNodeName + `:hover {
    box-sizing: content-box;
    outline: var(--attract-distance, 0) solid rgba(255, 200, 0, .25);
  `;

  const newBlockObserver = new MutationObserver(checkNewBlocks);
  const newBlockObserverConfig = {
    childList: true,
    subtree: true,
  };

  const blockAttractionObserver = new MutationObserver(checkBlockAttratcion);
  const blockAttractionObserverConfig = {
    attributeFilter: ['attractdistance'],
  };

  // update attract distance
  function updateBlockAttraction(node) {
    node.style.setProperty('--attract-distance', node.attractDistance + 'px');
  }

  // watch magnet attraction
  function watchBlockAttraction(node) {
    blockAttractionObserver.observe(node, blockAttractionObserverConfig);
    updateBlockAttraction(node);
  }

  // check block attraction
  function checkBlockAttratcion(mutations) {
    mutations.forEach(function(mutation) {
      updateBlockAttraction(mutation.target);
    });
  }

  // check mutation doms
  function checkNewBlocks(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (magnetNodeName === node.localName) {
          watchBlockAttraction(node);
        }
      });
    });
  }
  
  Array.from(document.querySelectorAll(magnetNodeName))
    .forEach(function(node) {
      watchBlockAttraction(node);
    });

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  document.getElementsByTagName('head')[0].appendChild(style);

  newBlockObserver.observe(document.body, newBlockObserverConfig);
}, 0);