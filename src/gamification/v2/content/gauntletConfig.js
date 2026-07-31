/**
 * Per-unit question pool composition for Gauntlet Mode. Each generator
 * calls the real, existing engine function to produce a question + the
 * engine's own correctly-computed answer — Gauntlet Mode never
 * reimplements simulation logic itself.
 */

export const GAUNTLET_UNIT_WEIGHTS = {
  1: 1,
  2: 1.2,
  3: 1.3, // pipelining/hazards weighted slightly higher — commonly tested
  4: 0.8,
  5: 1.2,
}

export const DEFAULT_GAUNTLET_LENGTH = 8

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomSigned8(excludeZero = false) {
  let v = randInt(-64, 63)
  if (excludeZero) while (v === 0) v = randInt(-64, 63)
  return v
}
