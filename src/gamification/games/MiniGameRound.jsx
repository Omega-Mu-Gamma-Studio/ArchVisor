/**
 * MiniGameRound — one multiple-choice round for the new arcade mini-games
 * (Register Rush, Binary Blitz, Hazard Hunter). Mirrors the existing
 * CacheDemoRound pattern in ArcadeHub.jsx (PredictionGate + SpeedrunTimer +
 * ConfettiBurst + FailStateAnimation) but generalized to N options instead
 * of a fixed hit/miss pair, so it's reusable across all three games.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PredictionGate from '../components/PredictionGate.jsx'
import SpeedrunTimer from '../components/SpeedrunTimer.jsx'
import ConfettiBurst from '../components/ConfettiBurst.jsx'
import FailStateAnimation from '../components/FailStateAnimation.jsx'

export default function MiniGameRound({
  toolId,
  conceptTag,
  color,
  round,
  index,
  total,
  isLast,
  onNext,
  onResult,
  failKind = 'generic',
}) {
  const [runComplete, setRunComplete] = useState(false)
  const [showFail, setShowFail] = useState(false)
  const [showBurst, setShowBurst] = useState(false)

  return (
    <PredictionGate
      key={index}
      toolId={toolId}
      conceptTag={conceptTag}
      expected={round.correctKey}
      onReveal={(correct) => {
        setRunComplete(true)
        onResult?.(correct)
        if (correct) {
          setShowBurst(true)
          setTimeout(() => setShowBurst(false), 700)
        } else {
          setShowFail(true)
        }
      }}
      renderPrompt={({ guess, setGuess, submit, revealed, isCorrect }) => (
        <div style={{ position: 'relative' }}>
          <SpeedrunTimer toolId={toolId} active={!runComplete} completed={runComplete} />

          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
            Round {index + 1} of {total}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{round.prompt}</div>
          {round.subtitle && (
            <div
              style={{
                fontSize: 13,
                opacity: 0.7,
                marginBottom: 14,
                fontFamily: round.subtitle.includes('$') || round.subtitle.includes('→')
                  ? 'ui-monospace, SFMono-Regular, Menlo, monospace'
                  : 'inherit',
              }}
            >
              {round.subtitle}
            </div>
          )}

          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <ConfettiBurst show={showBurst} count={16} />
            {round.options.map((opt) => {
              const selected = guess === opt.key
              return (
                <motion.button
                  key={opt.key}
                  disabled={revealed}
                  onClick={() => setGuess(opt.key)}
                  whileHover={!revealed ? { scale: 1.03 } : {}}
                  whileTap={!revealed ? { scale: 0.95 } : {}}
                  style={{
                    padding: '14px 10px',
                    borderRadius: 12,
                    border: selected ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.1)',
                    background: selected ? `${color}22` : 'rgba(255,255,255,0.03)',
                    color: 'inherit',
                    cursor: revealed ? 'default' : 'pointer',
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: /^[01]+$/.test(opt.label) || opt.label.startsWith('$')
                      ? 'ui-monospace, SFMono-Regular, Menlo, monospace'
                      : 'inherit',
                  }}
                >
                  {opt.label}
                </motion.button>
              )
            })}
          </div>

          {!revealed ? (
            <motion.button
              onClick={submit}
              disabled={!guess}
              whileHover={guess ? { scale: 1.02 } : {}}
              whileTap={guess ? { scale: 0.96 } : {}}
              style={{
                width: '100%',
                padding: '11px 0',
                borderRadius: 12,
                border: 'none',
                background: guess ? `linear-gradient(135deg, ${color}, #db2777)` : 'rgba(255,255,255,0.08)',
                color: '#fff',
                cursor: guess ? 'pointer' : 'not-allowed',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Lock it in 🔒
            </motion.button>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    fontSize: 13,
                    background: isCorrect ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.1)',
                    color: isCorrect ? '#16a34a' : '#dc2626',
                    fontWeight: 600,
                  }}
                >
                  {isCorrect
                    ? '✅ Correct!'
                    : `❌ Not quite — it was ${round.correctKey}.`}
                  {round.explain && (
                    <div style={{ marginTop: 4, fontWeight: 400, opacity: 0.85, color: 'inherit' }}>
                      {round.explain}
                    </div>
                  )}
                </div>
                <FailStateAnimation
                  kind={failKind}
                  show={showFail && !isCorrect}
                  onDone={() => setShowFail(false)}
                />
                {!isLast ? (
                  <motion.button
                    onClick={onNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      padding: '10px 0',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'transparent',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Next round →
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={onNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      padding: '10px 0',
                      borderRadius: 10,
                      border: 'none',
                      background: `linear-gradient(135deg, ${color}, #db2777)`,
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    See results 🏁
                  </motion.button>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}
    />
  )
}
