/**
 * GauntletMode — pre-exam mixed-review session runner. New route
 * (/gauntlet). Pulls real, engine-validated questions across units,
 * weighted toward tagged weak spots, and ties results back into
 * XP/weak-spot/achievement systems via the same PredictionGate stream
 * everything else uses.
 */

import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PredictionGate from '../../components/PredictionGate.jsx'
import ConfettiBurst from '../../components/ConfettiBurst.jsx'
import useWeakSpotStore, { NUDGE_THRESHOLD } from '../store/weakSpotStore.js'
import useXPStore from '../store/xpStore.js'
import { buildGauntletSession } from '../utils/gauntletQuestions.js'
import { DEFAULT_GAUNTLET_LENGTH } from '../content/gauntletConfig.js'

export default function GauntletMode() {
  const navigate = useNavigate()
  const missCounts = useWeakSpotStore((s) => s.missCounts)
  const xpAtStart = useXPStore((s) => s.totalXP)

  const weakSpotTags = useMemo(
    () => Object.entries(missCounts).filter(([, c]) => c >= NUDGE_THRESHOLD).map(([tag]) => tag),
    [missCounts]
  )

  const [session] = useState(() => buildGauntletSession(DEFAULT_GAUNTLET_LENGTH, weakSpotTags))
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const currentXP = useXPStore((s) => s.totalXP)
  const question = session[index]

  const handleNext = useCallback(
    (correct) => {
      if (correct) setScore((s) => s + 1)
      if (index + 1 >= session.length) {
        setFinished(true)
      } else {
        setIndex((i) => i + 1)
      }
    },
    [index, session.length]
  )

  if (finished) {
    const xpEarned = currentXP - xpAtStart
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <ConfettiBurst show count={24} />
        <div style={{ fontSize: 40, marginBottom: 8 }}>🏁</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Gauntlet complete</h1>
        <p style={{ opacity: 0.7, marginBottom: 20 }}>
          {score}/{session.length} correct · +{xpEarned} XP earned
        </p>
        <button
          onClick={() => navigate('/arcade')}
          style={{
            padding: '10px 22px',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(135deg, #6d28d9, #db2777)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Back to Arcade
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 13, opacity: 0.6 }}>
          Question {index + 1} of {session.length} · score {score}
        </div>
        <button
          onClick={() => navigate('/arcade')}
          style={{ fontSize: 12, opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
        >
          Exit early ✕
        </button>
      </div>

      <div style={{ width: '100%', height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.08)', marginBottom: 24 }}>
        <div
          style={{
            width: `${((index) / session.length) * 100}%`,
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #6d28d9, #db2777)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          style={{
            padding: '20px 22px',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 8 }}>
            Unit {question.unitId} · {question.difficulty}
          </div>
          <div style={{ fontSize: 14, whiteSpace: 'pre-wrap', marginBottom: 16, lineHeight: 1.5 }}>
            {question.prompt}
          </div>

          <PredictionGate
            key={index}
            toolId={question.toolId}
            expected={question.expected}
            conceptTag={question.conceptTag}
            difficulty={question.difficulty}
            unitId={question.unitId}
            onReveal={(correct) => {
              setTimeout(() => handleNext(correct), 900)
            }}
            renderPrompt={({ guess, setGuess, submit, revealed, isCorrect }) => (
              <div>
                <input
                  type="text"
                  value={guess}
                  disabled={revealed}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="Your answer"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'inherit',
                    fontSize: 14,
                    marginBottom: 12,
                  }}
                />
                {!revealed ? (
                  <button
                    onClick={submit}
                    disabled={!guess}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 10,
                      border: 'none',
                      background: guess ? 'linear-gradient(135deg, #6d28d9, #db2777)' : 'rgba(255,255,255,0.08)',
                      color: '#fff',
                      cursor: guess ? 'pointer' : 'not-allowed',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Submit
                  </button>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 600, color: isCorrect ? '#22c55e' : '#f87171' }}>
                    {isCorrect ? '✓ Correct!' : `✗ Answer: ${question.expected}`}
                  </div>
                )}
              </div>
            )}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
