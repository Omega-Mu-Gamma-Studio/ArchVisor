/**
 * USBOverview — Illustrated USB topology and packet transfer animation
 *
 * USB topology tree diagram
 * Packet transfer animation: host → device → ack
 * Shows token packet, data packet, handshake packet phases
 * Hand-crafted React SVG + Framer Motion
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PACKET_PHASES = [
  { label: 'Token Packet', desc: 'Host sends token (PID + address + endpoint + CRC)', color: '#3b82f6', icon: '📤' },
  { label: 'Data Packet', desc: 'Host or device sends data (PID + data payload + CRC)', color: '#22c55e', icon: '📦' },
  { label: 'Handshake', desc: 'Receiver sends ACK/NAK/STALL handshake packet', color: '#f59e0b', icon: '🤝' },
]

export default function USBOverview() {
  const [phase, setPhase] = useState(0)
  const [animating, setAnimating] = useState(false)

  const handleNext = () => {
    if (phase < PACKET_PHASES.length - 1) setPhase(p => p + 1)
  }
  const handlePrev = () => {
    if (phase > 0) setPhase(p => p - 1)
  }
  const handleAnimate = async () => {
    setAnimating(true)
    setPhase(0)
    for (let i = 0; i < PACKET_PHASES.length; i++) {
      setPhase(i)
      await new Promise(r => setTimeout(r, 800))
    }
    setAnimating(false)
  }
  const handleReset = () => {
    setPhase(0)
    setAnimating(false)
  }

  const current = PACKET_PHASES[phase]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit V · Tool 5
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          USB Overview
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Explore USB topology and the packet transfer protocol.
        </p>
      </div>

      {/* Topology diagram */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '16px' }}>
          USB Topology
        </h3>
        <svg width="100%" height="180" viewBox="0 0 500 180" style={{ maxWidth: 500, display: 'block' }}>
          {/* Host root */}
          <rect x={210} y={5} width={80} height={34} rx={6} fill="#3b82f622" stroke="#3b82f6" strokeWidth="1.5"/>
          <text x={250} y={27} fill="#3b82f6" fontFamily="var(--mono)" fontSize="10" textAnchor="middle" fontWeight="600">Host (Root)</text>

          {/* Hub */}
          <rect x={210} y={55} width={80} height={30} rx={6} fill="#8b5cf622" stroke="#8b5cf6" strokeWidth="1"/>
          <text x={250} y={74} fill="#8b5cf6" fontFamily="var(--mono)" fontSize="9" textAnchor="middle">Hub</text>
          <line x1={250} y1={39} x2={250} y2={55} stroke="#8b5cf6" strokeWidth="1"/>

          {/* Devices */}
          {[
            { x: 30, y: 110, label: 'Keyboard', color: '#22c55e' },
            { x: 160, y: 110, label: 'Mouse', color: '#22c55e' },
            { x: 290, y: 110, label: 'Flash Drive', color: '#f59e0b' },
            { x: 400, y: 110, label: 'Printer', color: '#ef4444' },
          ].map((dev, i) => (
            <g key={i}>
              <line x1={250} y1={85} x2={dev.x + 35} y2={110} stroke="var(--border)" strokeWidth="0.8"/>
              <rect x={dev.x} y={120} width={70} height={30} rx={6} fill={`${dev.color}22`} stroke={dev.color} strokeWidth="1"/>
              <text x={dev.x + 35} y={139} fill={dev.color} fontFamily="var(--mono)" fontSize="8" textAnchor="middle">{dev.label}</text>
            </g>
          ))}

          {/* Labels */}
          <text x={430} y={20} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="7">Tier 1</text>
          <text x={430} y={65} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="7">Tier 2</text>
          <text x={430} y={140} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="7">Tier 3</text>
        </svg>

        <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.7, marginTop: '8px' }}>
          USB uses a <strong>tiered star topology</strong> with a single host controller at the root.
          Hubs expand the tree up to 127 devices across 7 tiers.
        </div>
      </div>

      {/* Packet transfer animation */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '16px' }}>
          Packet Transfer
        </h3>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={handlePrev} disabled={phase === 0 || animating} style={usbBtn(phase === 0 || animating)}>← Prev</button>
          <button onClick={handleNext} disabled={phase >= PACKET_PHASES.length - 1 || animating} style={usbBtn(phase >= PACKET_PHASES.length - 1 || animating)}>Next →</button>
          <button onClick={handleAnimate} disabled={animating} style={{ ...usbBtn(animating), background: 'var(--accent-dim)', borderColor: 'var(--accent-border)', color: 'var(--accent-text)', fontWeight: 600 }}>
            {animating ? '⏳' : '▶ Animate All'}
          </button>
          <button onClick={handleReset} style={usbBtn(false)}>↺ Reset</button>
        </div>

        {/* Phase indicator */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '16px',
          fontFamily: 'var(--mono)', fontSize: '9px',
        }}>
          {PACKET_PHASES.map((p, i) => (
            <div key={i} style={{
              flex: 1, padding: '6px 8px', borderRadius: '6px', textAlign: 'center',
              background: i <= phase ? `${p.color}15` : 'transparent',
              border: `1px solid ${i <= phase ? p.color : 'var(--border)'}`,
              color: i <= phase ? p.color : 'var(--text-muted)',
              fontWeight: i <= phase ? 600 : 400,
              transition: 'all 0.3s',
            }}>
              {p.icon} {p.label}
            </div>
          ))}
        </div>

        {/* Animation SVG */}
        <svg width="100%" height="160" viewBox="0 0 500 160" style={{ maxWidth: 500, display: 'block', margin: '0 auto' }}>
          {/* Host */}
          <rect x={20} y={55} width={80} height={50} rx={6} fill="#3b82f622" stroke="#3b82f6" strokeWidth="1.5"/>
          <text x={60} y={75} fill="#3b82f6" fontFamily="var(--mono)" fontSize="10" textAnchor="middle" fontWeight="600">Host</text>
          <text x={60} y={92} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">(Sender)</text>

          {/* Device */}
          <rect x={400} y={55} width={80} height={50} rx={6} fill="#22c55e22" stroke="#22c55e" strokeWidth="1.5"/>
          <text x={440} y={75} fill="#22c55e" fontFamily="var(--mono)" fontSize="10" textAnchor="middle" fontWeight="600">Device</text>
          <text x={440} y={92} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">(Receiver)</text>

          {/* Bus line */}
          <line x1={100} y1={80} x2={400} y2={80} stroke="var(--border)" strokeWidth="1" strokeDasharray="6,3"/>
          <text x={250} y={48} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">USB Bus</text>

          {/* Animated packet */}
          <AnimatePresence>
            {phase >= 0 && phase <= 1 && (
              <motion.g
                key="token"
                initial={{ x: 0 }}
                animate={{ x: phase === 1 ? 280 : 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <rect x={120} y={68} width={60} height={24} rx={4} fill="#3b82f6" opacity="0.9"/>
                <text x={150} y={84} fill="#fff" fontFamily="var(--mono)" fontSize="8" textAnchor="middle" fontWeight="600">TOKEN</text>
              </motion.g>
            )}
            {phase >= 1 && phase <= 2 && (
              <motion.g
                key="data"
                initial={{ x: 0 }}
                animate={{ x: phase === 2 ? 280 : 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <rect x={120} y={95} width={60} height={24} rx={4} fill="#22c55e" opacity="0.9"/>
                <text x={150} y={111} fill="#fff" fontFamily="var(--mono)" fontSize="8" textAnchor="middle" fontWeight="600">DATA</text>
              </motion.g>
            )}
            {phase >= 2 && (
              <motion.g
                key="ack"
                initial={{ x: 280 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <rect x={120} y={68} width={60} height={24} rx={4} fill="#f59e0b" opacity="0.9"/>
                <text x={150} y={84} fill="#fff" fontFamily="var(--mono)" fontSize="8" textAnchor="middle" fontWeight="600">ACK</text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Phase labels */}
          <text x={250} y={145} fill={current?.color || 'var(--text-muted)'} fontFamily="var(--mono)" fontSize="9" textAnchor="middle" fontWeight="600">
            {phase >= 2 ? 'Handshake complete ✓' : 'Transferring...'}
          </text>
        </svg>

        {/* Phase description */}
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '12px', padding: '12px', borderRadius: '8px',
                background: `${current.color}10`, border: `1px solid ${current.color}30`,
                fontSize: '13px', color: 'var(--text)', lineHeight: 1.7,
              }}
            >
              <strong style={{ color: current.color }}>{current.icon} {current.label}:</strong>{' '}
              {current.desc}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reference info */}
      <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.7, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <strong>USB Standards:</strong> USB 2.0 (480 Mbps), USB 3.0 (5 Gbps), USB 3.1 (10 Gbps), USB 3.2 (20 Gbps), USB4 (40 Gbps).
        All use differential signaling (D+/D−) on twisted-pair wires.
      </div>
    </div>
  )
}

function usbBtn(disabled) {
  return {
    padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border)',
    background: 'transparent', color: disabled ? 'var(--text-muted)' : 'var(--text)',
    fontFamily: 'var(--mono)', fontSize: '10px',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1,
    transition: 'all 0.2s',
  }
}
