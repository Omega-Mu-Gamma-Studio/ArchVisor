/**
 * ComebackBadge — small distinct visual treatment shown briefly when a
 * genuine miss->correct comeback happens on the same concept tag.
 * Visually distinct from StreakBadge (different color/icon) so it reads
 * as "you recovered," not just "you got it right."
 */

import { motion, AnimatePresence } from 'framer-motion'

export default function ComebackBadge({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          role="status"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            background: 'rgba(14, 165, 233, 0.15)',
            color: '#38bdf8',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <span aria-hidden="true">↩️</span> Comeback!
        </motion.div>
      )}
    </AnimatePresence>
  )
}
