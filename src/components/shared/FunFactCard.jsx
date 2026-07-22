import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FUN_FACTS from '../../data/funFacts.js'
import FunFactSettings from './FunFactSettings.jsx'

const CUSTOM_STORAGE_KEY = 'archvisor-custom-facts'

/** Load custom facts from localStorage, returning { unit → [text, ...] } */
function loadCustomFacts() {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY)
    if (!raw) return {}
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return {}
    return list.reduce((acc, f) => {
      if (!f.text || !f.unit) return acc
      const u = f.unit
      if (!acc[u]) acc[u] = []
      acc[u].push(f.text)
      return acc
    }, {})
  } catch {
    return {}
  }
}

/**
 * Dismissible fun fact card displayed in the top-right corner.
 *
 * Props:
 *   unitId: number|string — the current unit (1–5) or "all" to pick from all units
 */
export default function FunFactCard({ unitId }) {
  const [dismissed, setDismissed] = useState(false)
  const [fact, setFact] = useState(null)
  const [key, setKey] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [customVersion, setCustomVersion] = useState(0) // bumped on add/delete

  // Build merged pool: built-in + custom facts for this unit
  const pickFact = useCallback(() => {
    const custom = loadCustomFacts()

    const pool = unitId === 'all'
      ? [...Object.values(FUN_FACTS).flat(), ...Object.values(custom).flat()]
      : [...(FUN_FACTS[unitId] || []), ...(custom[unitId] || [])]

    if (pool.length === 0) {
      setFact(null)
      return
    }

    // Avoid showing the same fact twice in a row
    const storageKey = `archvisor-fact-${unitId}`
    const lastIndex = parseInt(localStorage.getItem(storageKey) || '-1', 10)

    let idx
    if (pool.length === 1) {
      idx = 0
    } else {
      do {
        idx = Math.floor(Math.random() * pool.length)
      } while (idx === lastIndex)
    }

    localStorage.setItem(storageKey, String(idx))
    setFact(pool[idx])
  }, [unitId, customVersion]) // re-pick when custom facts change

  // Reset when unitId changes
  useEffect(() => {
    setDismissed(false)
    setKey((k) => k + 1)
    pickFact()
  }, [unitId, pickFact])

  // Escape to dismiss
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setDismissed(true)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // When settings close, re-evaluate
  function handleSettingsClose() {
    setSettingsOpen(false)
  }

  function handleFactsChanged() {
    setCustomVersion((v) => v + 1)
  }

  if (!fact && !settingsOpen) return null

  return (
    <>
      <FunFactSettings
        open={settingsOpen}
        onClose={handleSettingsClose}
        onFactsChanged={handleFactsChanged}
      />

      <AnimatePresence>
        {!dismissed && fact && (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.8 }}
            style={{
              position: 'fixed',
              top: '72px',
              right: '24px',
              zIndex: 80,
              maxWidth: '360px',
              width: '100%',
            }}
            className="fun-fact-card"
          >
            <div
              className="glass-card"
              role="status"
              style={{
                padding: '16px 18px',
                borderColor: 'var(--accent-border)',
                boxShadow: '0 0 20px var(--accent-glow), 0 8px 32px rgba(0,0,0,0.4)',
                position: 'relative',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setDismissed(true)}
                title="Dismiss"
                aria-label="Dismiss fact"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', paddingRight: '28px' }}>
                <span style={{ fontSize: '16px', lineHeight: 1 }}>💡</span>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--accent-text)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  Did You Know?
                </span>
              </div>

              {/* Fact body */}
              <p style={{
                fontSize: '13px',
                lineHeight: 1.65,
                color: 'var(--text)',
                margin: 0,
              }}>
                {fact}
              </p>

              {/* Footer */}
              <div style={{
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <button
                  onClick={() => setSettingsOpen(true)}
                  title="Manage custom facts"
                  aria-label="Open custom facts settings"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'var(--mono)',
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-text)'
                    e.currentTarget.style.background = 'var(--accent-dim)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  Customize
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em',
                  }}>
                    Esc
                  </span>
                  <button
                    onClick={() => {
                      pickFact()
                      setKey((k) => k + 1)
                    }}
                    title="Show another fact"
                    aria-label="Show a different fact"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: 'var(--mono)',
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--accent-text)'
                      e.currentTarget.style.background = 'var(--accent-dim)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10"/>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                    Shuffle
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
