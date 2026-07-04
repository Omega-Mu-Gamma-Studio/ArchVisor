/**
 * SuperscalarComparator — Side-by-side scalar vs 2-issue superscalar pipeline comparison
 *
 * Same instruction input as PipelineAnimator
 * Renders two pipeline grids: Scalar (1 issue/cycle) vs Superscalar (2 issue/cycle)
 * IPC and Speedup ratio badge
 * D3.js grid rendering
 * Structural hazard warnings
 */

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import { simulatePipeline } from '../../engines/pipelineEngine.js'
import PipelineGrid from '../../components/shared/PipelineGrid.jsx'
import HazardBadge from '../../components/shared/HazardBadge.jsx'

const DEFAULT_INSTRUCTIONS = `addi $t0, $zero, 5
addi $t1, $zero, 10
add $t2, $t0, $t1
sub $t3, $t1, $t0
addi $t4, $zero, 20
add $t5, $t4, $t2`

const SCALAR_COLOR = '#3b82f6'
const SUPER_COLOR = '#22c55e'

export default function SuperscalarComparator() {
  const [input, setInput] = useState(DEFAULT_INSTRUCTIONS)
  const [currentCycle, setCurrentCycle] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  // Parse instructions
  const instructions = useMemo(() => {
    return input
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#'))
  }, [input])

  // Scalar simulation (standard)
  const scalarResult = useMemo(() => {
    if (instructions.length === 0) return null
    return simulatePipeline(instructions, { forwarding: false })
  }, [instructions])

  // Superscalar simulation (up to 2 instructions per cycle)
  const superscalarResult = useMemo(() => {
    if (instructions.length === 0) return null
    return simulateSuperscalar(instructions)
  }, [instructions])

  const maxCycle = Math.max(
    scalarResult?.cycles || 0,
    superscalarResult?.cycles || 0,
  )

  const totalSteps = maxCycle
  const canStepForward = currentCycle < totalSteps
  const canStepBack = currentCycle > 0

  const handleStepForward = () => {
    if (currentCycle < totalSteps) setCurrentCycle(c => c + 1)
  }
  const handleStepBack = () => {
    if (currentCycle > 0) setCurrentCycle(c => c - 1)
  }
  const handleRunAll = async () => {
    setIsRunning(true)
    for (let i = 1; i <= totalSteps; i++) {
      setCurrentCycle(i)
      await new Promise(r => setTimeout(r, 350))
    }
    setIsRunning(false)
  }
  const handleReset = () => {
    setCurrentCycle(0)
    setIsRunning(false)
  }

  // Compute metrics
  const scalarCPI = scalarResult?.cpi || 0
  const superCPI = superscalarResult?.cpi || 0
  const scalarIPC = scalarCPI > 0 ? 1 / scalarCPI : 0
  const superIPC = superCPI > 0 ? 1 / superCPI : 0
  const speedup = superCPI > 0 ? scalarCPI / superCPI : 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit III · Tool 4
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Superscalar Comparator
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Compare scalar (1 instruction/cycle) vs 2-issue superscalar pipeline performance.
        </p>
      </div>

      {/* Instruction input */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <label style={{
          display: 'block', fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.08em',
        }}>
          MIPS Instructions (one per line)
        </label>
        <textarea
          value={input}
          onChange={e => { setInput(e.target.value); handleReset() }}
          style={{
            width: '100%', minHeight: '100px',
            padding: '10px', borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontFamily: 'var(--mono)',
            fontSize: '13px', lineHeight: 1.6,
            resize: 'vertical', outline: 'none',
          }}
        />
      </div>

      {/* Controls */}
      <div className="glass-card" style={{
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <StepButton onClick={handleStepBack} disabled={!canStepBack || isRunning} label="Back" arrow="left" />
          <StepButton onClick={handleStepForward} disabled={!canStepForward || isRunning} label="Step" arrow="right" />
          <button
            onClick={handleRunAll}
            disabled={isRunning || !canStepForward}
            style={btnStyle(isRunning || !canStepForward, true)}
          >
            {isRunning ? '⏳ Running...' : '▶ Run All'}
          </button>
          <button onClick={handleReset} style={btnStyle(false)}>↺ Reset</button>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          Cycle <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>{currentCycle}</span> / {totalSteps}
        </div>
      </div>

      {/* Speedup badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: 'center', padding: '20px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.05))',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}
      >
        <div style={{ fontFamily: 'var(--mono)', fontSize: '28px', fontWeight: 700, color: 'var(--accent-text)' }}>
          {speedup.toFixed(2)}× Speedup
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '12px', flexWrap: 'wrap' }}>
          <Metric label="Scalar CPI" value={scalarCPI.toFixed(2)} color={SCALAR_COLOR} />
          <Metric label="Superscalar CPI" value={superCPI.toFixed(2)} color={SUPER_COLOR} />
          <Metric label="Scalar IPC" value={scalarIPC.toFixed(2)} color={SCALAR_COLOR} />
          <Metric label="Superscalar IPC" value={superIPC.toFixed(2)} color={SUPER_COLOR} />
        </div>
      </motion.div>

      {/* Side-by-side grids */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            color: SCALAR_COLOR, fontWeight: 600,
            letterSpacing: '0.08em', marginBottom: '8px',
          }}>
            SCALAR · {instructions.length} inst in {scalarResult?.cycles || '—'} cycles
          </div>
          {scalarResult && (
            <PipelineGrid
              diagram={scalarResult}
              currentCycle={currentCycle}
              showForwarding={false}
              showHazards
            />
          )}
        </div>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            color: SUPER_COLOR, fontWeight: 600,
            letterSpacing: '0.08em', marginBottom: '8px',
          }}>
            2-ISSUE SUPERSCALAR · {instructions.length} inst in {superscalarResult?.cycles || '—'} cycles
          </div>
          {superscalarResult && (
            <SuperscalarGrid
              diagram={superscalarResult}
              currentCycle={currentCycle}
            />
          )}
        </div>
      </div>

      {/* Pairing info */}
      {superscalarResult?.pairings?.length > 0 && currentCycle > 0 && (
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            color: 'var(--text-muted)', fontWeight: 600,
            letterSpacing: '0.08em', marginBottom: '12px',
          }}>
            INSTRUCTION PAIRINGS
          </div>
          {superscalarResult.pairings.map((pair, idx) => {
            const isVisible = pair.cycle <= currentCycle
            if (!isVisible) return null
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 12px', marginBottom: '4px',
                  borderRadius: '6px',
                  background: 'rgba(34, 197, 94, 0.08)',
                  fontFamily: 'var(--mono)', fontSize: '11px',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>C{pair.cycle}</span>
                <span style={{ color: 'var(--text)' }}>{pair.instrA}</span>
                {pair.instrB && (
                  <>
                    <span style={{ color: 'var(--text-muted)' }}>+</span>
                    <span style={{ color: 'var(--text)' }}>{pair.instrB}</span>
                  </>
                )}
                {pair.structuralHazard && (
                  <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '10px' }}>
                    ⚠ Structural hazard
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {instructions.length === 0 && (
        <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
          Enter instructions above to compare scalar vs superscalar execution.
        </div>
      )}
    </div>
  )
}

// ── Helper Components ──────────────────────────────────────

function StepButton({ onClick, disabled, label, arrow }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '7px 14px', borderRadius: '8px',
        border: '1px solid var(--border)', background: 'transparent',
        color: disabled ? 'var(--text-muted)' : 'var(--text)',
        fontFamily: 'var(--mono)', fontSize: '11px',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.2s',
      }}
    >
      {arrow === 'left' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      )}
      {label}
      {arrow === 'right' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      )}
    </button>
  )
}

