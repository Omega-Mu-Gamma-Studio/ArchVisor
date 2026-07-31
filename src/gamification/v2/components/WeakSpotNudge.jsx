/**
 * WeakSpotNudge — low-key, dismissible, non-modal card suggesting a
 * revisit when a concept tag's miss count crosses NUDGE_THRESHOLD.
 * Shows at most one nudge at a time (the tag with the highest miss
 * count that hasn't been dismissed), so it's never naggy/stacked.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import useWeakSpotStore, { NUDGE_THRESHOLD } from '../store/weakSpotStore.js'
import useV2SettingsStore from '../store/v2SettingsStore.js'
import { getWeakSpotMeta } from '../content/weakSpotTaxonomy.js'

export default function WeakSpotNudge() {
  const v2Enabled = useV2SettingsStore((s) => s.v2Enabled)
  const missCounts = useWeakSpotStore((s) => s.missCounts)
  const dismissedTags = useWeakSpotStore((s) => s.dismissedTags)
  const dismissNudge = useWeakSpotStore((s) => s.dismissNudge)

  if (!v2Enabled) return null

  const candidate = Object.entries(missCounts)
    .filter(([tag, count]) => count >= NUDGE_THRESHOLD && !dismissedTags.includes(tag))
    .sort((a, b) => b[1] - a[1])[0]

  if (!candidate) return null

  const [tag, count] = candidate
  const meta = getWeakSpotMeta(tag)
  if (!meta) return null // never nudge toward an unmapped/invalid route

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 150,
        maxWidth: 300,
      }}
    >
      <AnimatePresence>
        <motion.div
          key={tag}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          style={{
            padding: '14px 16px',
            borderRadius: 14,
            background: 'rgba(14, 165, 233, 0.1)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontSize: 13, lineHeight: 1.4 }}>
              💡 You've missed a few <strong>{meta.label}</strong> cases ({count}x) — want to revisit{' '}
              <Link to={`/unit/${meta.unitId}/tool/${meta.toolId}`} style={{ color: '#38bdf8' }}>
                the tool
              </Link>
              ?
            </div>
            <button
              onClick={() => dismissNudge(tag)}
              aria-label="Dismiss suggestion"
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                opacity: 0.5,
                cursor: 'pointer',
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
