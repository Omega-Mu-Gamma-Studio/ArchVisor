/**
 * StepControls — Reusable step navigation control bar
 *
 * Used by BoothMultiplier, RestoringDivision, BinaryAdder,
 * PipelineAnimator, CacheSimulator, etc.
 */

import { motion } from 'framer-motion'

export default function StepControls({
  onStepForward,
  onStepBack,
  onRunAll,
  onReset,
  currentStep = 0,
  totalSteps = 0,
  canStepForward = true,
  canStepBack = true,
  isRunning = false,
}) {
  const btnStyle = (disabled) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: disabled ? 'var(--text-muted)' : 'var(--text)',
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all 0.2s',
    letterSpacing: '0.04em',
  })

  return (
    <div
      className="glass-card"
      style={{
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button
          onClick={onStepBack}
          disabled={!canStepBack || isRunning}
          style={btnStyle(!canStepBack || isRunning)}
          title="Step Back"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <button
          onClick={onStepForward}
          disabled={!canStepForward || isRunning}
          style={btnStyle(!canStepForward || isRunning)}
          title="Step Forward"
        >
          Step
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <button
          onClick={onRunAll}
          disabled={isRunning || !canStepForward}
          style={{
            ...btnStyle(isRunning || !canStepForward),
            background: isRunning ? 'transparent' : 'var(--accent-dim)',
            borderColor: isRunning ? 'var(--border)' : 'var(--accent-border)',
            color: isRunning ? 'var(--text-muted)' : 'var(--accent-text)',
          }}
          title="Run All"
        >
          {isRunning ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                ◌
              </motion.span>
              Running...
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Run All
            </>
          )}
        </button>

        <button
          onClick={onReset}
          style={btnStyle(false)}
          title="Reset"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Reset
        </button>
      </div>

      {/* Step counter */}
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span>Step</span>
        <span style={{
          padding: '2px 10px',
          borderRadius: '4px',
          background: 'var(--accent-dim)',
          color: 'var(--accent-text)',
          fontWeight: 600,
          fontSize: '13px',
        }}>
          {currentStep}
        </span>
        <span>/ {totalSteps}</span>
      </div>
    </div>
  )
}
