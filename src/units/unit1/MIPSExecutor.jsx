/**
 * MIPSExecutor — Step-through MIPS interpreter
 *
 * CodeMirror 6 editor for MIPS assembly input with syntax highlighting.
 * Controls: Load, Step Forward, Run All, Reset.
 * Embeds RegisterFileViewer for live register updates.
 */

import { useEffect, useRef, useState } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands'
import { StreamLanguage } from '@codemirror/language'
import { motion, AnimatePresence } from 'framer-motion'
import useMipsStore from '../../store/mipsStore.js'
import RegisterFileViewer from './RegisterFileViewer.jsx'

// ── MIPS Syntax Highlighting ───────────────────────────────

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

    // Comments
    if (stream.match('#')) {
      stream.skipToEnd()
      return 'comment'
    }

    // Decimal immediate
    if (stream.match(/^-?\d+/)) return 'number'

    // Register names
    if (stream.match(/\$[a-z0-9]+/i)) {
      const regName = stream.current().toLowerCase().replace('$', '')
      if (mipsRegisters.includes(regName)) return 'variableName'
      return 'string'
    }

    // Labels (identifiers followed by colon)
    if (stream.match(/^[A-Za-z_][A-Za-z0-9_]*:/)) return 'labelName'

    // Identifiers (instructions or labels)
    if (stream.match(/^[A-Za-z_][A-Za-z0-9_]*/)) {
      const word = stream.current().toLowerCase()
      if (mipsKeywords.includes(word)) return 'keyword'
      return 'labelName'
    }

    // Punctuation
    if (stream.match(/^[,()]/)) return 'punctuation'

    // Hexadecimal
    if (stream.match(/^0x[0-9a-fA-F]+/)) return 'number'

    stream.next()
    return null
  },
})

// Custom editor theme
const mipsTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '13px',
  },
  '.cm-content': {
    caretColor: 'var(--accent)',
    padding: '8px 0',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--accent)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(170, 59, 255, 0.06)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(170, 59, 255, 0.15)',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: '1px solid var(--border)',
    color: 'var(--text-muted)',
  },
  '.cm-lineNumbers .gutterElement': {
    padding: '0 12px 0 8px',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(170, 59, 255, 0.15)',
  },
})

// Registers $t0-$t3 resolve to the same index (8-11) under both the
// interpreter's internal numbering and standard MIPS ABI names, so it's
// safe to look them up this way for the boss win-check below. (Registers
// from $t4 up diverge between the two — see mipsInterpreter.js.)
const SAFE_REGISTER_INDEX = { t0: 8, t1: 9, t2: 10, t3: 11 }

