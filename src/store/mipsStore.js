/**
 * MIPS Store
 *
 * Zustand store for MIPS interpreter state: registers, PC, memory,
 * instruction list, and execution step controls.
 */

import { create } from 'zustand'
import { initState, executeInstruction } from '../engines/mipsInterpreter.js'

const DEFAULT_INSTRUCTIONS = [
  'addi $t0, $zero, 10',
  'addi $t1, $zero, 20',
  'add $t2, $t0, $t1',
  'sub $t3, $t1, $t0',
]

const useMipsStore = create((set, get) => ({
  registers: null,
  pc: 0,
  memory: {},
  executionLog: [],
  instructionList: DEFAULT_INSTRUCTIONS,
  currentLine: -1,

  setInstructions: (lines) => {
    set({
      instructionList: lines,
      currentLine: -1,
      executionLog: [],
      registers: null,
      pc: 0,
      memory: {},
    })
  },

  stepForward: () => {
    const { instructionList, currentLine, registers, pc, memory } = get()
    const nextLine = currentLine + 1

    if (nextLine >= instructionList.length) return

    // Initialize state on first step
    const state = registers === null
      ? initState()
      : { registers, pc, memory }

    const instruction = instructionList[nextLine]
    const { newState, log, error } = executeInstruction(instruction, state)

    if (error) {
      set((st) => ({
        executionLog: [...st.executionLog, `Error: ${error}`],
        currentLine: nextLine,
      }))
      return
    }

    set((st) => ({
      registers: newState.registers,
      pc: newState.pc,
      memory: newState.memory,
      executionLog: [...st.executionLog, `[${nextLine}] ${instruction} → ${log}`],
      currentLine: nextLine,
    }))
  },

  runAll: () => {
    const { registers, pc, memory, instructionList } = get()
    let state = registers === null
      ? initState()
      : { registers, pc, memory }

    const log = []
    let lastLine = -1

    for (let i = 0; i < instructionList.length; i++) {
      const instr = instructionList[i]
      const { newState, log: stepLog, error } = executeInstruction(instr, state)
      if (error) {
        log.push(`Error at line ${i}: ${error}`)
        break
      }
      log.push(`[${i}] ${instr} → ${stepLog}`)
      state = newState
      lastLine = i
    }

    set({
      registers: state.registers,
      pc: state.pc,
      memory: state.memory,
      executionLog: log,
      currentLine: lastLine,
    })
  },

  reset: () => {
    set({
      registers: null,
      pc: 0,
      memory: {},
      executionLog: [],
      currentLine: -1,
    })
  },
}))

export default useMipsStore
