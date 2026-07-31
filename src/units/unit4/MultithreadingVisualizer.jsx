/**
 * MultithreadingVisualizer — Timeline visualization comparing threading models
 *
 * Config panel: Thread count (1–8), Stall frequency (Low/Medium/High), Mode selector
 * Three modes: Coarse-Grained, Fine-Grained, SMT/Hyperthreading
 * D3.js timeline grid: rows = CPU slots per cycle, columns = cycles
 * CPU utilization bar below the timeline
 * Legend: one color per thread + idle color
 */

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'

const THREAD_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
]

const IDLE_COLOR = '#374151'

const MODES = [
  {
    id: 'coarse',
    label: 'Coarse-Grained',
    desc: 'Thread runs until a high-latency event (e.g., cache miss). Then switches — overhead is high but switching is rare.',
  },
  {
    id: 'fine',
    label: 'Fine-Grained',
    desc: 'Thread switches every cycle in round-robin fashion. Max utilization but every cycle may switch.',
  },
  {
    id: 'smt',
    label: 'SMT / Hyperthreading',
    desc: 'Multiple threads share the same core\'s execution units simultaneously. Instructions from different threads issue in the same cycle.',
  },
]

export default function MultithreadingVisualizer() {
  const [threadCount, setThreadCount] = useState(4)
  const [stallFreq, setStallFreq] = useState('medium')
  const [mode, setMode] = useState('coarse')
  const [currentCycle, setCurrentCycle] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const svgRef = useRef(null)

  const totalCycles = 16

  // Generate timeline data
  const timeline = useMemo(() => {
    const data = []
    const slots = mode === 'smt' ? 2 : 1 // SMT has 2 issue slots per cycle

    for (let c = 0; c < totalCycles; c++) {
      const cycleSlots = []
      for (let s = 0; s < slots; s++) {
        const stallRoll = Math.random()
        const stallThreshold = stallFreq === 'low' ? 0.15 : stallFreq === 'high' ? 0.55 : 0.35
        const isStall = stallRoll < stallThreshold

        if (isStall) {
          cycleSlots.push({ thread: -1, label: 'idle' })
        } else {
          let thread
          if (mode === 'coarse') {
            // Each thread runs for consecutive cycles before switching
            const cyclesPerThread = Math.floor(totalCycles / threadCount)
            thread = Math.min(Math.floor(c / cyclesPerThread), threadCount - 1)
          } else if (mode === 'fine') {
            // Round-robin each cycle
            thread = c % threadCount
          } else {
            // SMT: two threads per cycle, alternating pair
            const pairBase = (Math.floor(c / 2) * 2) % threadCount
            thread = s === 0 ? pairBase : (pairBase + 1) % threadCount
          }
          cycleSlots.push({ thread, label: `T${thread}` })
        }
      }
      data.push({ cycle: c, slots: cycleSlots })
    }

    return data
  }, [threadCount, stallFreq, mode, totalCycles])

  // Calculate utilization
  const { utilized, total } = useMemo(() => {
    let u = 0, t = 0
    for (const c of timeline) {
      if (c.cycle <= currentCycle || currentCycle === 0) {
        for (const s of c.slots) {
          t++
          if (s.thread >= 0) u++
        }
      }
    }
    return { utilized: u, total: t }
  }, [timeline, currentCycle])

  const utilization = total > 0 ? (utilized / total) * 100 : 0

  // D3 render
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const rows = mode === 'smt' ? 2 : threadCount
    const cellW = 36
    const cellH = 28
    const labelW = 100
    const headerH = 24
    const margin = { top: 8, right: 8, bottom: 8, left: 8 }
    const visibleCycles = currentCycle > 0 ? currentCycle : totalCycles

    const totalWidth = labelW + visibleCycles * cellW + margin.left + margin.right
    const totalHeight = margin.top + margin.bottom + headerH + rows * cellH + 40

    svg
      .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style('display', 'block')

    // Header
    for (let c = 0; c < visibleCycles; c++) {
      const x = labelW + c * cellW
      svg.append('rect')
        .attr('x', x).attr('y', margin.top)
        .attr('width', cellW).attr('height', headerH)
        .attr('fill', 'var(--surface)')
        .attr('stroke', 'var(--border)')
        .attr('stroke-width', 0.5)
      svg.append('text')
        .attr('x', x + cellW / 2).attr('y', margin.top + headerH / 2 + 3)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--text-muted)')
        .attr('font-family', 'var(--mono)')
        .attr('font-size', '8px')
        .text(`C${c + 1}`)
    }

    // Cells
    const rowLabels = mode === 'smt' ? ['Slot 0', 'Slot 1'] : Array.from({ length: threadCount }, (_, i) => `T${i}`)

    for (let row = 0; row < rows; row++) {
      const y = margin.top + headerH + row * cellH

      // Row label
      svg.append('rect')
        .attr('x', 0).attr('y', y)
        .attr('width', labelW).attr('height', cellH)
        .attr('fill', 'var(--surface)')
        .attr('stroke', 'var(--border)')
        .attr('stroke-width', 0.5)

      svg.append('text')
        .attr('x', 6).attr('y', y + cellH / 2 + 3)
        .attr('fill', 'var(--text-muted)')
        .attr('font-family', 'var(--mono)')
        .attr('font-size', '9px')
        .text(rowLabels[row])

      for (let c = 0; c < visibleCycles; c++) {
        const cx = labelW + c * cellW
        const slot = timeline[c]?.slots[row]

        const color = slot && slot.thread >= 0
          ? THREAD_COLORS[slot.thread % THREAD_COLORS.length]
          : IDLE_COLOR

        svg.append('rect')
          .attr('x', cx + 1).attr('y', y + 1)
          .attr('width', cellW - 2).attr('height', cellH - 2)
          .attr('fill', slot && slot.thread >= 0 ? `${color}33` : 'rgba(55, 65, 81, 0.15)')
          .attr('stroke', color)
          .attr('stroke-width', slot && slot.thread >= 0 ? 1 : 0.5)
          .attr('stroke-opacity', 0.4)
          .attr('rx', 2)

        if (slot) {
          svg.append('text')
            .attr('x', cx + cellW / 2).attr('y', y + cellH / 2 + 3)
            .attr('text-anchor', 'middle')
            .attr('fill', slot.thread >= 0 ? color : '#6b7280')
            .attr('font-family', 'var(--mono)')
            .attr('font-size', '7px')
            .attr('font-weight', '600')
            .text(slot.label)
        }
      }
    }

    // Utilization bar
    const barY = margin.top + headerH + rows * cellH + 12
    svg.append('text')
      .attr('x', 0).attr('y', barY + 10)
      .attr('fill', 'var(--text-muted)')
      .attr('font-family', 'var(--mono)')
      .attr('font-size', '8px')
      .text('CPU Util')

    const barW = labelW + visibleCycles * cellW
    const fillW = barW * (utilization / 100)

    svg.append('rect')
      .attr('x', 0).attr('y', barY + 16)
      .attr('width', barW).attr('height', 14)
      .attr('fill', 'rgba(55, 65, 81, 0.2)')
      .attr('rx', 3)

    svg.append('rect')
      .attr('x', 0).attr('y', barY + 16)
      .attr('width', fillW).attr('height', 14)
      .attr('fill', utilization > 60 ? '#22c55e' : utilization > 30 ? '#f59e0b' : '#ef4444')
      .attr('rx', 3)

    svg.append('text')
      .attr('x', barW / 2).attr('y', barY + 26)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-family', 'var(--mono)')
      .attr('font-size', '8px')
      .attr('font-weight', '600')
      .text(`${utilization.toFixed(0)}%`)

  }, [timeline, currentCycle, mode, threadCount, utilization, totalCycles])

  // Controls
  const canStepForward = currentCycle < totalCycles
  const canStepBack = currentCycle > 0

  const handleStepForward = () => {
    if (currentCycle < totalCycles) setCurrentCycle(c => c + 1)
  }
  const handleStepBack = () => {
    if (currentCycle > 0) setCurrentCycle(c => c - 1)
  }
  const handleRunAll = async () => {
    setIsRunning(true)
    for (let i = 1; i <= totalCycles; i++) {
      setCurrentCycle(i)
      await new Promise(r => setTimeout(r, 300))
    }
    setIsRunning(false)
  }
  const handleReset = () => {
    setCurrentCycle(0)
    setIsRunning(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit IV · Tool 2
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Multithreading Visualizer
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Compare coarse-grained, fine-grained, and SMT multithreading models cycle by cycle.
        </p>
      </div>

      {/* Config panel */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Thread Count
          </label>
          <select value={threadCount} onChange={e => { setThreadCount(parseInt(e.target.value)); handleReset() }} className="input-field" style={{ width: '80px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Stall Frequency
          </label>
          <select value={stallFreq} onChange={e => setStallFreq(e.target.value)} className="input-field" style={{ width: '110px' }}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); handleReset() }}
              style={{
                padding: '7px 14px', borderRadius: '8px',
                border: `1px solid ${mode === m.id ? 'var(--accent-border)' : 'var(--border)'}`,
                background: mode === m.id ? 'var(--accent-dim)' : 'transparent',
                color: mode === m.id ? 'var(--accent-text)' : 'var(--text)',
                fontFamily: 'var(--mono)', fontSize: '10px',
                cursor: 'pointer', fontWeight: mode === m.id ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <StepBtn onClick={handleStepBack} disabled={!canStepBack || isRunning}>← Back</StepBtn>
          <StepBtn onClick={handleStepForward} disabled={!canStepForward || isRunning}>Step →</StepBtn>
          <button onClick={handleRunAll} disabled={isRunning || !canStepForward} style={accentBtnStyle(isRunning || !canStepForward)}>
            {isRunning ? '⏳' : '▶ Run All'}
          </button>
          <StepBtn onClick={handleReset}>↺ Reset</StepBtn>
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          Cycle <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>{currentCycle}</span> / {totalCycles}
        </span>
      </div>

      {/* D3 Grid */}
      <div style={{ background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <svg ref={svgRef} />
      </div>

      {/* Mode description */}
      <div className="glass-card" style={{ padding: '16px' }}>
        {MODES.filter(m => m.id === mode).map(m => (
          <div key={m.id}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent-text)', fontWeight: 600, letterSpacing: '0.08em' }}>
              {m.label}
            </span>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, marginTop: '6px' }}>{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
        {Array.from({ length: threadCount }, (_, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: THREAD_COLORS[i % THREAD_COLORS.length] }}/>
            T{i}
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: IDLE_COLOR }}/>
          Idle/Stall
        </span>
      </div>
    </div>
  )
}

function StepBtn({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border)',
        background: 'transparent', color: disabled ? 'var(--text-muted)' : 'var(--text)',
        fontFamily: 'var(--mono)', fontSize: '10px',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1, transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  )
}

function accentBtnStyle(disabled) {
  return {
    padding: '7px 14px', borderRadius: '8px',
    border: '1px solid var(--accent-border)',
    background: 'var(--accent-dim)',
    color: disabled ? 'var(--text-muted)' : 'var(--accent-text)',
    fontFamily: 'var(--mono)', fontSize: '10px',
    cursor: disabled ? 'default' : 'pointer',
    fontWeight: 600, opacity: disabled ? 0.4 : 1,
    transition: 'all 0.2s',
  }
}
