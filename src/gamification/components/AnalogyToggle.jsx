/**
 * AnalogyToggle — companion toggle to NarratorToggle, but for conceptual
 * labels (MESI states, cache hierarchy, hazard types) rather than events.
 * Display-layer only.
 */

import useGamificationStore from '../store/gamificationStore.js'

export default function AnalogyToggle({ label = 'Silly analogies' }) {
  const analogyOn = useGamificationStore((state) => state.modes.analogy)
  const toggleMode = useGamificationStore((state) => state.toggleMode)

  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <input
        type="checkbox"
        checked={analogyOn}
        onChange={() => toggleMode('analogy')}
        aria-label={label}
        style={{ cursor: 'pointer' }}
      />
      <span aria-hidden="true">🥸</span>
      {label}
    </label>
  )
}
