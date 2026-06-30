/**
 * MIPS Interpreter Engine
 *
 * Pure functions for MIPS register state management,
 * instruction execution, encoding, and decoding.
 *
 * Supported: add, sub, and, or, nor, slt, addi, andi, ori,
 *            lw, sw, beq, bne, j, jr, jal
 */

const REGISTER_NAMES = [
  'zero','at','v0','v1','a0','a1','a2','a3',
  't0','t1','t2','t3','t8','t9','k0','k1',
  'gp','sp','fp','ra','s0','s1','s2','s3',
  's4','s5','s6','s7','t4','t5','t6','t7',
]

const REG_ABI = {
  '$zero':'$zero', '$0':'$zero',
  '$at':'$at',     '$1':'$at',
  '$v0':'$v0',     '$2':'$v0',  '$v1':'$v1',     '$3':'$v1',
  '$a0':'$a0',     '$4':'$a0',  '$a1':'$a1',     '$5':'$a1',
  '$a2':'$a2',     '$6':'$a2',  '$a3':'$a3',     '$7':'$a3',
  '$t0':'$t0',     '$8':'$t0',  '$t1':'$t1',     '$9':'$t1',
  '$t2':'$t2',     '$10':'$t2', '$t3':'$t3',     '$11':'$t3',
  '$t4':'$t4',     '$12':'$t4', '$t5':'$t5',     '$13':'$t5',
  '$t6':'$t6',     '$14':'$t6', '$t7':'$t7',     '$15':'$t7',
  '$s0':'$s0',     '$16':'$s0', '$s1':'$s1',     '$17':'$s1',
  '$s2':'$s2',     '$18':'$s2', '$s3':'$s3',     '$19':'$s3',
  '$s4':'$s4',     '$20':'$s4', '$s5':'$s5',     '$21':'$s5',
  '$s6':'$s6',     '$22':'$s6', '$s7':'$s7',     '$23':'$s7',
  '$t8':'$t8',     '$24':'$t8', '$t9':'$t9',     '$25':'$t9',
  '$k0':'$k0',     '$26':'$k0', '$k1':'$k1',     '$27':'$k1',
  '$gp':'$gp',     '$28':'$gp', '$sp':'$sp',     '$29':'$sp',
  '$fp':'$fp',     '$30':'$fp', '$ra':'$ra',     '$31':'$ra',
}

const REG_TO_INDEX = {}
for (let i = 0; i < 32; i++) {
  REG_TO_INDEX[`$${i}`] = i
  REG_TO_INDEX[`$${REGISTER_NAMES[i]}`] = i
}

function resolveReg(name) {
  const abi = REG_ABI[name]
  if (abi !== undefined) {
    const idx = REG_TO_INDEX[abi]
    if (idx !== undefined) return idx
  }
  const idx = REG_TO_INDEX[name]
  if (idx !== undefined) return idx
  return -1
}

function signed(val, bits = 32) {
  const sign = 1 << (bits - 1)
  return val & sign ? val - (1 << bits) : val
}

/**
 * Initialises a fresh MIPS register file.
 * @returns {{ registers: Record<string, number>, pc: number, memory: object }}
 */
export function initState() {
  const registers = {}
  for (let i = 0; i < 32; i++) {
    registers[`$${i}`] = 0
  }
  registers['$zero'] = 0
  registers['$0'] = 0
  return { registers, pc: 0, memory: {} }
}

/**
 * Parses a MIPS assembly instruction line.
 * Returns { op, args: string[] } or null on failure.
 */
function parseInstruction(line) {
  line = line.trim().replace(/#.*$/, '').trim()
  if (!line) return null

  // Handle labels like "loop:" optionally
  const labelMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*):/)
  if (labelMatch) {
    line = line.slice(labelMatch[0].length).trim()
  }

  const parts = line.split(/[\s,]+/).filter(Boolean)
  if (parts.length === 0) return null

  const op = parts[0].toLowerCase()
  const args = parts.slice(1)
  return { op, args }
}

