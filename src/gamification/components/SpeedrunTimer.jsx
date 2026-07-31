/**
 * SpeedrunTimer — opt-in stopwatch overlay.
 *
 * Purely observational: it starts when the parent tells it a scenario has
 * begun (`active` becomes true) and stops when the parent tells it the
 * scenario was completed correctly (`completed` becomes true). It never
 * reads or writes the wrapped tool's own state/inputs.
 *
 * Usage (composition, from a wrapper — never inside an existing tool file):
 *   <SpeedrunTimer toolId="booth-multiplier" active={started} completed={done} />
 */

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import useGamificationStore from '../store/gamificationStore.js'

function formatMs(ms) {
  if (ms == null) return '—'
  return (ms / 1000).toFixed(1) + 's'
}

export default function SpeedrunTimer({ toolId, active, completed, onRunRecorded }) {
  const recordRun = useGamificationStore((state) => state.recordRun)
  const best = useGamificationStore((state) => state.bestTimes[toolId]?.bestMs)

  const [elapsedMs, setElapsedMs] = useState(0)
  const startRef = useRef(null)
  const rafRef = useRef(null)
  const hasRecordedRef = useRef(false)

  useEffect(() => {
    if (active && !completed) {
      startRef.current = performance.now()
      hasRecordedRef.current = false

      const tick = () => {
        setElapsedMs(performance.now() - startRef.current)
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  useEffect(() => {
    if (completed && startRef.current != null && !hasRecordedRef.current) {
      hasRecordedRef.current = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      const finalElapsed = performance.now() - startRef.current
      setElapsedMs(finalElapsed)
      const result = recordRun(toolId, finalElapsed)
      onRunRecorded?.(result)
    }
  }, [completed, toolId, recordRun, onRunRecorded])

  if (!active && !completed) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 20,
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: '6px 12px',
        borderRadius: 999,
        background: 'rgba(15, 15, 20, 0.75)',
        color: '#fff',
        fontSize: 13,
        fontVariantNumeric: 'tabular-nums',
        pointerEvents: 'none',
      }}
      aria-live="polite"
    >
      <span>⏱ {formatMs(elapsedMs)}</span>
      {best != null && <span style={{ opacity: 0.7 }}>Best: {formatMs(best)}</span>}
    </motion.div>
  )
}
