/**
 * SubwordDemo — SIMD-style subword parallelism visualizer
 *
 * Shows a 32-bit register containing 4 × 8-bit packed values
 * Input: 4 value fields for Lane 0–3
 * Animate: packing → operating on all lanes simultaneously → unpacking
 * Framer Motion for synced lane animations
 * Scalar vs SIMD side-by-side comparison with speedup label
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const INITIAL_LANES = [10, 20, 30, 40]
const OPERATIONS = [
  { id: 'add', label: 'Add', symbol: '+' },
  { id: 'sub', label: 'Subtract', symbol: '−' },
  { id: 'mul', label: 'Multiply', symbol: '×' },
  { id: 'and', label: 'AND', symbol: '&' },
]

export default function SubwordDemo() {
  const [lanes, setLanes] = useState(INITIAL_LANES)
  const [scalarVal, setScalarVal] = useState(1)
  const [operation, setOperation] = useState('add')
  const [phase, setPhase] = useState('input') // input | packing | operating | unpacking | result
  const [simdResults, setSimdResults] = useState([0, 0, 0, 0])
  const [scalarResults, setScalarResults] = useState([0, 0, 0, 0])

  const getOpFn = (op) => {
    switch (op) {
      case 'add': return (a, b) => a + b
      case 'sub': return (a, b) => a - b
      case 'mul': return (a, b) => a * b
      case 'and': return (a, b) => a & b
      default: return (a, b) => a + b
    }
  }

  const op = getOpFn(operation)

  const runAnimation = async () => {
    // Phase 1: Packing
    setPhase('packing')
    await sleep(600)

    // Phase 2: Operating (SIMD — all lanes simultaneous)
    setPhase('operating')
    const sResults = lanes.map(v => {
      const r = op(v, scalarVal)
      return r > 255 ? 255 : r < 0 ? 0 : r
    })
    setSimdResults(sResults)
    await sleep(600)

    // Phase 3: Unpacking
    setPhase('unpacking')
    await sleep(600)

    // Phase 4: Results — compute scalar equivalents
    let scResults = []
    for (const v of lanes) {
      const r = op(v, scalarVal)
      scResults.push(r > 255 ? 255 : r < 0 ? 0 : r)
    }
    setScalarResults(scResults)
    setPhase('result')
  }

  const handleRun = () => {
    if (phase !== 'input') return
    setPhase('packing')
    runAnimation()
  }

  const handleReset = () => {
    setPhase('input')
    setSimdResults([0, 0, 0, 0])
    setScalarResults([0, 0, 0, 0])
  }

  const currentOp = OPERATIONS.find(o => o.id === operation)

  const laneColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit II · Tool 5
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Subword Parallelism (SIMD)
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Pack 4 × 8-bit values into a 32-bit register and operate on all lanes simultaneously.
        </p>
      </div>

      {/* Lane inputs */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {lanes.map((val, idx) => (
          <div key={idx}>
            <label style={{
              display: 'block',
              fontFamily: 'var(--mono)', fontSize: '10px',
              color: laneColors[idx],
              marginBottom: '4px', letterSpacing: '0.08em',
            }}>
              Lane {idx} (8-bit)
            </label>
            <input
              type="number"
              min={0} max={255}
              value={val}
              onChange={e => {
                const newLanes = [...lanes]
                newLanes[idx] = parseInt(e.target.value) || 0
                setLanes(newLanes)
              }}
              disabled={phase !== 'input'}
              className="input-field"
              style={{
                width: '90px',
                borderColor: phase === 'input' ? laneColors[idx] : 'var(--border)',
              }}
            />
          </div>
        ))}

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Scalar Operand
          </label>
          <input
            type="number"
            min={0} max={255}
            value={scalarVal}
            onChange={e => setScalarVal(parseInt(e.target.value) || 0)}
            disabled={phase !== 'input'}
            className="input-field"
            style={{ width: '90px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            Operation
          </label>
          <select
            value={operation}
            onChange={e => setOperation(e.target.value)}
            disabled={phase !== 'input'}
            className="input-field"
            style={{ width: '120px' }}
          >
            {OPERATIONS.map(o => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleRun}
          disabled={phase !== 'input'}
          style={{
            padding: '8px 20px', borderRadius: '8px',
            border: '1px solid var(--accent-border)',
            background: phase === 'input' ? 'var(--accent-dim)' : 'transparent',
            color: phase === 'input' ? 'var(--accent-text)' : 'var(--text-muted)',
            fontFamily: 'var(--mono)', fontSize: '12px',
            cursor: phase === 'input' ? 'pointer' : 'default',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          {phase === 'input' ? '▶  Run SIMD' : '⏳ Processing...'}
        </button>
        <button
          onClick={handleReset}
          disabled={phase === 'input'}
          style={{
            padding: '8px 20px', borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: phase === 'input' ? 'var(--text-muted)' : 'var(--text)',
            fontFamily: 'var(--mono)', fontSize: '12px',
            cursor: phase === 'input' ? 'default' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ↺ Reset
        </button>
      </div>

      {/* Visualizer */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '260px' }}>

        {/* Phase label */}
        <div style={{
          fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'var(--accent-text)',
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          {phase === 'input' && 'Configure lane values above'}
          {phase === 'packing' && '📦 Packing values into 32-bit register...'}
          {phase === 'operating' && `⚡ SIMD: All 4 lanes ${currentOp.label} ${scalarVal} simultaneously`}
          {phase === 'unpacking' && '📤 Unpacking lane results...'}
          {phase === 'result' && '✅ Results'}
        </div>

        {/* 32-bit register visualization */}
        <div style={{
          display: 'flex',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          overflow: 'hidden',
          height: '64px',
        }}>
          {lanes.map((val, idx) => {
            const isActive = phase === 'operating' || phase === 'result'
            const resultVal = phase === 'result' ? simdResults[idx] : val

            return (
              <motion.div
                key={idx}
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  scale: isActive ? 1.05 : 1,
                }}
                transition={{ duration: 0.3, delay: isActive ? idx * 0.05 : 0 }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  background: isActive ? `${laneColors[idx]}22` : 'transparent',
                  borderRight: idx < 3 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.3s',
                }}
              >
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: laneColors[idx],
                }}>
                  {resultVal.toString(2).padStart(8, '0')}
                </span>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                }}>
                  Lane {idx} · {resultVal} (dec)
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Operation visualization */}
        {phase === 'operating' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', justifyContent: 'center', gap: '16px',
              padding: '8px',
            }}
          >
            {lanes.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.2, 1] }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '8px',
                  background: `${laneColors[idx]}15`,
                  fontFamily: 'var(--mono)', fontSize: '13px',
                  color: laneColors[idx],
                }}
              >
                <span>{val}</span>
                <span style={{ color: 'var(--text)' }}>{currentOp.symbol}</span>
                <span>{scalarVal}</span>
                <span style={{ color: 'var(--text-muted)' }}>=</span>
                <span style={{ fontWeight: 700 }}>{simdResults[idx]}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Results: SIMD vs Scalar comparison */}
        {phase === 'result' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              {/* SIMD panel */}
              <div className="glass-card" style={{
                padding: '16px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: '10px',
                  color: '#22c55e', fontWeight: 600,
                  letterSpacing: '0.08em', marginBottom: '12px',
                }}>
                  SIMD (1 operation)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {simdResults.map((r, idx) => (
                    <div key={idx} style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontFamily: 'var(--mono)', fontSize: '12px',
                    }}>
                      <span style={{ color: laneColors[idx] }}>Lane {idx}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scalar panel */}
              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: '10px',
                  color: 'var(--text-muted)', fontWeight: 600,
                  letterSpacing: '0.08em', marginBottom: '12px',
                }}>
                  Scalar (4 operations)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {scalarResults.map((r, idx) => (
                    <div key={idx} style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontFamily: 'var(--mono)', fontSize: '12px',
                    }}>
                      <span style={{ color: laneColors[idx] }}>Lane {idx}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Speedup label */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              style={{
                textAlign: 'center', marginTop: '16px',
                padding: '12px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-dim), rgba(34, 197, 94, 0.1))',
                border: '1px solid var(--accent-border)',
              }}
            >
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '24px', fontWeight: 700,
                color: 'var(--accent-text)',
              }}>
                4× Speedup
              </span>
              <span style={{
                display: 'block',
                fontFamily: 'var(--mono)', fontSize: '11px',
                color: 'var(--text-muted)', marginTop: '4px',
              }}>
                4 scalar ops → 1 SIMD op
              </span>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Architecture note */}
      <div style={{
        fontSize: '12px', color: 'var(--text)', lineHeight: 1.7,
        padding: '12px', borderRadius: '8px',
        border: '1px solid var(--border)',
      }}>
        <strong>Subword Parallelism</strong> packs multiple smaller data elements into a single larger register
        and operates on all elements with one instruction. Used in SSE, AVX, NEON (ARM), and GPU SIMT execution.
      </div>
    </div>
  )
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
