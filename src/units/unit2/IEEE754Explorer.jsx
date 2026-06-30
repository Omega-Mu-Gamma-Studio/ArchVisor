/**
 * IEEE754Explorer — IEEE 754 single-precision converter and FP operation visualizer
 *
 * Two modes: Converter and FP Operation
 * Converter mode: decimal → IEEE 754 with 32-bit SVG bit-field
 * FP Operation mode: add/sub two floats with phase-by-phase step-through
 * Uses BitFieldRenderer for the bit-field display
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toIEEE754, ieee754Operation } from '../../engines/ieee754.js'
import BitFieldRenderer from '../../components/shared/BitFieldRenderer.jsx'

export default function IEEE754Explorer() {
  const [mode, setMode] = useState('converter')
  const [convValue, setConvValue] = useState(3.14)
  const [opA, setOpA] = useState(5.5)
  const [opB, setOpB] = useState(2.25)
  const [fpOp, setFpOp] = useState('add')

  const convResult = useMemo(() => {
    try {
      return toIEEE754(convValue)
    } catch {
      return null
    }
  }, [convValue])

  const opResult = useMemo(() => {
    try {
      return ieee754Operation(opA, opB, fpOp)
    } catch {
      return null
    }
  }, [opA, opB, fpOp])

  const convFields = convResult
    ? [
        { label: 'Sign', bits: convResult.sign.toString(), color: '#ef4444', range: '31' },
        { label: 'Exponent', bits: convResult.bits.slice(1, 9), color: '#3b82f6', range: '30–23' },
        { label: 'Mantissa', bits: convResult.mantissa, color: '#22c55e', range: '22–0' },
      ]
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit II · Tool 4
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          IEEE 754 Explorer
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Explore single-precision floating-point representation and operations.
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['converter', 'fp-operation'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: `1px solid ${mode === m ? 'var(--accent-border)' : 'var(--border)'}`,
              background: mode === m ? 'var(--accent-dim)' : 'transparent',
              color: mode === m ? 'var(--accent-text)' : 'var(--text)',
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: mode === m ? 600 : 400,
              transition: 'all 0.2s',
            }}
          >
            {m === 'converter' ? 'Converter' : 'FP Operation'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'converter' ? (
          <ConverterMode
            key="converter"
            value={convValue}
            setValue={setConvValue}
            result={convResult}
            fields={convFields}
          />
        ) : (
          <FpOperationMode
            key="fp"
            a={opA}
            b={opB}
            setA={setOpA}
            setB={setOpB}
            fpOp={fpOp}
            setFpOp={setFpOp}
            result={opResult}
          />
        )}
      </AnimatePresence>

      {/* Color legend */}
      <div style={{ display: 'flex', gap: '20px', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444' }}/> Sign (1 bit)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3b82f6' }}/> Exponent (8 bits)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#22c55e' }}/> Mantissa (23 bits)
        </span>
      </div>

      {/* Reference info */}
      <div className="glass-card" style={{ padding: '16px', fontSize: '12px', color: 'var(--text)', lineHeight: 1.7 }}>
        <strong>Single Precision (32-bit):</strong> Sign (1) + Biased Exponent (8) + Mantissa (23) = 32 bits.&nbsp;
        <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          Value = (−1)^sign × 2^(exponent − 127) × 1.mantissa
        </span>
      </div>
    </div>
  )
}

