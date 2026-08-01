/**
 * v2SettingsStore — the single opt-out switch for the entire v2 layer
 * (Mastery Map, XP bar, weak-spot nudges, ghost replay, report card,
 * gauntlet entry point). Every v2 component checks `v2Enabled` and
 * renders nothing when it's off.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useV2SettingsStore = create(
  persist(
    (set) => ({
      v2Enabled: true,
      setV2Enabled: (enabled) => set({ v2Enabled: enabled }),
      toggleV2Enabled: () => set((state) => ({ v2Enabled: !state.v2Enabled })),
    }),
    { name: 'archvisor-v2-settings' }
  )
)

export default useV2SettingsStore
