/**
 * MasteryMap — React Flow skill-tree visualization of all 23 sub-tools,
 * grouped by unit, with prerequisite edges.
 *
 * Node states:
 *   locked           — a prerequisite isn't in navigationStore.completedSubtools
 *   unlocked          — prerequisites met, not yet visited/completed
 *   in-progress        — visited (in completedSubtools) but not yet mastered
 *   mastered           — in masteryStore.masteredTools
 *
 * Reads navigationStore.completedSubtools read-only (no writes from here);
 * mastery threshold data comes from the new masteryStore.js.
 */

import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactFlow, { Background, Controls, Handle, Position, useNodesState, useEdgesState, MarkerType } from 'reactflow'
import 'reactflow/dist/style.css'
import useNavigationStore from '../../../store/navigationStore.js'
import useMasteryStore from '../store/masteryStore.js'
import useV2SettingsStore from '../store/v2SettingsStore.js'
import { TOOL_CATALOG, UNIT_TITLES } from '../content/toolCatalog.js'

const UNIT_COLORS = { 1: '#0ea5e9', 2: '#eab308', 3: '#db2777', 4: '#16a34a', 5: '#6d28d9' }

const STATUS_STYLE = {
  locked: { opacity: 0.35, borderStyle: 'dashed' },
  unlocked: { opacity: 0.8, borderStyle: 'solid' },
  'in-progress': { opacity: 1, borderStyle: 'solid' },
  mastered: { opacity: 1, borderStyle: 'solid' },
}

function MasteryNode({ data }) {
  const color = UNIT_COLORS[data.unitId]
  const style = STATUS_STYLE[data.status]
  return (
    <div
      role="button"
      tabIndex={data.status === 'locked' ? -1 : 0}
      aria-disabled={data.status === 'locked'}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && data.status !== 'locked') data.onOpen()
      }}
      onClick={() => data.status !== 'locked' && data.onOpen()}
      style={{
        padding: '8px 14px',
        borderRadius: 10,
        border: `2px ${style.borderStyle} ${color}`,
        background: data.status === 'mastered' ? `${color}30` : 'rgba(20,20,26,0.9)',
        color: '#fff',
        fontSize: 12,
        fontWeight: 600,
        opacity: style.opacity,
        cursor: data.status === 'locked' ? 'not-allowed' : 'pointer',
        minWidth: 150,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {data.status === 'locked' && <span aria-hidden="true">🔒</span>}
      {data.status === 'mastered' && <span aria-hidden="true">⭐</span>}
      {data.label}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  )
}

const nodeTypes = { mastery: MasteryNode }

export default function MasteryMap() {
  const v2Enabled = useV2SettingsStore((s) => s.v2Enabled)
  const completedSubtools = useNavigationStore((s) => s.completedSubtools)
  const masteredTools = useMasteryStore((s) => s.masteredTools)
  const navigate = useNavigate()

  const statusFor = useCallback(
    (tool) => {
      const prereqsMet = tool.prerequisites.every((prereqKey) => {
        const [, prereqToolId] = prereqKey.split('/')
        return completedSubtools.includes(prereqToolId)
      })
      if (!prereqsMet) return 'locked'
      if (masteredTools.includes(tool.key)) return 'mastered'
      if (completedSubtools.includes(tool.toolId)) return 'in-progress'
      return 'unlocked'
    },
    [completedSubtools, masteredTools]
  )

  const initialLayout = useMemo(() => {
    const byUnit = {}
    TOOL_CATALOG.forEach((t) => {
      byUnit[t.unitId] = byUnit[t.unitId] || []
      byUnit[t.unitId].push(t)
    })

    const nodes = []
    const edges = []
    let unitIndex = 0
    Object.entries(byUnit).forEach(([unitId, tools]) => {
      tools.forEach((tool, i) => {
        nodes.push({
          id: tool.key,
          type: 'mastery',
          position: { x: unitIndex * 260, y: i * 90 },
          data: {
            label: tool.label,
            unitId: tool.unitId,
            status: statusFor(tool),
            onOpen: () => navigate(`/unit/${tool.unitId}/tool/${tool.toolId}`),
          },
        })
        tool.prerequisites.forEach((prereqKey) => {
          edges.push({
            id: `${prereqKey}->${tool.key}`,
            source: prereqKey,
            target: tool.key,
            style: { stroke: UNIT_COLORS[unitId], opacity: 0.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: UNIT_COLORS[unitId] },
          })
        })
      })
      unitIndex += 1
    })
    return { nodes, edges }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSubtools, masteredTools, navigate])

  const [nodes, , onNodesChange] = useNodesState(initialLayout.nodes)
  const [edges, , onEdgesChange] = useEdgesState(initialLayout.edges)

  if (!v2Enabled) {
    return (
      <div style={{ padding: 32, textAlign: 'center', opacity: 0.6 }}>
        The Mastery Map is turned off. Re-enable the fun layer from the Arcade to use it.
      </div>
    )
  }

  const masteredCount = masteredTools.length

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 24px 0' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>🗺️ Mastery Map</h1>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 12 }}>
          {masteredCount}/{TOOL_CATALOG.length} tools mastered — click any unlocked node to jump in.
        </p>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, opacity: 0.7, marginBottom: 8, flexWrap: 'wrap' }}>
          {Object.entries(UNIT_TITLES).map(([id, title]) => (
            <span key={id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: UNIT_COLORS[id], display: 'inline-block' }} />
              Unit {id} — {title}
            </span>
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}
