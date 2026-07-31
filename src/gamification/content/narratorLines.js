/**
 * First-person "CPU's-eye-view" narrator lines, keyed by event.
 *
 * Display-layer content only — consumed by useNarratorLine(eventKey).
 * When narrator mode is off, or a key has no entry here, the calling tool
 * should fall back to its own existing default text (this file never
 * substitutes for that default silently — see useNarratorLine.js).
 */

export const NARRATOR_LINES = {
  // Unit III — Pipeline
  'pipeline.stall': "Ugh, hold on — the instruction ahead of me hasn't finished its ALU op yet.",
  'pipeline.forward': "Good news, I don't have to wait — I can grab that value straight off the bypass path.",
  'pipeline.hazard.raw': "I need a value that hasn't been written back yet. Awkward.",
  'pipeline.hazard.control': "I don't even know if I should be running yet — that branch hasn't resolved.",
  'pipeline.flush': "Well, that branch went the other way. Scrap me, I guess.",

  // Unit V — Cache / Memory
  'cache.hit': "Oh nice, it's already here. Handing it back immediately.",
  'cache.miss': "Not in here. Guess I'm walking all the way to memory again.",
  'cache.eviction': "Sorry, old data — you're getting kicked out to make room.",
  'tlb.hit': "Already know where this page lives. Quick trip.",
  'tlb.miss': "Don't have this mapping cached. Time for the slow walk through the page table.",
  'tlb.pageFault': "Nope, don't have that page. Time to bother the disk.",

  // Unit II — Arithmetic
  'adder.overflow': "Whoa — that result doesn't fit in the bits I've got. Something's gotta give.",
  'booth.shiftRight': "Shifting everything right and dragging the sign bit along with me.",
  'division.restore': "Went negative — putting that remainder back where it was.",

  // Unit I — MIPS execution
  'mips.branchTaken': "Taking the branch. See you at the new address.",
  'mips.jal': "Stashing my return address before I jump off into this function.",
  'mips.loadWord': "Reaching into memory to pull this word into a register.",

  // Unit IV
  'mesi.modified': "I'm the only one with the current copy of this line. Everyone else is stale.",
  'mesi.invalidate': "Someone else just wrote to this line. Mine's no good anymore.",
}

export function getNarratorLine(eventKey) {
  return NARRATOR_LINES[eventKey] || null
}
