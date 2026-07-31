/**
 * ChallengeShareCard — generates/consumes shareable challenge links.
 *
 * Props:
 *   toolId: string
 *   scenario: object — the current scenario/input state to share
 */

import { useState, useCallback } from 'react'
import { buildChallengeUrl } from '../utils/encodeChallenge.js'

export default function ChallengeShareCard({ toolId, scenario }) {
  const [copied, setCopied] = useState(false)
  const url = buildChallengeUrl(toolId, scenario)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — fall back to manual selection via the visible input.
    }
  }, [url])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 10,
        background: 'rgba(0,0,0,0.04)',
        fontSize: 13,
      }}
    >
      <span aria-hidden="true">🔗</span>
      <input
        type="text"
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        aria-label="Shareable challenge link"
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          fontSize: 12,
          color: 'inherit',
        }}
      />
      <button
        onClick={handleCopy}
        style={{
          padding: '5px 12px',
          borderRadius: 8,
          border: 'none',
          background: copied ? '#16a34a' : '#111',
          color: '#fff',
          cursor: 'pointer',
          fontSize: 12,
          whiteSpace: 'nowrap',
        }}
      >
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}
