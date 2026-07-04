/**
 * Cache Store
 *
 * Zustand store for cache simulation state: config, reference string,
 * simulation result, and step controls.
 */

import { create } from 'zustand'
import { simulateCache } from '../engines/cacheSimulator.js'

const DEFAULT_CONFIG = {
  cacheSize: 4096,
  blockSize: 64,
  associativity: 1,
  replacementPolicy: 'LRU',
  writePolicy: 'write-through',
}

const DEFAULT_REFS = [
  { address: 0x00, type: 'R' },
  { address: 0x40, type: 'R' },
  { address: 0x00, type: 'R' },
  { address: 0x80, type: 'W' },
  { address: 0x40, type: 'R' },
  { address: 0x00, type: 'R' },
]

const useCacheStore = create((set, get) => ({
  config: { ...DEFAULT_CONFIG },
  referenceString: [...DEFAULT_REFS],
  simulationResult: null,
  currentStep: -1,

  setConfig: (newConfig) => set({
    config: { ...get().config, ...newConfig },
    simulationResult: null,
    currentStep: -1,
  }),

  setReferenceString: (refs) => set({
    referenceString: refs,
    simulationResult: null,
    currentStep: -1,
  }),

  runSimulation: () => {
    const { config, referenceString } = get()
    const result = simulateCache(config, referenceString)
    set({ simulationResult: result, currentStep: -1 })
  },

  stepForward: () => {
    const { currentStep, simulationResult } = get()
    if (!simulationResult) return
    const maxStep = simulationResult.steps.length - 1
    if (currentStep < maxStep) {
      set({ currentStep: currentStep + 1 })
    }
  },

  stepBack: () => {
    const { currentStep } = get()
    if (currentStep > -1) {
      set({ currentStep: currentStep - 1 })
    }
  },

  reset: () => set({
    simulationResult: null,
    currentStep: -1,
  }),
}))

export default useCacheStore
