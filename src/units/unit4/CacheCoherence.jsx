/**
 * CacheCoherence — MESI protocol state machine explorer across multiple cores
 *
 * Config: 2–4 cores, configurable memory address space
 * Event input: sequence of Read/Write events
 * React Flow 11 for MESI state machine diagram
 * Event step-through: highlights transitions + updates per-core cache state table
 * Bus transaction log panel
 */

import { useState, useMemo } from 'react'
import ReactFlow, {
  Handle,
  Position,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'

// ── MESI State Machine Nodes ──────────────────────────────
const MESI_NODES = [
  {
    id: 'invalid',
    type: 'mesiNode',
    position: { x: 50, y: 150 },
    data: { label: 'Invalid (I)', color: '#6b7280', desc: 'Cache line is invalid — contains no usable data.' },
  },
  {
    id: 'shared',
    type: 'mesiNode',
    position: { x: 250, y: 20 },
    data: { label: 'Shared (S)', color: '#3b82f6', desc: 'This line is valid, clean, and may be in other caches too.' },
  },
  {
    id: 'exclusive',
    type: 'mesiNode',
    position: { x: 500, y: 150 },
    data: { label: 'Exclusive (E)', color: '#22c55e', desc: 'This line is valid, clean, and ONLY in this cache.' },
  },
  {
    id: 'modified',
    type: 'mesiNode',
    position: { x: 250, y: 280 },
    data: { label: 'Modified (M)', color: '#ef4444', desc: 'This line is valid, dirty (modified), and only in this cache.' },
  },
]

const MESI_EDGES = [
  { id: 'e-i-s', source: 'invalid', target: 'shared', label: 'Local Read (others have it)', style: { stroke: '#3b82f6' }, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
  { id: 'e-i-e', source: 'invalid', target: 'exclusive', label: 'Local Read (no one else has it)', style: { stroke: '#22c55e' }, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
  { id: 'e-s-e', source: 'shared', target: 'exclusive', label: 'Local Write (upgrade)', style: { stroke: '#22c55e' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
  { id: 'e-s-i', source: 'shared', target: 'invalid', label: 'Remote Write', style: { stroke: '#ef4444' }, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
  { id: 'e-e-s', source: 'exclusive', target: 'shared', label: 'Remote Read', style: { stroke: '#3b82f6' }, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
  { id: 'e-m', source: 'exclusive', target: 'modified', label: 'Local Write', style: { stroke: '#ef4444' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
  { id: 'e-e-i', source: 'exclusive', target: 'invalid', label: 'Remote Write', style: { stroke: '#ef4444' }, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
  { id: 'e-m-s', source: 'modified', target: 'shared', label: 'Remote Read (write-back)', style: { stroke: '#3b82f6' }, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
  { id: 'e-m-i', source: 'modified', target: 'invalid', label: 'Remote Write (write-back)', style: { stroke: '#ef4444' }, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
]

// ── Custom Node ───────────────────────────────────────────
function MesiNode({ data }) {
  return (
    <div style={{
      padding: '10px 18px', borderRadius: '12px',
      background: `${data.color}18`,
      border: `2px solid ${data.color}`,
      textAlign: 'center', minWidth: '100px',
      boxShadow: `0 0 16px ${data.color}33`,
    }}>
      <Handle type="target" position={Position.Left} style={{ background: data.color, width: 8, height: 8 }} />
      <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, color: data.color }}>
        {data.label}
      </div>
      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '120px', lineHeight: 1.4 }}>
        {data.desc}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: data.color, width: 8, height: 8 }} />
    </div>
  )
}

const nodeTypes = { mesiNode: MesiNode }

// ── Simulation ────────────────────────────────────────────
const ADDRESSES = ['0x00', '0x04', '0x08', '0x0C']

function generateEvents(count) {
  const events = []
  for (let i = 0; i < count; i++) {
    const core = Math.floor(Math.random() * 4) + 1
    const addr = ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)]
    const type = Math.random() > 0.4 ? 'Read' : 'Write'
    events.push({ id: i + 1, core, address: addr, type })
  }
  return events
}

const MESI_STATES = { I: 'Invalid', S: 'Shared', E: 'Exclusive', M: 'Modified' }

function getTransition(prevState, event, otherCoresHaveIt) {
  if (prevState === 'I') {
    if (event.type === 'Read') return otherCoresHaveIt ? { next: 'S', edge: 'i-s' } : { next: 'E', edge: 'i-e' }
    if (event.type === 'Write') return { next: 'M', edge: 'i-e' } // simplified: goes through E then M
  }
  if (prevState === 'S') {
    if (event.type === 'Read') return { next: 'S', edge: null }
    if (event.type === 'Write') return { next: 'M', edge: 's-e' }
  }
  if (prevState === 'E') {
    if (event.type === 'Read') return otherCoresHaveIt ? { next: 'S', edge: 'e-s' } : { next: 'E', edge: null }
    if (event.type === 'Write') return { next: 'M', edge: 'e-m' }
  }
  if (prevState === 'M') {
    if (event.type === 'Read') return otherCoresHaveIt ? { next: 'S', edge: 'm-s' } : { next: 'M', edge: null }
    if (event.type === 'Write') return { next: 'M', edge: null }
  }
  return { next: prevState, edge: null }
}

export default function CacheCoherence() {
  const [coreCount, setCoreCount] = useState(3)
  const [events, setEvents] = useState(() => generateEvents(8))
  const [currentEvent, setCurrentEvent] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)

  // Core cache states: coreId → { addr → state }
  const [coreStates, setCoreStates] = useState(() => {
    const states = {}
    for (let c = 1; c <= 4; c++) {
      states[c] = {}
      for (const addr of ADDRESSES) {
        states[c][addr] = 'I'
      }
    }
    return states
  })

  const [busLog, setBusLog] = useState([])
  const [activeEdge, setActiveEdge] = useState(null)

  const [nodes, setNodes, onNodesChange] = useNodesState(MESI_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState(MESI_EDGES)

  const visibleEvents = currentEvent >= 0 ? events.slice(0, currentEvent + 1) : []

  const handleStepForward = () => {
    if (currentEvent < events.length - 1) {
      const nextIdx = currentEvent + 1
      const event = events[nextIdx]
      const prevState = coreStates[event.core]?.[event.address] || 'I'

      // Check if other cores have this address
      let otherHaveIt = false
      for (let c = 1; c <= coreCount; c++) {
        if (c !== event.core && coreStates[c]?.[event.address] !== 'I') {
          otherHaveIt = true
          break
        }
      }

      const { next, edge } = getTransition(prevState, event, otherHaveIt)

      // Update state
      const newStates = JSON.parse(JSON.stringify(coreStates))

      // On remote read/write, invalidate/shared other cores
      for (let c = 1; c <= coreCount; c++) {
        if (c !== event.core) {
          if (event.type === 'Write') {
            newStates[c][event.address] = 'I'
          } else if (event.type === 'Read' && next === 'S' && newStates[c][event.address] !== 'I') {
            // Keep others in Shared
          }
        }
      }
      newStates[event.core][event.address] = next

      setCoreStates(newStates)
      setActiveEdge(edge)
      setCurrentEvent(nextIdx)

      const logEntry = `C${event.core} ${event.type} ${event.address}: ${prevState} → ${next}`
      setBusLog(prev => [...prev, logEntry])
    }
  }

  const handleStepBack = () => {
    if (currentEvent >= 0) {
      setCurrentEvent(e => e - 1)
      setActiveEdge(null)
      // Rebuild state from scratch up to currentEvent - 1
      rebuildState(currentEvent - 1)
      setBusLog(prev => prev.slice(0, -1))
    }
  }

  const rebuildState = (upTo) => {
    const states = {}
    for (let c = 1; c <= 4; c++) {
      states[c] = {}
      for (const addr of ADDRESSES) {
        states[c][addr] = 'I'
      }
    }

    for (let i = 0; i <= upTo; i++) {
      if (i >= events.length) break
      const event = events[i]
      const prevState = states[event.core]?.[event.address] || 'I'
      let otherHaveIt = false
      for (let c = 1; c <= coreCount; c++) {
        if (c !== event.core && states[c]?.[event.address] !== 'I') {
          otherHaveIt = true
          break
        }
      }
      const { next } = getTransition(prevState, event, otherHaveIt)
      for (let c = 1; c <= coreCount; c++) {
        if (c !== event.core && event.type === 'Write') {
          states[c][event.address] = 'I'
        }
      }
      states[event.core][event.address] = next
    }
    setCoreStates(states)
  }

  const handleRunAll = async () => {
    setIsRunning(true)
    setCurrentEvent(-1)
    setBusLog([])
    // Full reset
    const freshStates = {}
    for (let c = 1; c <= 4; c++) {
      freshStates[c] = {}
      for (const addr of ADDRESSES) {
        freshStates[c][addr] = 'I'
      }
    }
    setCoreStates(freshStates)

    for (let i = 0; i < events.length; i++) {
      await new Promise(r => setTimeout(r, 600))
      // Re-run step logic
      const event = events[i]
      const prevState = freshStates[event.core]?.[event.address] || 'I'
      let otherHaveIt = false
      for (let c = 1; c <= coreCount; c++) {
        if (c !== event.core && freshStates[c]?.[event.address] !== 'I') {
          otherHaveIt = true
          break
        }
      }
      const { next, edge } = getTransition(prevState, event, otherHaveIt)
      for (let c = 1; c <= coreCount; c++) {
        if (c !== event.core && event.type === 'Write') {
          freshStates[c][event.address] = 'I'
        }
      }
      freshStates[event.core][event.address] = next
      setCoreStates({ ...freshStates })
      setActiveEdge(edge)
      setCurrentEvent(i)
      setBusLog(prev => [...prev, `C${event.core} ${event.type} ${event.address}: ${prevState} → ${next}`])
    }
    setIsRunning(false)
  }

  const handleReset = () => {
    setCurrentEvent(-1)
    setActiveEdge(null)
    setBusLog([])
    setEvents(generateEvents(8))
    const freshStates = {}
    for (let c = 1; c <= 4; c++) {
      freshStates[c] = {}
      for (const addr of ADDRESSES) {
        freshStates[c][addr] = 'I'
      }
    }
    setCoreStates(freshStates)
  }

  const stateColor = (state) => {
    switch (state) {
      case 'I': return '#6b7280'
      case 'S': return '#3b82f6'
      case 'E': return '#22c55e'
      case 'M': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit IV · Tool 3
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Cache Coherence (MESI)
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Step through Read/Write events and watch the MESI protocol maintain coherence across cores.
        </p>
      </div>

      {/* Config */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Cores
          </label>
          <select value={coreCount} onChange={e => { setCoreCount(parseInt(e.target.value)); handleReset() }} className="input-field" style={{ width: '70px' }}>
            {[2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <StepBtn onClick={handleStepBack} disabled={currentEvent < 0 || isRunning}>← Back</StepBtn>
        <StepBtn onClick={handleStepForward} disabled={currentEvent >= events.length - 1 || isRunning}>Step →</StepBtn>
        <button onClick={handleRunAll} disabled={isRunning} style={accentBtn(isRunning)}>
          {isRunning ? '⏳ Running...' : '▶ Run All'}
        </button>
        <StepBtn onClick={handleReset}>↺ Reset</StepBtn>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          Event {currentEvent + 1} / {events.length}
        </span>
      </div>

      {/* Main layout: MESI state machine + Cache table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* MESI State Machine Diagram */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden', height: '380px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges.map(e => ({
              ...e,
              style: { ...e.style, stroke: activeEdge === e.id ? e.style?.stroke || '#fff' : e.style?.stroke || 'var(--border)', strokeWidth: activeEdge === e.id ? 3 : 1 },
              animated: activeEdge === e.id || e.animated,
            }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="var(--border)" gap={20} size={1} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        {/* Per-core cache state table */}
        <div className="glass-card" style={{ padding: '12px', overflow: 'auto' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '10px' }}>
            CACHE STATES
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '4px 8px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '9px', fontWeight: 500 }}>Core</th>
                {ADDRESSES.map(addr => (
                  <th key={addr} style={{ padding: '4px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '9px', fontWeight: 500 }}>{addr}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: coreCount }, (_, i) => {
                const core = i + 1
                return (
                  <tr key={core} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 8px', color: 'var(--text)', fontWeight: 600 }}>C{core}</td>
                    {ADDRESSES.map(addr => {
                      const state = coreStates[core]?.[addr] || 'I'
                      return (
                        <td key={addr} style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '28px', height: '28px', borderRadius: '6px',
                            background: `${stateColor(state)}22`,
                            border: `1px solid ${stateColor(state)}44`,
                            color: stateColor(state),
                            fontWeight: 700, fontSize: '13px',
                          }}>
                            {state}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
            {Object.entries(MESI_STATES).map(([abbr, name]) => (
              <span key={abbr} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: stateColor(abbr) }}/>
                {abbr}={name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bus Transaction Log */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
          BUS TRANSACTION LOG ({busLog.length})
        </div>
        <div style={{ maxHeight: '150px', overflow: 'auto', padding: '4px 0' }}>
          {busLog.length === 0 ? (
            <div style={{ padding: '20px 14px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              Step through events to see bus transactions.
            </div>
          ) : (
            busLog.map((entry, idx) => (
              <div key={idx} style={{
                padding: '5px 14px', fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text)',
                borderLeft: idx === busLog.length - 1 ? '2px solid var(--accent)' : '2px solid transparent',
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>#{idx + 1} </span>
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StepBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border)',
      background: 'transparent', color: disabled ? 'var(--text-muted)' : 'var(--text)',
      fontFamily: 'var(--mono)', fontSize: '10px',
      cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1,
      transition: 'all 0.2s',
    }}>
      {children}
    </button>
  )
}

function accentBtn(disabled) {
  return {
    padding: '7px 14px', borderRadius: '8px',
    border: '1px solid var(--accent-border)',
    background: 'var(--accent-dim)',
    color: disabled ? 'var(--text-muted)' : 'var(--accent-text)',
    fontFamily: 'var(--mono)', fontSize: '10px',
    cursor: disabled ? 'default' : 'pointer',
    fontWeight: 600, opacity: disabled ? 0.4 : 1,
  }
}
