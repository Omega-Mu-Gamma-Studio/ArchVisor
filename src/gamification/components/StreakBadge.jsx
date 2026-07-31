/**
 * StreakBadge — small flame/counter indicator for the current streak.
 * Reads directly from gamificationStore; purely presentational otherwise.
 */

import { motion, AnimatePresence } from 'framer-motion'
import useGamificationStore from '../store/gamificationStore.js'

export default function StreakBadge({ toolId = 'global', compact = false }) {
  const streak = useGamificationStore((state) => state.streaks[toolId]?.current || 0)
  const best = useGamificationStore((state) => state.streaks[toolId]?.best || 0)

  if (streak === 0 && best === 0) return null

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={streak}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: compact ? '2px 8px' : '4px 10px',
          borderRadius: 999,
          background: streak > 0 ? 'rgba(255, 122, 24, 0.15)' : 'rgba(120,120,120,0.12)',
          color: streak > 0 ? '#ff7a18' : '#888',
          fontSize: compact ? 12 : 13,
          fontWeight: 600,
        }}
        role="status"
        aria-label={`Current streak: ${streak}. Best: ${best}.`}
      >
        <span aria-hidden="true">🔥</span>
        <span>{streak}</span>
        {!compact && <span style={{ opacity: 0.6, fontWeight: 400 }}>best {best}</span>}
      </motion.div>
    </AnimatePresence>
  )
}
