/**
 * MemoryHierarchy — Animated memory hierarchy pyramid
 *
 * D3.js rendered pyramid with levels: Registers → L1 → L2 → L3 → DRAM → Storage
 * Each level labeled with capacity, latency, bandwidth
 * Click a level to see detail panel
 * Simulate Access animates a request traveling down/up the pyramid
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'

const LEVELS = [
  { id: 'regs',   label: 'Registers',   capacity: '~1 KB',   latency: '0.3 ns',   bandwidth: '∞',      cost: 'Highest', color: '#ef4444', tip: 0.2 },
  { id: 'l1',     label: 'L1 Cache',    capacity: '32–64 KB', latency: '1 ns',     bandwidth: '~1 TB/s', cost: 'Very High', color: '#f59e0b', tip: 0.35 },
  { id: 'l2',     label: 'L2 Cache',    capacity: '256–512 KB', latency: '3–5 ns',  bandwidth: '~500 GB/s', cost: 'High', color: '#22c55e', tip: 0.5 },
  { id: 'l3',     label: 'L3 Cache',    capacity: '4–32 MB',  latency: '10–20 ns', bandwidth: '~200 GB/s', cost: 'Medium', color: '#3b82f6', tip: 0.65 },
  { id: 'dram',   label: 'DRAM',        capacity: '8–64 GB',  latency: '50–100 ns', bandwidth: '~50 GB/s', cost: 'Low', color: '#8b5cf6', tip: 0.8 },
  { id: 'storage', label: 'Storage',    capacity: '256 GB–2 TB', latency: '1–10 ms', bandwidth: '~5 GB/s', cost: 'Very Low', color: '#6b7280', tip: 1.0 },
]

export default function MemoryHierarchy() {
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [accessAnim, setAccessAnim] = useState(null)
  const svgRef = useRef(null)

  // D3 pyramid render
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const height = 420
    const centerX = width / 2

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style('display', 'block')

    const levelHeight = 56
    const gap = 4

    LEVELS.forEach((level, i) => {
      const tipRatio = level.tip
      const y = i * (levelHeight + gap)
      const currentTip = centerX * tipRatio
      const currentBase = centerX * (1 + (1 - tipRatio))

      // Trapezoid
      svg.append('polygon')
        .attr('points', [
          `${centerX - currentTip},${y}`,
          `${centerX + currentTip},${y}`,
          `${centerX + currentBase},${y + levelHeight}`,
          `${centerX - currentBase},${y + levelHeight}`,
        ].join(' '))
        .attr('fill', `${level.color}18`)
        .attr('stroke', selectedLevel === level.id ? level.color : `${level.color}44`)
        .attr('stroke-width', selectedLevel === level.id ? 2.5 : 1)
        .attr('cursor', 'pointer')
        .on('click', () => setSelectedLevel(level.id))

      // Label
      svg.append('text')
        .attr('x', centerX)
        .attr('y', y + levelHeight / 2 - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', level.color)
        .attr('font-family', 'var(--mono)')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('cursor', 'pointer')
        .text(level.label)

      // Subtitle
      svg.append('text')
        .attr('x', centerX)
        .attr('y', y + levelHeight / 2 + 12)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--text-muted)')
        .attr('font-family', 'var(--mono)')
        .attr('font-size', '8px')
        .attr('cursor', 'pointer')
        .text(`${level.capacity} · ${level.latency}`)

      // Access arrow animation
      if (accessAnim && accessAnim.level === i) {
        const fromX = centerX
        const fromY = accessAnim.direction === 'down' ? y + levelHeight : y
        const toY = accessAnim.direction === 'down' ? y : y + levelHeight

        svg.append('circle')
          .attr('cx', fromX)
          .attr('cy', fromY)
          .attr('r', 6)
          .attr('fill', level.color)
          .transition()
          .duration(500)
          .ease(d3.easeQuadInOut)
          .attr('cy', toY)
          .on('end', function() {
            d3.select(this).remove()
          })
      }
    })

    // Labels on the sides
    const sideLabels = ['Faster', 'Smaller', 'Costlier']
    sideLabels.forEach((label, i) => {
      svg.append('text')
        .attr('x', centerX + 180)
        .attr('y', 20 + i * 12)
        .attr('text-anchor', 'end')
        .attr('fill', 'var(--text-muted)')
        .attr('font-family', 'var(--mono)')
        .attr('font-size', '7px')
        .attr('opacity', 0.6)
        .text(label)
    })

    const bottomLabels = ['Slower', 'Larger', 'Cheaper']
    bottomLabels.forEach((label, i) => {
      svg.append('text')
        .attr('x', centerX - 180)
        .attr('y', height - 20 - i * 12)
        .attr('fill', 'var(--text-muted)')
        .attr('font-family', 'var(--mono)')
        .attr('font-size', '7px')
        .attr('opacity', 0.6)
        .text(label)
    })

  }, [selectedLevel, accessAnim])

  const handleSimulateAccess = async () => {
    for (let i = 0; i < LEVELS.length; i++) {
      setAccessAnim({ level: i, direction: 'down' })
      await new Promise(r => setTimeout(r, 400))
    }
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      setAccessAnim({ level: i, direction: 'up' })
      await new Promise(r => setTimeout(r, 400))
    }
    setAccessAnim(null)
  }

  const selected = LEVELS.find(l => l.id === selectedLevel)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit V · Tool 1
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Memory Hierarchy
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Interactive pyramid of the memory hierarchy — click a level for details or simulate an access.
        </p>
      </div>

      {/* Pyramid + Detail panel */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div className="glass-card" style={{ padding: '16px', flexShrink: 0 }}>
          <svg ref={svgRef} />
        </div>

        <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleSimulateAccess}
            style={{
              padding: '9px 20px', borderRadius: '8px',
              border: '1px solid var(--accent-border)',
              background: 'var(--accent-dim)', color: 'var(--accent-text)',
              fontFamily: 'var(--mono)', fontSize: '11px',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            ▸ Simulate Access
          </button>

          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card"
                style={{ padding: '20px', borderLeft: `3px solid ${selected.color}` }}
              >
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: selected.color, fontWeight: 600, letterSpacing: '0.08em' }}>
                  {selected.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontFamily: 'var(--mono)', fontSize: '11px' }}>
                  <DetailRow label="Capacity" value={selected.capacity} />
                  <DetailRow label="Latency" value={selected.latency} />
                  <DetailRow label="Bandwidth" value={selected.bandwidth} />
                  <DetailRow label="Cost/bit" value={selected.cost} />
                </div>
              </motion.div>
            ) : (
              <div className="glass-card" style={{ padding: '24px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                Click any level in the pyramid to see details.
              </div>
            )}
          </AnimatePresence>

          {/* Hit/miss probability slider - simplified */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              CACHE HIT RATE TREND
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '8px', color: 'var(--text-muted)' }}>
              <span>L1: ~95%</span>
              <span>L2: ~85%</span>
              <span>L3: ~60%</span>
              <span>DRAM: ~100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reference info */}
      <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.7, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <strong>Key principle:</strong> Each level acts as a cache for the level below it.
        Registers are fastest but most expensive; storage is slowest but cheapest.
        The memory hierarchy exploits <strong>temporal</strong> and <strong>spatial locality</strong>.
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{value}</span>
    </div>
  )
}
