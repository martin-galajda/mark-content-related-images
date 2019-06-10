
export function getPathFromDocRoot (targetNode) {
  const pieces = []
  let node = targetNode

  while (node && node.parentNode) {
    pieces.push(Array.prototype.indexOf.call(node.parentNode.childNodes, node))
    node = node.parentNode
  }

  const pathFromRoot = pieces
    .reverse()
    .join('/')

  return `doc/${pathFromRoot}`
}

