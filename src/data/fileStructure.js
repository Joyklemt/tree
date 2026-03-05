// Hardcoded Next.js file structure

function addMeta(node, parentId = null, depth = 0) {
  const result = { ...node, parentId, depth }
  if (node.children) {
    result.children = node.children.map(c => addMeta(c, node.id, depth + 1))
  }
  return result
}

const raw = {
  id: 'app',
  name: 'app/',
  type: 'folder',
  isRoot: true,
  children: [
    { id: 'app-layout',    name: 'layout.tsx', type: 'layout' },
    { id: 'app-page',      name: 'page.tsx',   type: 'page',   route: '/' },
    {
      id: 'dashboard', name: 'dashboard/', type: 'folder',
      children: [
        { id: 'dash-layout', name: 'layout.tsx', type: 'layout' },
        { id: 'dash-page',   name: 'page.tsx',   type: 'page',   route: '/dashboard' },
        {
          id: 'settings', name: 'settings/', type: 'folder',
          children: [
            { id: 'settings-page', name: 'page.tsx', type: 'page', route: '/dashboard/settings' },
          ],
        },
      ],
    },
    {
      id: 'blog', name: 'blog/', type: 'folder',
      children: [
        {
          id: 'slug', name: '[slug]/', type: 'folder', isDynamic: true,
          children: [
            { id: 'slug-page', name: 'page.tsx', type: 'page', route: '/blog/:slug' },
          ],
        },
      ],
    },
  ],
}

export const fileStructure = addMeta(raw)

export function flattenNodes(node, acc = []) {
  acc.push(node)
  if (node.children) node.children.forEach(c => flattenNodes(c, acc))
  return acc
}

export function buildMap(nodes) {
  const m = {}
  nodes.forEach(n => { m[n.id] = n })
  return m
}

/** IDs of all layout.tsx nodes that wrap this page node */
export function getWrappingLayouts(node, map) {
  const layouts = []
  let cur = map[node.parentId]
  while (cur) {
    if (cur.children) {
      const lay = cur.children.find(c => c.type === 'layout')
      if (lay) layouts.push(lay.id)
    }
    cur = cur.parentId ? map[cur.parentId] : null
  }
  return layouts
}

/** IDs of all nodes wrapped by a given layout (siblings + descendants, excl. itself) */
export function getNodesWrappedByLayout(layoutNode, map) {
  const parent = map[layoutNode.parentId]
  if (!parent) return []
  const ids = []
  function collect(n) {
    if (n.id === layoutNode.id) return
    ids.push(n.id)
    if (n.children) n.children.forEach(collect)
  }
  if (parent.children) parent.children.forEach(collect)
  return ids
}
