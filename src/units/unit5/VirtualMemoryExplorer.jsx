/**
 * VirtualMemoryExplorer — Step-through virtual address translation with TLB and 2-level page table
 *
 * Config panel: Page Size, TLB Entries, Page Table Entries
 * Virtual address hex input
 * Calls translateAddress() engine
 * Step-through phases: Decompose → TLB Lookup → Page Table Walk → Assemble
 * Uses BitFieldRenderer for address decomposition
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { translateAddress } from '../../engines/tlb.js'
import BitFieldRenderer from '../../components/shared/BitFieldRenderer.jsx'

const DEFAULT_TLB = [
  { vpn: 0x1A, pfn: 0x3F, valid: true },
  { vpn: 0x2B, pfn: 0x7A, valid: true },
  { vpn: 0x3C, pfn: 0x12, valid: true },
]

// Build a default 2-level page table
function buildDefaultPageTable() {
  const table = {}
  for (let vpn1 = 0; vpn1 < 8; vpn1++) {
    const l2 = {}
    for (let vpn2 = 0; vpn2 < 8; vpn2++) {
      l2[vpn2] = { valid: true, pfn: 0x100 + vpn1 * 8 + vpn2 }
    }
    table[vpn1] = { valid: true, ptr: 0x2000 + vpn1 * 0x100, table: l2 }
  }
  return table
}

export default function VirtualMemoryExplorer() {
  const [pageSize, setPageSize] = useState(4096)
  const [tlbEntries, setTlbEntries] = useState(4)
  const [ptEntries, setPtEntries] = useState(8)
  const [vaInput, setVaInput] = useState('0x1A2B3C')
  const [currentPhase, setCurrentPhase] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)

  const tlb = useMemo(() => DEFAULT_TLB, [])
  const pageTable = useMemo(() => buildDefaultPageTable(), [])

  const va = useMemo(() => {
    try {
      return parseInt(vaInput, 16)
    } catch {
      return 0
    }
  }, [vaInput])

  const result = useMemo(() => {
    if (isNaN(va) || va <= 0) return null
    return translateAddress(va, {
      pageSize,
      tlbEntries,
      pageTableEntries: ptEntries,
      tlb,
      pageTable,
    })
  }, [va, pageSize, tlbEntries, ptEntries, tlb, pageTable])

  const phases = useMemo(() => {
    if (!result?.steps) return []
    return result.steps.map((s, i) => ({ ...s, index: i }))
  }, [result])

  const visiblePhases = currentPhase >= 0 ? phases.slice(0, currentPhase + 1) : []
  const canStepForward = currentPhase < phases.length - 1
  const canStepBack = currentPhase >= 0

  const handleStepForward = () => {
    if (currentPhase < phases.length - 1) setCurrentPhase(p => p + 1)
  }
  const handleStepBack = () => {
    if (currentPhase >= 0) setCurrentPhase(p => p - 1)
  }
  const handleRunAll = async () => {
    setIsRunning(true)
    for (let i = 0; i < phases.length; i++) {
      setCurrentPhase(i)
      await new Promise(r => setTimeout(r, 600))
    }
    setIsRunning(false)
  }
  const handleReset = () => {
    setCurrentPhase(-1)
    setIsRunning(false)
  }

  // Build bit fields for address decomposition
  const offsetBits = Math.log2(pageSize)
  const entriesPerLevelBits = Math.log2(ptEntries)
  const vpnBits = 32 - offsetBits
  const vpn2Bits = entriesPerLevelBits
  const vpn1Bits = vpnBits - vpn2Bits

  const vpn1Val = va >> (offsetBits + vpn2Bits)
  const vpn2Val = (va >> offsetBits) & ((1 << vpn2Bits) - 1)
  const offsetVal = va & ((1 << offsetBits) - 1)

  const addrFields = [
    { label: 'VPN1', bits: vpn1Val.toString(2).padStart(Math.max(vpn1Bits, 1), '0'), color: '#3b82f6', range: `31–${32 - vpn1Bits}` },
    { label: 'VPN2', bits: vpn2Val.toString(2).padStart(Math.max(vpn2Bits, 1), '0'), color: '#22c55e', range: `${32 - vpn1Bits - 1}–${offsetBits}` },
    { label: 'Offset', bits: offsetVal.toString(2).padStart(offsetBits, '0'), color: '#f59e0b', range: `${offsetBits - 1}–0` },
  ]



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit V · Tool 3
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Virtual Memory & TLB Explorer
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Step through virtual address translation — TLB lookup, page table walk, and physical address assembly.
        </p>
      </div>

      {/* Config */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px' }}>Page Size</label>
          <select value={pageSize} onChange={e => { setPageSize(parseInt(e.target.value)); handleReset() }} className="input-field" style={{ width: '90px', fontSize: '11px' }}>
            {[1024, 4096, 8192, 65536].map(n => (
              <option key={n} value={n}>{n / 1024} KB</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px' }}>TLB Entries</label>
          <select value={tlbEntries} onChange={e => { setTlbEntries(parseInt(e.target.value)); handleReset() }} className="input-field" style={{ width: '70px', fontSize: '11px' }}>
            {[2, 4, 8, 16].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px' }}>PT Entries/Level</label>
          <select value={ptEntries} onChange={e => { setPtEntries(parseInt(e.target.value)); handleReset() }} className="input-field" style={{ width: '70px', fontSize: '11px' }}>
            {[4, 8, 16].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px' }}>Virtual Address (hex)</label>
          <input type="text" value={vaInput} onChange={e => { setVaInput(e.target.value); handleReset() }}
            className="input-field" style={{ width: '120px', fontSize: '12px', fontFamily: 'var(--mono)' }}
            placeholder="0x..."
          />
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={handleStepBack} disabled={!canStepBack || isRunning} style={ctrlBtn(!canStepBack || isRunning)}>← Back</button>
          <button onClick={handleStepForward} disabled={!canStepForward || isRunning} style={ctrlBtn(!canStepForward || isRunning)}>Step →</button>
          <button onClick={handleRunAll} disabled={isRunning || !canStepForward} style={accentBtn(isRunning || !canStepForward)}>
            {isRunning ? '⏳' : '▶ Run All'}
          </button>
          <button onClick={handleReset} style={ctrlBtn(false)}>↺ Reset</button>
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          Phase {currentPhase + 1} / {phases.length}
        </span>
      </div>

      {/* Bit-field decomposition */}
      {currentPhase >= 0 && (
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--accent-text)', marginBottom: '6px', letterSpacing: '0.08em' }}>
            VIRTUAL ADDRESS BITS
          </div>
          <BitFieldRenderer fields={addrFields} totalBits={32} showLabels showRange />
        </div>
      )}

      {/* Phase-by-phase steps */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
          TRANSLATION PHASES
        </div>
        <div style={{ padding: '8px 14px' }}>
          <AnimatePresence>
            {visiblePhases.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                Press Step to begin the translation.
              </div>
            ) : (
              visiblePhases.map((phase, idx) => {
                const phaseIcons = {
                  decompose: '🔍',
                  'tlb-lookup': '📋',
                  'page-table-walk': '🌲',
                  assemble: '🔗',
                }
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    style={{
                      display: 'flex', gap: '12px', padding: '10px 0',
                      borderBottom: idx < visiblePhases.length - 1 ? '1px solid var(--border)' : 'none',
                      fontSize: '13px', lineHeight: 1.6,
                    }}
                  >
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>{phaseIcons[phase.phase] || '•'}</span>
                    <div>
                      <strong style={{ color: 'var(--text-h)' }}>{phase.label}</strong>
                      <span style={{ color: 'var(--text)', marginLeft: '8px' }}>{phase.detail}</span>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* TLB Table */}
      {currentPhase >= 0 && (
        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '8px' }}>
            TLB TABLE
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '4px 10px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '9px', fontWeight: 500 }}>Entry</th>
                <th style={{ padding: '4px 10px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '9px', fontWeight: 500 }}>VPN</th>
                <th style={{ padding: '4px 10px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '9px', fontWeight: 500 }}>PFN</th>
                <th style={{ padding: '4px 10px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '9px', fontWeight: 500 }}>Valid</th>
              </tr>
            </thead>
            <tbody>
              {tlb.slice(0, tlbEntries).map((entry, idx) => {
                const vpn = result ? (result.vpn1 * Math.pow(2, entriesPerLevelBits) + result.vpn2) : -1
                const isMatch = entry.valid && entry.vpn === vpn
                return (
                  <tr key={idx} style={{
                    borderBottom: '1px solid var(--border)',
                    background: isMatch ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                  }}>
                    <td style={{ padding: '5px 10px', color: 'var(--text-muted)' }}>{idx}</td>
                    <td style={{ padding: '5px 10px', color: 'var(--text)' }}>0x{entry.vpn.toString(16).toUpperCase()}</td>
                    <td style={{ padding: '5px 10px', color: 'var(--text)' }}>0x{entry.pfn.toString(16).toUpperCase()}</td>
                    <td style={{ padding: '5px 10px' }}>
                      <span style={{ color: entry.valid ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {entry.valid ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Final result */}
      {result && currentPhase >= phases.length - 1 && result.physicalAddress >= 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}
        >
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Physical Address</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: 700, color: 'var(--accent-text)' }}>
              0x{result.physicalAddress.toString(16).toUpperCase().padStart(8, '0')}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Page Frame Number</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
              0x{result.pfn.toString(16).toUpperCase()}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>TLB</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: result.tlbHit ? '#22c55e' : '#f59e0b' }}>
              {result.tlbHit ? 'HIT ✓' : 'MISS (page table walk)'}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function ctrlBtn(disabled) {
  return {
    padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border)',
    background: 'transparent', color: disabled ? 'var(--text-muted)' : 'var(--text)',
    fontFamily: 'var(--mono)', fontSize: '10px',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1,
    transition: 'all 0.2s',
  }
}

function accentBtn(disabled) {
  return {
    padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--accent-border)',
    background: 'var(--accent-dim)', color: disabled ? 'var(--text-muted)' : 'var(--accent-text)',
    fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1,
    transition: 'all 0.2s',
  }
}
