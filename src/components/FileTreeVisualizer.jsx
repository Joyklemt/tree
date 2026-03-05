import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  fileStructure,
  flattenNodes,
  buildMap,
  getWrappingLayouts,
  getNodesWrappedByLayout,
} from '../data/fileStructure'
import { layoutTree, buildEdges, NODE_W, NODE_H } from '../utils/treeLayout'

const PAD = 60

/* ── Color palette ── */
const COLORS = {
  folder:  { bg: '#2A1C0C', border: '#7A5830', text: '#C8A06A', badge: '#6A4E28' },
  layout:  { bg: '#2E100A', border: '#B84E28', text: '#E8805A', badge: '#8C3818' },
  page:    { bg: '#281600', border: '#B07820', text: '#E0A030', badge: '#7A5010' },
}
const DYNAMIC = { bg: '#1A0C32', border: '#6858A8', text: '#B098D8', badge: '#4A3878' }

function nodeColors(node) {
  if (node.isDynamic) return DYNAMIC
  return COLORS[node.type] || COLORS.folder
}

function TypeIcon({ type, isDynamic }) {
  if (isDynamic) return <span>{'{ }'}</span>
  if (type === 'layout') return <span>⬡</span>
  if (type === 'page')   return <span>◻</span>
  return <span>⌂</span>
}

