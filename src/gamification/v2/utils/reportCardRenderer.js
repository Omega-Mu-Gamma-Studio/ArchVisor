/**
 * Composes an exportable report card image entirely client-side via
 * <canvas> + toDataURL(), no new dependency. Also returns a plain-text
 * summary for the screen-reader-friendly fallback (ReportCardExporter
 * renders this text alongside the image, per the accessibility
 * requirement).
 */

export function buildReportCardText({ level, totalXP, bestStreak, badgeCount, badgeTotal, masteredCount, toolTotal }) {
  return [
    'ArchVisor Progress Report',
    `Level ${level} (${totalXP} XP)`,
    `Best streak: ${bestStreak}`,
    `Badges: ${badgeCount}/${badgeTotal}`,
    `Mastery: ${masteredCount}/${toolTotal} tools mastered`,
  ].join('\n')
}

/**
 * Renders the report card to a canvas and returns a PNG data URL.
 * @param {object} stats - same shape as buildReportCardText's argument
 * @returns {string} data URL (image/png)
 */
export function renderReportCardImage(stats) {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 360
  const ctx = canvas.getContext('2d')

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 640, 360)
  gradient.addColorStop(0, '#1e1b2e')
  gradient.addColorStop(1, '#2d1b3d')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 640, 360)

  ctx.fillStyle = '#ffffff'
  ctx.font = '700 26px sans-serif'
  ctx.fillText('🎮 ArchVisor Progress Report', 32, 56)

  ctx.font = '400 14px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('CS22304 — Computer Organization and Architecture', 32, 80)

  const rows = [
    [`Level ${stats.level}`, `${stats.totalXP} XP`],
    ['Best streak', String(stats.bestStreak)],
    ['Badges unlocked', `${stats.badgeCount} / ${stats.badgeTotal}`],
    ['Tools mastered', `${stats.masteredCount} / ${stats.toolTotal}`],
  ]

  let y = 140
  rows.forEach(([label, value]) => {
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '400 15px sans-serif'
    ctx.fillText(label, 32, y)

    ctx.fillStyle = '#ffffff'
    ctx.font = '700 22px sans-serif'
    ctx.fillText(value, 32, y + 28)

    y += 62
  })

  return canvas.toDataURL('image/png')
}
