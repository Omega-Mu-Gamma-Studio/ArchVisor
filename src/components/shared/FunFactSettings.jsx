import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'archvisor-custom-facts'

/** Load custom facts from localStorage */
function loadFacts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** Save custom facts to localStorage */
function saveFacts(facts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(facts))
}

/**
 * Settings panel for adding, viewing, and deleting custom fun facts.
 * Data stored in localStorage under 'archvisor-custom-facts'.
 *
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   onFactsChanged: () => void   // called after add/delete so parent re-picks
 */
export default function FunFactSettings({ open, onClose, onFactsChanged }) {
  const [facts, setFacts] = useState([])
  const [text, setText] = useState('')
  const [unit, setUnit] = useState(1)
  const [error, setError] = useState('')
  const textRef = useRef(null)

  // Refresh list when modal opens
  useEffect(() => {
    if (open) {
      setFacts(loadFacts())
      setError('')
    }
  }, [open])

  // Focus textarea on open
  useEffect(() => {
    if (open && textRef.current) {
      setTimeout(() => textRef.current.focus(), 150)
    }
  }, [open])

  // Escape to close
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleKey)
      return () => document.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  function handleAdd() {
    const trimmed = text.trim()
    if (!trimmed) {
      setError('Please enter a fact.')
      return
    }
    if (trimmed.length < 10) {
      setError('Fact must be at least 10 characters.')
      return
    }
    if (trimmed.length > 500) {
      setError('Fact must be under 500 characters.')
      return
    }

    const updated = [...facts, { text: trimmed, unit: Number(unit), id: Date.now() }]
    saveFacts(updated)
    setFacts(updated)
    setText('')
    setError('')
    onFactsChanged()
  }

  function handleDelete(id) {
    const updated = facts.filter((f) => f.id !== id)
    saveFacts(updated)
    setFacts(updated)
    onFactsChanged()
  }

  function handleClearAll() {
    saveFacts([])
    setFacts([])
    onFactsChanged()
  }

  const unitCounts = facts.reduce((acc, f) => {
    acc[f.unit] = (acc[f.unit] || 0) + 1
    return acc
  }, {})

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="glass-card"
            role="dialog"
            aria-label="Custom fun facts settings"
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>💡</span>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600,
                  color: 'var(--text-h)', letterSpacing: '0.03em',
                }}>
                  Custom Facts
                </span>
                {facts.length > 0 && (
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: '10px',
                    color: 'var(--text-muted)', background: 'var(--bg-card)',
                    padding: '2px 8px', borderRadius: '999px',
                  }}>
                    {facts.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                title="Close"
                aria-label="Close settings"
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  border: 'none', background: 'transparent',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-dim)'
                  e.currentTarget.style.color = 'var(--accent-text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {/* Add form */}
              <div style={{
                background: 'var(--bg-card)', borderRadius: '10px',
                padding: '16px', marginBottom: '20px',
                border: '1px solid var(--border)',
              }}>
                <p style={{
                  fontFamily: 'var(--mono)', fontSize: '10px',
                  color: 'var(--text-muted)', letterSpacing: '0.06em',
                  textTransform: 'uppercase', marginBottom: '10px',
                }}>
                  Add a New Fact
                </p>

                <textarea
                  ref={textRef}
                  value={text}
                  onChange={(e) => { setText(e.target.value); setError('') }}
                  placeholder="Enter your fun fact here..."
                  rows={3}
                  style={{
                    width: '100%', resize: 'none',
                    background: 'rgba(255,255,255,0.03)',
                    border: error ? '1px solid #ff6b6b' : '1px solid var(--border)',
                    borderRadius: '8px', padding: '10px 12px',
                    fontFamily: 'var(--sans)', fontSize: '13px',
                    color: 'var(--text-h)', lineHeight: 1.5,
                    outline: 'none', marginBottom: '10px',
                    transition: 'border-color 0.15s',
                  }}
                />

                {error && (
                  <p style={{
                    fontSize: '11px', color: '#ff6b6b',
                    marginBottom: '10px', marginTop: '-6px',
                  }}>
                    {error}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(Number(e.target.value))}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px', padding: '8px 10px',
                      fontFamily: 'var(--mono)', fontSize: '11px',
                      color: 'var(--text)', outline: 'none',
                      cursor: 'pointer', minWidth: '100px',
                    }}
                  >
                    <option value={1}>Unit I</option>
                    <option value={2}>Unit II</option>
                    <option value={3}>Unit III</option>
                    <option value={4}>Unit IV</option>
                    <option value={5}>Unit V</option>
                  </select>

                  <button
                    onClick={handleAdd}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '8px',
                      border: '1px solid var(--accent-border)',
                      background: 'var(--accent-dim)',
                      color: 'var(--accent-text)',
                      cursor: 'pointer',
                      fontFamily: 'var(--mono)', fontSize: '11px',
                      fontWeight: 500, letterSpacing: '0.04em',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 12px var(--accent-glow)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add Fact
                  </button>
                </div>
              </div>

              {/* Facts list */}
              {facts.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '32px 16px',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--mono)', fontSize: '11px',
                }}>
                  No custom facts yet. Add one above!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: '10px',
                      color: 'var(--text-muted)', letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>
                      Your Facts
                    </span>
                    {facts.length > 1 && (
                      <button
                        onClick={handleClearAll}
                        style={{
                          background: 'none', border: 'none',
                          color: 'var(--text-muted)', cursor: 'pointer',
                          fontFamily: 'var(--mono)', fontSize: '9px',
                          padding: '2px 6px', borderRadius: '4px',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ff6b6b'
                          e.currentTarget.style.background = 'rgba(255,107,107,0.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-muted)'
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {facts.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                        padding: '12px 14px',
                        background: 'var(--bg-card)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '12px', lineHeight: 1.55,
                          color: 'var(--text)', margin: 0,
                        }}>
                          {f.text}
                        </p>
                        <span style={{
                          fontFamily: 'var(--mono)', fontSize: '9px',
                          color: 'var(--accent-text)', marginTop: '6px',
                          display: 'inline-block', letterSpacing: '0.05em',
                        }}>
                          Unit {f.unit}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(f.id)}
                        title="Delete fact"
                        aria-label={`Delete fact: ${f.text.slice(0, 40)}...`}
                        style={{
                          width: '28px', height: '28px', borderRadius: '6px',
                          border: 'none', background: 'transparent',
                          color: 'var(--text-muted)', cursor: 'pointer',
                          flexShrink: 0, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,107,107,0.15)'
                          e.currentTarget.style.color = '#ff6b6b'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'var(--text-muted)'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer summary */}
            {facts.length > 0 && (
              <div style={{
                padding: '12px 24px', borderTop: '1px solid var(--border)',
                display: 'flex', gap: '16px', flexWrap: 'wrap',
              }}>
                {[1, 2, 3, 4, 5].map((u) => (
                  <span key={u} style={{
                    fontFamily: 'var(--mono)', fontSize: '9px',
                    color: unitCounts[u] ? 'var(--accent-text)' : 'var(--text-muted)',
                    letterSpacing: '0.05em',
                  }}>
                    Unit {u}: {unitCounts[u] || 0}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