export default function MIPSExecutor({ initialScenario = null, onScenarioSolved } = {}) {
  const editorRef = useRef(null)
  const viewRef = useRef(null)
  const firedRef = useRef(false)
  const [editorContent, setEditorContent] = useState(
    initialScenario?.program
      ? initialScenario.program.join('\n')
      : useMipsStore.getState().instructionList.join('\n')
  )

  const {
    instructionList,
    currentLine,
    registers,
    executionLog,
    setInstructions,
    stepForward,
    runAll,
    reset,
  } = useMipsStore()

  // ── Preload boss scenario on mount ───────────────────────
  useEffect(() => {
    if (initialScenario?.program) {
      setInstructions(initialScenario.program)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Boss win condition: derived, not stored in state ─────
  const targetIdx = initialScenario ? SAFE_REGISTER_INDEX[initialScenario.targetRegister] : undefined
  const solved = Boolean(
    initialScenario &&
    registers &&
    targetIdx !== undefined &&
    registers[`$${targetIdx}`] === initialScenario.targetValue
  )

  useEffect(() => {
    if (solved && !firedRef.current && onScenarioSolved) {
      firedRef.current = true
      onScenarioSolved()
    }
  }, [solved, onScenarioSolved])

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

  // ── Highlight current line on step ───────────────────────
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    if (currentLine >= 0 && currentLine < view.state.doc.lines) {
      const line = view.state.doc.line(currentLine + 1)
      view.dispatch({
        selection: { anchor: line.from, head: line.to },
        scrollIntoView: true,
      })
    }
  }, [currentLine])

  // ── Load instructions into store ─────────────────────────
  const handleLoad = () => {
    const lines = editorContent
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
    setInstructions(lines)
  }

  // ── Default example ──────────────────────────────────────
  const loadExample = () => {
    const example = `addi $t0, $zero, 10
addi $t1, $zero, 20
add $t2, $t0, $t1
sub $t3, $t1, $t0
addi $s0, $zero, 5
add $t4, $t2, $s0`
    setEditorContent(example)
    const lines = example.split('\n').filter(Boolean)
    setInstructions(lines)
  }

  const hasInstructions = instructionList.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '4px' }}>
          MIPS Mini-Executor
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Step through MIPS instructions and watch the register file update live.
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
            ? `✓ Boss cleared — $${initialScenario.targetRegister} = ${initialScenario.targetValue}`
            : `🎯 Objective: run the program and get $${initialScenario.targetRegister} to equal ${initialScenario.targetValue}`}
        </div>
      )}

      {/* Main Layout: Editor + Registers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', alignItems: 'start' }}>
        {/* Left: Editor & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)',
              }}>
                {editorContent.split('\n').filter(l => l.trim()).length} lines
              </span>
            </div>
            <div ref={editorRef} style={{ minHeight: '180px' }} />
          </div>

          {/* Controls */}
          <div className="glass-card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={handleLoad}
                className="badge"
                style={{ cursor: 'pointer', padding: '7px 16px', fontSize: '10px' }}
              >
                Load
              </button>
              <button
                onClick={stepForward}
                className="badge"
                style={{
                  cursor: 'pointer', padding: '7px 16px', fontSize: '10px',
                  opacity: hasInstructions ? 1 : 0.5,
                }}
                disabled={!hasInstructions}
              >
                Step Forward
              </button>
              <button
                onClick={runAll}
                className="badge"
                style={{
                  cursor: 'pointer', padding: '7px 16px', fontSize: '10px',
                  opacity: hasInstructions ? 1 : 0.5,
                }}
                disabled={!hasInstructions}
              >
                Run All
              </button>
              <button
                onClick={reset}
                className="badge"
                style={{
                  cursor: 'pointer', padding: '7px 16px', fontSize: '10px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444',
                }}
              >
                Reset
              </button>
              <button
                onClick={loadExample}
                style={{
                  cursor: 'pointer', padding: '7px 16px', fontSize: '10px',
                  fontFamily: 'var(--mono)', letterSpacing: '0.05em',
                  background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: '999px', color: 'var(--text-muted)',
                }}
              >
                Load Example
              </button>
            </div>
          </div>

          {/* Execution Log */}
          <div className="glass-card" style={{ flex: 1, minHeight: '140px', maxHeight: '240px', overflow: 'auto' }}>
            <div style={{
              padding: '8px 12px', borderBottom: '1px solid var(--border)',
              fontFamily: 'var(--mono)', fontSize: '10px',
              color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Execution Log ({executionLog.length})
            </div>
            <div style={{ padding: '4px 0' }}>
              <AnimatePresence mode="popLayout">
                {executionLog.length === 0 ? (
                  <div style={{
                    padding: '24px 16px', textAlign: 'center',
                    fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)',
                  }}>
                    Load instructions and press Step Forward to begin.
                  </div>
                ) : (
                  executionLog.map((entry, i) => (
                    <motion.div
                      key={`${entry}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{
                        padding: '5px 12px',
                        fontFamily: 'var(--mono)',
                        fontSize: '11px',
                        color: entry.startsWith('Error') ? '#ef4444' : 'var(--text)',
                        borderLeft: entry.startsWith('Error')
                          ? '2px solid #ef4444'
                          : '2px solid transparent',
                        backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      }}
                    >
                      {entry}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right: Register File Viewer */}
        <div className="glass-card" style={{ padding: '16px', position: 'sticky', top: '80px' }}>
          <RegisterFileViewer />
        </div>
      </div>
    </div>
  )
}
