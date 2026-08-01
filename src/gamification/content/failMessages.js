/**
 * Failure-type → funny-but-conceptually-accurate message + animation mapping.
 * Consumed by <FailStateAnimation kind="..." />.
 *
 * Keep `durationMs` short (<=800ms) so fast retry loops are never blocked.
 */

export const FAIL_MESSAGES = {
  'adder.overflow': {
    caption: "That number just doesn't fit anymore.",
    animation: 'explode',
    durationMs: 600,
  },
  'booth.wrongShiftDirection': {
    caption: 'Wrong way! Booth shifts right, not left.',
    animation: 'bounce-wrong-way',
    durationMs: 500,
  },
  'tlb.mispredictedHit': {
    caption: "Nope — that was actually a page fault. Alarms are going off.",
    animation: 'alarm-flash',
    durationMs: 700,
  },
  'cache.mispredictedHit': {
    caption: "Thought it'd be there, but it was a miss.",
    animation: 'shake',
    durationMs: 500,
  },
  'cache.mispredictedMiss': {
    caption: "It was actually sitting right there the whole time.",
    animation: 'shake',
    durationMs: 500,
  },
  'hazard.misclassified': {
    caption: "Close, but that's not quite the hazard type.",
    animation: 'shake',
    durationMs: 500,
  },
  'division.wrongRestoreDecision': {
    caption: 'That remainder needed to be restored — it went negative.',
    animation: 'bounce-wrong-way',
    durationMs: 500,
  },
  'mips.wrongRegisterValue': {
    caption: "That's not what ended up in the register.",
    animation: 'shake',
    durationMs: 500,
  },
  generic: {
    caption: 'Not quite — give it another shot.',
    animation: 'shake',
    durationMs: 400,
  },
}

export function getFailMessage(kind) {
  return FAIL_MESSAGES[kind] || FAIL_MESSAGES.generic
}
