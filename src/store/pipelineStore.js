/**
 * Pipeline Store
 *
 * Zustand store for pipeline simulation state: instruction list,
 * forwarding toggle, simulation result, and cycle stepping.
 */

import { create } from 'zustand'
import { simulatePipeline, classifyHazards } from '../engines/pipelineEngine.js'

const DEFAULT_INSTRUCTIONS = [
  'addi $t0, $zero, 5',
  'addi $t1, $zero, 10',
  'add $t2, $t0, $t1',
  'sub $t3, $t1, $t0',
]

const usePipelineStore = create((set, get) => ({
  instructions: DEFAULT_INSTRUCTIONS,
  forwardingEnabled: false,
  simulationResult: null,
  hazardReport: null,
  currentCycle: 0,

  setInstructions: (lines) => set({
    instructions: lines,
    simulationResult: null,
    hazardReport: null,
    currentCycle: 0,
  }),

  toggleForwarding: () => set((state) => ({
    forwardingEnabled: !state.forwardingEnabled,
    simulationResult: null,
    hazardReport: null,
    currentCycle: 0,
  })),

  runSimulation: () => {
    const { instructions, forwardingEnabled } = get()
    const result = simulatePipeline(instructions, { forwarding: forwardingEnabled })
    const hazards = classifyHazards(instructions)
    set({
      simulationResult: result,
      hazardReport: hazards,
      currentCycle: 0,
    })
  },

  stepCycle: () => {
    const { currentCycle, simulationResult } = get()
    if (!simulationResult) return
    const maxCycle = simulationResult.cycles
    if (currentCycle < maxCycle) {
      set({ currentCycle: currentCycle + 1 })
    }
  },

  stepBack: () => {
    const { currentCycle } = get()
    if (currentCycle > 0) {
      set({ currentCycle: currentCycle - 1 })
    }
  },

  resetSimulation: () => set({
    simulationResult: null,
    hazardReport: null,
    currentCycle: 0,
  }),
}))

export default usePipelineStore
