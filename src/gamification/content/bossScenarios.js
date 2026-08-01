/**
 * Hand-authored "boss battle" scenarios, one per unit.
 *
 * Each entry names the existing tool to preload (by its existing toolId,
 * matching the id used in navigationStore / routing), a themed intro, and
 * the scenario payload that tool's wrapper should preload it with.
 *
 * BossBattleWrapper is responsible for actually passing `scenario` into the
 * wrapped tool component as props/initial-state — it does not reach into
 * the tool's internals.
 */

export const BOSS_SCENARIOS = {
  unit1: {
    unitId: 'unit1',
    toolId: 'mips-executor',
    title: 'The Register Gauntlet',
    intro:
      'A five-instruction chain of adds and subs. Run it to the end and $t3 had better land on the right number.',
    scenario: {
      // Note: the interpreter only resolves numeric branch offsets, not
      // label names — so this is deliberately straight-line code (no
      // beq/j) rather than the loop a label-based version would need.
      program: [
        'addi $t0, $zero, 12',
        'addi $t1, $zero, 7',
        'add $t2, $t0, $t1',
        'sub $t3, $t2, $t1',
        'addi $t3, $t3, 3',
      ],
      targetRegister: 't3',
      targetValue: 15,
    },
  },
  unit2: {
    unitId: 'unit2',
    toolId: 'booth-multiplier',
    title: "Booth's Gambit",
    intro: 'Signed operands, a negative multiplier, and no room for a shift-direction mistake.',
    scenario: {
      multiplicand: -22,
      multiplier: -13,
      bitWidth: 8,
    },
  },
  unit3: {
    unitId: 'unit3',
    toolId: 'pipeline-animator',
    title: 'Hazard Overload',
    intro: 'RAW, WAW, and a control hazard, all stacked in six instructions. Forwarding alone won\'t save you.',
    scenario: {
      instructions: [
        'lw $t0, 0($s0)',
        'add $t1, $t0, $t0',
        'sub $t0, $t1, $t2',
        'beq $t0, $zero, target',
        'add $t2, $t0, $t1',
        'sw $t2, 4($s0)',
      ],
      forwardingEnabled: false,
    },
  },
  unit4: {
    unitId: 'unit4',
    toolId: 'cache-coherence',
    title: 'The MESI Standoff',
    intro: 'Four cores, one cache line, and a burst of interleaved reads and writes.',
    scenario: {
      // Core numbers are 1-indexed and addresses come from the tool's
      // fixed ADDRESSES set (['0x00','0x04','0x08','0x0C']) — matching
      // its internal data shape exactly so the table renders correctly.
      coreCount: 4,
      events: [
        { core: 1, type: 'Read', address: '0x00' },
        { core: 2, type: 'Read', address: '0x00' },
        { core: 3, type: 'Write', address: '0x00' },
        { core: 1, type: 'Read', address: '0x00' },
        { core: 4, type: 'Write', address: '0x00' },
        { core: 2, type: 'Read', address: '0x00' },
      ],
    },
  },
  unit5: {
    unitId: 'unit5',
    toolId: 'cache-simulator',
    title: 'Thrash Mode',
    intro: 'A reference string hand-picked to fight your replacement policy every step of the way.',
    scenario: {
      // Field names match CacheSimulator's own state (cacheSize/blockSize
      // are already in bytes there — no "Bytes" suffix needed).
      cacheSize: 256,
      blockSize: 16,
      associativity: 2,
      replacementPolicy: 'LRU',
      writePolicy: 'write-through',
      referenceString: [
        '0x00', '0x40', '0x80', '0x00', '0xC0', '0x40', '0x100', '0x80', '0x00', '0xC0',
      ],
    },
  },
}

export function getBossScenario(unitId) {
  return BOSS_SCENARIOS[unitId] || null
}
