import { useParams, useNavigate } from 'react-router-dom'

const UNIT_DATA = {
  1: {
    roman: 'I', title: 'Basic Structure of a Computer System',
    tools: [
      { id: 'anatomy-explorer',    name: 'Computer Anatomy Explorer',      desc: 'Interactive SVG diagram of functional units. Click any component to animate data flow.', complexity: 'Medium',      priority: 'High' },
      { id: 'instruction-encoder', name: 'MIPS Instruction Encoder',       desc: 'Encode assembly → color-coded bit-field breakdown. Decode binary/hex → labeled fields.', complexity: 'Medium-High', priority: 'High' },
      { id: 'register-viewer',     name: 'Register File Viewer',           desc: 'Live grid of all 32 MIPS registers with ABI names, values, and write-flash animations.',  complexity: 'Low',         priority: 'Medium' },
      { id: 'mips-executor',       name: 'MIPS Mini-Executor',             desc: 'Step through MIPS instructions, watch the register file update live. 17 core instructions.', complexity: 'High',       priority: 'High' },
    ]
  },
  2: {
    roman: 'II', title: 'Arithmetic for Computers',
    tools: [
      { id: 'binary-adder',     name: 'Binary Adder / Subtractor',         desc: 'Full binary column addition with carry bits, overflow detection, and 2\'s complement.', complexity: 'Low-Medium', priority: 'High' },
      { id: 'booth',            name: "Booth's Multiplication Visualizer", desc: "Step through Booth's Algorithm iteration by iteration — Accumulator/Q/Q-1 state.",    complexity: 'Medium',     priority: 'High' },
      { id: 'restoring-div',    name: 'Restoring Division Visualizer',     desc: 'Step through restoring division — partial remainder, subtraction, restore logic.',       complexity: 'Medium',     priority: 'Medium' },
      { id: 'ieee754',          name: 'IEEE 754 Floating Point Explorer',  desc: 'Decimal to IEEE 754 bit layout. FP add/subtract with alignment and rounding.',           complexity: 'High',       priority: 'High' },
      { id: 'subword-demo',     name: 'Subword Parallelism Demo',          desc: 'Animated SIMD-style: packing multiple values into one register, operating all lanes.',    complexity: 'Low',        priority: 'Low' },
    ]
  },
  3: {
    roman: 'III', title: 'Processor and Control Unit',
    tools: [
      { id: 'datapath-viewer',       name: 'MIPS Datapath Viewer',          desc: 'Interactive labeled diagram of the full 5-stage MIPS datapath and control signals.',  complexity: 'Medium-High', priority: 'High' },
      { id: 'pipeline-animator',     name: 'Pipeline Diagram Animator ⭐',  desc: 'FLAGSHIP — MIPS instruction sequence → animated cycle-by-cycle pipeline timing.',      complexity: 'Very High',  priority: 'Critical' },
      { id: 'hazard-classifier',     name: 'Hazard Classifier',             desc: 'Color-coded hazard report: RAW, WAW, WAR, control, and structural hazards.',           complexity: 'Medium',     priority: 'High' },
      { id: 'superscalar-comparator',name: 'Superscalar Comparator',        desc: 'Side-by-side: scalar vs. 2-issue superscalar. Shows IPC and speedup ratio.',           complexity: 'High',       priority: 'Medium' },
    ]
  },
  4: {
    roman: 'IV', title: 'Parallelism',
    tools: [
      { id: 'flynn-taxonomy',         name: "Flynn's Taxonomy Explorer",    desc: 'Clickable 2×2 quadrant — SISD/SIMD/MIMD/MISD with animated execution models.',       complexity: 'Low-Medium', priority: 'High' },
      { id: 'multithreading',         name: 'Multithreading Visualizer',    desc: 'Timeline of coarse-grained, fine-grained, and SMT. CPU utilization bars.',            complexity: 'Medium',     priority: 'Medium' },
      { id: 'cache-coherence',        name: 'Cache Coherence Explorer',     desc: 'Walk through MESI state machine across 2–4 cores. Per-core cache line transitions.',  complexity: 'Medium-High',priority: 'High' },
      { id: 'gpu-explainer',          name: 'GPU Architecture Explainer',   desc: 'Guided tour of SMs, SIMT execution, warp scheduling, and thread blocks.',             complexity: 'Low-Medium', priority: 'Medium' },
      { id: 'cluster-overview',       name: 'Cluster & Message-Passing',    desc: 'Clusters, warehouse-scale computing, and animated MPI-style send/receive.',           complexity: 'Low',        priority: 'Low' },
    ]
  },
  5: {
    roman: 'V', title: 'Memory & I/O Systems',
    tools: [
      { id: 'memory-hierarchy',    name: 'Memory Hierarchy Visualizer',   desc: 'Pyramid: Registers → L1 → L2 → L3 → DRAM → Storage. Animates a memory access.',        complexity: 'Low-Medium', priority: 'High' },
      { id: 'cache-simulator',     name: 'Cache Simulator ⭐',            desc: 'FLAGSHIP — Configurable cache. Reference string → step through hits/misses live.',       complexity: 'Very High',  priority: 'Critical' },
      { id: 'virtual-memory',      name: 'Virtual Memory & TLB Explorer', desc: 'Virtual address → VPN → TLB lookup → page table walk → physical address.',              complexity: 'Medium-High',priority: 'High' },
      { id: 'io-comparator',       name: 'I/O Methods Comparator',        desc: 'Animated timelines: Programmed I/O vs. Interrupt-Driven vs. DMA.',                       complexity: 'Medium',     priority: 'High' },
      { id: 'usb-overview',        name: 'USB Overview Panel',            desc: 'USB topology, enumeration sequence, transfer types, and animated packet transfer.',       complexity: 'Low',        priority: 'Low' },
    ]
  },
}