/**
 * Executes a single MIPS assembly instruction.
 * @param {string} instruction
 * @param {{ registers: object, pc: number, memory: object }} state
 * @returns {{ newState: object, log: string, error: string | null }}
 */
export function executeInstruction(instruction, state) {
  const parsed = parseInstruction(instruction)
  if (!parsed) {
    return { newState: state, log: '', error: 'Could not parse instruction' }
  }

  const { op, args } = parsed
  const newState = {
    registers: { ...state.registers },
    pc: state.pc,
    memory: { ...state.memory },
  }

  const r = (name) => {
    const idx = resolveReg(name)
    if (idx === -1) return 0
    return newState.registers[`$${idx}`]
  }
  const setR = (name, val) => {
    const idx = resolveReg(name)
    if (idx === -1) return
    if (idx === 0) return // $zero is read-only
    newState.registers[`$${idx}`] = val >>> 0 // keep as unsigned
  }

  const wordAt = (addr) => newState.memory[addr] || 0
  const setWord = (addr, val) => { newState.memory[addr] = val >>> 0 }

  let log = ''
  let error = null

  try {
    switch (op) {
      // ── R-type ──────────────────────────────────────
      case 'add': {
        const rd = args[0], rs = args[1], rt = args[2]
        const val = (r(rs) + r(rt)) >>> 0
        setR(rd, val)
        log = `${rd} = ${r(rs)} + ${r(rt)} = ${val}`
        newState.pc++
        break
      }
      case 'sub': {
        const rd = args[0], rs = args[1], rt = args[2]
        const val = (r(rs) - r(rt)) >>> 0
        setR(rd, val)
        log = `${rd} = ${r(rs)} - ${r(rt)} = ${val}`
        newState.pc++
        break
      }
      case 'and': {
        const rd = args[0], rs = args[1], rt = args[2]
        const val = (r(rs) & r(rt)) >>> 0
        setR(rd, val)
        log = `${rd} = ${r(rs)} & ${r(rt)} = ${val}`
        newState.pc++
        break
      }
      case 'or': {
        const rd = args[0], rs = args[1], rt = args[2]
        const val = (r(rs) | r(rt)) >>> 0
        setR(rd, val)
        log = `${rd} = ${r(rs)} | ${r(rt)} = ${val}`
        newState.pc++
        break
      }
      case 'nor': {
        const rd = args[0], rs = args[1], rt = args[2]
        const val = (~(r(rs) | r(rt))) >>> 0
        setR(rd, val)
        log = `${rd} = NOR(${r(rs)}, ${r(rt)}) = ${val}`
        newState.pc++
        break
      }
      case 'slt': {
        const rd = args[0], rs = args[1], rt = args[2]
        const aSigned = signed(r(rs))
        const bSigned = signed(r(rt))
        const val = aSigned < bSigned ? 1 : 0
        setR(rd, val)
        log = `${rd} = (${aSigned} < ${bSigned}) ? 1 : 0 = ${val}`
        newState.pc++
        break
      }

      // ── I-type ──────────────────────────────────────
      case 'addi': {
        const rt = args[0], rs = args[1], imm = parseInt(args[2])
        if (isNaN(imm)) { error = `Invalid immediate: ${args[2]}`; break }
        const val = (r(rs) + imm) >>> 0
        setR(rt, val)
        log = `${rt} = ${r(rs)} + ${imm} = ${val}`
        newState.pc++
        break
      }
      case 'andi': {
        const rt = args[0], rs = args[1], imm = parseInt(args[2])
        if (isNaN(imm)) { error = `Invalid immediate: ${args[2]}`; break }
        const val = (r(rs) & imm) >>> 0
        setR(rt, val)
        log = `${rt} = ${r(rs)} & ${imm} = ${val}`
        newState.pc++
        break
      }
      case 'ori': {
        const rt = args[0], rs = args[1], imm = parseInt(args[2])
        if (isNaN(imm)) { error = `Invalid immediate: ${args[2]}`; break }
        const val = (r(rs) | imm) >>> 0
        setR(rt, val)
        log = `${rt} = ${r(rs)} | ${imm} = ${val}`
        newState.pc++
        break
      }

      // ── Memory ──────────────────────────────────────
      case 'lw': {
        // lw $rt, offset($rs)
        const rt = args[0]
        const memArg = args.slice(1).join(' ')
        const memMatch = memArg.match(/(-?\d+)\((\$\S+)\)/)
        if (!memMatch) { error = `Invalid lw format: ${memArg}`; break }
        const offset = parseInt(memMatch[1])
        const baseReg = memMatch[2]
        const addr = r(baseReg) + offset
        const val = wordAt(addr)
        setR(rt, val)
        log = `${rt} = MEM[${r(baseReg)} + ${offset}] = MEM[${addr}] = ${val}`
        newState.pc++
        break
      }
      case 'sw': {
        const rt = args[0]
        const memArg = args.slice(1).join(' ')
        const memMatch = memArg.match(/(-?\d+)\((\$\S+)\)/)
        if (!memMatch) { error = `Invalid sw format: ${memArg}`; break }
        const offset = parseInt(memMatch[1])
        const baseReg = memMatch[2]
        const addr = r(baseReg) + offset
        setWord(addr, r(rt))
        log = `MEM[${r(baseReg)} + ${offset}] = MEM[${addr}] = ${r(rt)}`
        newState.pc++
        break
      }

      // ── Branches ────────────────────────────────────
      case 'beq': {
        const rs = args[0], rt = args[1], labelStr = args[2]
        const offset = parseInt(labelStr)
        const taken = r(rs) === r(rt)
        if (taken) {
          newState.pc += isNaN(offset) ? 0 : offset
        } else {
          newState.pc++
        }
        log = `${rs} (${r(rs)}) == ${rt} (${r(rt)}) → ${taken ? 'taken' : 'not taken'} (${isNaN(offset) ? `label: ${labelStr}` : `offset: ${offset}`})`
        break
      }
      case 'bne': {
        const rs2 = args[0], rt2 = args[1], labelStr2 = args[2]
        const offset2 = parseInt(labelStr2)
        const taken2 = r(rs2) !== r(rt2)
        if (taken2) {
          newState.pc += isNaN(offset2) ? 0 : offset2
        } else {
          newState.pc++
        }
        log = `${rs2} (${r(rs2)}) != ${rt2} (${r(rt2)}) → ${taken2 ? 'taken' : 'not taken'} (${isNaN(offset2) ? `label: ${labelStr2}` : `offset: ${offset2}`})`
        break
      }

      // ── Jumps ───────────────────────────────────────
      case 'j': {
        const target = parseInt(args[0])
        if (!isNaN(target)) {
          newState.pc = target
        } else {
          // label — treat as offset for simplicity
          newState.pc += target || 0
        }
        log = `jump to ${args[0]}`
        break
      }
      case 'jr': {
        const reg = args[0]
        newState.pc = r(reg)
        log = `jump to ${reg} = ${r(reg)}`
        break
      }
      case 'jal': {
        const returnAddr = newState.pc + 1
        setR('$ra', returnAddr)
        const target2 = parseInt(args[0])
        if (!isNaN(target2)) {
          newState.pc = target2
        } else {
          newState.pc += target2 || 0
        }
        log = `$ra = ${returnAddr}, jump to ${args[0]}`
        break
      }

      default:
        error = `Unsupported instruction: ${op}`
    }
  } catch (e) {
    error = `Execution error: ${e.message}`
  }

  return { newState, log: error ? '' : log, error }
}

