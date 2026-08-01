/**
 * "Silly analogy" labels for technical concepts, keyed by concept id.
 *
 * These are always shown ALONGSIDE the correct technical term (toggle or
 * side-by-side), never as a silent substitution — the real vocabulary is
 * still the thing being taught.
 */

export const ANALOGIES = {
  // Memory hierarchy / caching
  'cache.general': 'Like keeping snacks on your desk instead of walking to the kitchen every time.',
  'cache.l1': "Your desk drawer — closest, smallest, fastest to reach.",
  'cache.l2': 'The kitchen down the hall — a bit further, holds more.',
  'cache.dram': 'The grocery store across town — big, but a real trip to get to.',
  'cache.hit': "The snack was already on your desk. No trip needed.",
  'cache.miss': "Desk's empty — off to the kitchen you go.",

  // MESI cache coherence states
  'mesi.modified': "You're the only one editing this Google Doc right now, and no one else has synced your changes.",
  'mesi.exclusive': "You've got the only copy, but you haven't changed anything yet.",
  'mesi.shared': "Everyone has the same synced copy of the doc open, read-only.",
  'mesi.invalid': "Your copy of the doc is out of date — don't trust what's on your screen.",

  // Hazards
  'hazard.structural': 'Two people trying to use the one photocopier at the same time.',
  'hazard.raw': "You're asking for a package before the courier has actually dropped it off.",
  'hazard.war': "You're about to overwrite a whiteboard someone hasn't finished reading yet.",
  'hazard.waw': 'Two people racing to write the final answer on the same line of the whiteboard.',
  'hazard.control': "You don't know which hallway to walk down until someone tells you which door the meeting is in.",

  // Virtual memory / TLB
  'tlb.hit': "You already remember which locker number your stuff is in.",
  'tlb.miss': "You forgot your locker number and have to check the master list.",
  'pageFault': "Your stuff isn't even in a locker right now — it's in off-site storage.",

  // Pipelining
  'pipeline.stall': 'A car stuck behind another car waiting at a red light.',
  'pipeline.forwarding': "Passing a note directly to the person behind you instead of making them wait for it to go through the teacher.",

  // I/O
  'io.polling': 'Repeatedly checking your mailbox even though nothing has arrived.',
  'io.interrupt': 'Waiting for the mail carrier to ring your doorbell instead.',
  'io.dma': 'Having a courier deliver packages directly to your shelf without you lifting a finger.',
}

export function getAnalogy(conceptId) {
  return ANALOGIES[conceptId] || null
}