const PRIORITY_STYLE = {
  Critical: { color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)' },
  High:     { color: 'var(--accent-text)', bg: 'var(--accent-dim)', border: 'var(--accent-border)' },
  Medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  Low:      { color: 'var(--text-muted)', bg: 'transparent', border: 'var(--border)' },
}

export default function UnitPage() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const unit = UNIT_DATA[unitId]

  if (!unit) return (
    <div style={{ textAlign: 'center', padding: '120px 24px', color: 'var(--text-muted)' }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>Unit not found.</p>
    </div>
  )

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="bg-grid" />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '12px',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '0 0 32px', transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          All Units
        </button>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent-text)',
            letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '12px',
          }}>
            Unit {unit.roman}
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-h)', marginBottom: '8px' }}>
            {unit.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '12px' }}>
            {unit.tools.length} interactive tools
          </p>
        </div>

        {/* Tool cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {unit.tools.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} unitId={unitId} navigate={navigate} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ToolCard({ tool, index, unitId, navigate }) {
  const [hovered, setHovered] = useState(false)
  const p = PRIORITY_STYLE[tool.priority] || PRIORITY_STYLE.Low

  return (
    <div
      className="glass-card"
      onClick={() => navigate(`/unit/${unitId}/tool/${tool.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        padding: '22px 24px',
        display: 'flex', alignItems: 'center', gap: '20px',
      }}
    >
      <span style={{
        fontFamily: 'var(--mono)', fontSize: '13px',
        color: hovered ? 'var(--accent-text)' : 'var(--text-muted)',
        minWidth: '24px', transition: 'color 0.2s',
      }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '4px' }}>{tool.name}</p>
        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>{tool.desc}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.06em',
          textTransform: 'uppercase', padding: '3px 10px', borderRadius: '999px',
          color: p.color, background: p.bg, border: `1px solid ${p.border}`,
        }}>
          {tool.priority}
        </span>

        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="var(--accent-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(-6px)', transition: 'all 0.2s' }}
        >
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </div>
  )
}

import { useState } from 'react'