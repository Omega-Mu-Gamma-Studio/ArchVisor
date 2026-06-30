/**
 * RegisterFileViewer — Live display of all 32 MIPS registers
 *
 * 4-column grid showing register number, ABI name, decimal + hex value.
 * Subscribes to mipsStore for live updates with flash animations.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMipsStore from '../../store/mipsStore.js'

const REGISTERS = [
  { num: 0,  abi: 'zero', name: 'zero' },
  { num: 1,  abi: 'at',   name: 'at'   },
  { num: 2,  abi: 'v0',   name: 'v0'   },
  { num: 3,  abi: 'v1',   name: 'v1'   },
  { num: 4,  abi: 'a0',   name: 'a0'   },
  { num: 5,  abi: 'a1',   name: 'a1'   },
  { num: 6,  abi: 'a2',   name: 'a2'   },
  { num: 7,  abi: 'a3',   name: 'a3'   },
  { num: 8,  abi: 't0',   name: 't0'   },
  { num: 9,  abi: 't1',   name: 't1'   },
  { num: 10, abi: 't2',   name: 't2'   },
  { num: 11, abi: 't3',   name: 't3'   },
  { num: 12, abi: 't4',   name: 't4'   },
  { num: 13, abi: 't5',   name: 't5'   },
  { num: 14, abi: 't6',   name: 't6'   },
  { num: 15, abi: 't7',   name: 't7'   },
  { num: 16, abi: 's0',   name: 's0'   },
  { num: 17, abi: 's1',   name: 's1'   },
  { num: 18, abi: 's2',   name: 's2'   },
  { num: 19, abi: 's3',   name: 's3'   },
  { num: 20, abi: 's4',   name: 's4'   },
  { num: 21, abi: 's5',   name: 's5'   },
  { num: 22, abi: 's6',   name: 's6'   },
  { num: 23, abi: 's7',   name: 's7'   },
  { num: 24, abi: 't8',   name: 't8'   },
  { num: 25, abi: 't9',   name: 't9'   },
  { num: 26, abi: 'k0',   name: 'k0'   },
  { num: 27, abi: 'k1',   name: 'k1'   },
  { num: 28, abi: 'gp',   name: 'gp'   },
  { num: 29, abi: 'sp',   name: 'sp'   },
  { num: 30, abi: 'fp',   name: 'fp'   },
  { num: 31, abi: 'ra',   name: 'ra'   },
]

function RegisterRow({ reg, value, flashKey }) {
  const isZero = reg.num === 0

  return (
    <motion.div
      layout
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        borderRadius: '6px',
        background: isZero ? 'transparent' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        opacity: isZero ? 0.5 : 1,
        minWidth: 0,
      }}
    >
      {/* Register number */}
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: '9px',
        color: 'var(--text-muted)',
        minWidth: '20px',
      }}>
        ${reg.num}
      </span>

      {/* ABI name */}
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: '10px',
        fontWeight: isZero ? 400 : 600,
        color: isZero ? 'var(--text-muted)' : 'var(--accent-text)',
        minWidth: '28px',
      }}>
        ${reg.abi}
      </span>

      {/* Value */}
      <AnimatePresence mode="popLayout">
        <motion.span
          key={flashKey}
          initial={{ backgroundColor: isZero ? 'transparent' : 'rgba(170, 59, 255, 0.3)' }}
          animate={{ backgroundColor: 'transparent' }}
          exit={{ backgroundColor: 'transparent' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: value === 0 ? 'var(--text-muted)' : 'var(--text-h)',
            flex: 1,
            textAlign: 'right',
            padding: '2px 4px',
            borderRadius: '3px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>

      {/* Hex value */}
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: '9px',
        color: 'var(--text-muted)',
        minWidth: '52px',
        textAlign: 'right',
      }}>
        0x{value.toString(16).padStart(8, '0')}
      </span>
    </motion.div>
  )
}

export default function RegisterFileViewer() {
  const registers = useMipsStore((s) => s.registers)
  const currentLine = useMipsStore((s) => s.currentLine)

  // Build a flashKey based on register values and current execution step
  const flashKey = useMemo(() => {
    if (!registers || currentLine < 0) return 'init'
    // Use a hash of current register values so animation triggers on change
    const vals = Object.values(registers).slice(0, 8).join(',')
    return `step-${currentLine}-${vals}`
  }, [registers, currentLine])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
          Register File
        </h4>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '9px',
          color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          32 × 32-bit
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '4px',
      }}>
        {REGISTERS.map((reg) => {
          const value = registers ? (registers[`$${reg.num}`] ?? 0) : 0
          return (
            <RegisterRow
              key={reg.num}
              reg={reg}
              value={value}
              flashKey={`${flashKey}-${reg.num}`}
            />
          )
        })}
      </div>
    </div>
  )
}
