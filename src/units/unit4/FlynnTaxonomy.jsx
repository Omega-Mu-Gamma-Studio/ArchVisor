/**
 * FlynnTaxonomy — Interactive Flynn's Taxonomy 2×2 quadrant explorer
 *
 * Renders a 2×2 grid: SISD | SIMD (top row), MISD | MIMD (bottom row)
 * Each quadrant is clickable — expands with animated instruction/data stream diagrams,
 * real-world examples, and explanation text.
 * Uses hand-crafted React SVG + Framer Motion.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'

const QUADRANTS = [
  {
    id: 'sisd',
    label: 'SISD',
    title: 'Single Instruction, Single Data',
    row: 0, col: 0,
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.3)',
    examples: ['Classic von Neumann machine', 'Single-core CPU', 'Most early computers'],
    desc: 'One instruction stream operates on one data stream. This is the standard unpipelined/uniprocessor model — one operation at a time.',
    how: 'A single control unit fetches one instruction at a time, which operates on a single data element from memory.',
  },
  {
    id: 'simd',
    label: 'SIMD',
    title: 'Single Instruction, Multiple Data',
    row: 0, col: 1,
    color: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.3)',
    examples: ['GPU shader cores', 'Intel SSE/AVX', 'ARM NEON', 'Vector processors'],
    desc: 'One instruction operates on multiple data elements simultaneously using multiple processing units.',
    how: 'A single control unit broadcasts the same instruction to all PUs, each operating on its own data element from the data stream.',
  },
  {
    id: 'misd',
    label: 'MISD',
    title: 'Multiple Instruction, Single Data',
    row: 1, col: 0,
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.3)',
    examples: ['Fault-tolerant systems', 'Space Shuttle flight computers', 'Some systolic arrays'],
    desc: 'Multiple instructions operate on the same data stream. Rare in practice — mainly used in fault-tolerant systems where the same data is processed by different units for redundancy.',
    how: 'The same data element flows through multiple processing units, each applying a different instruction to it.',
  },
  {
    id: 'mimd',
    label: 'MIMD',
    title: 'Multiple Instruction, Multiple Data',
    row: 1, col: 1,
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.3)',
    examples: ['Multi-core CPUs', 'Intel Core i7/AMD Ryzen', 'Cluster computers', 'Most modern parallel systems'],
    desc: 'Multiple autonomous processors execute different instructions on different data simultaneously. This is the dominant parallel architecture today.',
    how: 'Each processing unit has its own control unit and data stream, allowing completely independent execution paths.',
  },
]

export default function FlynnTaxonomy() {
  const [expanded, setExpanded] = useState(null)

  const toggleQuadrant = (id) => {
    setExpanded(expanded === id ? null : id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit IV · Tool 1
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Flynn's Taxonomy
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Explore the four categories of parallel computing architectures. Click any quadrant to expand.
        </p>
      </div>

      {/* 2×2 Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        {QUADRANTS.map(q => {
          const isExpanded = expanded === q.id
          return (
            <motion.div
              key={q.id}
              layout
              onClick={() => toggleQuadrant(q.id)}
              className="glass-card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                padding: isExpanded ? '24px' : '28px',
                border: `1px solid ${isExpanded ? q.color : 'var(--border)'}`,
                boxShadow: isExpanded ? `0 0 24px ${q.glow}` : 'none',
                transition: 'box-shadow 0.3s',
                minHeight: isExpanded ? '320px' : '160px',
              }}
              whileHover={!isExpanded ? { scale: 1.02 } : {}}
            >
              {/* Glow background */}
              <div style={{
                position: 'absolute', top: '-50%', left: '-50%',
                width: '200%', height: '200%',
                background: `radial-gradient(circle at 50% 50%, ${q.glow} 0%, transparent 60%)`,
                opacity: isExpanded ? 0.5 : 0,
                pointerEvents: 'none',
                transition: 'opacity 0.3s',
              }}/>

              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isExpanded ? '16px' : '0' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: `${q.color}22`, border: `1px solid ${q.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 700,
                  color: q.color, flexShrink: 0,
                }}>
                  {q.label}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)' }}>
                    {q.label}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                    {q.title}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '18px' }}>
                  {isExpanded ? '−' : '+'}
                </div>
              </div>

              {/* Animated SVG diagram */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <StreamDiagram quadrant={q.id} color={q.color} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>{q.desc}</p>
                    <div>
                      <div style={{
                        fontFamily: 'var(--mono)', fontSize: '9px',
                        color: q.color, fontWeight: 600,
                        letterSpacing: '0.08em', marginBottom: '6px',
                      }}>
                        HOW IT WORKS
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{q.how}</p>
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'var(--mono)', fontSize: '9px',
                        color: q.color, fontWeight: 600,
                        letterSpacing: '0.08em', marginBottom: '6px',
                      }}>
                        REAL-WORLD EXAMPLES
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {q.examples.map((ex, i) => (
                          <span key={i} style={{
                            padding: '2px 10px', borderRadius: '999px',
                            background: `${q.color}11`, border: `1px solid ${q.color}22`,
                            fontSize: '10px', color: q.color, fontFamily: 'var(--mono)',
                          }}>
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Legend hint */}
      <div style={{
        textAlign: 'center', padding: '12px',
        fontSize: '12px', color: 'var(--text-muted)',
        fontFamily: 'var(--mono)',
        border: '1px solid var(--border)', borderRadius: '8px',
      }}>
        Click any quadrant to expand and explore. I = Instruction, D = Data.
      </div>
    </div>
  )
}

function StreamDiagram({ quadrant, color }) {
  const width = 280, height = 80

  const renderStreams = () => {
    switch (quadrant) {
      case 'sisd':
        return (
          <g>
            {/* Single instruction */}
            <text x={10} y={18} fill={color} fontFamily="var(--mono)" fontSize="8" fontWeight="600">INST</text>
            <rect x={8} y={24} width={60} height={20} rx={4} fill={`${color}22`} stroke={color} strokeWidth="1"/>
            <text x={38} y={37} fill={color} fontFamily="var(--mono)" fontSize="7" textAnchor="middle">I₁</text>
            {/* Arrow down */}
            <line x1={38} y1={44} x2={38} y2={54} stroke={color} strokeWidth="1" markerEnd="url(#arrow-sisd)"/>
            {/* Single data */}
            <text x={10} y={66} fill={color} fontFamily="var(--mono)" fontSize="8" fontWeight="600">DATA</text>
            <rect x={8} y={56} width={60} height={20} rx={4} fill={`${color}33`} stroke={color} strokeWidth="1"/>
            <text x={38} y={69} fill={color} fontFamily="var(--mono)" fontSize="7" textAnchor="middle">D₁</text>
            {/* Processing unit */}
            <rect x={120} y={28} width={50} height={34} rx={6} fill={color} opacity="0.9"/>
            <text x={145} y={50} fill="#fff" fontFamily="var(--mono)" fontSize="8" fontWeight="600" textAnchor="middle">PU</text>
            {/* Result */}
            <text x={200} y={36} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="7">→</text>
            <rect x={210} y={28} width={50} height={20} rx={4} fill="var(--surface)" stroke="var(--border)" strokeWidth="1"/>
            <text x={235} y={41} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">Result</text>
          </g>
        )
      case 'simd':
        return (
          <g>
            <text x={10} y={18} fill={color} fontFamily="var(--mono)" fontSize="8" fontWeight="600">INST</text>
            <rect x={8} y={24} width={60} height={20} rx={4} fill={`${color}22`} stroke={color} strokeWidth="1"/>
            <text x={38} y={37} fill={color} fontFamily="var(--mono)" fontSize="7" textAnchor="middle">I₁</text>
            {/* Broadcast to 3 PUs */}
            <line x1={68} y1={34} x2={100} y2={22} stroke={color} strokeWidth="1"/>
            <line x1={68} y1={34} x2={100} y2={34} stroke={color} strokeWidth="1"/>
            <line x1={68} y1={34} x2={100} y2={46} stroke={color} strokeWidth="1"/>
            {/* PUs */}
            {[22, 34, 46].map((y, i) => (
              <g key={i}>
                <rect x={100} y={y - 6} width={36} height={14} rx={4} fill={color} opacity="0.85"/>
                <text x={118} y={y + 3} fill="#fff" fontFamily="var(--mono)" fontSize="6" fontWeight="600" textAnchor="middle">PU{i+1}</text>
                <text x={142} y={y + 3} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="6">← D{i+1}</text>
              </g>
            ))}
          </g>
        )
      case 'misd':
        return (
          <g>
            <text x={10} y={18} fill={color} fontFamily="var(--mono)" fontSize="8" fontWeight="600">DATA</text>
            <rect x={8} y={24} width={60} height={20} rx={4} fill={`${color}22`} stroke={color} strokeWidth="1"/>
            <text x={38} y={37} fill={color} fontFamily="var(--mono)" fontSize="7" textAnchor="middle">D₁</text>
            {/* D₁ flows to 3 PUs */}
            <line x1={68} y1={34} x2={100} y2={22} stroke={color} strokeWidth="1"/>
            <line x1={68} y1={34} x2={100} y2={34} stroke={color} strokeWidth="1"/>
            <line x1={68} y1={34} x2={100} y2={46} stroke={color} strokeWidth="1"/>
            {[22, 34, 46].map((y, i) => (
              <g key={i}>
                <rect x={100} y={y - 6} width={36} height={14} rx={4} fill={color} opacity="0.85"/>
                <text x={118} y={y + 3} fill="#fff" fontFamily="var(--mono)" fontSize="6" fontWeight="600" textAnchor="middle">PU{i+1}</text>
                <text x={142} y={y + 3} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="6">← I{i+1}</text>
              </g>
            ))}
          </g>
        )
      case 'mimd':
        return (
          <g>
            {[12, 34, 56].map((y, i) => (
              <g key={i}>
                <rect x={8} y={y - 2} width={50} height={16} rx={4} fill={`${color}22`} stroke={color} strokeWidth="1"/>
                <text x={33} y={y + 8} fill={color} fontFamily="var(--mono)" fontSize="6" textAnchor="middle">I{i+1}</text>
                <line x1={58} y1={y + 6} x2={80} y2={y + 6} stroke={color} strokeWidth="0.8"/>
                <rect x={82} y={y - 4} width={30} height={16} rx={4} fill={color} opacity="0.85"/>
                <text x={97} y={y + 7} fill="#fff" fontFamily="var(--mono)" fontSize="6" fontWeight="600" textAnchor="middle">PU{i+1}</text>
                <text x={118} y={y + 7} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="6">→ D{i+1}</text>
              </g>
            ))}
          </g>
        )
      default:
        return null
    }
  }

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width }}>
      <defs>
        <marker id="arrow-sisd" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color}/>
        </marker>
      </defs>
      {renderStreams()}
    </svg>
  )
}
