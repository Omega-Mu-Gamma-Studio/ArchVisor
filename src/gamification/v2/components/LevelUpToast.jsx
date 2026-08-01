/**
 * LevelUpToast — animated level-up celebration. Mount once at layout
 * level (same tier as AchievementToast). Fires exactly once per threshold
 * crossing since xpStore only sets `pendingLevelUp` on an actual level
 * increase and this component dismisses it after showing.
 */

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useXPStore from '../store/xpStore.js'
import useV2SettingsStore from '../store/v2SettingsStore.js'
import ConfettiBurst from '../../components/ConfettiBurst.jsx'

const AUTO_DISMISS_MS = 4000

export default function LevelUpToast() {
  const v2Enabled = useV2SettingsStore((s) => s.v2Enabled)
  const pendingLevelUp = useXPStore((s) => s.pendingLevelUp)
  const dismissLevelUp = useXPStore((s) => s.dismissLevelUp)

  useEffect(() => {
    if (!pendingLevelUp) return undefined
    const t = setTimeout(() => dismissLevelUp(), AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [pendingLevelUp, dismissLevelUp])

  if (!v2Enabled) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1100,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {pendingLevelUp && (
          <motion.div
            key={pendingLevelUp.toLevel}
            initial={{ opacity: 0, scale: 0.6, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            onClick={() => dismissLevelUp()}
            role="status"
            aria-live="polite"
            style={{
              position: 'relative',
              pointerEvents: 'auto',
              padding: '20px 32px',
              borderRadius: 20,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1e1b2e, #2d1b3d)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 16px 50px rgba(109,40,217,0.4)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <ConfettiBurst show count={26} />
            <div style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.6, fontWeight: 700 }}>
              LEVEL UP
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, margin: '4px 0' }}>
              Level {pendingLevelUp.toLevel}
            </div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>
              Up from level {pendingLevelUp.fromLevel} — nice work.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
