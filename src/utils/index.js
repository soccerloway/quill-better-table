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