function ConverterMode({ value, setValue, result, fields }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Input */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Decimal Value
          </label>
          <input
            type="number"
            step="any"
            value={value}
            onChange={e => setValue(parseFloat(e.target.value) || 0)}
            className="input-field"
            style={{ width: '160px' }}
          />
        </div>
      </div>

      {/* Bit-field SVG */}
      {result && fields.length > 0 && (
        <BitFieldRenderer
          fields={fields}
          totalBits={32}
          showLabels
          showRange
          showDecimal
        />
      )}

      {/* Summary */}
      {result && (
        <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <SummaryItem label="Hex" value={parseInt(result.bits, 2).toString(16).toUpperCase().padStart(8, '0')} />
          <SummaryItem label="Biased Exponent" value={String(result.biasedExponent)} />
          <SummaryItem label="Actual Exponent" value={String(result.biasedExponent - 127)} />
        </div>
      )}

      {/* Step-by-step breakdown */}
      {result && result.steps.length > 0 && (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            STEP-BY-STEP BREAKDOWN
          </div>
          <div style={{ padding: '12px 16px' }}>
            {result.steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  display: 'flex', gap: '16px', padding: '8px 0',
                  borderBottom: idx < result.steps.length - 1 ? '1px solid var(--border)' : 'none',
                  fontSize: '13px', lineHeight: 1.6,
                }}
              >
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: '10px',
                  color: 'var(--accent-text)', fontWeight: 600,
                  minWidth: '28px', paddingTop: '2px',
                }}>
                  {idx + 1}.
                </span>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>{step.label}</span>
                  <span style={{ color: 'var(--text)', marginLeft: '8px' }}>{step.detail}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function FpOperationMode({ a, b, setA, setB, fpOp, setFpOp, result }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Inputs */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Operand A
          </label>
          <input
            type="number"
            step="any"
            value={a}
            onChange={e => setA(parseFloat(e.target.value) || 0)}
            className="input-field"
            style={{ width: '120px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Operand B
          </label>
          <input
            type="number"
            step="any"
            value={b}
            onChange={e => setB(parseFloat(e.target.value) || 0)}
            className="input-field"
            style={{ width: '120px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Operation
          </label>
          <select
            value={fpOp}
            onChange={e => setFpOp(e.target.value)}
            className="input-field"
            style={{ width: '110px' }}
          >
            <option value="add">Add (+)</option>
            <option value="sub">Subtract (−)</option>
          </select>
        </div>
      </div>

      {/* Phase-by-phase steps */}
      {result && result.steps.length > 0 && (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            PHASES
          </div>
          <div style={{ padding: '12px 16px' }}>
            {result.steps.map((step, idx) => {
              const phaseColors = {
                align: { bg: 'rgba(59, 130, 246, 0.1)', dot: '#3b82f6' },
                operate: { bg: 'rgba(245, 158, 11, 0.1)', dot: '#f59e0b' },
                normalize: { bg: 'rgba(34, 197, 94, 0.1)', dot: '#22c55e' },
                round: { bg: 'rgba(139, 92, 246, 0.1)', dot: '#8b5cf6' },
              }
              const pc = phaseColors[step.phase] || { bg: 'transparent', dot: 'var(--text-muted)' }

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  style={{
                    display: 'flex', gap: '14px', padding: '10px 0',
                    borderBottom: idx < result.steps.length - 1 ? '1px solid var(--border)' : 'none',
                    fontSize: '13px', lineHeight: 1.6,
                  }}
                >
                  {/* Phase badge */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    minWidth: '80px',
                  }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 10px', borderRadius: '12px',
                      background: pc.bg,
                      color: pc.dot,
                      fontFamily: 'var(--mono)', fontSize: '9px',
                      fontWeight: 600, textTransform: 'uppercase',
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: pc.dot }}/>
                      {step.phase}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>{step.label}</span>
                    <span style={{ color: 'var(--text)', marginLeft: '8px' }}>{step.detail}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}
        >
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
              Result
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-text)' }}>
              {result.result.toFixed(6)}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
              32-bit Representation
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)', wordBreak: 'break-all' }}>
              {result.resultBits}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              0x{parseInt(result.resultBits, 2).toString(16).toUpperCase().padStart(8, '0')}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
              Actual
            </div>
            <div style={{
              fontSize: '20px', fontWeight: 600,
              color: fpOp === 'add'
                ? (Math.abs(result.result - (a + b)) < 0.01 ? '#22c55e' : '#ef4444')
                : (Math.abs(result.result - (a - b)) < 0.01 ? '#22c55e' : '#ef4444'),
            }}>
              {fpOp === 'add' ? `${a} + ${b} = ${(a + b).toFixed(4)}` : `${a} − ${b} = ${(a - b).toFixed(4)}`}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '16px', fontWeight: 600, color: 'var(--accent-text)' }}>
        {value}
      </div>
    </div>
  )
}
