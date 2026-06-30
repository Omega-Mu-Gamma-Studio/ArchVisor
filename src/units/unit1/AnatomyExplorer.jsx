/**
 * AnatomyExplorer — Interactive computer functional unit diagram
 *
 * Uses React Flow 11 to render functional unit nodes with
 * animated data flow edges and clickable tooltip panels.
 */

import { useState, useCallback } from 'react'
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

// ── Custom Node ──────────────────────────────────────────────

const COLORS = {
  cu: '#3b82f6',
  alu: '#22c55e',
  memory: '#a855f7',
  io: '#f97316',
  bus: '#6b7280',
}

const GLOW = {
  cu: 'rgba(59, 130, 246, 0.2)',
  alu: 'rgba(34, 197, 94, 0.2)',
  memory: 'rgba(168, 85, 247, 0.2)',
  io: 'rgba(249, 115, 22, 0.2)',
}

const UNIT_INFO = {
  'cu': {
    label: 'Control Unit (CU)',
    desc: 'Directs the operation of the processor. Decodes instructions and generates control signals that coordinate the execution of operations across the datapath.',
    role: 'Fetches instructions from memory → decodes them → issues control signals to ALU, registers, and buses.',
    bus: 'Control Bus — carries control signals (read/write, interrupt requests) from CU to all other units.',
  },
  'alu': {
    label: 'Arithmetic Logic Unit (ALU)',
    desc: 'Performs arithmetic (add, subtract) and logical (AND, OR, NOT) operations on data received from registers or memory.',
    role: 'Receives operands from register file → computes result → writes back to register file or memory.',
    bus: 'Data Bus — carries operand values to ALU and result values from ALU.',
  },
  'memory': {
    label: 'Main Memory (RAM)',
    desc: 'Stores instructions and data. The CPU exchanges data with memory via load and store operations.',
    role: 'Holds the program being executed. Provides instructions to the CPU and stores/retrieves data on demand.',
    bus: 'Address Bus (address selection) + Data Bus (data transfer) + Control Bus (read/write signals).',
  },
  'io': {
    label: 'I/O Devices',
    desc: 'Handles input from peripherals (keyboard, mouse) and output to displays, storage, and network interfaces.',
    role: 'Bridges the computer system to the outside world. Uses programmed I/O, interrupts, or DMA to communicate.',
    bus: 'System Bus — I/O devices communicate through bus controllers and adapters.',
  },
}

