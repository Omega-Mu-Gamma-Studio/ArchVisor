/**
 * mesiTransitions.js — the MESI protocol transition table. Extracted out
 * of CacheCoherence.jsx (which still uses it) so it can also be reused by
 * the boss-fight predictor without a component file exporting non-component
 * values (breaks React Fast Refresh).
 */

export function getTransition(prevState, event, otherCoresHaveIt) {
  if (prevState === 'I') {
    if (event.type === 'Read') return otherCoresHaveIt ? { next: 'S', edge: 'i-s' } : { next: 'E', edge: 'i-e' }
    if (event.type === 'Write') return { next: 'M', edge: 'i-e' } // simplified: goes through E then M
  }
  if (prevState === 'S') {
    if (event.type === 'Read') return { next: 'S', edge: null }
    if (event.type === 'Write') return { next: 'M', edge: 's-e' }
  }
  if (prevState === 'E') {
    if (event.type === 'Read') return otherCoresHaveIt ? { next: 'S', edge: 'e-s' } : { next: 'E', edge: null }
    if (event.type === 'Write') return { next: 'M', edge: 'e-m' }
  }
  if (prevState === 'M') {
    if (event.type === 'Read') return otherCoresHaveIt ? { next: 'S', edge: 'm-s' } : { next: 'M', edge: null }
    if (event.type === 'Write') return { next: 'M', edge: null }
  }
  return { next: prevState, edge: null }
}
