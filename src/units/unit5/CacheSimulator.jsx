/**
 * CacheSimulator ⭐ — Fully configurable cache simulator with step-through visualization
 *
 * FLAGSHIP TOOL for Unit V
 *
 * Features:
 * - Config panel: Cache Size, Block Size, Associativity, Replacement Policy, Write Policy
 * - Reference string input (hex addresses)
 * - Calls simulateCache() engine
 * - Cache State Table: rows = sets, columns = ways
 * - Access Log panel
 * - Hit Rate / Miss Rate progress bars
 * - Step Forward / Back / Run All / Reset controls
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { simulateCache } from '../../engines/cacheSimulator.js'
import StepControls from '../../components/shared/StepControls.jsx'

const DEFAULT_REFS = 'R:0x00 W:0x40 R:0x00 R:0x80 W:0x40'

function scenarioRefString(scenario) {
  if (!scenario?.referenceString) return null
  return scenario.referenceString.map((addr) => `R:${addr}`).join(' ')
}

export default function CacheSimulator({ initialScenario = null, onScenarioSolved } = {}) {
  // ── Config state ─────────────────────────────────────────
  const [cacheSize, setCacheSize] = useState(initialScenario?.cacheSize ?? 4096)
  const [blockSize, setBlockSize] = useState(initialScenario?.blockSize ?? 64)
  const [associativity, setAssociativity] = useState(initialScenario?.associativity ?? 1)
  const [replacementPolicy, setReplacementPolicy] = useState(initialScenario?.replacementPolicy ?? 'LRU')
  const [writePolicy, setWritePolicy] = useState(initialScenario?.writePolicy ?? 'write-through')

  const [refInput, setRefInput] = useState(scenarioRefString(initialScenario) ?? DEFAULT_REFS)
  const [currentStep, setCurrentStep] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const firedRef = useRef(false)

  // Parse reference string
  const referenceString = useMemo(() => {
    return refInput
      .split(/\s+/)
      .filter(Boolean)
      .map(token => {
        const parts = token.split(':')
        if (parts.length === 2) {
          const type = parts[0].toUpperCase() === 'W' ? 'W' : 'R'
          const address = parseInt(parts[1], 16)
          return { address, type }
        }
        return { address: parseInt(token, 16) || 0, type: 'R' }
      })
  }, [refInput])

  // Config object
  const config = useMemo(() => ({
    cacheSize,
    blockSize,
    associativity,
    replacementPolicy,
    writePolicy,
  }), [cacheSize, blockSize, associativity, replacementPolicy, writePolicy])

  // Run simulation
  const result = useMemo(() => {
    if (referenceString.length === 0) return null
    return simulateCache(config, referenceString)
  }, [config, referenceString])

  const steps = result?.steps ?? []
  const totalSteps = steps.length
  const visibleSteps = currentStep >= 0 ? steps.slice(0, currentStep + 1) : []
  const canStepForward = currentStep < totalSteps - 1
  const canStepBack = currentStep >= 0

  const handleStepForward = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(s => s + 1)
  }
  const handleStepBack = () => {
    if (currentStep >= 0) setCurrentStep(s => s - 1)
  }
  const handleRunAll = async () => {
    setIsRunning(true)
    for (let i = 0; i < totalSteps; i++) {
      setCurrentStep(i)
      await new Promise(r => setTimeout(r, 400))
    }
    setIsRunning(false)
  }
  const handleReset = () => {
    setCurrentStep(-1)
    setIsRunning(false)
  }

  // ── Boss win condition: derived, not stored in state ─────
  const solved = Boolean(initialScenario && totalSteps > 0 && currentStep >= totalSteps - 1)

  useEffect(() => {
    if (solved && !firedRef.current && onScenarioSolved) {
      firedRef.current = true
      onScenarioSolved()
    }
  }, [solved, onScenarioSolved])

  // Get visible cache state from the latest visible step
  const latestState = visibleSteps.length > 0
    ? visibleSteps[visibleSteps.length - 1].cacheState
    : null

  // Compute hit rate/miss rate for visible steps
  const visibleHits = visibleSteps.filter(s => s.hit).length
  const visibleTotal = visibleSteps.length
  const visibleHitRate = visibleTotal > 0 ? visibleHits / visibleTotal : 0

  // Get set count and way count from cache state
  const setCount = latestState?.length || 1
  const wayCount = latestState?.[0]?.ways?.length || associativity

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit V · Tool 2 ⭐
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          Cache Simulator
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          Fully configurable cache simulation with cycle-by-cycle step-through.
        </p>
      </div>

      {initialScenario && (
        <div style={{
          padding: '10px 16px', borderRadius: '10px',
          border: `1px solid ${solved ? 'rgba(34,197,94,0.4)' : 'var(--accent-border)'}`,
          background: solved ? 'rgba(34,197,94,0.1)' : 'var(--accent-dim)',
          fontFamily: 'var(--mono)', fontSize: '12px',
          color: solved ? '#22c55e' : 'var(--accent-text)',
        }}>
          {solved
            ? `✓ Boss cleared — you rode out all ${initialScenario.referenceString.length} accesses`
            : `🎯 Objective: step (or Run All) through all ${initialScenario.referenceString.length} accesses below`}
        </div>
      )}

      {/* Config panel */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <ConfigSelect label="Cache Size" value={cacheSize} onChange={v => { setCacheSize(parseInt(v)); handleReset() }} options={[256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144].map(n => ({ value: n, label: n >= 1024 ? `${n / 1024} KB` : `${n} B` }))} />
        <ConfigSelect label="Block Size" value={blockSize} onChange={v => { setBlockSize(parseInt(v)); handleReset() }} options={[16, 32, 64, 128].map(n => ({ value: n, label: `${n} B` }))} />
        <ConfigSelect label="Associativity" value={associativity} onChange={v => { setAssociativity(parseInt(v)); handleReset() }} options={[
          { value: 1, label: 'Direct-Mapped' },
          { value: 2, label: '2-Way' },
          { value: 4, label: '4-Way' },
          { value: 8, label: '8-Way' },
          { value: 0, label: 'Fully Assoc.' },
        ]} />
        <ConfigSelect label="Replacement" value={replacementPolicy} onChange={v => { setReplacementPolicy(v); handleReset() }} options={[
          { value: 'LRU', label: 'LRU' },
          { value: 'FIFO', label: 'FIFO' },
          { value: 'Random', label: 'Random' },
        ]} />
        <ConfigSelect label="Write Policy" value={writePolicy} onChange={v => { setWritePolicy(v); handleReset() }} options={[
          { value: 'write-through', label: 'Write-Through' },
          { value: 'write-back', label: 'Write-Back' },
        ]} />
      </div>

      {/* Reference string input */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.08em' }}>
          Reference String (space-separated, e.g. <code style={{ color: 'var(--accent-text)' }}>R:0x00 W:0x40</code>)
        </label>
        <input
          type="text"
          value={refInput}
          onChange={e => { setRefInput(e.target.value); handleReset() }}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '13px',
            outline: 'none',
          }}
        />
        <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {referenceString.length} access{referenceString.length !== 1 ? 'es' : ''} parsed
        </div>
      </div>

      {/* Controls */}
      <StepControls
        onStepForward={handleStepForward}
        onStepBack={handleStepBack}
        onRunAll={handleRunAll}
        onReset={handleReset}
        currentStep={currentStep + 1}
        totalSteps={totalSteps}
        canStepForward={canStepForward}
        canStepBack={canStepBack}
        isRunning={isRunning}
      />

      {/* Stats panel */}
      {result && (
        <div className="glass-card" style={{ padding: '14px 20px', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <StatItem label="Total Accesses" value={String(result.totalAccesses)} />
          <StatItem label="Hits" value={String(result.hits)} />
          <StatItem label="Misses" value={String(result.misses)} />
          <StatItem label="Hit Rate" value={`${(result.hitRate * 100).toFixed(1)}%`} color="#22c55e" />
          <StatItem label="Miss Rate" value={`${(result.missRate * 100).toFixed(1)}%`} color="#ef4444" />
        </div>
      )}

      {/* Hit Rate progress bar (visible steps) */}
      {visibleTotal > 0 && (
        <div className="glass-card" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>Hit Rate (visible)</span>
            <span>{(visibleHitRate * 100).toFixed(0)}%</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(55,65,81,0.3)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${visibleHitRate * 100}%` }}
              style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #22c55e, #3b82f6)' }}
            />
          </div>
        </div>
      )}

      {/* Cache State Table */}
      {latestState && (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
            CACHE STATE TABLE ({setCount} set{setCount !== 1 ? 's' : ''} × {wayCount} way{wayCount !== 1 ? 's' : ''})
          </div>
          <div style={{ overflowX: 'auto', padding: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '9px', fontWeight: 500 }}>Set</th>
                  {Array.from({ length: wayCount }, (_, i) => (
                    <th key={i} style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '9px', fontWeight: 500 }}>
                      Way {i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {latestState.slice(0, 16).map((set, si) => (
                  <tr key={si} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '5px 10px', color: 'var(--text-muted)', fontSize: '10px' }}>{set.setIndex}</td>
                    {set.ways.map((way, wi) => (
                      <td key={wi} style={{ padding: '5px 10px', textAlign: 'center' }}>
                        {way.valid ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            padding: '2px 8px', borderRadius: '4px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            fontSize: '10px', color: 'var(--text)',
                          }}>
                            T:{way.tag}
                            {way.dirty !== undefined && (
                              <span style={{ color: way.dirty ? '#f59e0b' : 'var(--text-muted)', fontSize: '8px' }}>
                                {way.dirty ? ' D' : ''}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Access Log */}
      {visibleSteps.length > 0 && (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
            ACCESS LOG ({visibleSteps.length})
          </div>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            <AnimatePresence>
              {visibleSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '5px 14px', fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text)',
                    borderLeft: step.hit ? '2px solid #22c55e' : '2px solid #ef4444',
                    background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: '9px', minWidth: '20px' }}>#{step.accessIndex}</span>
                  <span style={{
                    padding: '1px 6px', borderRadius: '3px',
                    background: step.type === 'R' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                    color: step.type === 'R' ? '#3b82f6' : '#f59e0b',
                    fontWeight: 600, fontSize: '10px',
                  }}>{step.type}</span>
                  <span style={{ color: 'var(--text)' }}>0x{step.address.toString(16).toUpperCase().padStart(2, '0')}</span>
                  <span style={{
                    padding: '1px 8px', borderRadius: '4px',
                    background: step.hit ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: step.hit ? '#22c55e' : '#ef4444',
                    fontWeight: 600, fontSize: '10px',
                  }}>
                    {step.hit ? 'HIT' : 'MISS'}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                    Set {step.setIndex} · Tag {step.tag} · Off {step.blockOffset}
                  </span>
                  {step.evicted !== undefined && (
                    <span style={{ color: '#f59e0b', fontSize: '10px', fontWeight: 600 }}>
                      Evict T:{step.evicted}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
          Configure the cache and add references, then step through to see results.
        </div>
      )}
    </div>
  )
}

function ConfigSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <select value={value} onChange={e => onChange(e.target.value)} className="input-field" style={{ minWidth: '100px', fontSize: '11px', padding: '6px 10px' }}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function StatItem({ label, value, color }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: color || 'var(--accent-text)', fontFamily: 'var(--mono)' }}>
        {value}
      </div>
    </div>
  )
}
