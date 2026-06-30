/**
 * Sidebar — Collapsible unit navigation sidebar
 *
 * Lists all 5 units as collapsible sections with sub-tools.
 * Tracks active/visited subtools via navigationStore.
 */

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const UNITS = [
  {
    id: 1, roman: 'I', title: 'Basic Structure',
    tools: [
      { slug: 'anatomy-explorer',    name: 'Anatomy Explorer' },
      { slug: 'instruction-encoder', name: 'Instruction Encoder' },
      { slug: 'register-viewer',     name: 'Register File Viewer' },
      { slug: 'mips-executor',       name: 'MIPS Executor' },
    ],
  },
  {
    id: 2, roman: 'II', title: 'Arithmetic',
    tools: [
      { slug: 'binary-adder',     name: 'Binary Adder' },
      { slug: 'booth',            name: "Booth's Multiplier" },
      { slug: 'restoring-div',    name: 'Restoring Division' },
      { slug: 'ieee754',          name: 'IEEE 754 Explorer' },
      { slug: 'subword-demo',     name: 'Subword Demo' },
    ],
  },
  {
    id: 3, roman: 'III', title: 'Processor',
    tools: [
      { slug: 'datapath-viewer',        name: 'Datapath Viewer' },
      { slug: 'pipeline-animator',      name: 'Pipeline Animator' },
      { slug: 'hazard-classifier',      name: 'Hazard Classifier' },
      { slug: 'superscalar-comparator', name: 'Superscalar Comp.' },
    ],
  },
  {
    id: 4, roman: 'IV', title: 'Parallelism',
    tools: [
      { slug: 'flynn-taxonomy',     name: "Flynn's Taxonomy" },
      { slug: 'multithreading',     name: 'Multithreading' },
      { slug: 'cache-coherence',    name: 'Cache Coherence' },
      { slug: 'gpu-explainer',      name: 'GPU Explainer' },
      { slug: 'cluster-overview',   name: 'Cluster Overview' },
    ],
  },
  {
    id: 5, roman: 'V', title: 'Memory & I/O',
    tools: [
      { slug: 'memory-hierarchy',   name: 'Memory Hierarchy' },
      { slug: 'cache-simulator',    name: 'Cache Simulator' },
      { slug: 'virtual-memory',     name: 'Virtual Memory' },
      { slug: 'io-comparator',      name: 'I/O Comparator' },
      { slug: 'usb-overview',       name: 'USB Overview' },
    ],
  },
]

const UNIT_ICONS = {
  1: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/>
      <rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>
    </svg>
  ),
  2: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="12"/>
    </svg>
  ),
  3: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="7" width="10" height="10" rx="1"/>
      <line x1="7" y1="9" x2="3" y2="9"/><line x1="7" y1="12" x2="3" y2="12"/><line x1="7" y1="15" x2="3" y2="15"/>
      <line x1="17" y1="9" x2="21" y2="9"/><line x1="17" y1="12" x2="21" y2="12"/><line x1="17" y1="15" x2="21" y2="15"/>
    </svg>
  ),
  4: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="6" x2="19" y2="6"/><line x1="5" y1="10" x2="19" y2="10"/>
      <line x1="5" y1="14" x2="19" y2="14"/><line x1="5" y1="18" x2="19" y2="18"/>
    </svg>
  ),
  5: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="4" rx="1"/>
      <rect x="3" y="11" width="18" height="4" rx="1"/>
      <rect x="3" y="17" width="18" height="4" rx="1"/>
    </svg>
  ),
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedUnits, setExpandedUnits] = useState([1])
  const location = useLocation()
  const navigate = useNavigate()

  const pathParts = location.pathname.split('/')
  const currentUnit = pathParts[2]
  const currentTool = pathParts[4]

  const toggleUnit = (unitId) => {
    setExpandedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    )
  }

  const isActive = (unitId, toolSlug) =>
    String(unitId) === currentUnit && toolSlug === currentTool

  const SIDEBAR_WIDTH = collapsed ? 60 : 240
  const UNIT_HEIGHT = 40
  const TOOL_HEIGHT = 32

  return (
    <>
      {/* Sidebar */}
      <aside
        style={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          height: 'calc(100vh - 56px)',
          position: 'sticky',
          top: '56px',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.25s ease, min-width 0.25s ease',
          zIndex: 90,
        }}
      >
        {/* Collapse toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-end',
            padding: '8px',
            borderBottom: '1px solid var(--border)',
            minHeight: '48px',
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.25s',
            }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>

        {/* Units list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {UNITS.map((unit) => {
            const isExpanded = expandedUnits.includes(unit.id)
            const isCurrentUnit = String(unit.id) === currentUnit

            return (
              <div key={unit.id}>
                {/* Unit header */}
                <button
                  onClick={() => {
                    toggleUnit(unit.id)
                    if (!collapsed) navigate(`/unit/${unit.id}`)
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: collapsed ? '12px 0' : '10px 14px',
                    border: 'none',
                    background: isCurrentUnit ? 'var(--accent-dim)' : 'transparent',
                    color: isCurrentUnit ? 'var(--accent-text)' : 'var(--text)',
                    cursor: 'pointer',
                    fontFamily: 'var(--mono)',
                    fontSize: '11px',
                    textAlign: 'left',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderLeft: isCurrentUnit ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  title={collapsed ? `Unit ${unit.roman}: ${unit.title}` : undefined}
                >
                  <span style={{
                    color: isCurrentUnit ? 'var(--accent)' : 'var(--text-muted)',
                    display: 'flex',
                    flexShrink: 0,
                  }}>
                    {UNIT_ICONS[unit.id]}
                  </span>
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1, fontWeight: isCurrentUnit ? 600 : 400 }}>
                        Unit {unit.roman}
                      </span>
                      <span style={{
                        fontSize: '9px',
                        color: 'var(--text-muted)',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}>
                        ▸
                      </span>
                    </>
                  )}
                </button>

                {/* Sub-tools */}
                {!collapsed && isExpanded && (
                  <div>
                    {unit.tools.map((tool) => {
                      const active = isActive(unit.id, tool.slug)
                      return (
                        <button
                          key={tool.slug}
                          onClick={() => navigate(`/unit/${unit.id}/tool/${tool.slug}`)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 14px 7px 30px',
                            border: 'none',
                            background: active ? 'var(--accent-dim)' : 'transparent',
                            color: active ? 'var(--accent-text)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontFamily: 'var(--mono)',
                            fontSize: '10px',
                            textAlign: 'left',
                            borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                            transition: 'all 0.15s',
                          }}
                        >
                          <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: active ? 'var(--accent)' : 'var(--border)',
                            flexShrink: 0,
                          }}/>
                          <span style={{ flex: 1 }}>{tool.name}</span>
                          {active && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>
    </>
  )
}
