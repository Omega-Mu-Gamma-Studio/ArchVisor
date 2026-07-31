/**
 * Question generators for Gauntlet Mode. Each function calls the same
 * real engine function the corresponding tool already uses, and derives
 * the question + correct answer entirely from that engine's own output —
 * no simulation logic is reimplemented here.
 */

import { boothMultiply } from '../../../engines/booth.js'
import { classifyHazards } from '../../../engines/pipelineEngine.js'
import { simulateCache } from '../../../engines/cacheSimulator.js'
import { restoringDivide } from '../../../engines/restoringDivision.js'
import { randomSigned8 } from '../content/gauntletConfig.js'

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateBoothQuestion() {
  const multiplicand = randomSigned8()
  const multiplier = randInt(-8, 8)
  const { product } = boothMultiply(multiplicand, multiplier, 8)
  return {
    unitId: '2',
    toolId: 'booth',
    conceptTag: 'booth.shiftDirection',
    difficulty: 'hard',
    prompt: `Using Booth's algorithm: what is ${multiplicand} × ${multiplier} (8-bit signed)?`,
    expected: String(product),
  }
}

export function generateRestoringDivisionQuestion() {
  const divisor = randInt(2, 9)
  const quotientTarget = randInt(1, 12)
  const dividend = divisor * quotientTarget + randInt(0, divisor - 1)
  const { quotient } = restoringDivide(dividend, divisor, 8)
  return {
    unitId: '2',
    toolId: 'restoring-div',
    conceptTag: 'division.restoreStep',
    difficulty: 'hard',
    prompt: `Using restoring division: what is ${dividend} ÷ ${divisor} (quotient, 8-bit)?`,
    expected: String(quotient),
  }
}

export function generateHazardQuestion() {
  const pool = [
    ['lw $t0, 0($s0)', 'add $t1, $t0, $t0', 'sub $t2, $t1, $t3'],
    ['add $t0, $s0, $s1', 'sub $t1, $s2, $s3', 'and $t2, $s4, $s5'],
    ['lw $t0, 0($s0)', 'add $t1, $t0, $t0', 'sw $t1, 4($s0)', 'lw $t2, 4($s0)'],
  ]
  const instructions = pool[randInt(0, pool.length - 1)]
  const hazards = classifyHazards(instructions)
  return {
    unitId: '3',
    toolId: 'hazard-classifier',
    conceptTag: 'hazard.RAW',
    difficulty: 'medium',
    prompt: `How many hazards does this sequence contain?\n${instructions.join('\n')}`,
    expected: String(hazards.length),
  }
}

export function generateCacheQuestion() {
  const config = { cacheSize: 64, blockSize: 16, associativity: 1, replacementPolicy: 'LRU', writePolicy: 'write-back' }
  const addresses = Array.from({ length: 5 }, () => randInt(0, 7) * 16)
  const referenceString = addresses.map((address) => ({ address, type: 'R' }))
  const { steps } = simulateCache(config, referenceString)
  const lastStep = steps[steps.length - 1]
  return {
    unitId: '5',
    toolId: 'cache-simulator',
    conceptTag: 'cache.hitMiss',
    difficulty: 'medium',
    prompt: `Direct-mapped, 64B cache / 16B blocks. Reference sequence: ${addresses.map((a) => '0x' + a.toString(16)).join(', ')}. Is the final access a hit or a miss?`,
    expected: lastStep.hit ? 'hit' : 'miss',
  }
}

const GENERATORS = [generateBoothQuestion, generateRestoringDivisionQuestion, generateHazardQuestion, generateCacheQuestion]

/**
 * Builds a gauntlet session's question list, weighted toward tagged weak
 * spots when available (weak-spot tags simply get their matching
 * generator repeated more often; still capped at one duplicate per tag
 * per session so a single generator can't dominate an 8-question run).
 */
export function buildGauntletSession(length, weakSpotTags = []) {
  const weighted = [...GENERATORS]
  GENERATORS.forEach((gen) => {
    const sample = gen()
    if (weakSpotTags.includes(sample.conceptTag)) weighted.push(gen)
  })

  const questions = []
  for (let i = 0; i < length; i++) {
    const gen = weighted[randInt(0, weighted.length - 1)]
    questions.push(gen())
  }
  return questions
}
