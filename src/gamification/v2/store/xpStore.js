/**
 * xpStore — XP total (monotonically non-decreasing) and level state.
 * Separate localStorage key from the core gamificationStore, per the
 * spec's namespacing requirement.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { levelForXP } from '../content/xpRules.js'

const useXPStore = create(
  persist(
    (set, get) => ({
      totalXP: 0,
      level: 1,
      pendingLevelUp: null, // { fromLevel, toLevel } — consumed by LevelUpToast

      awardXP: (amount) => {
        if (amount <= 0) return
        const { totalXP, level } = get()
        const nextTotal = totalXP + amount
        const nextLevel = levelForXP(nextTotal)

        set({
          totalXP: nextTotal,
          level: nextLevel,
          pendingLevelUp: nextLevel > level ? { fromLevel: level, toLevel: nextLevel } : get().pendingLevelUp,
        })
      },

      dismissLevelUp: () => set({ pendingLevelUp: null }),

      resetXP: () => set({ totalXP: 0, level: 1, pendingLevelUp: null }),
    }),
    {
      name: 'archvisor-xp',
      partialize: (state) => ({ totalXP: state.totalXP, level: state.level }),
    }
  )
)

export default useXPStore
