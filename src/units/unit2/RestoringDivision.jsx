/**
 * RestoringDivision — Step-through Restoring Division visualizer
 *
 * Two inputs: Dividend and Divisor
 * Bit-width selector (4, 8, 16 bits)
 * Calls restoringDivide() engine
 * Step table: Iteration | Partial Remainder | Subtract Result | Restored? | Quotient Bit | A | Q
 * Highlight restored rows in amber, successful subtract in green
 * Step Forward / Back / Run All / Reset controls
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { restoringDivide } from '../../engines/restoringDivision.js'
import StepControls from '../../components/shared/StepControls.jsx'

export default function RestoringDivision() {
  const [dividend, setDividend] = useState(10)
  const [divisor, setDivisor] = useState(3)
  const [bits, setBits] = useState(8)
  const [currentStep, setCurrentStep] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)

  const result = useMemo(() => {
    try {
      return restoringDivide(dividend, divisor, bits)
    } catch {
      return null
    }
  }, [dividend, divisor, bits])

  const steps = result?.steps ?? []
  const totalSteps = steps.length
  const visibleSteps = currentStep >= 0 ? steps.slice(0, currentStep + 1) : []

  const canStepForward = currentStep < totalSteps - 1
  const canStepBack = currentStep >= 0

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit II · Tool 3
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Restoring Division
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Step through the restoring division algorithm, watching the quotient emerge bit by bit.
        </p>
      </div>

      {/* Configuration */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Dividend
          </label>
          <input
            type="number"
            value={dividend}
            onChange={e => { setDividend(parseInt(e.target.value) || 0); handleReset() }}
            className="input-field"
            style={{ width: '100px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Divisor
          </label>
          <input
            type="number"
            value={divisor}
            onChange={e => { setDivisor(parseInt(e.target.value) || 1); handleReset() }}
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
                  <TH>Partial Rem.</TH>
                  <TH>A − M</TH>
                  <TH>Restored?</TH>
                  <TH>Q-bit</TH>
                  <TH>A (after)</TH>
                  <TH>Q (after)</TH>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {visibleSteps.map((step, idx) => {
                    const rowBg = step.restored
                      ? 'rgba(245, 158, 11, 0.08)'
                      : step.quotientBit === 1
                        ? 'rgba(34, 197, 94, 0.05)'
                        : idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'

                    return (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: rowBg,
                        }}
                      >
                        <TD>{step.iteration + 1}</TD>
                        <TD style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>
                          {step.partialRemainder}
                        </TD>
                        <TD style={{
                          fontFamily: 'var(--mono)',
                          color: step.restored ? '#f59e0b' : '#22c55e',
                        }}>
                          {step.subtractResult}
                        </TD>
                        <TD>
                          {step.restored ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '2px 8px', borderRadius: '4px',
                              background: 'rgba(245, 158, 11, 0.2)',
                              color: '#f59e0b', fontWeight: 600, fontSize: '11px',
                            }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                              Restored
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>—</span>
                          )}
                        </TD>
                        <TD>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '24px', height: '24px',
                            borderRadius: '6px',
                            background: step.quotientBit === 1 ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                            color: step.quotientBit === 1 ? '#22c55e' : 'var(--text-muted)',
                            fontWeight: 600,
                          }}>
                            {step.quotientBit}
                          </span>
                        </TD>
                        <TD style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>{step.A}</TD>
                        <TD style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>{step.Q}</TD>
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
          style={{ padding: '20px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}
        >
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
              Quotient
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-text)' }}>
              {result.quotient}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {result.quotient.toString(2).padStart(bits, '0')}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
              Remainder
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-text)' }}>
              {result.remainder}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {result.remainder.toString(2).padStart(bits, '0')}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
              Check
            </div>
            <div style={{
              fontSize: '16px', fontWeight: 600,
              color: dividend === result.quotient * Math.abs(divisor) + result.remainder ? '#22c55e' : '#ef4444',
            }}>
              {dividend} ÷ {divisor} = {Math.floor(dividend / Math.abs(divisor))} R {dividend % Math.abs(divisor)}
              {dividend === result.quotient * Math.abs(divisor) + result.remainder ? ' ✓' : ' ✗'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(34, 197, 94, 0.3)' }}/> Subtract success
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(245, 158, 11, 0.3)' }}/> Restored
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