/* ─────────────────────────────────────────────
   Plain-language descriptions for every node
───────────────────────────────────────────── */
const DESCRIPTIONS = {
  app: {
    tagline: 'The root of your entire app',
    what: 'This is the heart of Next.js. Every page, route, and layout in your application lives inside the app/ folder. Next.js reads this folder automatically and turns the folder structure into your URL routes — no manual routing configuration needed.',
    why: 'Without this folder, Next.js has nothing to work with. It is the starting point that connects everything together.',
    connects: [
      'Contains layout.tsx — which wraps every single page',
      'Contains page.tsx — your homepage at /',
      'dashboard/ and blog/ define sub-sections of the site',
    ],
  },

  'app-layout': {
    tagline: 'The frame that wraps your entire website',
    what: 'This layout is the global shell of your app. Think of it like the border of a picture frame — every page your users ever visit will be shown inside this layout. It is a great place to put things like your navigation bar, footer, fonts, and the global <html> and <body> tags.',
    why: 'It only renders once when the app loads and stays on screen during page navigation. This makes navigation feel instant because the frame never disappears and reloads.',
    connects: [
      'Automatically wraps app/page.tsx (the homepage)',
      'Also wraps dashboard/page.tsx and all blog posts',
      'Stacks with dashboard/layout.tsx for deeper pages',
    ],
  },

  'app-page': {
    tagline: 'Your homepage — the / route',
    what: 'This is the very first page users land on when they visit your website. In Next.js, a page.tsx file inside a folder means "render this when someone visits this route". Since this one is in the app/ root, it answers to the / URL.',
    why: 'Every website needs a homepage. This file is it. Delete it and visitors to / get a 404.',
    connects: [
      'Served at the URL: /',
      'Wrapped by app/layout.tsx (the global frame)',
      'Sits alongside layout.tsx at the same level',
    ],
  },

  dashboard: {
    tagline: 'A section of your app with its own sub-routes',
    what: 'Creating a folder in Next.js creates a new URL segment. The dashboard/ folder means everything inside it lives under the /dashboard path. It groups all dashboard-related pages together and even has its own layout, so the whole dashboard section can share a common sidebar or header.',
    why: 'Folder-based routing keeps your code organised. Instead of one giant routes file, the folder structure is the route structure.',
    connects: [
      'Adds the /dashboard URL segment',
      'Contains its own layout.tsx for a dashboard-specific shell',
      'Has a page.tsx for the main /dashboard page',
      'Has a settings/ sub-folder for /dashboard/settings',
    ],
  },

  'dash-layout': {
    tagline: 'A shared shell just for the dashboard section',
    what: 'This layout wraps every page inside the dashboard/ folder — but nothing outside of it. You can use this to add a dashboard sidebar, a top navigation bar with user info, or an authentication check. If a user isn\'t logged in, you can redirect them here before any dashboard page loads.',
    why: 'It lets the dashboard have its own look and logic without affecting the rest of the site. It stacks on top of app/layout.tsx, so the dashboard gets both the global frame AND its own frame.',
    connects: [
      'Wraps dashboard/page.tsx and settings/page.tsx',
      'Stacks inside app/layout.tsx (both run at once)',
      'Doesn\'t affect blog/ pages — they skip this layout',
    ],
  },

  'dash-page': {
    tagline: 'The main dashboard page at /dashboard',
    what: 'This is what users see when they navigate to /dashboard. It is wrapped by two layouts at the same time: app/layout.tsx gives it the site-wide frame, and dashboard/layout.tsx gives it the dashboard-specific sidebar or navigation. The page itself only needs to care about its own content.',
    why: 'This is the entry point to the dashboard section. It\'s the first thing a logged-in user typically sees.',
    connects: [
      'Served at the URL: /dashboard',
      'Wrapped by app/layout.tsx (global)',
      'Also wrapped by dashboard/layout.tsx (dashboard shell)',
    ],
  },

  settings: {
    tagline: 'A nested route segment under dashboard',
    what: 'By creating a settings/ folder inside dashboard/, Next.js automatically creates the route /dashboard/settings. No extra code needed — the folder name becomes the URL path. This page inherits the dashboard layout automatically, so the sidebar and header from dashboard/layout.tsx are always present.',
    why: 'Nested folders mean nested URLs. It keeps settings logically grouped inside the dashboard section both in your code and in the browser URL.',
    connects: [
      'Lives inside dashboard/, so it inherits dashboard/layout.tsx',
      'Creates the /dashboard/settings URL segment',
      'Contains page.tsx which is the actual settings UI',
    ],
  },

  'settings-page': {
    tagline: 'The settings page at /dashboard/settings',
    what: 'This page renders the settings UI. What is interesting is that by the time Next.js shows this page, TWO layouts have already run: first app/layout.tsx (the global frame), then dashboard/layout.tsx (the dashboard shell). The page itself sits inside both of those, like a Russian doll.',
    why: 'This is a great example of how nested layouts work in Next.js. The page only needs to render the settings content — the surrounding UI is handled automatically by parent layouts.',
    connects: [
      'Served at the URL: /dashboard/settings',
      'Wrapped by app/layout.tsx AND dashboard/layout.tsx',
      'Two layouts run before this page even appears on screen',
    ],
  },

  blog: {
    tagline: 'The blog section of your app',
    what: 'This folder creates the /blog URL segment and groups all blog-related routes together. Unlike the dashboard, the blog/ folder has no layout.tsx, which means it only uses the global app/layout.tsx. It contains a [slug]/ folder that handles individual blog posts dynamically.',
    why: 'Keeping blog posts in their own folder is good organisation. It also means you can later add a blog/layout.tsx if you want a shared blog header or sidebar.',
    connects: [
      'Creates the /blog route segment',
      'No local layout — only uses app/layout.tsx',
      'Contains [slug]/ for dynamic post pages',
    ],
  },

  slug: {
    tagline: 'A dynamic route — matches any blog post URL',
    what: 'The square brackets around "slug" are the magic here. Instead of creating a separate folder for every blog post (which is impossible if you have thousands), this one folder matches ANY URL segment. So /blog/hello-world, /blog/my-trip-to-spain, and /blog/react-tips all route to the same page.tsx. The actual slug value is passed to the page as a parameter so it can fetch the right post.',
    why: 'Dynamic routes are essential for any content-driven site. Without this pattern, you would need a new file for every single piece of content.',
    connects: [
      'Matches URLs like /blog/anything, /blog/my-post, /blog/123',
      'The slug value (e.g. "my-post") is passed to page.tsx as a prop',
      'Inherits only app/layout.tsx — no dashboard layout',
    ],
  },

  'slug-page': {
    tagline: 'Renders one blog post based on the URL',
    what: 'This page receives the slug from the URL — for example, if a user visits /blog/hello-world, the slug is "hello-world". The page then uses that value to fetch and display the right blog post. This single file handles all blog posts in the entire app.',
    why: 'One file, infinite pages. This is the core power of dynamic routing in Next.js. You write the template once and it works for any post.',
    connects: [
      'Served at URLs like: /blog/:slug (any slug)',
      'Wrapped by app/layout.tsx (the global frame)',
      'Gets the slug as a prop: params.slug',
    ],
  },
}

