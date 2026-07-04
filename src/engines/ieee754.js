/**
 * IEEE 754 Engine
 *
 * Pure functions for IEEE 754 single-precision conversion
 * and floating-point addition/subtraction with step capture.
 */

const BIAS = 127
const TOTAL_BITS = 32
const EXP_BITS = 8
const MANT_BITS = 23

/**
 * Converts a decimal number to IEEE 754 single-precision representation.
 * @param {number} value
 * @returns {{
 *   sign: 0 | 1,
 *   biasedExponent: number,
 *   mantissa: string,
 *   bits: string,
 *   steps: Array<{label: string, detail: string}>
 * }}
 */
export function toIEEE754(value) {
  const steps = []

  // Handle zero
  if (value === 0) {
    steps.push({ label: 'Zero Detection', detail: 'Value is zero. IEEE 754 representation is all zeros.' })
    return {
      sign: 0,
      biasedExponent: 0,
      mantissa: '0'.repeat(MANT_BITS),
      bits: '0'.repeat(TOTAL_BITS),
      steps,
    }
  }

  // Sign
  const sign = value < 0 ? 1 : 0
  steps.push({ label: 'Sign Detection', detail: `Value is ${value < 0 ? 'negative' : 'positive or zero'} → sign bit = ${sign}` })

  const absVal = Math.abs(value)

  // Normalized form: 1.mantissa × 2^exponent
  let exponent = Math.floor(Math.log2(absVal))
  let mantissaVal = absVal / Math.pow(2, exponent)

  steps.push({ label: 'Normalization', detail: `${absVal} = ${mantissaVal.toFixed(6)} × 2^${exponent}` })

  // Biased exponent
  const biasedExp = exponent + BIAS
  const expBits = biasedExp.toString(2).padStart(EXP_BITS, '0')
  steps.push({ label: 'Biased Exponent', detail: `Exponent ${exponent} + bias ${BIAS} = ${biasedExp} → ${expBits}` })

  // Mantissa: keep only fractional part (23 bits)
  let mantissaFrac = mantissaVal - 1  // remove leading 1
  let mantissaBits = ''
  for (let i = 0; i < MANT_BITS; i++) {
    mantissaFrac *= 2
    const bit = Math.floor(mantissaFrac)
    mantissaBits += bit
    mantissaFrac -= bit
  }

  steps.push({ label: 'Mantissa Extraction', detail: `Fractional part of 1.${mantissaBits}... → ${mantissaBits} (23 bits)` })

  const bits = `${sign}${expBits}${mantissaBits}`
  steps.push({ label: 'Assemble', detail: `Full 32-bit: ${bits}` })

  return {
    sign,
    biasedExponent: biasedExp,
    mantissa: mantissaBits,
    bits,
    steps,
  }
}

/**
 * Performs IEEE 754 floating-point addition or subtraction with step capture.
 * @param {number} a
 * @param {number} b
 * @param {'add'|'sub'} op
 * @returns {{
 *   steps: Array<{
 *     phase: string,
 *     label: string,
 *     detail: string,
 *     mantissaA?: string,
 *     mantissaB?: string,
 *     exponent?: number
 *   }>,
 *   result: number,
 *   resultBits: string
 * }}
 */
