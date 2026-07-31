/**
 * XP values per action, and level thresholds.
 */

export const XP_RULES = {
  correctBase: 10,
  correctSpeedBonusMax: 5, // scaled by how fast, see xpCalculator.js
  correctDifficultyBonus: { easy: 0, medium: 3, hard: 6 },
  incorrectAttemptXP: 2, // XP never fully withholds progress, even on a miss
  comebackBonus: 8, // on top of correctBase, for a miss->correct on the same tag
}

// Level N requires LEVEL_THRESHOLDS[N-1] total XP. Level 1 starts at 0.
export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000]

export function levelForXP(xp) {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  return level
}

export function xpForNextLevel(xp) {
  const currentLevel = levelForXP(xp)
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel] // index = currentLevel is the next level's threshold
  if (nextThreshold == null) return null // max level reached
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1]
  return {
    currentLevel,
    nextLevel: currentLevel + 1,
    currentThreshold,
    nextThreshold,
    progress: (xp - currentThreshold) / (nextThreshold - currentThreshold),
  }
}
