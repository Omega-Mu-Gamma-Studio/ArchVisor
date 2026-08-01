/**
 * ReportCardExporter — "Share your progress" button that generates and
 * downloads a PNG summary, plus a visible text-based fallback for
 * screen-reader users (not just alt text on an image).
 */

import { useState, useCallback } from 'react'
import useXPStore from '../store/xpStore.js'
import useMasteryStore from '../store/masteryStore.js'
import useGamificationStore from '../../store/gamificationStore.js'
import { ACHIEVEMENTS } from '../../content/achievements.js'
import { TOOL_CATALOG } from '../content/toolCatalog.js'
import { buildReportCardText, renderReportCardImage } from '../utils/reportCardRenderer.js'

export default function ReportCardExporter() {
  const [imageUrl, setImageUrl] = useState(null)
  const level = useXPStore((s) => s.level)
  const totalXP = useXPStore((s) => s.totalXP)
  const bestStreak = useGamificationStore((s) => s.streaks.global?.best || 0)
  const badgeCount = useGamificationStore((s) => s.unlockedAchievements.length)
  const masteredCount = useMasteryStore((s) => s.masteredTools.length)

  const stats = {
    level,
    totalXP,
    bestStreak,
    badgeCount,
    badgeTotal: ACHIEVEMENTS.length,
    masteredCount,
    toolTotal: TOOL_CATALOG.length,
  }

  const handleExport = useCallback(() => {
    const dataUrl = renderReportCardImage(stats)
    setImageUrl(dataUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, totalXP, bestStreak, badgeCount, masteredCount])

  const handleDownload = useCallback(() => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = 'archvisor-progress.png'
    a.click()
  }, [imageUrl])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        onClick={handleExport}
        style={{
          alignSelf: 'flex-start',
          padding: '8px 16px',
          borderRadius: 10,
          border: 'none',
          background: 'linear-gradient(135deg, #6d28d9, #db2777)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        📤 Share your progress
      </button>

      {imageUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <img
            src={imageUrl}
            alt={buildReportCardText(stats)}
            style={{ maxWidth: 420, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button
            onClick={handleDownload}
            style={{
              alignSelf: 'flex-start',
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Download PNG
          </button>
          {/* Text-based fallback for screen-reader users, not just image alt text */}
          <pre
            style={{
              fontSize: 12,
              opacity: 0.6,
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
            }}
          >
            {buildReportCardText(stats)}
          </pre>
        </div>
      )}
    </div>
  )
}
