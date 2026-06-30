/**
 * PipelineAnimator ⭐ — Animated cycle-by-cycle pipeline timing diagram with hazard visualization
 *
 * FLAGSHIP TOOL for Unit III
 *
 * Features:
 * - CodeMirror 6 editor for MIPS instruction sequence input
 * - Mode toggle: Without Forwarding / With Forwarding / Side-by-Side
 * - Calls simulatePipeline() engine
 * - D3.js PipelineGrid for timing diagram
 * - Stats panel: CPI, Total Cycles, Stall Count, Hazard Count
 * - Hazard legend
 * - Step Forward / Back / Run All / Reset controls
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands'
import { StreamLanguage } from '@codemirror/language'
import { simulatePipeline } from '../../engines/pipelineEngine.js'
import PipelineGrid from '../../components/shared/PipelineGrid.jsx'
import HazardBadge from '../../components/shared/HazardBadge.jsx'
import StepControls from '../../components/shared/StepControls.jsx'

// ── MIPS Syntax Highlighting (same as MIPSExecutor) ───────
const mipsKeywords = [
  'add','sub','and','or','nor','slt',
  'addi','andi','ori',
  'lw','sw',
  'beq','bne',
  'j','jr','jal',
]

const mipsRegisters = [
  'zero','at','v0','v1','a0','a1','a2','a3',
  't0','t1','t2','t3','t4','t5','t6','t7',
  's0','s1','s2','s3','s4','s5','s6','s7',
  't8','t9','k0','k1','gp','sp','fp','ra',
]

const mipsLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.eatSpace()) return null
    if (stream.match('#')) { stream.skipToEnd(); return 'comment' }
    if (stream.match(/^-?\d+/)) return 'number'
    if (stream.match(/\$[a-z0-9]+/i)) {
      const regName = stream.current().toLowerCase().replace('$', '')
      if (mipsRegisters.includes(regName)) return 'variableName'
      return 'string'
    }
    if (stream.match(/^[A-Za-z_][A-Za-z0-9_]*:/)) return 'labelName'
    if (stream.match(/^[A-Za-z_][A-Za-z0-9_]*/)) {
      const word = stream.current().toLowerCase()
      if (mipsKeywords.includes(word)) return 'keyword'
      return 'labelName'
    }
    if (stream.match(/^[,()]/)) return 'punctuation'
    if (stream.match(/^0x[0-9a-fA-F]+/)) return 'number'
    stream.next()
    return null
  },
})

const mipsTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '13px',
  },
  '.cm-content': { caretColor: 'var(--accent)', padding: '8px 0' },
  '.cm-cursor': { borderLeftColor: 'var(--accent)' },
  '.cm-activeLine': { backgroundColor: 'rgba(170, 59, 255, 0.06)' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(170, 59, 255, 0.15)' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: '1px solid var(--border)',
    color: 'var(--text-muted)',
  },
  '.cm-lineNumbers .gutterElement': { padding: '0 12px 0 8px' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(170, 59, 255, 0.15)' },
})

const DEFAULT_TEXT = `addi $t0, $zero, 5
addi $t1, $zero, 10
add $t2, $t0, $t1
sub $t3, $t1, $t0`