// ── Encoding / Decoding Helpers ──────────────────────────────

const OPCODES = {
  'R': 0b000000,
  'j': 0b000010, 'jal': 0b000011,
  'beq': 0b000100, 'bne': 0b000101,
  'addi': 0b001000, 'andi': 0b001100, 'ori': 0b001101,
  'lw': 0b100011, 'sw': 0b101011,
}

const FUNCT = {
  'add': 0b100000, 'sub': 0b100010,
  'and': 0b100100, 'or': 0b100101, 'nor': 0b100111,
  'slt': 0b101010, 'jr': 0b001000,
}

const OPCODE_TO_INSTR = {}
for (const [k, v] of Object.entries(OPCODES)) {
  if (k !== 'R') OPCODE_TO_INSTR[v] = k
}

const FUNCT_TO_INSTR = {}
for (const [k, v] of Object.entries(FUNCT)) {
  FUNCT_TO_INSTR[v] = k
}

function padBin(val, bits) {
  return val.toString(2).padStart(bits, '0')
}

/**
 * Encodes a MIPS assembly instruction to 32-bit binary string.
 * @param {string} instruction
 * @returns {{ format: string, fields: object, binary: string, hex: string, error: string | null }}
 */
export function encodeInstruction(instruction) {
  const parsed = parseInstruction(instruction)
  if (!parsed) {
    return { format: '', fields: {}, binary: '', hex: '', error: 'Could not parse instruction' }
  }

  const { op, args } = parsed
  const regIdx = (name) => {
    const idx = resolveReg(name)
    if (idx === -1) return 0
    return idx
  }

  let format = ''
  let fields = {}
  let binary = ''
  let error = null

  try {
    if (FUNCT[op] !== undefined) {
      // R-type
      format = 'R'
      const rd = regIdx(args[0])
      const rs = regIdx(args[1])
      const rt = regIdx(args[2])
      const shamt = 0
      const funct = FUNCT[op]

      fields = {
        opcode: padBin(0, 6),
        rs: padBin(rs, 5),
        rt: padBin(rt, 5),
        rd: padBin(rd, 5),
        shamt: padBin(shamt, 5),
        funct: padBin(funct, 6),
      }
      binary = fields.opcode + fields.rs + fields.rt + fields.rd + fields.shamt + fields.funct
    } else if (op === 'jr') {
      format = 'R'
      const rs = regIdx(args[0])
      fields = {
        opcode: padBin(0, 6),
        rs: padBin(rs, 5),
        rt: padBin(0, 5),
        rd: padBin(0, 5),
        shamt: padBin(0, 5),
        funct: padBin(FUNCT['jr'], 6),
      }
      binary = fields.opcode + fields.rs + fields.rt + fields.rd + fields.shamt + fields.funct
    } else if (op === 'j' || op === 'jal') {
      // J-type
      format = 'J'
      const target = parseInt(args[0]) || 0
      fields = {
        opcode: padBin(OPCODES[op], 6),
        target: padBin(target & 0x3FFFFFF, 26),
      }
      binary = fields.opcode + fields.target
    } else if (OPCODES[op] !== undefined) {
      // I-type
      format = 'I'
      const rt = regIdx(args[0])
      const rs = regIdx(args[1])

      let immediate = 0
      if (op === 'lw' || op === 'sw') {
        // lw/sw $rt, offset($rs)
        const memArg = args.slice(1).join(' ')
        const memMatch = memArg.match(/(-?\d+)\((\$\S+)\)/)
        if (memMatch) {
          fields.rsParsed = memMatch[2]
          immediate = parseInt(memMatch[1])
        }
      } else {
        immediate = parseInt(args[2]) || 0
      }

      // Recompute rs for lw/sw
      let actualRs = rs
      if (op === 'lw' || op === 'sw') {
        const memArg2 = args.slice(1).join(' ')
        const memMatch2 = memArg2.match(/(-?\d+)\((\$\S+)\)/)
        if (memMatch2) {
          actualRs = regIdx(memMatch2[2])
        }
      }

      fields = {
        opcode: padBin(OPCODES[op], 6),
        rs: padBin(actualRs, 5),
        rt: padBin(rt, 5),
        immediate: padBin(immediate & 0xFFFF, 16),
      }
      binary = fields.opcode + fields.rs + fields.rt + fields.immediate
    } else {
      error = `Unsupported instruction: ${op}`
    }
  } catch (e) {
    error = `Encoding error: ${e.message}`
  }

  const hex = binary ? parseInt(binary, 2).toString(16).toUpperCase().padStart(8, '0') : ''
  return { format, fields, binary, hex, error }
}

