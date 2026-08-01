/**
 * bossFightContent.js — turns each boss's scenario into a sequence of
 * predict-then-reveal rounds, using the SAME engines the underlying tool
 * uses (mipsInterpreter, booth, pipelineEngine, cacheSimulator, and
 * CacheCoherence's MESI transition table). Nothing here is hand-scripted —
 * if a scenario in bossScenarios.js changes, these rounds recompute.
 */

import { initState, executeInstruction } from '../../engines/mipsInterpreter.js'
import { boothMultiply } from '../../engines/booth.js'
import { classifyHazards } from '../../engines/pipelineEngine.js'
import { simulateCache } from '../../engines/cacheSimulator.js'
import { getTransition } from '../../engines/mesiTransitions.js'

// $t0-$t3 resolve to the same index (8-11) under both the interpreter's
// internal numbering and standard MIPS ABI names — see mipsInterpreter.js.
const SAFE_REGISTER_INDEX = { t0: 8, t1: 9, t2: 10, t3: 11 }
const MESI_LABEL = { I: 'Invalid', S: 'Shared', E: 'Exclusive', M: 'Modified' }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function numericDistractors(correct, count) {
  const seen = new Set([correct])
  const out = []
  const deltas = shuffle([1, -1, 2, -2, 3, -3, 4, -4, 5, -5])
  for (const d of deltas) {
    const v = correct + d
    if (v < 0 || seen.has(v)) continue
    seen.add(v)
    out.push(v)
    if (out.length === count) break
  }
  return out
}

// ── Unit I — Register Gauntlet ──────────────────────────────
export function buildUnit1Rounds(scenario) {
  let state = initState()
  const rounds = []
  for (const line of scenario.program) {
    const { newState } = executeInstruction(line, state)
    const parts = line.replace(',', ' ').split(/\s+/).filter(Boolean)
    const destName = parts[1]?.replace('$', '').replace(',', '')
    const idx = SAFE_REGISTER_INDEX[destName]
    if (idx !== undefined) {
      const correct = newState.registers[`$${idx}`]
      const options = shuffle([
        { key: String(correct), label: String(correct) },
        ...numericDistractors(correct, 3).map((v) => ({ key: String(v), label: String(v) })),
      ])
      rounds.push({
        prompt: line,
        subtitle: `What will $${destName} become?`,
        options,
        correctKey: String(correct),
      })
    }
    state = newState
  }
  return rounds
}

// ── Unit II — Booth's Gambit ─────────────────────────────────
const BOOTH_OPTIONS = [
  { key: 'A = A - M', label: 'Subtract M' },
  { key: 'A = A + M', label: 'Add M' },
  { key: 'No operation', label: 'No operation (shift only)' },
]

export function buildUnit2Rounds(scenario) {
  const { steps } = boothMultiply(scenario.multiplicand, scenario.multiplier, scenario.bitWidth)
  return steps.map((s, i) => ({
    prompt: `Iteration ${i + 1}: Q0 = ${s.Q0}, Q₋1 = ${s.Q_1}`,
    subtitle: "What does Booth's algorithm do this iteration?",
    options: shuffle(BOOTH_OPTIONS),
    correctKey: s.operation,
  }))
}

// ── Unit III — Hazard Overload ───────────────────────────────
const HAZARD_OPTIONS = [
  { key: 'RAW', label: 'RAW hazard' },
  { key: 'control', label: 'Control hazard' },
  { key: 'None', label: 'No hazard' },
]

export function buildUnit3Rounds(scenario) {
  const instructions = scenario.instructions
  const hazards = classifyHazards(instructions)
  const rounds = []
  for (let i = 1; i < instructions.length; i++) {
    const raw = hazards.find((h) => h.type === 'RAW' && h.instrIndexB === i)
    const control = hazards.find((h) => h.type === 'control' && h.instrIndexB === i)
    const type = raw ? 'RAW' : control ? 'control' : 'None'
    rounds.push({
      prompt: `${instructions[i - 1]}   →   ${instructions[i]}`,
      subtitle: 'What hazard (if any) hits the second instruction?',
      options: shuffle(HAZARD_OPTIONS),
      correctKey: type,
    })
  }
  return rounds
}

// ── Unit IV — The MESI Standoff ──────────────────────────────
export function buildUnit4Rounds(scenario) {
  const { coreCount, events } = scenario
  const addresses = [...new Set(events.map((e) => e.address))]
  const coreStates = {}
  for (let c = 1; c <= coreCount; c++) {
    coreStates[c] = {}
    for (const a of addresses) coreStates[c][a] = 'I'
  }

  const stateOptions = shuffle(
    Object.entries(MESI_LABEL).map(([key, label]) => ({ key, label }))
  )

  return events.map((event) => {
    const prevState = coreStates[event.core][event.address]
    let otherHaveIt = false
    for (let c = 1; c <= coreCount; c++) {
      if (c !== event.core && coreStates[c][event.address] !== 'I') { otherHaveIt = true; break }
    }
    const { next } = getTransition(prevState, event, otherHaveIt)
    const round = {
      prompt: `Core ${event.core}: ${event.type} on ${event.address} (currently ${MESI_LABEL[prevState]})`,
      subtitle: 'What MESI state does this cache line end up in?',
      options: stateOptions,
      correctKey: next,
    }
    coreStates[event.core][event.address] = next
    return round
  })
}

// ── Unit V — Thrash Mode ─────────────────────────────────────
const HITMISS_OPTIONS = [
  { key: 'hit', label: 'HIT' },
  { key: 'miss', label: 'MISS' },
]

export function buildUnit5Rounds(scenario) {
  const config = {
    cacheSize: scenario.cacheSize,
    blockSize: scenario.blockSize,
    associativity: scenario.associativity,
    replacementPolicy: scenario.replacementPolicy,
    writePolicy: scenario.writePolicy,
  }
  const referenceString = scenario.referenceString.map((addr) => ({ address: parseInt(addr, 16), type: 'R' }))
  const { steps } = simulateCache(config, referenceString)
  return steps.map((s, i) => ({
    prompt: `Access #${i + 1}: ${scenario.referenceString[i]}`,
    subtitle: 'Hit or miss?',
    options: shuffle(HITMISS_OPTIONS),
    correctKey: s.hit ? 'hit' : 'miss',
  }))
}

export const ROUND_BUILDERS = {
  unit1: buildUnit1Rounds,
  unit2: buildUnit2Rounds,
  unit3: buildUnit3Rounds,
  unit4: buildUnit4Rounds,
  unit5: buildUnit5Rounds,
}
