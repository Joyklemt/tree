export const NODE_W = 140
export const NODE_H  = 46
export const H_GAP   = 24
export const V_GAP   = 88

/** Bottom-up: compute how wide a subtree needs to be */
export function subtreeWidth(node) {
  if (!node.children || node.children.length === 0) return NODE_W
  const total = node.children.reduce(
    (sum, c, i) => sum + subtreeWidth(c) + (i > 0 ? H_GAP : 0),
    0
  )
  return Math.max(total, NODE_W)
}

/**
 * Top-down: assign {x, y} to every node.
 * Returns a map: id → {x, y}
 */
export function layoutTree(node, level = 0, leftEdge = 0, pos = {}) {
  const sw = subtreeWidth(node)
  pos[node.id] = {
    x: leftEdge + sw / 2 - NODE_W / 2,
    y: level * (NODE_H + V_GAP),
  }
  if (node.children) {
    let cursor = leftEdge
    node.children.forEach(child => {
      layoutTree(child, level + 1, cursor, pos)
      cursor += subtreeWidth(child) + H_GAP
    })
  }
  return pos
}

/** Collect all parent → child edges as SVG midpoint bezier data */
export function buildEdges(node, pos, edges = []) {
  if (node.children) {
    node.children.forEach(child => {
      const p = pos[node.id]
      const c = pos[child.id]
      if (p && c) {
        edges.push({
          id:  `${node.id}--${child.id}`,
          x1:  p.x + NODE_W / 2,
          y1:  p.y + NODE_H,
          x2:  c.x + NODE_W / 2,
          y2:  c.y,
          parentId: node.id,
          childId:  child.id,
        })
      }
      buildEdges(child, pos, edges)
    })
  }
  return edges
}