function FunctionalUnitNode({ data, selected }) {
  const unit = UNIT_INFO[data.id] || {}
  const color = COLORS[data.id] || '#666'
  const glow = GLOW[data.id] || 'rgba(0,0,0,0.1)'

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${color}22, transparent)`,
        border: `1.5px solid ${selected ? color : color}55`,
        borderRadius: '14px',
        padding: '16px 20px',
        minWidth: data.id === 'memory' ? '140px' : '120px',
        boxShadow: selected ? `0 0 24px ${glow}` : `0 0 8px ${glow}`,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      {data.id !== 'bus' && (
        <Handle type="target" position={Position.Top} style={{ background: color, width: 8, height: 8 }} />
      )}
      <div style={{ fontSize: '22px', marginBottom: '4px' }}>{data.emoji}</div>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: '12px',
        fontWeight: 600,
        color: selected ? color : 'var(--text-h)',
        transition: 'color 0.2s',
      }}>
        {data.label}
      </div>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: '9px',
        color: 'var(--text-muted)',
        marginTop: '4px',
      }}>
        {data.id.toUpperCase()}
      </div>
      {data.id === 'cpu' && (
        <div style={{
          display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '8px',
        }}>
          <span style={{
            padding: '2px 8px', borderRadius: '4px', fontSize: '9px',
            background: `${COLORS.cu}33`, color: COLORS.cu, fontFamily: 'var(--mono)',
          }}>CU</span>
          <span style={{
            padding: '2px 8px', borderRadius: '4px', fontSize: '9px',
            background: `${COLORS.alu}33`, color: COLORS.alu, fontFamily: 'var(--mono)',
          }}>ALU</span>
        </div>
      )}
      {data.id !== 'bus' && (
        <Handle type="source" position={Position.Bottom} style={{ background: color, width: 8, height: 8 }} />
      )}
    </div>
  )
}

const nodeTypes = { functionalUnit: FunctionalUnitNode }

// ── Initial Layout ───────────────────────────────────────────

const INITIAL_NODES = [
  {
    id: 'cpu',
    type: 'functionalUnit',
    position: { x: 250, y: 0 },
    data: { id: 'cpu', label: 'CPU', emoji: '⚙️' },
  },
  {
    id: 'memory',
    type: 'functionalUnit',
    position: { x: 250, y: 180 },
    data: { id: 'memory', label: 'Main Memory', emoji: '🧠' },
  },
  {
    id: 'io',
    type: 'functionalUnit',
    position: { x: 400, y: 340 },
    data: { id: 'io', label: 'I/O Devices', emoji: '🖥️' },
  },
  {
    id: 'bus',
    type: 'functionalUnit',
    position: { x: 30, y: 260 },
    data: { id: 'bus', label: 'Buses', emoji: '🔗' },
  },
]

const INITIAL_EDGES = [
  {
    id: 'e-cpu-memory',
    source: 'cpu', target: 'memory',
    animated: true,
    style: { stroke: COLORS.memory, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.memory },
  },
  {
    id: 'e-memory-io',
    source: 'memory', target: 'io',
    animated: true,
    style: { stroke: COLORS.io, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.io },
  },
  {
    id: 'e-cpu-bus',
    source: 'cpu', target: 'bus',
    animated: false,
    style: { stroke: COLORS.bus, strokeWidth: 2, strokeDasharray: '5 3' },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.bus },
  },
  {
    id: 'e-bus-memory',
    source: 'bus', target: 'memory',
    animated: false,
    style: { stroke: COLORS.bus, strokeWidth: 2, strokeDasharray: '5 3' },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.bus },
  },
  {
    id: 'e-bus-io',
    source: 'bus', target: 'io',
    animated: false,
    style: { stroke: COLORS.bus, strokeWidth: 2, strokeDasharray: '5 3' },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.bus },
  },
]

export default function AnatomyExplorer() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [animating, setAnimating] = useState(false)

  const onNodeClick = useCallback((event, node) => {
    setSelectedUnit(node.data)

    // Animate edges: toggle animation on clicked node's edges
    setEdges((eds) =>
      eds.map((e) => {
        if (e.source === node.id || e.target === node.id) {
          return { ...e, animated: true, style: { ...e.style, strokeWidth: 3 } }
        }
        return { ...e, animated: false, style: { ...e.style, strokeWidth: 2 } }
      })
    )

    // Pulse the selected node
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === node.id,
      }))
    )
  }, [setEdges, setNodes])

  const onPaneClick = useCallback(() => {
    setSelectedUnit(null)
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })))
    setEdges((eds) => eds.map((e) => ({ ...e, animated: true, style: { ...e.style, strokeWidth: 2 } })))
  }, [setNodes, setEdges])

  const unitInfo = selectedUnit ? UNIT_INFO[selectedUnit.id] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '4px' }}>
            Computer Anatomy Explorer
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Click any component to see its role and data flow path.
          </p>
        </div>
      </div>

      {/* React Flow Diagram */}
      <div
        className="glass-card"
        style={{ height: '560px', minHeight: '560px', padding: '0', overflow: 'hidden' }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: false }}
          style={{ background: 'var(--bg)' }}
        >
          <Background color="var(--border)" gap={24} />
          <Controls
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              button: { color: 'var(--text)', borderColor: 'var(--border)', fill: 'var(--text)' },
            }}
          />
        </ReactFlow>
      </div>

      {/* Info Panel */}
      <AnimatePresence mode="wait">
        {unitInfo ? (
          <motion.div
            key={selectedUnit?.id || 'none'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="glass-card"
            style={{
              padding: '20px 24px',
              borderLeft: `3px solid ${COLORS[selectedUnit?.id] || 'var(--accent)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span style={{ fontSize: '24px' }}>{selectedUnit?.emoji}</span>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-h)' }}>{unitInfo.label}</h4>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: '10px',
                  color: COLORS[selectedUnit?.id] || 'var(--accent-text)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {selectedUnit?.id.toUpperCase()}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '12px' }}>
              {unitInfo.desc}
            </p>

            <div style={{
              padding: '10px 14px',
              background: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent-text)', marginBottom: '4px' }}>
                FETCH-DECODE-EXECUTE CYCLE
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
                {unitInfo.role}
              </p>
            </div>

            <div style={{
              marginTop: '10px',
              padding: '10px 14px',
              background: `${COLORS[selectedUnit?.id] || 'var(--accent)'}0a`,
              borderRadius: '8px',
              border: `1px solid ${COLORS[selectedUnit?.id] || 'var(--accent)'}22`,
            }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: COLORS[selectedUnit?.id] || 'var(--accent-text)', marginBottom: '4px' }}>
                BUS COMMUNICATION
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
                {unitInfo.bus}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '16px',
              fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)',
            }}
          >
            Click any component in the diagram above to learn about its role.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
