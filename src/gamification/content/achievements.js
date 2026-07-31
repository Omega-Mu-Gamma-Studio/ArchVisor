/**
 * Achievement definitions.
 *
 * Each achievement's `condition` is a pure function of the gamification
 * store's state, so checking is O(#achievements) and never rescans history.
 */

const SPEEDRUN_THRESHOLD_MS = 15000 // "Speedrunner" — finish any tracked scenario under 15s

export const ACHIEVEMENTS = [
  {
    id: 'hazard-hunter',
    name: 'Hazard Hunter',
    description: 'Correctly classify 20 hazards in a row on the Hazard Classifier.',
    icon: 'target',
    condition: (state) => (state.streaks['hazard-classifier']?.best || 0) >= 20,
  },
  {
    id: 'cache-whisperer',
    name: 'Cache Whisperer',
    description: '100% hit/miss prediction accuracy over a 10-reference run.',
    icon: 'brain',
    condition: (state) => (state.streaks['cache-simulator']?.best || 0) >= 10,
  },
  {
    id: 'booths-boss',
    name: "Booth's Boss",
    description: "Complete a Booth's Multiplication run with zero incorrect steps.",
    icon: 'crown',
    condition: (state) => (state.streaks['booth-multiplier']?.best || 0) >= 1 &&
      (state.bestTimes['booth-multiplier']?.runs || 0) >= 1,
  },
  {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: `Complete any tool's scenario in under ${SPEEDRUN_THRESHOLD_MS / 1000}s.`,
    icon: 'zap',
    condition: (state) =>
      Object.values(state.bestTimes).some((entry) => entry.bestMs <= SPEEDRUN_THRESHOLD_MS),
  },
  {
    id: 'unit-cleared-1',
    name: 'Unit I Cleared',
    description: 'Defeat the Unit I boss battle.',
    icon: 'shield',
    condition: (state) => state.bossesCleared.includes('unit1'),
  },
  {
    id: 'unit-cleared-2',
    name: 'Unit II Cleared',
    description: 'Defeat the Unit II boss battle.',
    icon: 'shield',
    condition: (state) => state.bossesCleared.includes('unit2'),
  },
  {
    id: 'unit-cleared-3',
    name: 'Unit III Cleared',
    description: 'Defeat the Unit III boss battle.',
    icon: 'shield',
    condition: (state) => state.bossesCleared.includes('unit3'),
  },
  {
    id: 'unit-cleared-4',
    name: 'Unit IV Cleared',
    description: 'Defeat the Unit IV boss battle.',
    icon: 'shield',
    condition: (state) => state.bossesCleared.includes('unit4'),
  },
  {
    id: 'unit-cleared-5',
    name: 'Unit V Cleared',
    description: 'Defeat the Unit V boss battle.',
    icon: 'shield',
    condition: (state) => state.bossesCleared.includes('unit5'),
  },
  {
    id: 'chaos-agent',
    name: 'Chaos Agent',
    description: "Trigger Sandbox Mode's most extreme break condition.",
    icon: 'flame',
    condition: (state) =>
      Object.values(state.chaosTriggered).some((levels) => levels.includes('extreme')),
  },
  {
    id: 'comeback-kid',
    name: 'Comeback Kid',
    description: 'Recover from a miss with a correct answer on the very same concept.',
    icon: 'refresh',
    condition: (state) => (state.comebackCount || 0) >= 1,
  },
]

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]))
