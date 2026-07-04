/**
 * Restoring Division Engine
 *
 * Implements the restoring division algorithm with step capture.
 */

/**
 * @param {number} dividend
 * @param {number} divisor
 * @param {number} bits - Bit width (default 8)
 * @returns {{
 *   steps: Array<{
 *     iteration: number,
 *     partialRemainder: string,
 *     subtractResult: string,
 *     restored: boolean,
 *     quotientBit: 0 | 1,
 *     A: string,
 *     Q: string
 *   }>,
 *   quotient: number,
 *   remainder: number
 * }}
 */
export function restoringDivide(dividend, divisor, bits = 8) {
  const mask = (1 << bits) - 1
  const signBit = 1 << (bits - 1)

  // Convert to unsigned 2's complement if negative
  const A_init = 0
  let Q = dividend < 0 ? (dividend + (1 << bits)) & mask : dividend & mask
  let M = divisor < 0 ? (divisor + (1 << bits)) & mask : divisor & mask
  let A = A_init

  // 2's complement of M (for subtraction)
  const negM = ((~M) + 1) & mask

  const steps = []

  for (let i = 0; i < bits; i++) {
    // 1. Shift left A and Q
    A = ((A << 1) | ((Q & signBit) >> (bits - 1))) & mask
    Q = (Q << 1) & mask

    const beforeSubtractA = A.toString(2).padStart(bits, '0')
    const beforeSubtractQ = Q.toString(2).padStart(bits, '0')

    // 2. Subtract M from A
    const A_minus_M = (A + negM) & mask

    const subtractResultStr = A_minus_M.toString(2).padStart(bits, '0')

    let restored = false
    let quotientBit = 0

    // 3. Check sign of result
    if ((A_minus_M & signBit) === 0) {
      // Result is non-negative: set quotient bit to 1
      A = A_minus_M
      Q = Q | 1
      quotientBit = 1
      restored = false
    } else {
      // Result is negative: restore A (add M back), set quotient bit to 0
      A = (A_minus_M + M) & mask
      quotientBit = 0
      restored = true
    }

    steps.push({
      iteration: i,
      partialRemainder: beforeSubtractA,
      subtractResult: subtractResultStr,
      restored,
      quotientBit,
      A: A.toString(2).padStart(bits, '0'),
      Q: Q.toString(2).padStart(bits, '0'),
    })
  }

  // After all iterations: quotient is in Q (lower bits), remainder is in A (upper bits)
  const quotient = Q & mask
  const remainder = A & mask

  // Determine sign of results
  const quotientSigned = quotient & signBit ? quotient - (1 << bits) : quotient
  const remainderSigned = remainder & signBit ? remainder - (1 << bits) : remainder

  return {
    steps,
    quotient: quotientSigned,
    remainder: remainderSigned,
  }
}
