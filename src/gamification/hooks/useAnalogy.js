/**
 * useAnalogy — display-layer-only hook, companion to useNarratorLine.
 *
 * Returns { analogyOn, analogy } so callers can render the analogy
 * ALONGSIDE the real technical label (never as a silent substitution).
 */

import useGamificationStore from '../store/gamificationStore.js'
import { getAnalogy } from '../content/analogies.js'

export default function useAnalogy(conceptId) {
  const analogyOn = useGamificationStore((state) => state.modes.analogy)
  return {
    analogyOn,
    analogy: analogyOn ? getAnalogy(conceptId) : null,
  }
}
