/**
 * NarratorToggle — switches a tool's copy into first-person CPU voice.
 * Display-layer only: flips a boolean in gamificationStore that
 * useNarratorLine() reads.
 */

import useGamificationStore from '../store/gamificationStore.js'

export default function NarratorToggle({ label = "CPU's-eye view" }) {
  const narratorOn = useGamificationStore((state) => state.modes.narrator)
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
        checked={narratorOn}
        onChange={() => toggleMode('narrator')}
        aria-label={label}
        style={{ cursor: 'pointer' }}
      />
      <span aria-hidden="true">🎙️</span>
      {label}
    </label>
  )
}
