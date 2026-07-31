/**
 * masteryStore — tracks per-tool attempt/accuracy signal used to decide
 * "mastered" vs merely "visited," layered on top of (not replacing)
 * navigationStore's read-only `completedSubtools`.
 *
 * "Mastered" = the per-tool streak (from the core gamificationStore) has
 * reached MASTERY_STREAK_THRESHOLD at least once. This reuses existing
 * streak data rather than tracking a duplicate parallel counter, per the
 * single-source-of-truth requirement.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const MASTERY_STREAK_THRESHOLD = 5

const useMasteryStore = create(
  persist(
    (set, get) => ({
      masteredTools: [], // array of tool keys, e.g. '3/hazard-classifier'

      // Called with the latest streak snapshot for a tool; records mastery
      // the first time the threshold is crossed. Idempotent.
      checkMastery: (toolKey, currentStreak) => {
        if (currentStreak < MASTERY_STREAK_THRESHOLD) return
        const { masteredTools } = get()
        if (!masteredTools.includes(toolKey)) {
          set({ masteredTools: [...masteredTools, toolKey] })
        }
      },

      resetMastery: () => set({ masteredTools: [] }),
    }),
    { name: 'archvisor-mastery' }
  )
)

export default useMasteryStore
