/**
 * GhostRaceOverlay — purely visual "vs. your past self" comparison.
 * Shows a faint secondary marker representing the best prior run's pace
 * alongside the current live attempt's elapsed time, on a shared
 * timeline. Never blocks or alters actual input/engine behavior.
 *
 * Props:
 *   scenarioKey: string — same key used with ghostStore.recordRunIfBest
 *   elapsedMs: number — current attempt's live elapsed time
 *   expectedTotalMs?: number — used to scale the timeline; defaults to
 *                     1.5x the ghost's total time if omitted
 */

import { motion } from 'framer-motion'
import useGhostStore from '../store/ghostStore.js'

export default function GhostRaceOverlay({ scenarioKey, elapsedMs, expectedTotalMs }) {
  const ghost = useGhostStore((s) => s.getGhost(scenarioKey))

  if (!ghost) return null // only appears when a genuine prior completed run exists

  const scale = expectedTotalMs || ghost.totalMs * 1.5
  const ghostPct = Math.min(100, (ghost.totalMs / scale) * 100)
  const livePct = Math.min(100, (elapsedMs / scale) * 100)
  const aheadOfGhost = elapsedMs < ghost.totalMs

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
        <span>👻 Ghost: {(ghost.totalMs / 1000).toFixed(1)}s</span>
        <span style={{ color: aheadOfGhost ? '#22c55e' : '#f87171' }}>
          {aheadOfGhost ? 'Ahead of ghost' : 'Behind ghost'}
        </span>
      </div>
      <div style={{ position: 'relative', height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: `${ghostPct}%`,
            width: 2,
            height: '100%',
            background: 'rgba(255,255,255,0.5)',
          }}
        />
        <motion.div
          animate={{ width: `${livePct}%` }}
          transition={{ ease: 'linear', duration: 0.1 }}
          style={{
            height: '100%',
            borderRadius: 999,
            background: aheadOfGhost ? '#22c55e' : '#f87171',
          }}
        />
      </div>
    </div>
  )
}