export default function PipelineAnimator() {
  const [mode, setMode] = useState('no-fwd')
  const [editorContent, setEditorContent] = useState(DEFAULT_TEXT)
  const [currentCycle, setCurrentCycle] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const editorRef = useRef(null)
  const viewRef = useRef(null)

  // ── Init CodeMirror ──────────────────────────────────────
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return

    const startState = EditorState.create({
      doc: editorContent,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        mipsLanguage,
        mipsTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setEditorContent(update.state.doc.toString())
          }
        }),
      ],
    })

    viewRef.current = new EditorView({
      state: startState,
      parent: editorRef.current,
    })

    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Parse instructions ───────────────────────────────────
  const instructions = useMemo(() => {
    return editorContent
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#'))
  }, [editorContent])

  // ── Run simulations ──────────────────────────────────────
  const resultNoFwd = useMemo(() => {
    if (instructions.length === 0) return null
    return simulatePipeline(instructions, { forwarding: false })
  }, [instructions])

  const resultWithFwd = useMemo(() => {
    if (instructions.length === 0) return null
    return simulatePipeline(instructions, { forwarding: true })
  }, [instructions])

  const currentResult = mode === 'with-fwd' ? resultWithFwd : resultNoFwd
  const maxCycle = currentResult?.cycles || 0
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
      await new Promise(r => setTimeout(r, 400))
    }
    setIsRunning(false)
  }
  const handleReset = () => {
    setCurrentCycle(0)
    setIsRunning(false)
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setCurrentCycle(0)
    setIsRunning(false)
  }

  const stallCount = useMemo(() => {
    if (!currentResult?.diagram) return 0
    let count = 0
    for (const instr of currentResult.diagram) {
      for (const stage of instr.stages) {
        if (stage.stage === 'stall') count++
      }
    }
    return count
  }, [currentResult])

  const hazardCount = currentResult?.hazards?.length || 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit III · Tool 2 ⭐
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Pipeline Animator
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Animated cycle-by-cycle 5-stage MIPS pipeline timing diagram with hazard visualization.
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'no-fwd', label: 'Without Forwarding' },
          { id: 'with-fwd', label: 'With Forwarding' },
          { id: 'side-by-side', label: 'Side-by-Side' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => handleModeChange(m.id)}
            style={{
              padding: '8px 18px', borderRadius: '8px',
              border: `1px solid ${mode === m.id ? 'var(--accent-border)' : 'var(--border)'}`,
              background: mode === m.id ? 'var(--accent-dim)' : 'transparent',
              color: mode === m.id ? 'var(--accent-text)' : 'var(--text)',
              fontFamily: 'var(--mono)', fontSize: '11px',
              cursor: 'pointer', fontWeight: mode === m.id ? 600 : 400,
              transition: 'all 0.2s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* CodeMirror Editor */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: '4px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderBottom: '1px solid var(--border)',
        }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            MIPS Assembly
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
            {instructions.length} instr
          </span>
        </div>
        <div ref={editorRef} style={{ minHeight: '100px' }} />
      </div>

      {/* Controls */}
      <StepControls
        onStepForward={handleStepForward}
        onStepBack={handleStepBack}
        onRunAll={handleRunAll}
        onReset={handleReset}
        currentStep={currentCycle}
        totalSteps={totalSteps}
        canStepForward={canStepForward}
        canStepBack={canStepBack}
        isRunning={isRunning}
      />

      {/* Stats panel */}
      {currentResult && (
        <div className="glass-card" style={{
          padding: '14px 20px',
          display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center',
        }}>
          <StatItem label="Total Cycles" value={String(currentResult.cycles)} />
          <StatItem label="CPI" value={currentResult.cpi.toFixed(2)} />
          <StatItem label="Instructions" value={String(instructions.length)} />
          <StatItem label="Stalls" value={String(stallCount)} />
          <StatItem label="Hazards" value={String(hazardCount)} />
          {mode === 'side-by-side' && resultWithFwd && (
            <div style={{
              padding: '6px 14px', borderRadius: '8px',
              background: 'rgba(34, 197, 94, 0.15)',
              fontFamily: 'var(--mono)', fontSize: '12px',
              color: '#22c55e', fontWeight: 600,
            }}>
              ΔCPI: {(currentResult.cpi - resultWithFwd.cpi).toFixed(2)}
            </div>
          )}
        </div>
      )}

      {/* Pipeline Grid */}
      {mode !== 'side-by-side' ? (
        <>
          {currentResult && (
            <PipelineGrid
              diagram={currentResult}
              currentCycle={currentCycle}
              showForwarding={mode === 'with-fwd'}
              showHazards
            />
          )}

          <div style={{
            display: 'flex', gap: '16px', flexWrap: 'wrap',
            fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)',
            padding: '10px', borderRadius: '8px',
            border: '1px solid var(--border)',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>Legend:</span>
            <HazardBadge type="RAW" size="sm" />
            <HazardBadge type="control" size="sm" />
            <HazardBadge type="structural" size="sm" />
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#22c55e', fontSize: '14px' }}>⤴</span> Forwarding
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                width: '12px', height: '12px', borderRadius: '2px',
                background: 'repeating-linear-gradient(45deg, #6b7280, #6b7280 2px, transparent 2px, transparent 4px)',
              }}/>
              Stall
            </span>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: '10px',
              color: '#ef4444', fontWeight: 600,
              letterSpacing: '0.08em', marginBottom: '8px',
            }}>
              WITHOUT FORWARDING · CPI: {resultNoFwd?.cpi.toFixed(2) || '—'}
            </div>
            {resultNoFwd && (
              <PipelineGrid
                diagram={resultNoFwd}
                currentCycle={currentCycle}
                showForwarding={false}
                showHazards
              />
            )}
          </div>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: '10px',
              color: '#22c55e', fontWeight: 600,
              letterSpacing: '0.08em', marginBottom: '8px',
            }}>
              WITH FORWARDING · CPI: {resultWithFwd?.cpi.toFixed(2) || '—'}
            </div>
            {resultWithFwd && (
              <PipelineGrid
                diagram={resultWithFwd}
                currentCycle={currentCycle}
                showForwarding
                showHazards
              />
            )}
          </div>
        </div>
      )}

      {/* Hazard detail list */}
      {currentResult?.hazards?.length > 0 && currentCycle > 0 && (
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            color: 'var(--text-muted)', fontWeight: 600,
            letterSpacing: '0.08em', marginBottom: '12px',
          }}>
            HAZARD DETAILS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <AnimatePresence>
              {currentResult.hazards.slice(0, 10).map((h, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '6px 12px', borderRadius: '6px',
                    background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    fontSize: '12px',
                  }}
                >
                  <HazardBadge type={h.type} size="sm" />
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--mono)' }}>
                    C{h.cycle}
                  </span>
                  <span style={{ color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '11px', flex: 1 }}>
                    {h.instrA.length > 16 ? h.instrA.slice(0, 14) + '…' : h.instrA}
                    {' → '}
                    {h.instrB.length > 16 ? h.instrB.slice(0, 14) + '…' : h.instrB}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    {h.resolution}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {!currentResult && (
        <div style={{
          padding: '32px', textAlign: 'center',
          fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-muted)',
        }}>
          Enter instructions above and step through to see the pipeline diagram.
        </div>
      )}
    </div>
  )
}

function StatItem({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-text)', fontFamily: 'var(--mono)' }}>
        {value}
      </div>
    </div>
  )
}
