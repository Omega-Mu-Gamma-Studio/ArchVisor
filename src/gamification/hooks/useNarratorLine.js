/**
 * useNarratorLine — display-layer-only hook.
 *
 * Never alters engine computation: it only chooses which string gets
 * rendered for a given event key. Falls back to the tool's own existing
 * default text when narrator mode is off, or when there's no line for
 * that key yet.
 *
 * Usage in a wrapping component (never inside an existing tool file):
 *   const line = useNarratorLine('cache.miss', "Cache miss.")
 */

import useGamificationStore from '../store/gamificationStore.js'
import { getNarratorLine } from '../content/narratorLines.js'

export default function useNarratorLine(eventKey, defaultText) {
  const narratorOn = useGamificationStore((state) => state.modes.narrator)
  if (!narratorOn) return defaultText
  return getNarratorLine(eventKey) ?? defaultText
}
