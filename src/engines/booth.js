/**
 * Booth's Multiplication Engine
 *
 * Implements Booth's multiplication algorithm with step capture
 * for iteration-by-iteration visualization.
 */

/**
 * @param {number} multiplicand - M
 * @param {number} multiplier - Q
 * @param {number} bits - Bit width (default 8)
 * @returns {{
 *   steps: Array<{
 *     iteration: number,
 *     Q0: number,
 *     Q_1: number,
 *     operation: string,
 *     A: string,
 *     Q: string,
 *     Q_minus1: number,
 *     afterShift: { A: string, Q: string, Q_minus1: number }
 *   }>,
 *   product: number,
 *   binaryProduct: string
 * }}
 */
export function boothMultiply(multiplicand, multiplier, bits = 8) {
  const mask = (1 << bits) - 1
  const signBit = 1 << (bits - 1)

  // Convert negative numbers to 2's complement
  let M = multiplicand < 0 ? (multiplicand + (1 << bits)) & mask : multiplicand & mask
  let Q = multiplier < 0 ? (multiplier + (1 << bits)) & mask : multiplier & mask

  // 2's complement of M (for A - M operation)
  const negM = ((~M) + 1) & mask

  // Accumulator A starts at 0
  let A = 0
  let Q_1 = 0

  const steps = []

  for (let i = 0; i < bits; i++) {
    const Q0 = Q & 1

    let operation = 'No operation'
    let operationDone = false

    if (Q0 === 1 && Q_1 === 0) {
      // A = A - M
      operation = 'A = A - M'
      A = (A + negM) & mask
      operationDone = true
    } else if (Q0 === 0 && Q_1 === 1) {
      // A = A + M
      operation = 'A = A + M'
      A = (A + M) & mask
      operationDone = true
    }

    // Capture state before arithmetic shift
    const beforeShiftA = A.toString(2).padStart(bits, '0')
    const beforeShiftQ = Q.toString(2).padStart(bits, '0')

    // Arithmetic right shift (A | Q | Q_1)
    // Preserve sign bit of A
    const aSign = A & signBit ? 1 : 0
    const newA = (aSign * signBit) | (A >> 1)
    const newQ = ((A & 1) * signBit) | (Q >> 1)
    const newQ_1 = Q & 1

    steps.push({
      iteration: i,
      Q0,
      Q_1,
      operation,
      A: beforeShiftA,
      Q: beforeShiftQ,
      Q_minus1: Q_1,
      afterShift: {
        A: newA.toString(2).padStart(bits, '0'),
        Q: newQ.toString(2).padStart(bits, '0'),
        Q_minus1: newQ_1,
      },
    })

    A = newA
    Q = newQ
    Q_1 = newQ_1
  }

  // Final product: A concatenated with Q
  const productBits = A.toString(2).padStart(bits, '0') + Q.toString(2).padStart(bits, '0')
  const productInt = (A << bits) | Q

  // Sign-extend to determine actual product value
  const extendedBits = bits * 2
  const extendedSign = 1 << (extendedBits - 1)
  const product = productInt & extendedSign ? productInt - (1 << extendedBits) : productInt

  return {
    steps,
    product,
    binaryProduct: productBits,
  }
}
