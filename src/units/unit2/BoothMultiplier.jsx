/**
 * BoothMultiplier — Step-through Booth's Algorithm visualizer
 *
 * Two inputs: Multiplicand (M) and Multiplier (Q)
 * Bit-width selector (4, 8, 16 bits)
 * Calls boothMultiply() engine
 * Step table: Iteration | Operation | A | Q | Q₋₁
 * Highlighted operation cells (green/red/gray)
 * Step Forward / Back / Run All / Reset controls
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { boothMultiply } from '../../engines/booth.js'
import StepControls from '../../components/shared/StepControls.jsx'

export default function BoothMultiplier({ initialScenario = null, onScenarioSolved } = {}) {
  const [multiplicand, setMultiplicand] = useState(initialScenario?.multiplicand ?? 3)
  const [multiplier, setMultiplier] = useState(initialScenario?.multiplier ?? 4)
  const [bits, setBits] = useState(initialScenario?.bitWidth ?? 8)
  const [currentStep, setCurrentStep] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const firedRef = useRef(false)

  const result = useMemo(() => {
    try {
      return boothMultiply(multiplicand, multiplier, bits)
    } catch {
      return null
    }
  }, [multiplicand, multiplier, bits])

  const steps = result?.steps ?? []
  const totalSteps = steps.length
  const visibleSteps = currentStep >= 0 ? steps.slice(0, currentStep + 1) : []

  const canStepForward = currentStep < totalSteps - 1
  const canStepBack = currentStep >= 0

  // ── Boss win condition: derived, not stored in state ─────
  const solved = Boolean(initialScenario && totalSteps > 0 && currentStep >= totalSteps - 1)

  useEffect(() => {
    if (solved && !firedRef.current && onScenarioSolved) {
      firedRef.current = true
      onScenarioSolved()
    }
  }, [solved, onScenarioSolved])

  const handleStepForward = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(s => s + 1)
  }
  const handleStepBack = () => {
    if (currentStep >= 0) setCurrentStep(s => s - 1)
  }
  const handleRunAll = async () => {
    setIsRunning(true)
    for (let i = 0; i < totalSteps; i++) {
      setCurrentStep(i)
      await new Promise(r => setTimeout(r, 500))
    }
    setIsRunning(false)
  }
  const handleReset = () => {
    setCurrentStep(-1)
    setIsRunning(false)
  }

  const operationColor = (op) => {
    if (op === 'A = A + M') return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'A + M' }
    if (op === 'A = A - M') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'A − M' }
    return { bg: 'transparent', color: 'var(--text-muted)', label: 'no-op' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit II · Tool 2
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Booth's Multiplier
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Step through Booth's multiplication algorithm iteration by iteration.
        </p>
      </div>

      {initialScenario && (
        <div style={{
          padding: '10px 16px', borderRadius: '10px',
          border: `1px solid ${solved ? 'rgba(34,197,94,0.4)' : 'var(--accent-border)'}`,
          background: solved ? 'rgba(34,197,94,0.1)' : 'var(--accent-dim)',
          fontFamily: 'var(--mono)', fontSize: '12px',
          color: solved ? '#22c55e' : 'var(--accent-text)',
        }}>
          {solved
            ? `✓ Boss cleared — ${multiplicand} × ${multiplier} worked out to ${result?.product ?? '?'}`
            : `🎯 Objective: step all the way through ${multiplicand} × ${multiplier} to the final product`}
        </div>
      )}

      {/* Configuration */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Multiplicand (M)
          </label>
          <input
            type="number"
            value={multiplicand}
            onChange={e => { setMultiplicand(parseInt(e.target.value) || 0); handleReset() }}
            className="input-field"
            style={{ width: '100px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Multiplier (Q)
          </label>
          <input
            type="number"
            value={multiplier}
            onChange={e => { setMultiplier(parseInt(e.target.value) || 0); handleReset() }}
            className="input-field"
            style={{ width: '100px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Bit Width
          </label>
          <select
            value={bits}
            onChange={e => { setBits(parseInt(e.target.value)); handleReset() }}
            className="input-field"
            style={{ width: '90px' }}
          >
            {[4, 8, 16].map(n => (
              <option key={n} value={n}>{n} bits</option>
            ))}
          </select>
        </div>
      </div>

      {/* Controls */}
      <StepControls
        onStepForward={handleStepForward}
        onStepBack={handleStepBack}
        onRunAll={handleRunAll}
        onReset={handleReset}
        currentStep={currentStep + 1}
        totalSteps={totalSteps}
        canStepForward={canStepForward}
        canStepBack={canStepBack}
        isRunning={isRunning}
      />

      {/* Step table */}
      {result && steps.length > 0 && (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse',
              fontFamily: 'var(--mono)', fontSize: '12px',
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  <TH>Iter</TH>
                  <TH>Q₀</TH>
                  <TH>Q₋₁</TH>
                  <TH>Operation</TH>
                  <TH>A</TH>
                  <TH>Q</TH>                        <TH>Q₋₁</TH>
                        <TH>A Shift</TH>
                        <TH>Q Shift</TH>
                        <TH>Q₋₁' Shift</TH>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {visibleSteps.map((step, idx) => {
                    const opStyle = operationColor(step.operation)
                    return (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                        }}
                      >
                        <TD>{step.iteration + 1}</TD>
                        <TD>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '24px', height: '24px',
                            borderRadius: '6px',
                            background: step.Q0 ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                            color: step.Q0 ? '#3b82f6' : 'var(--text-muted)',
                            fontWeight: 600,
                          }}>
                            {step.Q0}
                          </span>
                        </TD>
                        <TD>
                          <span style={{ color: step.Q_1 === 1 ? 'var(--accent-text)' : 'var(--text-muted)' }}>
                            {step.Q_1}
                          </span>
                        </TD>
                        <TD>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            background: opStyle.bg,
                            color: opStyle.color,
                            fontWeight: 600,
                            fontSize: '11px',
                          }}>
                            {opStyle.label}
                          </span>
                        </TD>
                        <TD style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>{step.A}</TD>
                        <TD style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>{step.Q}</TD>
                        <TD style={{ color: 'var(--text-muted)' }}>{step.Q_minus1}</TD>
                        <TD style={{ fontFamily: 'var(--mono)', color: '#3b82f6' }}>{step.afterShift.A}</TD>
                        <TD style={{ fontFamily: 'var(--mono)', color: '#3b82f6' }}>{step.afterShift.Q}</TD>
                        <TD style={{ color: '#3b82f6', fontWeight: 600 }}>{step.afterShift.Q_minus1}</TD>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Final result */}
      {result && currentStep >= totalSteps - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}
        >
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
              Product (Binary)
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '16px', fontWeight: 600, color: 'var(--accent-text)' }}>
              {result.binaryProduct}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
              Product (Decimal)
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-text)' }}>
              {result.product}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
              Check
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: result.product === multiplicand * multiplier ? '#22c55e' : '#ef4444' }}>
              {multiplicand} × {multiplier} = {multiplicand * multiplier} {result.product === multiplicand * multiplier ? '✓' : '✗'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(34, 197, 94, 0.3)' }}/> A + M
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.3)' }}/> A − M
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'transparent', border: '1px solid var(--border)' }}/> No-op
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(59, 130, 246, 0.3)' }}/> After shift
        </span>
      </div>
    </div>
  )
}

function TH({ children }) {
  return (
    <th style={{
      padding: '10px 12px', textAlign: 'left',
      fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)',
      letterSpacing: '0.06em', fontWeight: 500,
    }}>
      {children}
    </th>
  )
}

function TD({ children, style }) {
  return (
    <td style={{
      padding: '10px 12px',
      ...style,
    }}>
      {children}
    </td>
  )
}
