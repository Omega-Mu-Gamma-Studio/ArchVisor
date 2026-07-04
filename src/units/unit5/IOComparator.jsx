/**
 * IOComparator — Illustrated comparison of I/O methods
 *
 * Three-section tabbed explorer:
 * 1. Programmed I/O — CPU busy-waits for device
 * 2. Interrupt-Driven I/O — Device interrupts CPU when ready
 * 3. DMA — Direct Memory Access, device ↔ memory without CPU
 * Hand-crafted SVG + Framer Motion
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const METHODS = [
  {
    id: 'pio',
    label: 'Programmed I/O',
    color: '#3b82f6',
    pros: ['Simple to implement', 'No special hardware needed', 'Deterministic timing'],
    cons: ['CPU busy-waits (wasted cycles)', 'Poor utilization for slow devices', 'Not scalable for many devices'],
    desc: 'The CPU repeatedly checks the device status register in a loop. While waiting, the CPU cannot do other work. Best for simple, fast devices where the wait is negligible.',
    timing: 'CPU polls → Device busy → CPU polls → Device ready → CPU transfers → Done',
  },
  {
    id: 'interrupt',
    label: 'Interrupt-Driven I/O',
    color: '#22c55e',
    pros: ['CPU can do other work while waiting', 'Efficient for slow devices', 'Event-driven — no wasted polling'],
    cons: ['Overhead of interrupt handling', 'Need interrupt controller hardware', 'Interrupt storm risk with many devices'],
    desc: 'The CPU initiates the I/O operation and returns to other work. When the device is ready, it asserts an interrupt line. The CPU saves context, runs the ISR, and restores context.',
    timing: 'CPU initiates → CPU does other work → Device interrupts → ISR runs → Resume',
  },
  {
    id: 'dma',
    label: 'DMA (Direct Memory Access)',
    color: '#f59e0b',
    pros: ['Bulk transfers without CPU involvement', 'Maximum CPU utilization', 'High throughput for block devices'],
    cons: ['Complex DMA controller hardware', 'Cache coherence concerns', 'Memory bus contention'],
    desc: 'A dedicated DMA controller transfers data directly between device and memory. The CPU only sets up the transfer (source, destination, count) and handles completion interrupt.',
    timing: 'CPU configures DMA → DMA transfers → CPU works in parallel → DMA interrupts completion → Done',
  },
]

export default function IOComparator() {
  const [active, setActive] = useState('pio')

  const current = METHODS.find(m => m.id === active)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit V · Tool 4
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          I/O Methods Comparator
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Compare Programmed I/O, Interrupt-Driven I/O, and Direct Memory Access side by side.
        </p>
      </div>

      {/* Method tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {METHODS.map(m => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            style={{
              padding: '8px 18px', borderRadius: '8px',
              border: `1px solid ${active === m.id ? m.color : 'var(--border)'}`,
              background: active === m.id ? `${m.color}18` : 'transparent',
              color: active === m.id ? m.color : 'var(--text)',
              fontFamily: 'var(--mono)', fontSize: '11px',
              cursor: 'pointer', fontWeight: active === m.id ? 600 : 400,
              transition: 'all 0.2s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {/* SVG diagram */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
            <IOSVG method={current.id} color={current.color} />
          </div>

          {/* Description */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '12px' }}>
              {current.desc}
            </p>
            <div style={{
              padding: '8px 12px', borderRadius: '6px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              fontFamily: 'var(--mono)', fontSize: '11px', color: current.color, fontWeight: 600,
            }}>
              {current.timing}
            </div>
          </div>

          {/* Pros/Cons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '16px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#22c55e', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>
                PROS
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8 }}>
                {current.pros.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div className="glass-card" style={{ padding: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#ef4444', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>
                CONS
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8 }}>
                {current.cons.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function IOSVG({ method, color }) {
  const w = 400, h = 160

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ maxWidth: w }}>
      {/* CPU */}
      <rect x={10} y={55} width={70} height={50} rx={6} fill={method === 'dma' ? '#6b728033' : `${color}22`} stroke={method === 'dma' ? '#6b7280' : color} strokeWidth="1.5"/>
      <text x={45} y={75} fill={method === 'dma' ? '#6b7280' : color} fontFamily="var(--mono)" fontSize="10" textAnchor="middle" fontWeight="600">CPU</text>
      {method !== 'dma' && <text x={45} y={92} fill={method === 'dma' ? '#6b7280' : color} fontFamily="var(--mono)" fontSize="7" textAnchor="middle">(active)</text>}

      {/* Memory */}
      <rect x={10} y={10} width={70} height={36} rx={6} fill="#8b5cf622" stroke="#8b5cf6" strokeWidth="1"/>
      <text x={45} y={33} fill="#8b5cf6" fontFamily="var(--mono)" fontSize="9" textAnchor="middle" fontWeight="600">Memory</text>

      {/* Device */}
      <rect x={320} y={55} width={70} height={50} rx={6} fill="#f59e0b22" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x={355} y={75} fill="#f59e0b" fontFamily="var(--mono)" fontSize="9" textAnchor="middle" fontWeight="600">Device</text>
      <text x={355} y={92} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">(I/O)</text>

      {/* DMA Controller (only for DMA) */}
      {method === 'dma' && (
        <>
          <rect x={150} y={55} width={70} height={50} rx={6} fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
          <text x={185} y={75} fill={color} fontFamily="var(--mono)" fontSize="9" textAnchor="middle" fontWeight="600">DMA</text>
          <text x={185} y={92} fill={color} fontFamily="var(--mono)" fontSize="7" textAnchor="middle">Controller</text>
        </>
      )}

      {/* Arrows */}
      {method === 'pio' && (
        <>
          {/* CPU → Device (poll) */}
          <path d="M 80 70 Q 200 40 320 70" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrow-pio)"/>
          <text x={200} y={42} fill={color} fontFamily="var(--mono)" fontSize="7" textAnchor="middle">Poll / Status</text>

          {/* Device → CPU (data) */}
          <path d="M 320 90 Q 200 120 80 90" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arrow-pio-g)"/>
          <text x={200} y={118} fill="#22c55e" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">Data</text>

          {/* CPU → Memory */}
          <line x1={45} y1={46} x2={45} y2={55} stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arrow-pio-p)"/>
          <text x={55} y={52} fill="#8b5cf6" fontFamily="var(--mono)" fontSize="6">Store</text>
        </>
      )}

      {method === 'interrupt' && (
        <>
          {/* CPU initiates */}
          <path d="M 80 75 Q 200 55 320 75" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4,2" markerEnd="url(#arrow-int-b)"/>
          <text x={200} y={52} fill="#8b5cf6" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">Initiate</text>

          {/* Device interrupts */}
          <path d="M 320 65 Q 200 30 80 65" fill="none" stroke={color} strokeWidth="2" markerEnd="url(#arrow-int)"/>
          <text x={200} y={28} fill={color} fontFamily="var(--mono)" fontSize="7" textAnchor="middle">Interrupt!</text>

          {/* Data transfer */}
          <path d="M 320 95 Q 200 125 80 95" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3,2" markerEnd="url(#arrow-int-g)"/>
          <text x={200} y={123} fill="#22c55e" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">Data</text>
        </>
      )}

      {method === 'dma' && (
        <>
          {/* CPU configures DMA */}
          <line x1={80} y1={70} x2={150} y2={70} stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arrow-dma-p)"/>
          <text x={115} y={58} fill="#8b5cf6" fontFamily="var(--mono)" fontSize="6" textAnchor="middle">Setup</text>

          {/* DMA → Device */}
          <line x1={220} y1={75} x2={320} y2={75} stroke={color} strokeWidth="1.5" markerEnd="url(#arrow-dma)"/>
          <text x={270} y={67} fill={color} fontFamily="var(--mono)" fontSize="6" textAnchor="middle">Request</text>

          {/* Device → DMA (burst) */}
          <line x1={320} y1={90} x2={220} y2={90} stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arrow-dma-g)"/>
          <text x={270} y={105} fill="#22c55e" fontFamily="var(--mono)" fontSize="6" textAnchor="middle">Data burst</text>

          {/* DMA → Memory */}
          <line x1={185} y1={55} x2={80} y2={36} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3,2" markerEnd="url(#arrow-dma-g)"/>

          {/* DMA interrupt on completion */}
          <path d="M 185 120 Q 120 130 80 105" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2" markerEnd="url(#arrow-dma-r)"/>
          <text x={130} y={130} fill="#ef4444" fontFamily="var(--mono)" fontSize="6" textAnchor="middle">Done IRQ</text>
        </>
      )}

      <defs>
        <marker id="arrow-pio" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill={color}/></marker>
        <marker id="arrow-pio-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/></marker>
        <marker id="arrow-pio-p" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6"/></marker>
        <marker id="arrow-int" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill={color}/></marker>
        <marker id="arrow-int-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6"/></marker>
        <marker id="arrow-int-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/></marker>
        <marker id="arrow-dma" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill={color}/></marker>
        <marker id="arrow-dma-p" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6"/></marker>
        <marker id="arrow-dma-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/></marker>
        <marker id="arrow-dma-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444"/></marker>
      </defs>
    </svg>
  )
}