export function ieee754Operation(a, b, op = 'add') {
  const steps = []

  // Convert to IEEE 754 components
  const aBits = toIEEE754(a)
  const bBits = toIEEE754(b)

  const extractComponents = (val) => {
    if (val === 0) return { sign: 0, exponent: -BIAS, mantissa: 0, normalized: false }
    const sign = val < 0 ? 1 : 0
    const abs = Math.abs(val)
    const exponent = Math.floor(Math.log2(abs))
    const mantissa = abs / Math.pow(2, exponent) - 1
    return { sign, exponent, mantissa, normalized: true }
  }

  let compA = extractComponents(a)
  let compB = extractComponents(b)

  // For subtraction, flip sign of b
  if (op === 'sub') {
    compB.sign = compB.sign === 0 ? 1 : 0
  }

  // Phase 1: Exponent Alignment
  steps.push({
    phase: 'align',
    label: 'Exponent Alignment',
    detail: `Exponent A = ${compA.exponent}, Exponent B = ${compB.exponent}`,
    mantissaA: (1 + compA.mantissa).toString(2),
    mantissaB: (1 + compB.mantissa).toString(2),
    exponent: compA.exponent,
  })

  let alignedA = { ...compA }
  let alignedB = { ...compB }

  // Align smaller exponent to larger one
  if (compA.exponent > compB.exponent) {
    const diff = compA.exponent - compB.exponent
    alignedB.mantissa = (1 + compB.mantissa) / Math.pow(2, diff)
    alignedB.exponent = compA.exponent
    steps.push({
      phase: 'align',
      label: 'Shift B Right',
      detail: `Shift B mantissa right by ${diff} bits → ${alignedB.mantissa.toString(2)}`,
      mantissaA: (1 + compA.mantissa).toString(2),
      mantissaB: alignedB.mantissa.toString(2),
      exponent: compA.exponent,
    })
  } else if (compB.exponent > compA.exponent) {
    const diff = compB.exponent - compA.exponent
    alignedA.mantissa = (1 + compA.mantissa) / Math.pow(2, diff)
    alignedA.exponent = compB.exponent
    steps.push({
      phase: 'align',
      label: 'Shift A Right',
      detail: `Shift A mantissa right by ${diff} bits → ${alignedA.mantissa.toString(2)}`,
      mantissaA: alignedA.mantissa.toString(2),
      mantissaB: (1 + compB.mantissa).toString(2),
      exponent: compB.exponent,
    })
  } else {
    steps.push({
      phase: 'align',
      label: 'Exponents Already Equal',
      detail: 'Both operands have the same exponent — alignment not needed.',
      mantissaA: (1 + compA.mantissa).toString(2),
      mantissaB: (1 + compB.mantissa).toString(2),
      exponent: compA.exponent,
    })
  }

  // Phase 2: Mantissa Operation
  const mantissaA_val = alignedA.normalized ? 1 + compA.mantissa : 0
  const mantissaB_val = alignedB.normalized ? 1 + compB.mantissa : 0

  const alignedMantA = compA.exponent >= compB.exponent
    ? mantissaA_val
    : mantissaA_val / Math.pow(2, compB.exponent - compA.exponent)
  const alignedMantB = compB.exponent >= compA.exponent
    ? mantissaB_val
    : mantissaB_val / Math.pow(2, compA.exponent - compB.exponent)

  // Use the larger exponent
  const commonExp = Math.max(compA.exponent, compB.exponent)

  // Operate mantissas with signs
  let resultMantissa
  const aSigned = compA.sign === 0 ? alignedMantA : -alignedMantA
  const bSigned = compB.sign === 0 ? alignedMantB : -alignedMantB
  resultMantissa = aSigned + bSigned
  let resultSign = resultMantissa < 0 ? 1 : 0
  resultMantissa = Math.abs(resultMantissa)
  let resultExponent = commonExp

  steps.push({
    phase: 'operate',
    label: op === 'add' ? 'Mantissa Addition' : 'Mantissa Subtraction',
    detail: `Mantissa = (${aSigned.toFixed(4)}) + (${bSigned.toFixed(4)}) = ${resultMantissa.toFixed(4)}`,
  })

  // Phase 3: Normalization
  if (resultMantissa === 0) {
    steps.push({
      phase: 'normalize',
      label: 'Zero Result',
      detail: 'Result is zero.',
    })
    return {
      steps,
      result: 0,
      resultBits: '0'.repeat(TOTAL_BITS),
    }
  }

  // While mantissa >= 2, shift right
  while (resultMantissa >= 2) {
    resultMantissa /= 2
    resultExponent++
  }
  // While mantissa < 1 and > 0, shift left
  while (resultMantissa < 1 && resultMantissa > 0) {
    resultMantissa *= 2
    resultExponent--
  }

  // Remove leading 1 for IEEE 754 mantissa
  const fracMantissa = resultMantissa - 1

  steps.push({
    phase: 'normalize',
    label: 'Normalization',
    detail: `Result: 1.${fracMantissa.toString(2).slice(2)} × 2^${resultExponent}`,
  })

  // Phase 4: Rounding (truncation — simplest form)
  let mantissaBits = ''
  let frac = fracMantissa
  for (let i = 0; i < MANT_BITS; i++) {
    frac *= 2
    const bit = Math.floor(frac)
    mantissaBits += bit
    frac -= bit
  }

  steps.push({
    phase: 'round',
    label: 'Rounding (Truncation)',
    detail: `Mantissa bits: ${mantissaBits} (23 bits, truncated)`,
  })

  // Assemble
  const biasedExp = resultExponent + BIAS
  const expBits = biasedExp.toString(2).padStart(EXP_BITS, '0')
  const resultBits = `${resultSign}${expBits}${mantissaBits}`

  // Compute actual float value
  const floatVal = resultSign === 0 ? 1 : -1 * Math.pow(2, resultExponent) * (1 + fracMantissa)

  steps.push({
    phase: 'round',
    label: 'Final Result',
    detail: `${resultBits} = ${floatVal.toFixed(6)}`,
  })

  return {
    steps,
    result: floatVal,
    resultBits,
  }
}
