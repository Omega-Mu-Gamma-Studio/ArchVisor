/**
 * Serialize a tool scenario (instruction sequence, cache config, etc.)
 * into a compact, URL-safe string suitable for a `?challenge=` query param.
 *
 * Format: base64url( JSON.stringify({ v, toolId, scenario }) )
 * `v` is a small version tag so decodeChallenge can reject stale/incompatible
 * payloads gracefully instead of throwing.
 */

const CHALLENGE_VERSION = 1

function toBase64Url(str) {
  const nodeBuffer = globalThis.Buffer
  const b64 =
    typeof window !== 'undefined' && typeof window.btoa === 'function'
      ? window.btoa(unescape(encodeURIComponent(str)))
      : nodeBuffer.from(str, 'utf-8').toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * @param {string} toolId - existing tool id (matches routing/navigationStore ids)
 * @param {object} scenario - plain JSON-serializable scenario payload
 * @returns {string} URL-safe encoded challenge string
 */
export function encodeChallenge(toolId, scenario) {
  const payload = { v: CHALLENGE_VERSION, toolId, scenario }
  return toBase64Url(JSON.stringify(payload))
}

/**
 * Convenience helper: builds a full shareable URL given the current origin/path.
 */
export function buildChallengeUrl(toolId, scenario, { origin, pathname } = {}) {
  const base =
    (origin ?? (typeof window !== 'undefined' ? window.location.origin : '')) +
    (pathname ?? (typeof window !== 'undefined' ? window.location.pathname : ''))
  const encoded = encodeChallenge(toolId, scenario)
  const separator = base.includes('?') ? '&' : '?'
  return `${base}${separator}challenge=${encoded}`
}
