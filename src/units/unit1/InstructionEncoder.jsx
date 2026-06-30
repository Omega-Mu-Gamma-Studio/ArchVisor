/**
 * InstructionEncoder — MIPS Assembly ↔ Binary/Hex Encoder/Decoder
 *
 * Two tabs: Encode (assembly → bit fields) and Decode (binary/hex → assembly).
 * Uses shared BitFieldRenderer for color-coded bit field visualization.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BitFieldRenderer from '../../components/shared/BitFieldRenderer'
import { encodeInstruction, decodeInstruction } from '../../engines/mipsInterpreter.js'

const FIELD_COLORS = {
  opcode: '#aa3bff',
  rs: '#3b82f6',
  rt: '#22c55e',
  rd: '#f59e0b',
  shamt: '#ef4444',
  funct: '#8b5cf6',
  immediate: '#f97316',
  target: '#06b6d4',
}

const TAB_STYLE = (active) => ({
  flex: 1,
  padding: '10px 16px',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--mono)',
  fontSize: '12px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  background: active ? 'var(--accent-dim)' : 'transparent',
  color: active ? 'var(--accent-text)' : 'var(--text-muted)',
  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
  transition: 'all 0.2s',
})

export default function InstructionEncoder() {
  const [tab, setTab] = useState('encode')
  const [encodeInput, setEncodeInput] = useState('add $t0, $t1, $t2')
  const [decodeInput, setDecodeInput] = useState('00000001001010101000000000100000')
  const [encodeResult, setEncodeResult] = useState(null)
  const [decodeResult, setDecodeResult] = useState(null)
  const [error, setError] = useState(null)

  const handleEncode = () => {
    setError(null)
    const result = encodeInstruction(encodeInput)
    if (result.error) {
      setError(result.error)
      setEncodeResult(null)
      return
    }
    setEncodeResult(result)

    // Build bit field data for BitFieldRenderer
    const fieldEntries = Object.entries(result.fields).filter(([k]) => k !== 'rsParsed')
    if (fieldEntries.length === 0) return

    // Calculate ranges based on field positions in the binary string
    const fields = []
    let bitPos = 31

    // Determine field order based on format
    if (result.format === 'R') {
      const rOrder = ['opcode', 'rs', 'rt', 'rd', 'shamt', 'funct']
      for (const key of rOrder) {
        if (result.fields[key] !== undefined) {
          const bits = result.fields[key]
          fields.push({
            label: key,
            bits,
            color: FIELD_COLORS[key] || '#666',
            range: `${bitPos}–${bitPos - bits.length + 1}`,
          })
          bitPos -= bits.length
        }
      }
    } else if (result.format === 'I') {
      const iOrder = ['opcode', 'rs', 'rt', 'immediate']
      for (const key of iOrder) {
        if (result.fields[key] !== undefined) {
          const bits = result.fields[key]
          fields.push({
            label: key,
            bits,
            color: FIELD_COLORS[key] || '#666',
            range: `${bitPos}–${bitPos - bits.length + 1}`,
          })
          bitPos -= bits.length
        }
      }
    } else if (result.format === 'J') {
      const jOrder = ['opcode', 'target']
      for (const key of jOrder) {
        if (result.fields[key] !== undefined) {
          const bits = result.fields[key]
          fields.push({
            label: key,
            bits,
            color: FIELD_COLORS[key] || '#666',
            range: `${bitPos}–${bitPos - bits.length + 1}`,
          })
          bitPos -= bits.length
        }
      }
    }

    setEncodeResult({ ...result, renderFields: fields })
  }

  const handleDecode = () => {
    setError(null)
    const result = decodeInstruction(decodeInput)
    if (result.error) {
      setError(result.error)
      setDecodeResult(null)
      return
    }
    setDecodeResult(result)

    // Build bit field data
    const fieldEntries = Object.entries(result.fields)
    if (fieldEntries.length === 0) return

    const fields = []
    let bitPos = 31

    if (result.format === 'R') {
      const rOrder = ['opcode', 'rs', 'rt', 'rd', 'shamt', 'funct']
      for (const key of rOrder) {
        if (result.fields[key] !== undefined) {
          const bits = result.fields[key]
          fields.push({
            label: key,
            bits,
            color: FIELD_COLORS[key] || '#666',
            range: `${bitPos}–${bitPos - bits.length + 1}`,
          })
          bitPos -= bits.length
        }
      }
    } else if (result.format === 'I') {
      const iOrder = ['opcode', 'rs', 'rt', 'immediate']
      for (const key of iOrder) {
        if (result.fields[key] !== undefined) {
          const bits = result.fields[key]
          fields.push({
            label: key,
            bits,
            color: FIELD_COLORS[key] || '#666',
            range: `${bitPos}–${bitPos - bits.length + 1}`,
          })
          bitPos -= bits.length
        }
      }
    } else if (result.format === 'J') {
      const jOrder = ['opcode', 'target']
      for (const key of jOrder) {
        if (result.fields[key] !== undefined) {
          const bits = result.fields[key]
          fields.push({
            label: key,
            bits,
            color: FIELD_COLORS[key] || '#666',
            range: `${bitPos}–${bitPos - bits.length + 1}`,
          })
          bitPos -= bits.length
        }
      }
    }

    setDecodeResult({ ...result, renderFields: fields })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '4px' }}>
          MIPS Instruction Encoder / Decoder
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Convert between MIPS assembly and 32-bit machine code.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)' }}>
        <button style={TAB_STYLE(tab === 'encode')} onClick={() => { setTab('encode'); setError(null) }}>
          Encode
        </button>
        <button style={TAB_STYLE(tab === 'decode')} onClick={() => { setTab('decode'); setError(null) }}>
          Decode
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'encode' && (
          <motion.div
            key="encode"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Input */}
            <div className="glass-card" style={{ padding: '16px' }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.06em' }}>
                MIPS Assembly Instruction
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={encodeInput}
                  onChange={(e) => setEncodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEncode()}
                  placeholder="e.g. add $t0, $t1, $t2"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-h)',
                    fontFamily: 'var(--mono)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleEncode}
                  className="badge"
                  style={{ cursor: 'pointer', padding: '8px 18px', fontSize: '11px' }}
                >
                  Encode →
                </button>
              </div>
            </div>

            {/* Result */}
            {encodeResult && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                {/* Bit field renderer */}
                {encodeResult.renderFields && (
                  <BitFieldRenderer
                    fields={encodeResult.renderFields}
                    totalBits={32}
                    showLabels
                    showRange
                    showDecimal
                  />
                )}

                {/* Summary cards */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div className="glass-card" style={{ flex: 1, minWidth: '150px', padding: '14px' }}>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Format
                    </p>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: '18px', fontWeight: 600,
                      color: encodeResult.format === 'R' ? '#22c55e' : encodeResult.format === 'I' ? '#3b82f6' : '#f59e0b',
                    }}>
                      {encodeResult.format}-type
                    </span>
                  </div>

                  <div className="glass-card" style={{ flex: 1, minWidth: '200px', padding: '14px' }}>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Machine Code (Hex)
                    </p>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: '18px', fontWeight: 500, color: 'var(--accent-text)',
                    }}>
                      0x{encodeResult.hex}
                    </span>
                  </div>

                  <div className="glass-card" style={{ flex: 1, minWidth: '200px', padding: '14px' }}>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Binary
                    </p>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 400, color: 'var(--text)', wordBreak: 'break-all',
                    }}>
                      {encodeResult.binary}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === 'decode' && (
          <motion.div
            key="decode"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Input */}
            <div className="glass-card" style={{ padding: '16px' }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.06em' }}>
                32-bit Binary or 8-char Hex
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={decodeInput}
                  onChange={(e) => setDecodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDecode()}
                  placeholder="e.g. 00000001001010101000000000100000 or 0x012A8020"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-h)',
                    fontFamily: 'var(--mono)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleDecode}
                  className="badge"
                  style={{ cursor: 'pointer', padding: '8px 18px', fontSize: '11px' }}
                >
                  Decode →
                </button>
              </div>
            </div>

            {/* Result */}
            {decodeResult && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                {/* Assembly result */}
                <div className="glass-card" style={{
                  padding: '16px',
                  borderLeft: '3px solid var(--accent)',
                }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Decoded Assembly
                  </p>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: '18px', fontWeight: 500, color: 'var(--accent-text)',
                  }}>
                    {decodeResult.assembly}
                  </span>
                </div>

                {/* Bit field renderer */}
                {decodeResult.renderFields && (
                  <BitFieldRenderer
                    fields={decodeResult.renderFields}
                    totalBits={32}
                    showLabels
                    showRange
                    showDecimal
                  />
                )}

                {/* Format badge */}
                <div className="glass-card" style={{ padding: '12px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Format:
                  </span>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 600,
                    color: decodeResult.format === 'R' ? '#22c55e' : decodeResult.format === 'I' ? '#3b82f6' : '#f59e0b',
                  }}>
                    {decodeResult.format}-type
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              color: '#ef4444',
            }}
          >
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
