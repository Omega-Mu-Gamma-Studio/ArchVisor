/**
 * AchievementsPage — new page listing all badges (locked/unlocked).
 * New route only; does not touch any existing page.
 */

import { motion } from 'framer-motion'
import useGamificationStore from '../store/gamificationStore.js'
import { ACHIEVEMENTS } from '../content/achievements.js'

export default function AchievementsPage() {
  const unlocked = useGamificationStore((state) => state.unlockedAchievements)
  const resetGamification = useGamificationStore((state) => state.resetGamification)
  const unlockedSet = new Set(unlocked)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Achievements</h1>
      <p style={{ opacity: 0.65, fontSize: 14, marginBottom: 24 }}>
        {unlocked.length} of {ACHIEVEMENTS.length} unlocked
      </p>

      <div style={{ display: 'grid', gap: 12 }}>
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedSet.has(achievement.id)
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                borderRadius: 12,
                background: isUnlocked ? 'rgba(22, 163, 74, 0.08)' : 'rgba(0,0,0,0.03)',
                opacity: isUnlocked ? 1 : 0.55,
              }}
            >
              <div style={{ fontSize: 28 }} aria-hidden="true">
                {isUnlocked ? '🏆' : '🔒'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{achievement.name}</div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>{achievement.description}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <button
        onClick={resetGamification}
        style={{
          marginTop: 28,
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.15)',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        Reset gamification progress
      </button>
    </div>
  )
}
