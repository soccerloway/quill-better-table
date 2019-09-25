export function css (domNode, rules) {
  if (typeof rules === 'object') {
    for (let prop in rules) {
      domNode.style[prop] = rules[prop]
    }
  }
}

/**
 * getRelativeRect
 * @param  {Object} targetRect  rect data for target element
 * @param  {Element} container  container element
 * @return {Object}             an object with rect data
 */
export function getRelativeRect (targetRect, container) {
  let containerRect = container.getBoundingClientRect()

  return {
    x: targetRect.x - containerRect.x - container.scrollLeft,
    y: targetRect.y - containerRect.y - container.scrollTop,
    x1: targetRect.x - containerRect.x - container.scrollLeft + targetRect.width,
    y1: targetRect.y - containerRect.y - container.scrollTop + targetRect.height,
    width: targetRect.width,
    height: targetRect.height
  }
}

/**
 * _omit
 * @param  {Object} obj         target Object
 * @param  {Array} uselessKeys  keys of removed properties
 * @return {Object}             new Object without useless properties
 */
export function _omit (obj, uselessKeys) {
  return obj && Object.keys(obj).reduce((acc, key) => {
    return uselessKeys.includes(key) ?
      acc :
      Object.assign({}, acc, { [key]: obj[key] })
  }, {})
}

/**
 * getEventComposedPath
 *  compatibility fixed for Event.path/Event.composedPath
 *  Event.path is only for chrome/opera
 *  Event.composedPath is for Safari, FF
 *  Neither for Micro Edge
 * @param {Event} evt
 * @return {Array} an array of event.path
 */
export function getEventComposedPath (evt) {
  let path
  // chrome, opera, safari, firefox
  path = evt.path || (evt.composedPath && evt.composedPath())

  // other: edge
  if (path == undefined && evt.target) {
    path = []
    let target = evt.target
    path.push(target)

    while (target && target.parentNode) {
      target = target.parentNode
      path.push(target)
    }
  }

  return path
}

export function convertToHex (rgb) {
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  // if rgb
  if (/^(rgb|RGB)/.test(rgb)) {
    var color = rgb.toString().match(/\d+/g);
    var hex = "#";

    for (var i = 0; i < 3; i++) {
        hex += ("0" + Number(color[i]).toString(16)).slice(-2);
    }
    return hex;
  } else if (reg.test(rgb)) {
    var aNum = rgb.replace(/#/,"").split("");
    if (aNum.length === 6) {
        return rgb;
    } else if(aNum.length === 3) {
        var numHex = "#";
        for (var i=0; i<aNum.length; i+=1) {
            numHex += (aNum[i] + aNum[i]);
        }
        return numHex;
    }
  }

  return rgb;
}
