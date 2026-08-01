/**
 * AchievementToast — animated, auto-dismissing toast shown when a badge
 * unlocks. Reads `pendingToast` from gamificationStore; mount this once,
 * e.g. inside a layout-level wrapper (AppWithGamification), not inside any
 * existing tool.
 */

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGamificationStore from '../store/gamificationStore.js'
import ConfettiBurst from './ConfettiBurst.jsx'

const AUTO_DISMISS_MS = 4500

export default function AchievementToast() {
  const pendingToast = useGamificationStore((state) => state.pendingToast)
  const dismissToast = useGamificationStore((state) => state.dismissToast)

  useEffect(() => {
    if (!pendingToast) return undefined
    const timer = setTimeout(() => dismissToast(), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [pendingToast, dismissToast])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {pendingToast && (
          <motion.div
            key={pendingToast.id}
            initial={{ opacity: 0, y: 40, scale: 0.7, rotate: -6 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            role="status"
            aria-live="polite"
            style={{
              position: 'relative',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 20px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #1e1b2e, #2d1b3d)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              boxShadow: '0 12px 40px rgba(109, 40, 217, 0.35)',
              maxWidth: 340,
              cursor: 'pointer',
              overflow: 'visible',
            }}
            onClick={() => dismissToast()}
          >
            <ConfettiBurst show count={20} />
            <motion.span
              style={{ fontSize: 30 }}
              aria-hidden="true"
              animate={{ rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.25, 1] }}
              transition={{ duration: 0.6 }}
            >
              🏆
            </motion.span>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 1, opacity: 0.6, fontWeight: 700 }}>
                ACHIEVEMENT UNLOCKED
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, marginTop: 2 }}>{pendingToast.name}</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                {pendingToast.description}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
