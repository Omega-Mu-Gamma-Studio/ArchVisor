/**
 * Pipeline Engine
 *
 * Simulates a 5-stage MIPS pipeline (IF/ID/EX/MEM/WB) with hazard detection
 * and optional forwarding. Produces a cycle-by-cycle diagram and hazard report.
 */

const STAGES = ['IF', 'ID', 'EX', 'MEM', 'WB']

/**
 * Parse a MIPS instruction to extract register usage.
 */
function parseRegs(instr) {
  const clean = instr.replace(/#.*$/, '').trim()
  const parts = clean.split(/[\s,]+/).filter(Boolean)
  if (parts.length === 0) return null

  const op = parts[0].toLowerCase()
  const args = parts.slice(1)

  const result = { op, rd: null, rs: null, rt: null, writes: false, reads: [] }

  // Register name to number conversion
  const regNames = [
    'zero','at','v0','v1','a0','a1','a2','a3',
    't0','t1','t2','t3','t8','t9','k0','k1',
    'gp','sp','fp','ra','s0','s1','s2','s3',
    's4','s5','s6','s7','t4','t5','t6','t7',
  ]
  const toIdx = (name) => {
    const n = name.replace('$', '')
    const idx = parseInt(n)
    if (!isNaN(idx)) return idx
    const found = regNames.indexOf(n)
    return found
  }

  switch (op) {
    // R-type: rd, rs, rt
    case 'add': case 'sub': case 'and': case 'or': case 'nor': case 'slt':
      result.rd = toIdx(args[0])
      result.rs = toIdx(args[1])
      result.rt = toIdx(args[2])
      result.writes = true
      result.reads = [result.rs, result.rt]
      break

    // I-type (immediate): rt, rs, imm
    case 'addi': case 'andi': case 'ori':
      result.rt = toIdx(args[0])
      result.rs = toIdx(args[1])
      result.writes = true
      result.reads = [result.rs]
      break

    // Memory: lw rt, offset(rs) — writes rt
    case 'lw': {
      result.rt = toIdx(args[0])
      const memMatch = args.slice(1).join(' ').match(/(-?\d+)\((\$\S+)\)/)
      if (memMatch) result.rs = toIdx(memMatch[2])
      result.writes = true
      result.reads = [result.rs]
      break
    }
    // Memory: sw rt, offset(rs) — reads both
    case 'sw': {
      result.rt = toIdx(args[0])
      const memMatch2 = args.slice(1).join(' ').match(/(-?\d+)\((\$\S+)\)/)
      if (memMatch2) result.rs = toIdx(memMatch2[2])
      result.writes = false
      result.reads = [result.rt, result.rs]
      break
    }

    // Branches: rs, rt, label — reads both
    case 'beq': case 'bne':
      result.rs = toIdx(args[0])
      result.rt = toIdx(args[1])
      result.writes = false
      result.reads = [result.rs, result.rt]
      break

    // Jumps
    case 'j':
      result.writes = false
      result.reads = []
      break
    case 'jr':
      result.rs = toIdx(args[0])
      result.writes = false
      result.reads = [result.rs]
      break
    case 'jal':
      result.rd = 31 // $ra
      result.writes = true
      result.reads = []
      break
  }

  return result
}

/**
 * Checks for RAW hazard between two instructions.
 */
function rawHazard(instrA, instrB) {
  if (!instrA || !instrB) return false
  const a = parseRegs(instrA)
  const b = parseRegs(instrB)
  if (!a || !b || !a.writes) return false
  return b.reads.includes(a.rd)
}

/**
 * Runs a 5-stage MIPS pipeline simulation on an instruction sequence.
 * @param {string[]} instructions
 * @param {{ forwarding: boolean }} options
 * @returns {{
 *   cycles: number,
 *   cpi: number,
 *   diagram: Array<{ instruction: string, stages: Array<{ cycle: number, stage: string|null, hazard?: string|null, forwarded?: boolean }> }>,
 *   hazards: Array<{ type: string, instrA: string, instrB: string, cycle: number, resolution: string }>
 * }}
 */
export function simulatePipeline(instructions, options = { forwarding: false }) {
  const { forwarding } = options
  const diagram = []
  const hazards = []

  // Track which cycles each instruction spends in each stage
  // Each instruction has a start cycle for IF
  let startCycle = 1
  const stalls = [] // per-instruction stall count

  for (let i = 0; i < instructions.length; i++) {
    let stallCycles = 0
    const instr = instructions[i]
    const parsed = parseRegs(instr)

    // Check for RAW hazard with previous instructions
    if (parsed && parsed.reads.length > 0) {
      for (let j = Math.max(0, i - 2); j < i; j++) {
        const prevParsed = parseRegs(instructions[j])
        if (prevParsed && prevParsed.writes) {
          for (const readReg of parsed.reads) {
            if (readReg === prevParsed.rd && readReg !== 0) {
              // RAW hazard detected
              if (forwarding) {
                // With forwarding: EX→EX forwarding resolves this in 0 stalls
                if (i === j + 1) {
                  // Adjacent RAW can be forwarded
                  hazards.push({
                    type: 'RAW',
                    instrA: instructions[j],
                    instrB: instr,
                    cycle: startCycle + 1,
                    resolution: 'Forwarding from EX stage',
                  })
                } else if (i === j + 2) {
                  hazards.push({
                    type: 'RAW',
                    instrA: instructions[j],
                    instrB: instr,
                    cycle: startCycle + 1,
                    resolution: 'Forwarding from MEM stage',
                  })
                }
              } else {
                // Without forwarding: need 2 stall cycles
                if (i === j + 1) {
                  stallCycles = Math.max(stallCycles, 2)
                  hazards.push({
                    type: 'RAW',
                    instrA: instructions[j],
                    instrB: instr,
                    cycle: startCycle + 1,
                    resolution: '2 stall cycles inserted',
                  })
                } else if (i === j + 2) {
                  stallCycles = Math.max(stallCycles, 1)
                  hazards.push({
                    type: 'RAW',
                    instrA: instructions[j],
                    instrB: instr,
                    cycle: startCycle + 1,
                    resolution: '1 stall cycle inserted',
                  })
                }
              }
            }
          }
        }
      }
    }

    // Control hazard: branch instructions cause 1 stall
    if (parsed && (parsed.op === 'beq' || parsed.op === 'bne' || parsed.op === 'j' || parsed.op === 'jr')) {
      stallCycles = Math.max(stallCycles, 1)
      // Don't report control hazard for every branch in diagram — only on next instruction
      if (i + 1 < instructions.length) {
        hazards.push({
          type: 'control',
          instrA: instr,
          instrB: instructions[i + 1],
          cycle: startCycle + 1,
          resolution: '1 stall cycle (branch misprediction penalty)',
        })
      }
    }

    stalls.push(stallCycles)

    // Build the stage timeline for this instruction
    const stages = []
    let currentCycle = startCycle

    // If there are stall cycles, insert stall/bubble cycles
    if (stallCycles > 0) {
      // First, IF stage
      stages.push({ cycle: currentCycle, stage: 'IF', hazard: null, forwarded: false })
      currentCycle++

      // ID stage happens in the next cycle
      stages.push({ cycle: currentCycle, stage: forwarding ? 'ID' : 'stall', hazard: 'RAW', forwarded: false })
      currentCycle++

      for (let s = 0; s < stallCycles - 1; s++) {
        stages.push({ cycle: currentCycle, stage: 'stall', hazard: 'RAW', forwarded: false })
        currentCycle++
      }

      // Remaining stages
      for (let s = forwarding ? 2 : 2; s < STAGES.length; s++) {
        let stageName = STAGES[s]
        let isForwarded = false
        let hazardType = null

        // If we have forwarding and this is EX, mark as forwarded
        if (forwarding && stageName === 'EX' && i > 0 && rawHazard(instructions[i - 1], instr)) {
          isForwarded = true
        }

        stages.push({ cycle: currentCycle, stage: stageName, hazard: hazardType, forwarded: isForwarded })
        currentCycle++
      }
    } else {
      // Normal flow — one stage per cycle
      for (let s = 0; s < STAGES.length; s++) {
        let isForwarded = false
        let hazardType = null

        // Mark forwarding if applicable
        if (forwarding && STAGES[s] === 'EX' && i > 0 && rawHazard(instructions[i - 1], instr)) {
          isForwarded = true
        }

        stages.push({ cycle: currentCycle, stage: STAGES[s], hazard: hazardType, forwarded: isForwarded })
        currentCycle++
      }
    }

    // Handle control hazard: insert bubble for the next instruction if there's a branch
    if (parsed && (parsed.op === 'beq' || parsed.op === 'bne' || parsed.op === 'j' || parsed.op === 'jr')) {
      // The next instruction (if any) will have a stall in its IF
    }

    diagram.push({ instruction: instr, stages })
    startCycle = currentCycle - (STAGES.length - 1) // next instruction starts after the first stage of current
  }

  const totalCycles = diagram.length > 0
    ? Math.max(...diagram.map(instr => Math.max(...instr.stages.map(s => s.cycle))))
    : 0

  return {
    cycles: totalCycles,
    cpi: instructions.length > 0 ? totalCycles / instructions.length : 0,
    diagram,
    hazards,
  }
}

/**
 * Classifies all hazards in an instruction sequence (static analysis).
 * @param {string[]} instructions
 * @returns {Array<{ type: string, instrA: string, instrIndexA: number, instrB: string, instrIndexB: number, cycle: number, resolution: string }>}
 */
export function classifyHazards(instructions) {
  const result = []

  for (let i = 0; i < instructions.length; i++) {
    const parsed = parseRegs(instructions[i])
    if (!parsed) continue

    // RAW hazard: check if this instruction reads a register written by a previous one
    for (const readReg of parsed.reads) {
      if (readReg === 0) continue // $zero
      for (let j = Math.max(0, i - 2); j < i; j++) {
        const prevParsed = parseRegs(instructions[j])
        if (prevParsed && prevParsed.writes && prevParsed.rd === readReg) {
          const distance = i - j
          const stallCount = distance === 1 ? 2 : distance === 2 ? 1 : 0
          result.push({
            type: 'RAW',
            instrA: instructions[j],
            instrIndexA: j,
            instrB: instructions[i],
            instrIndexB: i,
            cycle: i + 1,
            resolution: stallCount > 0 ? `${stallCount} stall cycle(s) needed` : 'Forwarding resolves',
          })
        }
      }
    }

    // Control hazard: branches and jumps
    if (parsed.op === 'beq' || parsed.op === 'bne') {
      if (i + 1 < instructions.length) {
        result.push({
          type: 'control',
          instrA: instructions[i],
          instrIndexA: i,
          instrB: instructions[i + 1],
          instrIndexB: i + 1,
          cycle: i + 1,
          resolution: '1 stall cycle (branch misprediction)',
        })
      }
    }
    if (parsed.op === 'j' || parsed.op === 'jr' || parsed.op === 'jal') {
      if (i + 1 < instructions.length) {
        result.push({
          type: 'control',
          instrA: instructions[i],
          instrIndexA: i,
          instrB: instructions[i + 1],
          instrIndexB: i + 1,
          cycle: i + 1,
          resolution: '1 stall cycle (jump penalty)',
        })
      }
    }

    // Structural hazard: two ALU instructions in a row don't cause structural hazards
    // in a standard 5-stage pipeline, but we could detect if there's resource conflict
    // For this implementation, structural hazards are rare and not detected statically
  }

  return result
}
