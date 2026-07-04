/**
 * BinaryAdder — Step-by-step binary addition and subtraction with carry visualization
 *
 * Two integer inputs (signed, −128…127 for 8-bit default)
 * Operation selector: Add / Subtract
 * Shows 2's complement conversion for subtraction
 * Column-by-column SVG reveal with Framer Motion
 * Overflow detection with badge
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { binaryArithmetic } from '../../engines/binaryArithmetic.js'
import StepControls from '../../components/shared/StepControls.jsx'

export default function BinaryAdder() {
  const [a, setA] = useState(10)
  const [b, setB] = useState(3)
  const [operation, setOperation] = useState('add')
  const [bits, setBits] = useState(8)
  const [currentStep, setCurrentStep] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)

  const result = useMemo(() => {
    try {
      return binaryArithmetic(a, b, operation, bits)
    } catch {
      return null
    }
  }, [a, b, operation, bits])

  const steps = result?.steps ?? []
  const totalSteps = steps.length

  const visibleSteps = currentStep >= 0
    ? steps.slice(0, currentStep + 1)
    : []

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
      await new Promise(r => setTimeout(r, 400))
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
          Unit II · Tool 1
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Binary Adder / Subtractor
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Step through binary addition and subtraction bit by bit, watching carries propagate.
        </p>
      </div>

      {/* Configuration panel */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Operand A (decimal)
          </label>
          <input
            type="number"
            value={a}
            onChange={e => { setA(parseInt(e.target.value) || 0); handleReset() }}
            className="input-field"
            style={{ width: '100px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Operand B (decimal)
          </label>
          <input
            type="number"
            value={b}
            onChange={e => { setB(parseInt(e.target.value) || 0); handleReset() }}
            className="input-field"
            style={{ width: '100px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Operation
          </label>
          <select
            value={operation}
            onChange={e => { setOperation(e.target.value); handleReset() }}
            className="input-field"
            style={{ width: '110px' }}
          >
            <option value="add">Add (+)</option>
            <option value="sub">Subtract (−)</option>
          </select>
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

      {/* 2's Complement notice (subtraction only) */}
      {operation === 'sub' && result?.twosCompB && currentStep >= 0 && (
        <div className="glass-card" style={{
          padding: '12px 16px',
          borderLeft: '3px solid var(--accent)',
          fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)',
        }}>
          <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>2's Complement:</span>{' '}
          {b} → {result.twosCompB}
        </div>
      )}

      {/* Column addition layout */}
      {result && (
        <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontFamily: 'var(--mono)',
            fontSize: '14px',
            minWidth: `${bits * 40}px`,
          }}>
            {/* Carry row */}
            <div style={{ display: 'flex', alignItems: 'center', height: '28px' }}>
              <span style={{ width: '80px', flexShrink: 0, fontSize: '11px', color: 'var(--text-muted)' }}>carry</span>
              <div style={{ display: 'flex', gap: '2px', flex: 1, direction: 'rtl' }}>
                {result.binaryA.split('').map((_, idx) => {
                  const step = steps[binaryArithOrder(bits, idx)]
                  const isVisible = currentStep >= (bits - 1 - idx)
                  return (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, y: -8 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                      style={{
                        width: '36px', height: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '4px',
                        background: isVisible && step ? (step.carry_in ? 'var(--accent-dim)' : 'transparent') : 'transparent',
                        color: step?.carry_in ? 'var(--accent-text)' : 'var(--text-muted)',
                        fontSize: '12px', fontWeight: 600,
                      }}
                    >
                      {isVisible ? (step?.carry_in ?? '') : ''}
                    </motion.span>
                  )
                })}
              </div>
            </div>

            {/* Operand A */}
            <div style={{ display: 'flex', alignItems: 'center', height: '28px' }}>
              <span style={{ width: '80px', flexShrink: 0, fontSize: '11px', color: 'var(--text-muted)' }}>A</span>
              <div style={{ display: 'flex', gap: '2px', flex: 1, direction: 'rtl' }}>
                {result.binaryA.split('').map((bit, idx) => (
                  <span key={idx} style={{
                    width: '36px', height: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '4px',
                    background: idx === 0 ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: 'var(--text)',
                    fontSize: '13px', fontWeight: 500,
                  }}>
                    {bit}
                  </span>
                ))}
              </div>
            </div>

            {/* Operand B */}
            <div style={{ display: 'flex', alignItems: 'center', height: '28px' }}>
              <span style={{ width: '80px', flexShrink: 0, fontSize: '11px', color: 'var(--text-muted)' }}>B</span>
              <div style={{ display: 'flex', gap: '2px', flex: 1, direction: 'rtl' }}>
                {result.binaryB.split('').map((bit, idx) => (
                  <span key={idx} style={{
                    width: '36px', height: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '4px',
                    background: idx === 0 ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                    color: 'var(--text)',
                    fontSize: '13px', fontWeight: 500,
                  }}>
                    {bit}
                  </span>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div style={{ display: 'flex', alignItems: 'center', height: '20px' }}>
              <span style={{ width: '80px', flexShrink: 0 }} />
              <div style={{ flex: 1, borderBottom: '2px solid var(--border)', marginRight: '2px' }} />
            </div>

            {/* Sum row */}
            <div style={{ display: 'flex', alignItems: 'center', height: '28px' }}>
              <span style={{ width: '80px', flexShrink: 0, fontSize: '11px', color: 'var(--text-muted)' }}>sum</span>
              <div style={{ display: 'flex', gap: '2px', flex: 1, direction: 'rtl' }}>
                {result.binaryResult.split('').map((bit, idx) => {
                  const colFromRight = bits - 1 - idx
                  const isVisible = currentStep >= colFromRight
                  return (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      style={{
                        width: '36px', height: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '4px',
                        background: idx === 0 && result.overflow ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                        color: idx === 0 && result.overflow ? '#ef4444' : 'var(--text)',
                        fontSize: '13px', fontWeight: 600,
                      }}
                    >
                      {isVisible ? bit : ''}
                    </motion.span>
                  )
                })}
              </div>
            </div>

            {/* Carry-out row */}
            <div style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
              <span style={{ width: '80px', flexShrink: 0, fontSize: '11px', color: 'var(--text-muted)' }}>carry out</span>
              <div style={{ display: 'flex', gap: '2px', flex: 1, direction: 'rtl' }}>
                {steps.map((step, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={currentStep >= (bits - 1 - step.colIndex) ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: '36px', height: '20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '3px',
                      color: step.carry_out ? 'var(--accent-text)' : 'var(--text-muted)',
                      fontSize: '10px',
                    }}
                  >
                    {currentStep >= (bits - 1 - step.colIndex) ? (step.carry_out ?? '') : ''}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overflow badge */}
      {result?.overflow && currentStep >= totalSteps - 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{
            padding: '16px',
            borderLeft: '3px solid #ef4444',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>
            Overflow Detected — signed result exceeds {bits - 1}-bit range
          </span>
        </motion.div>
      )}

      {/* Result summary */}
      {result && currentStep >= 0 && (
        <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <ResultItem label="Binary" value={result.binaryResult} mono />
          <ResultItem label="Decimal (signed)" value={String(result.result)} />
          <ResultItem label="Hex" value={`0x${parseInt(result.binaryResult, 2).toString(16).toUpperCase().padStart(Math.ceil(bits / 4), '0')}`} mono />
        </div>
      )}
    </div>
  )
}

function ResultItem({ label, value, mono }) {
  return (
    <div>
      <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono ? 'var(--mono)' : 'inherit',
        fontSize: '16px', fontWeight: 600, color: 'var(--accent-text)',
      }}>
        {value}
      </span>
    </div>
  )
}

// Helper: map column index to correct step order (LSB = rightmost)
function binaryArithOrder(bits, idx) {
  return bits - 1 - idx
}
