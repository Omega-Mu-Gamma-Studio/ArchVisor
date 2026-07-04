/**
 * Navigation Store
 *
 * Zustand store for tracking active unit/subtool and visited subtools.
 */

import { create } from 'zustand'

const useNavigationStore = create((set, get) => ({
  activeUnit: null,
  activeSubtool: null,
  completedSubtools: [],

  setActiveUnit: (unit) => set({ activeUnit: unit }),

  setActiveSubtool: (subtool) => set({ activeSubtool: subtool }),

  markCompleted: (subtool) => {
    const { completedSubtools } = get()
    if (!completedSubtools.includes(subtool)) {
      set({ completedSubtools: [...completedSubtools, subtool] })
    }
  },
}))

export default useNavigationStore