function btnStyle(disabled, accent) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '8px',
    border: `1px solid ${accent ? 'var(--accent-border)' : 'var(--border)'}`,
    background: accent ? 'var(--accent-dim)' : 'transparent',
    color: disabled ? 'var(--text-muted)' : accent ? 'var(--accent-text)' : 'var(--text)',
    fontFamily: 'var(--mono)', fontSize: '11px',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    fontWeight: accent ? 600 : 400,
    transition: 'all 0.2s',
  }
}

function Metric({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  )
}

// ── Superscalar Simulation Engine (inline) ──────────────────

function simulateSuperscalar(instructions) {
  // 2-issue superscalar: pairs instructions two at a time
  const STAGES = ['IF', 'ID', 'EX', 'MEM', 'WB']
  const diagram = []
  const hazards = []
  const pairings = []

  let cycles = 0
  let i = 0

  while (i < instructions.length) {
    cycles++

    const pair = { cycle: cycles, instrA: instructions[i], instrB: null, structuralHazard: false }

    // Issue first instruction in this cycle
    const instrA = instructions[i]
    const stagesA = [
      { cycle: cycles, stage: 'IF', hazard: null, forwarded: false },
      { cycle: cycles + 1, stage: 'ID', hazard: null, forwarded: false },
      { cycle: cycles + 2, stage: 'EX', hazard: null, forwarded: false },
      { cycle: cycles + 3, stage: 'MEM', hazard: null, forwarded: false },
      { cycle: cycles + 4, stage: 'WB', hazard: null, forwarded: false },
    ]
    diagram.push({ instruction: instrA, stages: stagesA })

    // Try to issue second instruction in same cycle
    if (i + 1 < instructions.length) {
      const instrB = instructions[i + 1]
      pair.instrB = instrB

      // Check for structural hazard (both need same stage at same time)
      const needsALU = (instr) => {
        const op = instr.split(/\s+/)[0]?.toLowerCase()
        return ['add','sub','and','or','nor','slt','addi','andi','ori'].includes(op)
      }
      if (needsALU(instrA) && needsALU(instrB)) {
        // Structural hazard: both need ALU → second stalls 1 cycle
        pair.structuralHazard = true
        hazards.push({
          type: 'structural',
          instrA: instrA,
          instrB: instrB,
          cycle: cycles + 2,
          resolution: 'Both instructions need ALU — second stalls 1 cycle',
        })

        // B starts 1 cycle delayed in EX
        const stagesB = [
          { cycle: cycles, stage: 'IF', hazard: null, forwarded: false },
          { cycle: cycles + 1, stage: 'ID', hazard: 'structural', forwarded: false },
          { cycle: cycles + 2, stage: 'stall', hazard: 'structural', forwarded: false },
          { cycle: cycles + 3, stage: 'EX', hazard: null, forwarded: false },
          { cycle: cycles + 4, stage: 'MEM', hazard: null, forwarded: false },
          { cycle: cycles + 5, stage: 'WB', hazard: null, forwarded: false },
        ]
        diagram.push({ instruction: instrB, stages: stagesB })
      } else {
        // No conflict — both issue in same cycle
        const stagesB = [
          { cycle: cycles, stage: 'IF', hazard: null, forwarded: false },
          { cycle: cycles + 1, stage: 'ID', hazard: null, forwarded: false },
          { cycle: cycles + 2, stage: 'EX', hazard: null, forwarded: false },
          { cycle: cycles + 3, stage: 'MEM', hazard: null, forwarded: false },
          { cycle: cycles + 4, stage: 'WB', hazard: null, forwarded: false },
        ]
        diagram.push({ instruction: instrB, stages: stagesB })
      }

      pairings.push(pair)
      i += 2
    } else {
      pairings.push(pair)
      i += 1
    }
  }

  // Calculate total cycles (all stages completed)
  const totalCycles = cycles + STAGES.length

  return {
    cycles: totalCycles,
    cpi: instructions.length > 0 ? totalCycles / instructions.length : 0,
    diagram,
    hazards,
    pairings,
  }
}

