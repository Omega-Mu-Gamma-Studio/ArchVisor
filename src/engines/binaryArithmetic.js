/**
 * Binary Arithmetic Engine
 *
 * Performs binary addition or subtraction on two signed integers
 * and captures each column's carry/sum state for step-by-step animation.
 */

/**
 * @param {number} a - First operand (signed integer)
 * @param {number} b - Second operand (signed integer)
 * @param {'add'|'sub'} operation
 * @param {number} bits - Bit width (default 8)
 * @returns {{
 *   steps: Array<{ colIndex, abit, bbit, carry_in, sum_bit, carry_out }>,
 *   result: number,
 *   overflow: boolean,
 *   binaryA: string,
 *   binaryB: string,
 *   binaryResult: string,
 *   twosCompB: string | null
 * }}
 */
export function binaryArithmetic(a, b, operation = 'add', bits = 8) {
  // Convert to unsigned for bit manipulation
  const mask = (1 << bits) - 1
  let aUnsigned = a < 0 ? (a + (1 << bits)) & mask : a & mask
  let bUnsigned = b < 0 ? (b + (1 << bits)) & mask : b & mask

  let twosCompB = null
  let bOperand = bUnsigned

  if (operation === 'sub') {
    // Compute 2's complement of b: invert bits and add 1
    const inverted = (~bUnsigned) & mask
    bOperand = (inverted + 1) & mask
    twosCompB = bOperand.toString(2).padStart(bits, '0')
  }

  const binA = aUnsigned.toString(2).padStart(bits, '0')
  const binB = bOperand.toString(2).padStart(bits, '0')

  const steps = []
  let carry = 0
  let resultBits = ''

  // Process from LSB (rightmost) to MSB (leftmost)
  for (let i = bits - 1; i >= 0; i--) {
    const colIndex = bits - 1 - i  // 0 = LSB column
    const abit = parseInt(binA[i])
    const bbit = parseInt(binB[i])
    const sum = abit + bbit + carry
    const sumBit = sum & 1
    const carryOut = sum >> 1

    steps.push({
      colIndex,
      abit,
      bbit,
      carry_in: carry,
      sum_bit: sumBit,
      carry_out: carryOut,
    })

    resultBits = sumBit.toString() + resultBits
    carry = carryOut
  }

  const result = parseInt(resultBits, 2)
  // Determine signed result value
  const signBit = 1 << (bits - 1)
  const signedResult = result & signBit ? result - (1 << bits) : result

  // Overflow: if both inputs have same sign and result has different sign
  const aSign = (aUnsigned & signBit) !== 0
  const bSign = (bOperand & signBit) !== 0
  const rSign = (result & signBit) !== 0
  const overflow = operation === 'add'
    ? (aSign === bSign && aSign !== rSign)
    : (aSign !== bSign && aSign !== rSign)

  return {
    steps,
    result: signedResult,
    overflow,
    binaryA: binA,
    binaryB: binB,
    binaryResult: resultBits,
    twosCompB: operation === 'sub' ? twosCompB : null,
  }
}
