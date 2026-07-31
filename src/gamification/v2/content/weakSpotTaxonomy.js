/**
 * Concept-tag definitions per sub-tool. Each tag maps to the real
 * unit/tool route it should nudge a student back toward, so
 * WeakSpotNudge links are always valid.
 */

export const WEAK_SPOT_TAXONOMY = {
  'hazard.structural': { label: 'Structural hazards', unitId: '3', toolId: 'hazard-classifier' },
  'hazard.RAW':        { label: 'RAW hazards', unitId: '3', toolId: 'hazard-classifier' },
  'hazard.WAR':        { label: 'WAR hazards', unitId: '3', toolId: 'hazard-classifier' },
  'hazard.WAW':        { label: 'WAW hazards', unitId: '3', toolId: 'hazard-classifier' },
  'hazard.control':    { label: 'Control hazards', unitId: '3', toolId: 'hazard-classifier' },

  'cache.evictionLRU': { label: 'LRU eviction', unitId: '5', toolId: 'cache-simulator' },
  'cache.hitMiss':     { label: 'Hit/miss prediction', unitId: '5', toolId: 'cache-simulator' },
  'tlb.pageFault':     { label: 'Page faults', unitId: '5', toolId: 'virtual-memory' },

  'ieee754.signExtend':  { label: 'IEEE-754 sign handling', unitId: '2', toolId: 'ieee754' },
  'ieee754.rounding':    { label: 'IEEE-754 rounding', unitId: '2', toolId: 'ieee754' },
  'booth.shiftDirection': { label: "Booth's shift direction", unitId: '2', toolId: 'booth' },
  'division.restoreStep': { label: 'Restoring-division steps', unitId: '2', toolId: 'restoring-div' },

  'mips.branchTarget': { label: 'Branch targets', unitId: '1', toolId: 'mips-executor' },
  'mips.registerValue': { label: 'Register value tracing', unitId: '1', toolId: 'mips-executor' },

  'mesi.stateTransition': { label: 'MESI state transitions', unitId: '4', toolId: 'cache-coherence' },
}

export function getWeakSpotMeta(tag) {
  return WEAK_SPOT_TAXONOMY[tag] || null
}