// ── Superscalar Grid Component (D3.js SVG) ─────────────────

const SUPER_STAGE_COLORS = {
  IF:   { bg: '#3b82f6', text: '#fff' },
  ID:   { bg: '#8b5cf6', text: '#fff' },
  EX:   { bg: '#22c55e', text: '#fff' },
  MEM:  { bg: '#f59e0b', text: '#fff' },
  WB:   { bg: '#ef4444', text: '#fff' },
}

const SUPER_CELL_W = 34
const SUPER_CELL_H = 28
const SUPER_LABEL_W = 140

function SuperscalarGrid({ diagram, currentCycle }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current || !diagram || diagram.length === 0) return

    // Determine max visible cycles
    let maxCycle = 0
    diagram.forEach(instr => {
      instr.stages.forEach(s => {
        if (s.cycle > maxCycle) maxCycle = s.cycle
      })
    })
    const visibleCycles = currentCycle > 0 ? Math.min(currentCycle, maxCycle) : maxCycle

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const totalWidth = SUPER_LABEL_W + visibleCycles * SUPER_CELL_W + 16
    const totalHeight = 12 + 24 + diagram.length * SUPER_CELL_H + 12

    svg
      .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style('display', 'block')

    // Header row
    for (let c = 0; c < visibleCycles; c++) {
      const x = SUPER_LABEL_W + c * SUPER_CELL_W
      svg.append('rect')
        .attr('x', x).attr('y', 0)
        .attr('width', SUPER_CELL_W).attr('height', 22)
        .attr('fill', 'var(--surface)')
        .attr('stroke', 'var(--border)')
        .attr('stroke-width', 0.5)
      svg.append('text')
        .attr('x', x + SUPER_CELL_W / 2).attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--text-muted)')
        .attr('font-family', 'var(--mono)')
        .attr('font-size', '8px')
        .attr('font-weight', '500')
        .text(`C${c + 1}`)
    }

    // Instruction rows
    diagram.forEach((instr, rowIdx) => {
      const y = 24 + rowIdx * SUPER_CELL_H

      // Label
      svg.append('rect')
        .attr('x', 0).attr('y', y)
        .attr('width', SUPER_LABEL_W).attr('height', SUPER_CELL_H)
        .attr('fill', 'var(--surface)')
        .attr('stroke', 'var(--border)')
        .attr('stroke-width', 0.5)

      svg.append('text')
        .attr('x', 6).attr('y', y + SUPER_CELL_H / 2 + 3)
        .attr('fill', 'var(--text)')
        .attr('font-family', 'var(--mono)')
        .attr('font-size', '9px')
        .text(instr.instruction.length > 20
          ? instr.instruction.slice(0, 18) + '…'
          : instr.instruction
        )

      // Stage cells
      const stages = instr.stages.filter(s => s.cycle <= visibleCycles && s.cycle > 0)
      stages.forEach(stage => {
        const cx = SUPER_LABEL_W + (stage.cycle - 1) * SUPER_CELL_W
        const isStall = stage.stage === 'stall'
        const colors = isStall
          ? { bg: '#4b5563', text: '#9ca3af' }
          : SUPER_STAGE_COLORS[stage.stage] || { bg: '#374151', text: '#9ca3af' }

        svg.append('rect')
          .attr('x', cx + 1).attr('y', y + 1)
          .attr('width', SUPER_CELL_W - 2).attr('height', SUPER_CELL_H - 2)
          .attr('fill', isStall ? 'rgba(107,114,128,0.2)' : `${colors.bg}22`)
          .attr('stroke', isStall ? 'rgba(107,114,128,0.4)' : `${colors.bg}44`)
          .attr('stroke-width', 0.5)
          .attr('rx', 2)

        svg.append('text')
          .attr('x', cx + SUPER_CELL_W / 2).attr('y', y + SUPER_CELL_H / 2 + 3)
          .attr('text-anchor', 'middle')
          .attr('fill', isStall ? '#6b7280' : colors.text)
          .attr('font-family', 'var(--mono)')
          .attr('font-size', '7px')
          .attr('font-weight', '600')
          .text(isStall ? '—' : stage.stage)
      })
    })
  }, [diagram, currentCycle])

  if (!diagram || diagram.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
        No data
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <svg ref={svgRef} />
    </div>
  )
}


