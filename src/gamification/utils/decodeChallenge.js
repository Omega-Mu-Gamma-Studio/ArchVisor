/**
 * Reverse of encodeChallenge.js — decodes and validates a `?challenge=`
 * string. Never throws: returns `null` on any malformed input so callers
 * can gracefully fall back to the tool's default state.
 */

const CHALLENGE_VERSION = 1

function fromBase64Url(b64url) {
  const padded = b64url.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const b64 = padded + pad
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return decodeURIComponent(escape(window.atob(b64)))
  }
  const nodeBuffer = globalThis.Buffer
  return nodeBuffer.from(b64, 'base64').toString('utf-8')
}

/**
 * @param {string} encoded - the raw string from the `challenge` query param
 * @param {object} [options]
 * @param {string} [options.expectedToolId] - if provided, mismatches return null
 * @returns {{ toolId: string, scenario: object } | null}
 */
export function decodeChallenge(encoded, { expectedToolId } = {}) {
  if (!encoded || typeof encoded !== 'string') return null

  let json
  try {
    json = fromBase64Url(encoded)
  } catch {
    return null
  }

  let payload
  try {
    payload = JSON.parse(json)
  } catch {
    return null
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    payload.v !== CHALLENGE_VERSION ||
    typeof payload.toolId !== 'string' ||
    typeof payload.scenario !== 'object' ||
    payload.scenario === null
  ) {
    return null
  }

  if (expectedToolId && payload.toolId !== expectedToolId) return null

  return { toolId: payload.toolId, scenario: payload.scenario }
}

/**
 * Reads `window.location.search` for a `challenge` param and decodes it.
 * Returns `null` if absent or malformed — callers should treat that as
 * "use default state".
 */
export function readChallengeFromLocation({ expectedToolId } = {}) {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('challenge')
  if (!raw) return null
  return decodeChallenge(raw, { expectedToolId })
}
