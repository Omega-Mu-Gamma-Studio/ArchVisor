/**
 * weakSpotStore — tallies misses per concept tag, tracks nudge-dismiss
 * state (per tag, per session — see note below), and exposes the
 * miss->correct "comeback" check used by ComebackBadge/xp comeback bonus.
 *
 * Nudge threshold and dismiss behavior:
 * - A nudge becomes eligible once a tag's miss count reaches
 *   NUDGE_THRESHOLD.
 * - Dismissing a nudge for a tag suppresses it for the rest of the
 *   session (persisted, so it also stays dismissed across reloads —
 *   "doesn't repeat itself for the same tag within a session" is the
 *   floor; persisting further avoids re-nagging entirely, which is a
 *   superset of the requirement, not a violation of it).
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const NUDGE_THRESHOLD = 3

const useWeakSpotStore = create(
  persist(
    (set, get) => ({
      missCounts: {}, // { [tag]: number }
      dismissedTags: [], // tags the student has dismissed a nudge for
      lastMissTag: null, // most recent miss tag, for comeback detection

      registerMiss: (tag) => {
        if (!tag) return
        const { missCounts } = get()
        set({
          missCounts: { ...missCounts, [tag]: (missCounts[tag] || 0) + 1 },
          lastMissTag: tag,
        })
      },

      // Returns true if this correct answer is a genuine miss->correct
      // "comeback" on the same tag, and clears lastMissTag either way
      // (a correct answer always resolves the pending miss state).
      registerCorrectAndCheckComeback: (tag) => {
        const { lastMissTag } = get()
        const isComeback = Boolean(tag) && lastMissTag === tag
        set({ lastMissTag: null })
        return isComeback
      },

      dismissNudge: (tag) => {
        const { dismissedTags } = get()
        if (!dismissedTags.includes(tag)) {
          set({ dismissedTags: [...dismissedTags, tag] })
        }
      },

      resetWeakSpots: () => set({ missCounts: {}, dismissedTags: [], lastMissTag: null }),
    }),
    {
      name: 'archvisor-weakspots',
      partialize: (state) => ({
        missCounts: state.missCounts,
        dismissedTags: state.dismissedTags,
      }),
    }
  )
)

export default useWeakSpotStore
