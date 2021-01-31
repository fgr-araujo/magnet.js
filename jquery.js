'use strict';

import { Magnet, MagnetGroup } from './libs/magnet';
import MagnetBase from './libs/magnet/base';
import { isfunc, isset, objForEach, objValues } from './libs/stdlib';
import { isRect, stdRect } from './libs/magnet/rect';
import { calcAttractionOfTarget } from './libs/magnet/distance';

(($) => {
  if (!isset($)) {
    throw new Error(`jQuery not defined`);
  }

  $.magnet = function() {
    const magnet = new Magnet();

    [MagnetBase, MagnetGroup, Magnet].forEach((ref) => {
      Object.getOwnPropertyNames(ref.prototype)
        .forEach((name) => {
          switch (name) {
            case 'constructor': return;
          }

          if (magnet[name]) {
            if (isfunc(magnet[name])) {
              this[name] = (...args) => magnet[name](...args);
            } else {
              this[name] = () => magnet[name];
            }
          }
        });
    });

    return this;
  };

  [MagnetBase, MagnetGroup, Magnet].forEach((ref) => {
    Object.keys(ref).forEach((name) => {
      $.magnet[name] = ref[name];
    });
  });

  $.magnet.isRect = (source) => isRect(source);
  $.magnet.stdRect = (source) => stdRect(source);
  $.magnet.diffRect = (source, target, options) => {
    return calcAttractionOfTarget(source, target, {
      alignments: objValues($.magnet.ALIGNMENT),
      ...options,
    });
  };

  $.fn.magnet = function() {
    const $magnet = $(`<${Magnet.nodeName}>`);

    return this;
  };

})(window.jQuery);