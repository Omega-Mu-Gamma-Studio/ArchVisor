/**
 * Computes XP awarded for a single PredictionGate reveal event.
 * Pure function — no store access — so it's trivially testable and O(1).
 */

import { XP_RULES } from '../content/xpRules.js'

/**
 * @param {object} params
 * @param {boolean} params.correct
 * @param {'easy'|'medium'|'hard'} [params.difficulty='medium']
 * @param {number} [params.elapsedMs] - optional, for a small speed bonus
 * @param {boolean} [params.isComeback] - true if this correct answer follows
 *        a miss on the same concept tag
 * @returns {number} XP to award (always >= 0)
 */
export function calculateXP({ correct, difficulty = 'medium', elapsedMs, isComeback = false }) {
  if (!correct) {
    return XP_RULES.incorrectAttemptXP
  }

  let xp = XP_RULES.correctBase
  xp += XP_RULES.correctDifficultyBonus[difficulty] ?? 0

  if (typeof elapsedMs === 'number') {
    // Full speed bonus under 3s, tapering to 0 by 12s.
    const speedFactor = Math.max(0, Math.min(1, (12000 - elapsedMs) / 9000))
    xp += Math.round(XP_RULES.correctSpeedBonusMax * speedFactor)
  }

  if (isComeback) {
    xp += XP_RULES.comebackBonus
  }

  return xp
}