/* ─────────────────────────────────────────────
   Info Panel
───────────────────────────────────────────── */
function InfoPanel({ node, map }) {
  const desc = DESCRIPTIONS[node.id]
  const c    = nodeColors(node)

  const wrappingLayouts = node.type === 'page'
    ? getWrappingLayouts(node, map).map(id => map[id])
    : []

  const wrappedNodes = node.type === 'layout'
    ? getNodesWrappedByLayout(node, map).map(id => map[id])
    : []

  return (
    <motion.div
      key={node.id}
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        width: 300,
        background: '#160E04',
        borderLeft: '1px solid #2E1E08',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Coloured top strip */}
      <div style={{ height: 3, background: c.border, flexShrink: 0 }} />

      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                background: c.badge, color: c.text,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase',
              }}
            >
              {node.isDynamic ? 'dynamic folder' : node.type}
            </span>
            {node.route && (
              <span
                style={{
                  background: '#2A1E06', color: '#D09030',
                  border: '1px solid #5A3E10',
                  fontSize: 10, fontFamily: 'monospace',
                  padding: '2px 7px', borderRadius: 4,
                }}
              >
                {node.route}
              </span>
            )}
          </div>
          <h2 style={{ color: '#F2E0B8', fontSize: 15, fontWeight: 700, fontFamily: 'monospace', margin: 0 }}>
            {node.name}
          </h2>
          {desc && (
            <p style={{ color: '#A08060', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
              {desc.tagline}
            </p>
          )}
        </div>

        {/* Description */}
        {desc && (
          <div style={{
            background: '#1E1408', borderRadius: 8,
            padding: '12px 14px', border: '1px solid #2E2010',
          }}>
            <p style={{ color: '#6A5030', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              What is this?
            </p>
            <p style={{ color: '#C8A870', fontSize: 12.5, lineHeight: 1.65, margin: 0 }}>
              {desc.what}
            </p>
          </div>
        )}

        {/* Why it matters */}
        {desc && (
          <div style={{
            background: '#181008', borderRadius: 8,
            padding: '12px 14px', border: '1px solid #2A1C08',
          }}>
            <p style={{ color: '#6A5030', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Why it matters
            </p>
            <p style={{ color: '#B09060', fontSize: 12.5, lineHeight: 1.65, margin: 0 }}>
              {desc.why}
            </p>
          </div>
        )}

        {/* Connections */}
        {desc && desc.connects.length > 0 && (
          <div>
            <p style={{ color: '#6A5030', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              How it connects
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {desc.connects.map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: c.border, fontSize: 12, flexShrink: 0, marginTop: 1 }}>›</span>
                  <span style={{ color: '#907050', fontSize: 12, lineHeight: 1.55 }}>{line}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wrapped-by section (pages only) */}
        {wrappingLayouts.length > 0 && (
          <div>
            <p style={{ color: '#6A5030', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Layout chain (outermost → innermost)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[...wrappingLayouts].reverse().map((lay, i) => (
                <div key={lay.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 6,
                  background: '#2E100A', border: '1px solid #7A2A18',
                }}>
                  <span style={{ color: '#B84E28', fontSize: 13 }}>⬡</span>
                  <span style={{ color: '#E8805A', fontSize: 12, fontFamily: 'monospace', flex: 1 }}>
                    {lay.name}
                  </span>
                  <span style={{ color: '#5A2810', fontSize: 10 }}>
                    {i === 0 ? 'outermost' : 'inner'}
                  </span>
                </div>
              ))}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 6,
                background: '#281600', border: `1.5px solid ${c.border}`,
              }}>
                <span style={{ color: c.text, fontSize: 13 }}>◻</span>
                <span style={{ color: c.text, fontSize: 12, fontFamily: 'monospace' }}>
                  {node.name}
                </span>
                <span style={{ color: c.badge, fontSize: 10, marginLeft: 'auto' }}>this page</span>
              </div>
            </div>
          </div>
        )}

        {/* Wraps section (layouts only) */}
        {wrappedNodes.length > 0 && (
          <div>
            <p style={{ color: '#6A5030', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              This layout wraps
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {wrappedNodes.map(n => {
                const nc = nodeColors(n)
                return (
                  <div key={n.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 10px', borderRadius: 6,
                    background: nc.bg, border: `1px solid ${nc.border}55`,
                  }}>
                    <TypeIcon type={n.type} isDynamic={n.isDynamic} />
                    <span style={{ color: nc.text, fontSize: 12, fontFamily: 'monospace', flex: 1 }}>
                      {n.name}
                    </span>
                    {n.route && (
                      <span style={{ color: nc.badge, fontSize: 10 }}>{n.route}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  )
}

/* ── Legend dot ── */
function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
      <span style={{ color: '#5A4028', fontSize: 12 }}>{label}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function FileTreeVisualizer({ onBack }) {
  const [selectedId, setSelectedId] = useState(null)

  const { positions, edges, nodes, map } = useMemo(() => {
    const positions = layoutTree(fileStructure)
    const edges     = buildEdges(fileStructure, positions)
    const nodes     = flattenNodes(fileStructure)
    const map       = buildMap(nodes)
    return { positions, edges, nodes, map }
  }, [])

  const selectedNode = selectedId ? map[selectedId] : null

  const wrappingLayoutIds = useMemo(() => {
    if (!selectedNode || selectedNode.type !== 'page') return new Set()
    return new Set(getWrappingLayouts(selectedNode, map))
  }, [selectedNode, map])

  const wrappedBySelectedIds = useMemo(() => {
    if (!selectedNode || selectedNode.type !== 'layout') return new Set()
    return new Set(getNodesWrappedByLayout(selectedNode, map))
  }, [selectedNode, map])

  const canvasW = useMemo(() => {
    const maxX = Math.max(...Object.values(positions).map(p => p.x + NODE_W))
    return maxX + PAD * 2
  }, [positions])

  const canvasH = useMemo(() => {
    const maxY = Math.max(...Object.values(positions).map(p => p.y + NODE_H))
    return maxY + PAD * 2
  }, [positions])

  function toggleSelect(id) {
    setSelectedId(prev => (prev === id ? null : id))
  }

  function edgeHighlight(edge) {
    if (!selectedId) return false
    return edge.parentId === selectedId || edge.childId === selectedId
  }

  return (
    <motion.div
      className="w-full h-full flex flex-col"
      style={{ background: '#0E0904' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '10px 20px', flexShrink: 0,
        borderBottom: '1px solid #2A1C08', background: '#130C05',
      }}>
        <button
          onClick={onBack}
          style={{
            background: '#2A1C08', color: '#B8906A',
            border: '1px solid #3A2A10', borderRadius: 8,
            padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >
          ← Back
        </button>

        <div>
          <div style={{ color: '#F0DDB8', fontSize: 14, fontWeight: 600 }}>
            Next.js File Structure
          </div>
          <div style={{ color: '#5A4028', fontSize: 11, marginTop: 1 }}>
            Click any node to understand how it works
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 18 }}>
          <LegendDot color="#7A5830" label="Folder" />
          <LegendDot color="#B84E28" label="Layout" />
          <LegendDot color="#B07820" label="Page" />
          <LegendDot color="#6858A8" label="Dynamic" />
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Tree canvas */}
        <div style={{ flex: 1, overflow: 'auto', background: '#0E0904' }}>
          <div style={{ position: 'relative', width: canvasW, height: canvasH, minWidth: '100%', minHeight: '100%' }}>

            {/* SVG edges */}
            <svg
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              width={canvasW}
              height={canvasH}
            >
              {edges.map(edge => {
                const hi   = edgeHighlight(edge)
                const midY = (edge.y1 + edge.y2) / 2
                return (
                  <path
                    key={edge.id}
                    d={`M ${edge.x1 + PAD} ${edge.y1 + PAD}
                        C ${edge.x1 + PAD} ${midY + PAD},
                          ${edge.x2 + PAD} ${midY + PAD},
                          ${edge.x2 + PAD} ${edge.y2 + PAD}`}
                    stroke={hi ? '#C08030' : '#3A2A10'}
                    strokeWidth={hi ? 2 : 1.5}
                    fill="none"
                    opacity={hi ? 0.9 : 0.5}
                    style={{ transition: 'stroke 0.25s, opacity 0.25s' }}
                  />
                )
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node, i) => {
              const pos = positions[node.id]
              if (!pos) return null

              const c          = nodeColors(node)
              const isSelected = selectedId === node.id
              const isWrapping = wrappingLayoutIds.has(node.id)
              const isWrapped  = wrappedBySelectedIds.has(node.id)
              const isDimmed   = selectedId && !isSelected && !isWrapping && !isWrapped

              let borderColor = c.border
              if (isSelected)  borderColor = '#F0C060'
              else if (isWrapping) borderColor = '#F0A040'
              else if (isWrapped)  borderColor = '#A090D0'

              let boxShadow = 'none'
              if (isSelected)      boxShadow = `0 0 20px ${c.border}80`
              else if (isWrapping) boxShadow = '0 0 14px #F0A04060'
              else if (isWrapped)  boxShadow = '0 0 10px #A090D050'

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.72, y: -10 }}
                  animate={{ opacity: isDimmed ? 0.22 : 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.025, duration: 0.32, ease: 'easeOut' }}
                  whileHover={{ scale: isDimmed ? 1 : 1.05, transition: { duration: 0.1 } }}
                  onClick={() => toggleSelect(node.id)}
                  style={{
                    position: 'absolute',
                    left:   pos.x + PAD,
                    top:    pos.y + PAD,
                    width:  NODE_W,
                    height: NODE_H,
                    background: c.bg,
                    border: `1.5px solid ${borderColor}`,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '0 11px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    boxShadow,
                    transition: 'border-color 0.2s, box-shadow 0.2s, opacity 0.2s',
                  }}
                >
                  <span style={{ color: c.border, fontSize: 12, flexShrink: 0 }}>
                    <TypeIcon type={node.type} isDynamic={node.isDynamic} />
                  </span>
                  <span style={{
                    color: c.text, fontSize: 11.5,
                    fontFamily: 'monospace', flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    letterSpacing: '-0.01em',
                  }}>
                    {node.name}
                  </span>
                  {node.route && (
                    <span style={{
                      background: c.badge, color: c.text,
                      fontSize: 9, padding: '1px 5px', borderRadius: 3, flexShrink: 0,
                    }}>
                      →
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Info panel */}
        <AnimatePresence>
          {selectedNode && (
            <InfoPanel key={selectedNode.id} node={selectedNode} map={map} />
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  )
}
