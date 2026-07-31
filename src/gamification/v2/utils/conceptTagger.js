/**
 * Maps a (toolId, contextHint) pair to a concept tag defined in
 * weakSpotTaxonomy.js. Kept as a pure lookup function so callers
 * (PredictionGate consumers) can pass an explicit `conceptTag` directly
 * when they already know it, and only fall back to this heuristic
 * lookup when they pass a raw toolId + optional hint instead.
 */

import { WEAK_SPOT_TAXONOMY } from '../content/weakSpotTaxonomy.js'

// Default concept tag per tool, used when no more specific hint is given.
const DEFAULT_TAG_BY_TOOL = {
  'hazard-classifier': 'hazard.RAW',
  'cache-simulator': 'cache.hitMiss',
  'virtual-memory': 'tlb.pageFault',
  ieee754: 'ieee754.rounding',
  booth: 'booth.shiftDirection',
  'restoring-div': 'division.restoreStep',
  'mips-executor': 'mips.registerValue',
  'cache-coherence': 'mesi.stateTransition',
}

/**
 * @param {string} toolId - e.g. 'hazard-classifier'
 * @param {string} [hint] - an already-known concept tag, or a raw label
 *        like 'WAW' the caller can map loosely
 * @returns {string|null} a valid key into WEAK_SPOT_TAXONOMY, or null
 */
export function tagConcept(toolId, hint) {
  if (hint && WEAK_SPOT_TAXONOMY[hint]) return hint

  if (hint) {
    // Loose match: try `${toolPrefix}.${hint}` against known tags.
    const guess = Object.keys(WEAK_SPOT_TAXONOMY).find((tag) => tag.endsWith(`.${hint}`))
    if (guess) return guess
  }

  return DEFAULT_TAG_BY_TOOL[toolId] || null
}
