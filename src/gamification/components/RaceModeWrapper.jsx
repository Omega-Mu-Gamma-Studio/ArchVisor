/**
 * RaceModeWrapper — "You vs. CPU" prediction race.
 *
 * Presents the next instruction/step, asks the student to type what a
 * target register (or other value) will hold, runs a short timer, then
 * reveals the engine's actual computed value (already computed by the
 * existing engine — this wrapper never computes it itself).
 *
 * Props:
 *   toolId: string
 *   prompt: string — description of what's being predicted
 *   actualValue: string|number — the engine's already-computed answer
 *   timeLimitMs?: number
 *   onRoundComplete?: ({ correct, elapsedMs }) => void
 *
 * Note: to start a fresh round (new prompt/actualValue), render this with a
 * new `key` prop from the parent (e.g. `key={instructionIndex}`) rather than
 * relying on internal effects to reset — this keeps state resets driven by
 * React's own remount semantics instead of imperative effect resets.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGamificationStore from '../store/gamificationStore.js'

export default function RaceModeWrapper({
  toolId,
  prompt,
  actualValue,
  timeLimitMs = 8000,
  onRoundComplete,
}) {
  const [guess, setGuess] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [timeLeftMs, setTimeLeftMs] = useState(timeLimitMs)
  const [startTime] = useState(() => performance.now())
  const startRef = useRef(startTime)
  const registerCorrect = useGamificationStore((state) => state.registerCorrect)
  const registerIncorrect = useGamificationStore((state) => state.registerIncorrect)

  const reveal = useCallback(() => {
    setRevealed((prevRevealed) => {
      if (prevRevealed) return prevRevealed
      const elapsedMs = performance.now() - startRef.current
      const correct = String(guess).trim() === String(actualValue).trim()
      if (correct) registerCorrect(toolId)
      else registerIncorrect(toolId)
      onRoundComplete?.({ correct, elapsedMs })
      return true
    })
  }, [guess, actualValue, toolId, registerCorrect, registerIncorrect, onRoundComplete])

  // Keep a ref to the latest `reveal` so the interval below can call the
  // current version without needing `reveal` in its own dependency array.
  const revealRef = useRef(reveal)
  useEffect(() => {
    revealRef.current = reveal
  }, [reveal])

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = timeLimitMs - (performance.now() - startRef.current)
      if (remaining <= 0) {
        clearInterval(interval)
        setTimeLeftMs(0)
        revealRef.current()
      } else {
        setTimeLeftMs(remaining)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [timeLimitMs])

  const secondsLeft = Math.max(0, Math.ceil(timeLeftMs / 1000))
  const isCorrect = String(guess).trim() === String(actualValue).trim()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, opacity: 0.7 }}>{prompt}</div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>You</div>
          <input
            type="text"
            value={guess}
            disabled={revealed}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && reveal()}
            aria-label="Your prediction"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.15)',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>CPU</div>
          <div
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              background: 'rgba(0,0,0,0.05)',
              minHeight: 36,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {revealed ? actualValue : '???'}
          </div>
        </div>
      </div>

      {!revealed ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, opacity: 0.6 }}>{secondsLeft}s left</span>
          <button
            onClick={reveal}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: '#111',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Lock in guess
          </button>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: isCorrect ? '#16a34a' : '#dc2626',
            }}
          >
            {isCorrect ? '✓ You beat the CPU to it!' : '✗ Not quite — see above.'}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
