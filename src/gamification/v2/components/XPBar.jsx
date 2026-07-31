/**
 * XPBar — persistent slim XP/level indicator. Renders nothing if the v2
 * layer is toggled off.
 */

import { motion } from 'framer-motion'
import useXPStore from '../store/xpStore.js'
import useV2SettingsStore from '../store/v2SettingsStore.js'
import { xpForNextLevel } from '../content/xpRules.js'

export default function XPBar({ compact = false }) {
  const v2Enabled = useV2SettingsStore((s) => s.v2Enabled)
  const totalXP = useXPStore((s) => s.totalXP)
  const level = useXPStore((s) => s.level)

  if (!v2Enabled) return null

  const info = xpForNextLevel(totalXP)
  const progressPct = info ? Math.max(0, Math.min(1, info.progress)) * 100 : 100

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: compact ? 11 : 12,
      }}
      aria-label={`Level ${level}${info ? `, ${Math.round(progressPct)}% to level ${info.nextLevel}` : ' (max level)'}`}
    >
      <span
        style={{
          fontWeight: 800,
          padding: '2px 8px',
          borderRadius: 999,
          background: 'linear-gradient(135deg, #6d28d9, #db2777)',
          color: '#fff',
          flexShrink: 0,
        }}
      >
        Lv {level}
      </span>
      <div
        style={{
          width: compact ? 60 : 100,
          height: 6,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ width: `${progressPct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #6d28d9, #db2777)',
          }}
        />
      </div>
      {!compact && (
        <span style={{ opacity: 0.55, fontVariantNumeric: 'tabular-nums' }}>{totalXP} XP</span>
      )}
    </div>
  )
}
