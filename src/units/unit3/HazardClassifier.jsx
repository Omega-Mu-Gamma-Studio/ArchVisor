/**
 * HazardClassifier — Static hazard analysis of a MIPS instruction sequence
 *
 * Text area input → Classify Hazards button → calls classifyHazards() engine
 * Color-coded hazard report table with expandable rows
 * Summary counts panel
 * Green "No hazards detected" panel when clear
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { classifyHazards } from '../../engines/pipelineEngine.js'
import HazardBadge from '../../components/shared/HazardBadge.jsx'

const DEFAULT_INSTRUCTIONS = `addi $t0, $zero, 5
addi $t1, $zero, 10
add $t2, $t0, $t1
sub $t3, $t1, $t0
beq $t0, $t1, label
lw $t4, 0($t1)`

const HAZARD_EXPLANATIONS = {
  RAW: 'A Read-After-Write (RAW) hazard occurs when an instruction tries to read a register that a previous instruction is still writing. Without forwarding, the pipeline must stall until the data is available.',
  WAW: 'A Write-After-Write (WAW) hazard occurs when two instructions write to the same register out of order. In the classic 5-stage pipeline with in-order issue, WAW hazards typically do not occur.',
  WAR: 'A Write-After-Read (WAR) hazard occurs when an instruction writes to a register that a previous instruction is still reading. With in-order execution, this is not a problem in the 5-stage pipeline.',
  control: 'A control hazard (branch penalty) occurs when a branch or jump instruction changes the program flow. The instruction fetched after the branch must be flushed if the branch is taken, costing 1 stall cycle.',
  structural: 'A structural hazard occurs when two instructions need the same hardware resource simultaneously. The classic 5-stage pipeline avoids most structural hazards by separating instruction and data memory.',
}

export default function HazardClassifier() {
  const [input, setInput] = useState(DEFAULT_INSTRUCTIONS)
  const [hazards, setHazards] = useState([])
  const [expandedRow, setExpandedRow] = useState(null)
  const [hasClassified, setHasClassified] = useState(false)

  useEffect(() => {
    setHazards([])
    setHasClassified(false)
    setExpandedRow(null)
  }, [])

  const handleClassify = () => {
    const lines = input
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#'))

    const results = classifyHazards(lines)
    setHazards(results)
    setHasClassified(true)
    setExpandedRow(null)
  }

  const typeCounts = {}
  hazards.forEach(h => {
    typeCounts[h.type] = (typeCounts[h.type] || 0) + 1
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit III · Tool 3
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Hazard Classifier
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Analyze a MIPS instruction sequence for data and control hazards.
        </p>
      </div>

      {/* Input */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <label style={{
          display: 'block', fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.08em',
        }}>
          MIPS Instruction Sequence (one per line)
        </label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{
            width: '100%', minHeight: '140px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontFamily: 'var(--mono)',
            fontSize: '13px',
            lineHeight: 1.7,
            resize: 'vertical',
            outline: 'none',
          }}
        />
        <button
          onClick={handleClassify}
          style={{
            marginTop: '12px',
            padding: '9px 24px',
            borderRadius: '8px',
            border: '1px solid var(--accent-border)',
            background: 'var(--accent-dim)',
            color: 'var(--accent-text)',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '6px' }}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Classify Hazards
        </button>
      </div>

      {/* Summary counts */}
      {hasClassified && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}
        >
          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
            HAZARD SUMMARY
          </span>
          {hazards.length === 0 ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              No hazards detected
            </span>
          ) : (
            Object.entries(typeCounts).map(([type, count]) => (
              <HazardBadge key={type} type={type} size="md" />
            ))
          )}
          {hazards.length > 0 && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              {hazards.length} total hazard{hazards.length !== 1 ? 's' : ''}
            </span>
          )}
        </motion.div>
      )}

      {/* Hazard report table */}
      {hasClassified && hazards.length > 0 && (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse',
              fontFamily: 'var(--mono)', fontSize: '12px',
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 500 }}>#</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 500 }}>Hazard Type</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 500 }}>Instruction A</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 500 }}>Instruction B</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 500 }}>Cycle</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 500 }}>Resolution</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {hazards.map((h, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: expandedRow === idx ? 'rgba(255,255,255,0.04)' : idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '11px' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <HazardBadge type={h.type} size="sm" />
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text)', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>#{h.instrIndexA} </span>
                        {h.instrA.length > 20 ? h.instrA.slice(0, 18) + '…' : h.instrA}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text)', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>#{h.instrIndexB} </span>
                        {h.instrB.length > 20 ? h.instrB.slice(0, 18) + '…' : h.instrB}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '11px' }}>C{h.cycle}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text)', fontSize: '11px' }}>{h.resolution}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expanded explanation */}
      {expandedRow !== null && hazards[expandedRow] && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '16px', borderLeft: '3px solid var(--accent)' }}
        >
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            color: 'var(--accent-text)', fontWeight: 600,
            letterSpacing: '0.08em', marginBottom: '8px',
          }}>
            WHY THIS HAZARD?
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>
            {HAZARD_EXPLANATIONS[hazards[expandedRow].type] || 'No additional explanation available.'}
          </p>
          <div style={{
            marginTop: '8px', padding: '8px 12px',
            background: 'rgba(255,255,255,0.03)', borderRadius: '6px',
            fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)',
          }}>
            <strong>Resolution:</strong> {hazards[expandedRow].resolution}
          </div>
        </motion.div>
      )}

      {/* No hazards panel */}
      {hasClassified && hazards.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{
            padding: '32px', textAlign: 'center',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: '#22c55e', fontWeight: 600 }}>
            No hazards detected
          </span>
          <p style={{ fontSize: '13px', color: 'var(--text)', marginTop: '8px', lineHeight: 1.6 }}>
            The instruction sequence has no data or control hazards —<br />
            it can be pipelined without stalls.
          </p>
        </motion.div>
      )}

      {/* Hint */}
      <div style={{
        fontSize: '12px', color: 'var(--text)', lineHeight: 1.7,
        padding: '12px', borderRadius: '8px',
        border: '1px solid var(--border)',
      }}>
        <strong>Tip:</strong> Try adding an <code style={{ fontFamily: 'var(--mono)', color: 'var(--accent-text)' }}>add $t2, $t0, $t1</code> followed by
        a <code style={{ fontFamily: 'var(--mono)', color: 'var(--accent-text)' }}>sub $t3, $t2, $t1</code> to see a RAW hazard (sub reads $t2 that add writes).
        Add a <code style={{ fontFamily: 'var(--mono)', color: 'var(--accent-text)' }}>beq $t0, $t1, label</code> to see a control hazard.
      </div>
    </div>
  )
}
