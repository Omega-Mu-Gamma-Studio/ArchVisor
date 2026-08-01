/**
 * ClusterOverview — Illustrated overview of clusters, WSC, and message-passing
 *
 * Three-section illustrated page:
 * 1. Cluster Architecture — rack diagram
 * 2. Warehouse-Scale Computing — WSC abstraction
 * 3. Message-Passing (MPI-style) — animated send/receive
 * Hand-crafted SVG + Framer Motion
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SECTIONS = ['cluster', 'wsc', 'mpi']

export default function ClusterOverview() {
  const [activeSection, setActiveSection] = useState('cluster')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit IV · Tool 5
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Cluster Overview
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Explore cluster architecture, warehouse-scale computing, and message-passing.
        </p>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { id: 'cluster', label: 'Cluster Architecture' },
          { id: 'wsc', label: 'Warehouse-Scale' },
          { id: 'mpi', label: 'Message Passing' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              padding: '8px 18px', borderRadius: '8px',
              border: `1px solid ${activeSection === s.id ? 'var(--accent-border)' : 'var(--border)'}`,
              background: activeSection === s.id ? 'var(--accent-dim)' : 'transparent',
              color: activeSection === s.id ? 'var(--accent-text)' : 'var(--text)',
              fontFamily: 'var(--mono)', fontSize: '11px',
              cursor: 'pointer', fontWeight: activeSection === s.id ? 600 : 400,
              transition: 'all 0.2s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeSection === 'cluster' && <ClusterSection key="cluster" />}
        {activeSection === 'wsc' && <WSCSection key="wsc" />}
        {activeSection === 'mpi' && <MPISection key="mpi" />}
      </AnimatePresence>
    </div>
  )
}

function ClusterSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '12px' }}>
          Cluster Architecture
        </h3>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* SVG rack diagram */}
          <svg width="300" height="200" viewBox="0 0 300 200">
            {/* Rack 1 */}
            {[0, 1, 2, 3].map(i => (
              <rect key={i} x={20} y={20 + i * 32} width={60} height={26} rx={3}
                fill="#3b82f622" stroke="#3b82f6" strokeWidth="0.8"/>
            ))}
            <rect x={20} y={20} width={60} height={26 * 4 + 6} rx={5} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4,2"/>
            <text x={50} y={158} fill="#3b82f6" fontFamily="var(--mono)" fontSize="8" textAnchor="middle">Node</text>

            {/* Rack 2 */}
            {[0, 1, 2, 3].map(i => (
              <rect key={i} x={110} y={20 + i * 32} width={60} height={26} rx={3}
                fill="#22c55e22" stroke="#22c55e" strokeWidth="0.8"/>
            ))}
            <rect x={110} y={20} width={60} height={26 * 4 + 6} rx={5} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4,2"/>

            {/* Rack 3 */}
            {[0, 1, 2, 3].map(i => (
              <rect key={i} x={200} y={20 + i * 32} width={60} height={26} rx={3}
                fill="#f59e0b22" stroke="#f59e0b" strokeWidth="0.8"/>
            ))}
            <rect x={200} y={20} width={60} height={26 * 4 + 6} rx={5} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4,2"/>

            {/* Interconnect */}
            <line x1={80} y1={55} x2={110} y2={55} stroke="#8b5cf6" strokeWidth="1.5"/>
            <line x1={170} y1={55} x2={200} y2={55} stroke="#8b5cf6" strokeWidth="1.5"/>
            <text x={145} y={190} fill="#8b5cf6" fontFamily="var(--mono)" fontSize="8" textAnchor="middle">Interconnect (e.g., InfiniBand, Ethernet)</text>

            {/* Shared storage */}
            <rect x={110} y={165} width={60} height={20} rx={4} fill="#8b5cf622" stroke="#8b5cf6" strokeWidth="1"/>
            <text x={140} y={178} fill="#8b5cf6" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">Shared Storage</text>
          </svg>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '12px' }}>
              A computer cluster connects multiple independent nodes via a high-speed interconnect.
              Each node is a complete computer with its own CPU, memory, and storage.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--mono)', fontSize: '10px' }}>
              <Feature label="Nodes" desc="Standalone computers (servers) with CPU, RAM, disk" color="#3b82f6" />
              <Feature label="Racks" desc="Physical chassis holding 20–40 nodes each" color="#22c55e" />
              <Feature label="Network" desc="InfiniBand, 100Gb Ethernet, or OmniPath" color="#f59e0b" />
              <Feature label="Storage" desc="Shared NAS/SAN accessible by all nodes" color="#8b5cf6" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function WSCSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '12px' }}>
          Warehouse-Scale Computing
        </h3>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Aerial view SVG */}
          <svg width="300" height="200" viewBox="0 0 300 200">
            {/* Building outline */}
            <rect x={10} y={10} width={280} height={180} rx={6} fill="rgba(59,130,246,0.04)" stroke="#3b82f6" strokeWidth="1"/>
            <text x={150} y={24} fill="#3b82f6" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">Warehouse Scale</text>

            {/* Rows of pods */}
            {Array.from({ length: 5 }, (_, row) => (
              Array.from({ length: 6 }, (_, col) => (
                <rect key={`${row}-${col}`} x={25 + col * 42} y={35 + row * 28} width={36} height={20} rx={2}
                  fill={(row + col) % 2 === 0 ? "#22c55e22" : "#f59e0b22"}
                  stroke={(row + col) % 2 === 0 ? "#22c55e" : "#f59e0b"}
                  strokeWidth="0.5"
                />
              ))
            ))}

            {/* Cooling annotation */}
            <rect x={270} y={35} width={12} height={140} rx={2} fill="#3b82f622" stroke="#3b82f6" strokeWidth="1"/>
            <text x={276} y={100} fill="#3b82f6" fontFamily="var(--mono)" fontSize="6" textAnchor="middle" transform="rotate(-90, 276, 100)">Cooling</text>

            {/* Power annotation */}
            <rect x={10} y={40} width={8} height={130} rx={2} fill="#ef444422" stroke="#ef4444" strokeWidth="1"/>
            <text x={14} y={100} fill="#ef4444" fontFamily="var(--mono)" fontSize="6" textAnchor="middle" transform="rotate(-90, 14, 100)">Power Distribution</text>
          </svg>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '12px' }}>
              Warehouse-scale computers (WSCs) house tens of thousands of servers in a single facility.
              Key challenges: power delivery, cooling, networking, and fault tolerance at massive scale.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.7 }}>
              <strong>Key metrics:</strong>
              <ul style={{ marginTop: '6px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>100,000+</strong> servers per facility</li>
                <li><strong>20–50 MW</strong> power consumption</li>
                <li><strong>PUE</strong> 1.1–1.2 (power efficiency)</li>
                <li><strong>~$500M</strong> construction cost</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MPISection() {
  const [phase, setPhase] = useState(0)

  const handleNext = () => setPhase((prev) => (prev + 1) % 4)
  const handleReset = () => setPhase(0)

  const phases = [
    { label: 'Process A sends to B', color: '#3b82f6' },
    { label: 'Data travels over network', color: '#8b5cf6' },
    { label: 'Process B receives', color: '#22c55e' },
    { label: 'Acknowledgement (Ack)', color: '#f59e0b' },
  ]

  const currentPhase = phases[phase]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '12px' }}>
          Message-Passing (MPI-style)
        </h3>

        {/* Animation controls */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={handleNext} style={{
            padding: '6px 14px', borderRadius: '6px',
            border: '1px solid var(--accent-border)',
            background: 'var(--accent-dim)', color: 'var(--accent-text)',
            fontFamily: 'var(--mono)', fontSize: '10px', cursor: 'pointer', fontWeight: 600,
          }}>
            {phase < 3 ? '→ Next Phase' : '↻ Restart'}
          </button>
          <button onClick={handleReset} style={{
            padding: '6px 14px', borderRadius: '6px',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '10px', cursor: 'pointer',
          }}>
            ↺ Reset
          </button>
        </div>

        {/* Phase indicator */}
        <div style={{
          fontFamily: 'var(--mono)', fontSize: '10px', color: currentPhase.color,
          fontWeight: 600, marginBottom: '16px',
        }}>
          {phase + 1}. {currentPhase.label}
        </div>

        {/* Send/Receive diagram */}
        <svg width="100%" height="180" viewBox="0 0 500 180" style={{ maxWidth: '500px', display: 'block' }}>
          {/* Process A */}
          <rect x={20} y={60} width={90} height={60} rx={8} fill="#3b82f622" stroke="#3b82f6" strokeWidth="1.5"/>
          <text x={65} y={92} fill="#3b82f6" fontFamily="var(--mono)" fontSize="11" textAnchor="middle" fontWeight="600">Process A</text>
          <text x={65} y={108} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="8" textAnchor="middle">(Sender)</text>

          {/* Process B */}
          <rect x={390} y={60} width={90} height={60} rx={8} fill="#22c55e22" stroke="#22c55e" strokeWidth="1.5"/>
          <text x={435} y={92} fill="#22c55e" fontFamily="var(--mono)" fontSize="11" textAnchor="middle" fontWeight="600">Process B</text>
          <text x={435} y={108} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="8" textAnchor="middle">(Receiver)</text>

          {/* Buffer visualization */}
          {phase >= 0 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <rect x={30} y={140} width={70} height={18} rx={3} fill="#3b82f622" stroke="#3b82f6" strokeWidth="0.8"/>
              <text x={65} y={153} fill="#3b82f6" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">Send Buffer</text>
            </motion.g>
          )}

          {phase >= 3 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <rect x={400} y={140} width={70} height={18} rx={3} fill="#22c55e22" stroke="#22c55e" strokeWidth="0.8"/>
              <text x={435} y={153} fill="#22c55e" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">Recv Buffer</text>
            </motion.g>
          )}

          {/* Network cloud */}
          <ellipse cx={250} cy={90} rx={60} ry={30} fill="#8b5cf611" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4,2"/>
          <text x={250} y={87} fill="#8b5cf6" fontFamily="var(--mono)" fontSize="8" textAnchor="middle">Network</text>
          <text x={250} y={99} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="6" textAnchor="middle">(Interconnect)</text>

          {/* Data packet animation */}
          <AnimatePresence>
            {phase === 1 && (
              <motion.g
                initial={{ x: 0 }} animate={{ x: 280 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              >
                <rect x={120} y={75} width={40} height={20} rx={4} fill="#8b5cf6"/>
                <text x={140} y={89} fill="#fff" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">DATA</text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Ack packet */}
          <AnimatePresence>
            {phase === 3 && (
              <motion.g
                initial={{ x: 280 }} animate={{ x: 0 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              >
                <rect x={120} y={50} width={40} height={16} rx={4} fill="#f59e0b"/>
                <text x={140} y={61} fill="#fff" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">ACK</text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* MPI code example */}
        <div style={{
          marginTop: '16px', padding: '12px', borderRadius: '8px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          fontFamily: 'var(--mono)', fontSize: '11px', lineHeight: 1.7, color: 'var(--text)',
        }}>
          <span style={{ color: '#8b5cf6' }}>MPI_Send</span>(buf, count, <span style={{ color: '#22c55e' }}>MPI_INT</span>, dest, tag, <span style={{ color: '#3b82f6' }}>MPI_COMM_WORLD</span>)<br/>
          <span style={{ color: '#22c55e' }}>MPI_Recv</span>(buf, count, <span style={{ color: '#22c55e' }}>MPI_INT</span>, src, tag, <span style={{ color: '#3b82f6' }}>MPI_COMM_WORLD</span>, status)
        </div>
      </div>
    </motion.div>
  )
}

function Feature({ label, desc, color }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0, marginTop: '4px' }}/>
      <div>
        <span style={{ fontWeight: 600, color }}>{label}:</span>
        <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>{desc}</span>
      </div>
    </div>
  )
}
