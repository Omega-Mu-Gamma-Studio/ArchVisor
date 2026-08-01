/**
 * ghostStore — stores the single best completed run's timing per
 * scenario (keyed by the same encodeChallenge-style scenario key), so
 * localStorage usage stays bounded regardless of how many attempts a
 * student makes.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useGhostStore = create(
  persist(
    (set, get) => ({
      bestRuns: {}, // { [scenarioKey]: { totalMs, stepTimestampsMs: number[], recordedAt } }

      // Only overwrites the stored run if this one is faster (or no run exists yet).
      recordRunIfBest: (scenarioKey, { totalMs, stepTimestampsMs }) => {
        const { bestRuns } = get()
        const existing = bestRuns[scenarioKey]
        if (existing && existing.totalMs <= totalMs) return false

        set({
          bestRuns: {
            ...bestRuns,
            [scenarioKey]: { totalMs, stepTimestampsMs, recordedAt: Date.now() },
          },
        })
        return true
      },

      getGhost: (scenarioKey) => get().bestRuns[scenarioKey] || null,

      resetGhosts: () => set({ bestRuns: {} }),
    }),
    { name: 'archvisor-ghost' }
  )
)

export default useGhostStore