/**
 * Decodes a 32-bit binary or hex string to a MIPS assembly instruction.
 * @param {string} bits
 * @returns {{ format: string, fields: object, assembly: string, error: string | null }}
 */
export function decodeInstruction(bits) {
  let clean = bits.replace(/\s/g, '').toUpperCase()

  // If it's hex (0x prefix or 8-char hex), convert to binary
  if (clean.startsWith('0X')) clean = clean.slice(2)
  if (/^[0-9A-F]+$/.test(clean) && clean.length <= 8 && !/^[01]+$/.test(clean)) {
    clean = parseInt(clean, 16).toString(2).padStart(32, '0')
  }

  if (clean.length !== 32 || !/^[01]+$/.test(clean)) {
    return { format: '', fields: {}, assembly: '', error: 'Input must be a 32-bit binary string or 8-char hex string' }
  }

  const b = (start, len) => parseInt(clean.slice(start, start + len), 2)
  const bStr = (start, len) => clean.slice(start, start + len)

  const fields = {}
  let format = ''
  let assembly = ''
  let error = null

  try {
    const opcode = b(0, 6)
    fields.opcode = bStr(0, 6)

    if (opcode === 0b000000) {
      // R-type
      format = 'R'
      const rs = b(6, 5), rt = b(11, 5), rd = b(16, 5), shamt = b(21, 5), funct = b(26, 6)
      fields.rs = bStr(6, 5)
      fields.rt = bStr(11, 5)
      fields.rd = bStr(16, 5)
      fields.shamt = bStr(21, 5)
      fields.funct = bStr(26, 6)

      const rsName = `$${REGISTER_NAMES[rs] || rs}`
      const rtName = `$${REGISTER_NAMES[rt] || rt}`
      const rdName = `$${REGISTER_NAMES[rd] || rd}`

      if (FUNCT_TO_INSTR[funct] === 'jr') {
        assembly = `jr ${rsName}`
      } else if (FUNCT_TO_INSTR[funct]) {
        assembly = `${FUNCT_TO_INSTR[funct]} ${rdName}, ${rsName}, ${rtName}`
      } else {
        assembly = `unknown R-type funct=${funct}`
      }
    } else if (opcode === 0b000010 || opcode === 0b000011) {
      // J-type
      format = 'J'
      const target = b(6, 26)
      fields.target = bStr(6, 26)

      const instr = OPCODE_TO_INSTR[opcode] || 'unknown'
      assembly = `${instr} ${target}`
    } else {
      // I-type
      format = 'I'
      const rs = b(6, 5), rt = b(11, 5), imm = b(16, 16)
      fields.rs = bStr(6, 5)
      fields.rt = bStr(11, 5)
      fields.immediate = bStr(16, 16)

      const rsName = `$${REGISTER_NAMES[rs] || rs}`
      const rtName = `$${REGISTER_NAMES[rt] || rt}`
      const signedImm = imm & 0x8000 ? imm - 0x10000 : imm

      const instr = OPCODE_TO_INSTR[opcode]
      if (instr === 'lw' || instr === 'sw') {
        assembly = `${instr} ${rtName}, ${signedImm}(${rsName})`
      } else if (instr) {
        assembly = `${instr} ${rtName}, ${rsName}, ${signedImm}`
      } else {
        assembly = `unknown opcode=${opcode}`
      }
    }
  } catch (e) {
    error = `Decoding error: ${e.message}`
  }

  return { format, fields, assembly, error }
}
