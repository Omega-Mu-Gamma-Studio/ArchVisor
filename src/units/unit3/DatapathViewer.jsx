/**
 * DatapathViewer — Interactive labeled diagram of the full 5-stage MIPS datapath
 *
 * Uses React Flow 11 for the node/edge graph
 * Nodes: PC, Instruction Memory, IF/ID Register, Register File, Sign Extend,
 *        ID/EX Register, ALU, MUXes, EX/MEM Register, Data Memory, MEM/WB Register
 * Color-coded by stage: IF (blue), ID (purple), EX (green), MEM (orange), WB (red)
 * Hover a node → tooltip with stage info
 * Click pipeline register → shows stored fields panel
 */

import { useState, useCallback, useMemo } from 'react'
import ReactFlow, {
  Handle,
  Position,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'

// ── Node definitions ───────────────────────────────────────
const STAGE_COLORS = {
  IF:   { bg: '#3b82f6', dim: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', label: 'IF' },
  ID:   { bg: '#8b5cf6', dim: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6', label: 'ID' },
  EX:   { bg: '#22c55e', dim: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', label: 'EX' },
  MEM:  { bg: '#f59e0b', dim: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', label: 'MEM' },
  WB:   { bg: '#ef4444', dim: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', label: 'WB' },
}

// Node data template
const initialNodes = [
  // ── IF Stage ────────────────────────
  {
    id: 'pc',
    type: 'datapathNode',
    position: { x: 50, y: 180 },
    data: {
      label: 'PC',
      stage: 'IF',
      description: 'Program Counter — holds address of current instruction.',
      inputs: ['Next PC from ID'],
      outputs: ['Address to Instruction Memory'],
    },
  },
  {
    id: 'inst-mem',
    type: 'datapathNode',
    position: { x: 220, y: 180 },
    data: {
      label: 'Instruction\nMemory',
      stage: 'IF',
      description: 'Reads instruction at PC address.',
      inputs: ['PC address'],
      outputs: ['Instruction to IF/ID'],
    },
  },
  {
    id: 'ifid',
    type: 'pipelineRegNode',
    position: { x: 420, y: 180 },
    data: {
      label: 'IF / ID',
      stage: 'IF',
      description: 'Pipeline register between Fetch and Decode stages.',
      fields: [
        { name: 'PC+4', width: 32 },
        { name: 'Instruction', width: 32 },
      ],
    },
  },

  // ── ID Stage ────────────────────────
  {
    id: 'reg-file',
    type: 'datapathNode',
    position: { x: 580, y: 130 },
    data: {
      label: 'Register\nFile',
      stage: 'ID',
      description: 'Reads registers rs and rt. Writes rd (rd from WB).',
      inputs: ['rs, rt addresses from IF/ID', 'Write data from MEM/WB'],
      outputs: ['rs data, rt data to ID/EX'],
    },
  },
  {
    id: 'sign-ext',
    type: 'datapathNode',
    position: { x: 580, y: 300 },
    data: {
      label: 'Sign\nExtend',
      stage: 'ID',
      description: 'Extends 16-bit immediate to 32 bits.',
      inputs: ['16-bit immediate from IF/ID'],
      outputs: ['32-bit extended immediate to ID/EX'],
    },
  },
  {
    id: 'idex',
    type: 'pipelineRegNode',
    position: { x: 780, y: 180 },
    data: {
      label: 'ID / EX',
      stage: 'ID',
      description: 'Pipeline register between Decode and Execute stages.',
      fields: [
        { name: 'PC+4', width: 32 },
        { name: 'Read data 1', width: 32 },
        { name: 'Read data 2', width: 32 },
        { name: 'Sign-ext imm', width: 32 },
        { name: 'rt', width: 5 },
        { name: 'rd', width: 5 },
        { name: 'Control', width: 8 },
      ],
    },
  },

  // ── EX Stage ────────────────────────
  {
    id: 'mux-alu-src',
    type: 'muxNode',
    position: { x: 870, y: 280 },
    data: {
      label: 'MUX\n(ALUSrc)',
      stage: 'EX',
      description: 'Selects ALU input B: register data or immediate.',
    },
  },
  {
    id: 'alu',
    type: 'datapathNode',
    position: { x: 1000, y: 180 },
    data: {
      label: 'ALU',
      stage: 'EX',
      description: 'Performs arithmetic/logical operations.',
      inputs: ['Read data 1 from ID/EX', 'Read data 2 or Immediate'],
      outputs: ['ALU result to EX/MEM'],
    },
  },
  {
    id: 'exmem',
    type: 'pipelineRegNode',
    position: { x: 1180, y: 180 },
    data: {
      label: 'EX / MEM',
      stage: 'EX',
      description: 'Pipeline register between Execute and Memory stages.',
      fields: [
        { name: 'PC+4', width: 32 },
        { name: 'ALU result', width: 32 },
        { name: 'Write data', width: 32 },
        { name: 'rd', width: 5 },
        { name: 'Control', width: 4 },
      ],
    },
  },

  // ── MEM Stage ───────────────────────
  {
    id: 'data-mem',
    type: 'datapathNode',
    position: { x: 1340, y: 180 },
    data: {
      label: 'Data\nMemory',
      stage: 'MEM',
      description: 'Reads or writes data at ALU result address.',
      inputs: ['ALU result from EX/MEM', 'Write data from EX/MEM'],
      outputs: ['Read data to MEM/WB'],
    },
  },
  {
    id: 'memwb',
    type: 'pipelineRegNode',
    position: { x: 1520, y: 180 },
    data: {
      label: 'MEM / WB',
      stage: 'MEM',
      description: 'Pipeline register between Memory and Write-Back stages.',
      fields: [
        { name: 'ALU result', width: 32 },
        { name: 'Read data', width: 32 },
        { name: 'rd', width: 5 },
        { name: 'Control', width: 2 },
      ],
    },
  },

  // ── WB Stage ────────────────────────
  {
    id: 'mux-wb',
    type: 'muxNode',
    position: { x: 1650, y: 220 },
    data: {
      label: 'MUX\n(MemtoReg)',
      stage: 'WB',
      description: 'Selects write-back data: ALU result or memory data.',
    },
  },
]

// ── Edge definitions ───────────────────────────────────────
const initialEdges = [
  // IF
  { id: 'e-pc-im', source: 'pc', target: 'inst-mem', animated: true, style: { stroke: STAGE_COLORS.IF.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.IF.bg } },
  { id: 'e-im-ifid', source: 'inst-mem', target: 'ifid', animated: true, style: { stroke: STAGE_COLORS.IF.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.IF.bg } },

  // ID
  { id: 'e-ifid-rf', source: 'ifid', target: 'reg-file', style: { stroke: STAGE_COLORS.ID.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.ID.bg } },
  { id: 'e-ifid-se', source: 'ifid', target: 'sign-ext', style: { stroke: STAGE_COLORS.ID.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.ID.bg } },
  { id: 'e-rf-idex', source: 'reg-file', target: 'idex', style: { stroke: STAGE_COLORS.ID.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.ID.bg } },
  { id: 'e-se-idex', source: 'sign-ext', target: 'idex', style: { stroke: STAGE_COLORS.ID.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.ID.bg } },

  // EX
  { id: 'e-idex-mux', source: 'idex', target: 'mux-alu-src', style: { stroke: STAGE_COLORS.EX.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.EX.bg } },
  { id: 'e-mux-alu', source: 'mux-alu-src', target: 'alu', animated: true, style: { stroke: STAGE_COLORS.EX.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.EX.bg } },
  { id: 'e-idex-alu', source: 'idex', target: 'alu', style: { stroke: STAGE_COLORS.EX.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.EX.bg } },
  { id: 'e-alu-exmem', source: 'alu', target: 'exmem', style: { stroke: STAGE_COLORS.EX.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.EX.bg } },

  // MEM
  { id: 'e-exmem-dm', source: 'exmem', target: 'data-mem', style: { stroke: STAGE_COLORS.MEM.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.MEM.bg } },
  { id: 'e-dm-memwb', source: 'data-mem', target: 'memwb', style: { stroke: STAGE_COLORS.MEM.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.MEM.bg } },
  { id: 'e-exmem-memwb', source: 'exmem', target: 'memwb', style: { stroke: STAGE_COLORS.MEM.bg, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.MEM.bg } },

  // WB
  { id: 'e-memwb-muxwb', source: 'memwb', target: 'mux-wb', style: { stroke: STAGE_COLORS.WB.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.WB.bg } },
  { id: 'e-muxwb-rf', source: 'mux-wb', target: 'reg-file', animated: true, style: { stroke: STAGE_COLORS.WB.bg }, markerEnd: { type: MarkerType.ArrowClosed, color: STAGE_COLORS.WB.bg } },
]

// ── Custom Node Components ────────────────────────────────
function DatapathNode({ data }) {
  const stageColor = STAGE_COLORS[data.stage] || STAGE_COLORS.IF
  return (
    <div
      className="glass-card"
      style={{
        padding: '10px 14px',
        borderRadius: '10px',
        border: `1.5px solid ${stageColor.bg}`,
        background: stageColor.dim,
        minWidth: '100px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: `0 0 12px ${stageColor.bg}22`,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: stageColor.bg, width: 8, height: 8 }} />
      <div style={{
        fontFamily: 'var(--mono)', fontSize: '9px',
        color: stageColor.bg, fontWeight: 600,
        letterSpacing: '0.08em', marginBottom: '2px',
      }}>
        {stageColor.label}
      </div>
      <div style={{
        fontSize: '12px', fontWeight: 600, color: 'var(--text-h)',
        whiteSpace: 'pre-line', lineHeight: 1.3,
      }}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: stageColor.bg, width: 8, height: 8 }} />
    </div>
  )
}

function PipelineRegNode({ data }) {
  const stageColor = STAGE_COLORS[data.stage] || STAGE_COLORS.IF
  return (
    <div
      className="glass-card"
      style={{
        padding: '8px 12px',
        borderRadius: '10px',
        border: `2px dashed ${stageColor.bg}`,
        background: stageColor.dim,
        minWidth: '80px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: stageColor.bg, width: 8, height: 8 }} />
      <div style={{
        fontFamily: 'var(--mono)', fontSize: '8px',
        color: stageColor.bg, fontWeight: 600,
        letterSpacing: '0.08em', marginBottom: '2px',
      }}>
        REG
      </div>
      <div style={{
        fontSize: '11px', fontWeight: 600, color: 'var(--text-h)',
        whiteSpace: 'pre-line', lineHeight: 1.3,
      }}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: stageColor.bg, width: 8, height: 8 }} />
    </div>
  )
}

function MuxNode({ data }) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '6px 10px',
        borderRadius: '6px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        minWidth: '50px',
        textAlign: 'center',
        fontSize: '9px',
        fontFamily: 'var(--mono)',
        color: 'var(--text-muted)',
        fontWeight: 600,
        whiteSpace: 'pre-line',
        lineHeight: 1.3,
        cursor: 'pointer',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#9ca3af', width: 6, height: 6 }} />
      {data.label}
      <Handle type="source" position={Position.Right} style={{ background: '#9ca3af', width: 6, height: 6 }} />
    </div>
  )
}

const nodeTypes = {
  datapathNode: DatapathNode,
  pipelineRegNode: PipelineRegNode,
  muxNode: MuxNode,
}

// ── Main Component ────────────────────────────────────────
const NODE_INFO = {
  pc: {
    title: 'Program Counter (PC)',
    desc: 'Holds the memory address of the current instruction. Updated each cycle to PC+4 (or branch/jump target).',
    signals: 'Output: 32-bit address to Instruction Memory',
  },
  'inst-mem': {
    title: 'Instruction Memory',
    desc: 'Read-only memory that fetches the instruction at the PC address. Takes 1 cycle (IF stage).',
    signals: 'Input: PC address | Output: 32-bit instruction',
  },
  'ifid': {
    title: 'IF/ID Pipeline Register',
    desc: 'Stores the fetched instruction and PC+4 between the IF and ID stages. Updated every cycle.',
    signals: 'Fields: Instruction (32), PC+4 (32), total 64 bits',
  },
  'reg-file': {
    title: 'Register File',
    desc: 'Contains 32 × 32-bit general-purpose registers ($0–$31). Reads two registers (rs, rt) simultaneously in the ID stage. Written in the WB stage.',
    signals: 'Inputs: rs addr, rt addr, write addr, write data | Outputs: read data 1, read data 2',
  },
  'sign-ext': {
    title: 'Sign Extend',
    desc: 'Extends the 16-bit immediate field from the I-type instruction to 32 bits by replicating the sign bit.',
    signals: 'Input: 16-bit immediate (offset) | Output: 32-bit sign-extended value',
  },
  'idex': {
    title: 'ID/EX Pipeline Register',
    desc: 'Stores control signals, register data, and immediates between the ID and EX stages.',
    signals: 'Fields: PC+4, Read data 1, Read data 2, Sign-ext imm, rt, rd, Control',
  },
  'mux-alu-src': {
    title: 'ALUSrc Multiplexer',
    desc: 'Selects the second ALU operand: read data 2 (for R-type) or sign-extended immediate (for I-type).',
    signals: 'Select = 0 → Register data | Select = 1 → Immediate',
  },
  'alu': {
    title: 'ALU (Arithmetic Logic Unit)',
    desc: 'Performs arithmetic (add, sub) and logical (and, or, nor, slt) operations. Takes 1 cycle (EX stage).',
    signals: 'Inputs: 32-bit A, 32-bit B, ALU control (4 bits) | Output: 32-bit result, Zero flag',
  },
  'exmem': {
    title: 'EX/MEM Pipeline Register',
    desc: 'Stores ALU result, write data, and control signals between the EX and MEM stages.',
    signals: 'Fields: PC+4, ALU result, Write data, rd, Control',
  },
  'data-mem': {
    title: 'Data Memory',
    desc: 'Read or write memory at the address computed by the ALU. Used by lw (read) and sw (write) instructions.',
    signals: 'Inputs: Address (ALU result), Write data | Output: Read data',
  },
  'memwb': {
    title: 'MEM/WB Pipeline Register',
    desc: 'Stores ALU result, memory read data, and write-back control between MEM and WB stages.',
    signals: 'Fields: ALU result, Read data, rd, Control',
  },
  'mux-wb': {
    title: 'MemtoReg Multiplexer',
    desc: 'Selects data to write back to the register file: ALU result (for R-type, addi) or memory data (for lw).',
    signals: 'Select = 0 → ALU result | Select = 1 → Memory read data',
  },
}

export default function DatapathViewer() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
  }, [])

  const onNodeMouseEnter = useCallback((event, node) => {
    setHoveredNode(node)
  }, [])

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null)
  }, [])

  const selectedInfo = selectedNode ? NODE_INFO[selectedNode.id] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit III · Tool 1
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          MIPS Datapath Viewer
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Interactive 5-stage MIPS datapath — hover nodes for info, click pipeline registers for field details.
        </p>
      </div>

      {/* Stage color legend */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontFamily: 'var(--mono)', fontSize: '10px' }}>
        {Object.entries(STAGE_COLORS).map(([stage, color]) => (
          <span key={stage} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: color.bg }}/>
            {stage} · {color.label}
          </span>
        ))}
      </div>

      {/* React Flow canvas */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', height: '520px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.3}
          maxZoom={2}
        >
          <Background color="var(--border)" gap={20} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeStrokeColor="var(--border)"
            nodeColor={(n) => {
              const stageColor = STAGE_COLORS[n.data?.stage]
              return stageColor?.bg || '#374151'
            }}
            maskColor="var(--surface)"
            style={{ border: '1px solid var(--border)' }}
          />
        </ReactFlow>
      </div>

      {/* Info panel */}
      <AnimatePresence mode="wait">
        {selectedInfo ? (
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass-card"
            style={{ padding: '20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent-text)', letterSpacing: '0.08em' }}>
                  {selectedNode.data.stage} STAGE
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-h)', marginTop: '4px' }}>
                  {selectedInfo.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: '4px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '8px' }}>
              {selectedInfo.desc}
            </p>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              {selectedInfo.signals}
            </p>
          </motion.div>
        ) : hoveredNode && NODE_INFO[hoveredNode.id] ? (
          <motion.div
            key={`hover-${hoveredNode.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card"
            style={{ padding: '14px' }}
          >
            <div style={{
              fontFamily: 'var(--mono)', fontSize: '10px',
              color: STAGE_COLORS[hoveredNode.data?.stage]?.bg || 'var(--text-muted)',
              fontWeight: 600, marginBottom: '4px',
            }}>
              {hoveredNode.data?.stage} · {NODE_INFO[hoveredNode.id].title}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
              {NODE_INFO[hoveredNode.id].desc}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card"
            style={{ padding: '14px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}
          >
            Click any node for details. Click pipeline registers (dashed borders) for field widths.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pipeline register field details */}
      {selectedNode && selectedNode.type === 'pipelineRegNode' && selectedNode.data.fields && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '16px' }}
        >
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent-text)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '12px' }}>
            PIPELINE REGISTER FIELDS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {selectedNode.data.fields.map((field, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--mono)', fontSize: '11px',
              }}>
                <span style={{ color: 'var(--text)' }}>{field.name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                  {field.width} bits
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
