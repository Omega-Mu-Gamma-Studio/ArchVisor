/**
 * gameContent.js — pure data/generator functions for the new arcade
 * mini-games. No React, no store access — same "engines are pure
 * functions" philosophy as src/engines/. Each generator returns a
 * round shape the shared <MiniGameRound /> can render:
 *
 *   { prompt, subtitle?, options: [{ key, label }], correctKey, conceptTag? }
 */

// ── Register Rush (Unit I) ───────────────────────────────────────────
// Standard MIPS register number → ABI name table (register $0.."$31").
const MIPS_REGISTERS = [
  { num: 0, abi: '$zero' }, { num: 1, abi: '$at' },
  { num: 2, abi: '$v0' }, { num: 3, abi: '$v1' },
  { num: 4, abi: '$a0' }, { num: 5, abi: '$a1' }, { num: 6, abi: '$a2' }, { num: 7, abi: '$a3' },
  { num: 8, abi: '$t0' }, { num: 9, abi: '$t1' }, { num: 10, abi: '$t2' }, { num: 11, abi: '$t3' },
  { num: 12, abi: '$t4' }, { num: 13, abi: '$t5' }, { num: 14, abi: '$t6' }, { num: 15, abi: '$t7' },
  { num: 16, abi: '$s0' }, { num: 17, abi: '$s1' }, { num: 18, abi: '$s2' }, { num: 19, abi: '$s3' },
  { num: 20, abi: '$s4' }, { num: 21, abi: '$s5' }, { num: 22, abi: '$s6' }, { num: 23, abi: '$s7' },
  { num: 24, abi: '$t8' }, { num: 25, abi: '$t9' },
  { num: 26, abi: '$k0' }, { num: 27, abi: '$k1' },
  { num: 28, abi: '$gp' }, { num: 29, abi: '$sp' }, { num: 30, abi: '$fp' }, { num: 31, abi: '$ra' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickDistinct(pool, count, excludeFn) {
  const candidates = pool.filter((item) => !excludeFn(item))
  const chosen = []
  const used = new Set()
  while (chosen.length < count && chosen.length < candidates.length) {
    const c = candidates[Math.floor(Math.random() * candidates.length)]
    if (!used.has(c.num ?? c)) {
      used.add(c.num ?? c)
      chosen.push(c)
    }
  }
  return chosen
}

export function generateRegisterRushRound() {
  const target = MIPS_REGISTERS[Math.floor(Math.random() * MIPS_REGISTERS.length)]
  const distractors = pickDistinct(MIPS_REGISTERS, 3, (r) => r.num === target.num)
  const options = shuffle(
    [target, ...distractors].map((r) => ({ key: r.abi, label: r.abi }))
  )
  return {
    prompt: `Which register is $${target.num}?`,
    subtitle: 'Pick the correct ABI name',
    options,
    correctKey: target.abi,
    conceptTag: 'mips.registers',
  }
}

// ── Binary Blitz (Unit II) ───────────────────────────────────────────
function toBinary8(n) {
  return (n & 0xff).toString(2).padStart(8, '0')
}

function flipRandomBit(bin) {
  const pos = Math.floor(Math.random() * bin.length)
  const bit = bin[pos] === '0' ? '1' : '0'
  return bin.slice(0, pos) + bit + bin.slice(pos + 1)
}

export function generateBinaryBlitzRound() {
  const value = Math.floor(Math.random() * 256) // 0-255, unsigned 8-bit
  const correct = toBinary8(value)

  const distractorSet = new Set()
  while (distractorSet.size < 3) {
    const candidate = flipRandomBit(correct)
    if (candidate !== correct) distractorSet.add(candidate)
  }

  const options = shuffle(
    [correct, ...distractorSet].map((bin) => ({ key: bin, label: bin }))
  )
  return {
    prompt: `What is ${value} in 8-bit binary?`,
    subtitle: 'Unsigned, zero-padded to 8 bits',
    options,
    correctKey: correct,
    conceptTag: 'binary.conversion',
  }
}

// ── Hazard Hunter (Unit III) ────────────────────────────────────────
// Hand-authored, verified instruction pairs — same four categories the
// Hazard Classifier sub-tool (3.3) teaches: RAW, WAR, WAW, and no hazard.
const HAZARD_ROUNDS = [
  {
    lines: ['add $t0, $t1, $t2', 'sub $t3, $t0, $t4'],
    correctKey: 'RAW',
    note: 'Instruction 2 reads $t0 right after instruction 1 writes it.',
  },
  {
    lines: ['sub $t3, $t0, $t4', 'add $t0, $t5, $t6'],
    correctKey: 'WAR',
    note: 'Instruction 2 writes $t0 after instruction 1 only read it.',
  },
  {
    lines: ['add $t0, $t1, $t2', 'sub $t0, $t3, $t4'],
    correctKey: 'WAW',
    note: 'Both instructions write to $t0.',
  },
  {
    lines: ['add $t0, $t1, $t2', 'sub $s0, $s1, $s2'],
    correctKey: 'None',
    note: 'No registers are shared between the two instructions.',
  },
  {
    lines: ['lw $t2, 0($sp)', 'add $t5, $t2, $t2'],
    correctKey: 'RAW',
    note: 'Instruction 2 needs $t2, which the load hasn\u2019t written back yet.',
  },
  {
    lines: ['or $t1, $s0, $s1', 'and $t1, $t2, $t3'],
    correctKey: 'WAW',
    note: 'Both instructions write to $t1 — the second write wins.',
  },
]

const HAZARD_OPTIONS = [
  { key: 'RAW', label: 'RAW' },
  { key: 'WAR', label: 'WAR' },
  { key: 'WAW', label: 'WAW' },
  { key: 'None', label: 'No hazard' },
]

export function generateHazardHunterRound(usedIndices) {
  const available = HAZARD_ROUNDS
    .map((r, i) => i)
    .filter((i) => !usedIndices.has(i))
  const pool = available.length > 0 ? available : HAZARD_ROUNDS.map((_, i) => i)
  const idx = pool[Math.floor(Math.random() * pool.length)]
  const round = HAZARD_ROUNDS[idx]
  return {
    _idx: idx,
    prompt: 'What hazard is between these two back-to-back instructions?',
    subtitle: `${round.lines[0]}  →  ${round.lines[1]}`,
    options: shuffle(HAZARD_OPTIONS),
    correctKey: round.correctKey,
    conceptTag: 'pipeline.hazards',
    explain: round.note,
  }
}

export const MINI_GAMES = [
  {
    id: 'register-rush',
    toolId: 'arcade-register-rush',
    title: 'Register Rush',
    tagline: 'Name that MIPS register before the clock runs out',
    icon: '🧠',
    color: '#0ea5e9',
    unitLabel: 'Unit I — MIPS Basics',
    generate: () => generateRegisterRushRound(),
  },
  {
    id: 'binary-blitz',
    toolId: 'arcade-binary-blitz',
    title: 'Binary Blitz',
    tagline: 'Convert decimals to 8-bit binary at speed',
    icon: '🔢',
    color: '#eab308',
    unitLabel: 'Unit II — Arithmetic',
    generate: () => generateBinaryBlitzRound(),
  },
  {
    id: 'hazard-hunter',
    toolId: 'arcade-hazard-hunter',
    title: 'Hazard Hunter',
    tagline: 'Spot RAW / WAR / WAW hazards on sight',
    icon: '⚡',
    color: '#db2777',
    unitLabel: 'Unit III — Pipelining',
    generate: (usedIndices) => generateHazardHunterRound(usedIndices),
    stateful: true, // generator wants a "used" set so rounds don't repeat
  },
]
