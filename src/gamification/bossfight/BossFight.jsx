/**
 * BossFight — the actual battle. Predict each round correctly to damage
 * the boss; get it wrong and you take damage. Run out of HP and you lose
 * (retry). Clear every round with HP left and the boss shatters — that's
 * when onVictory fires (which the wrapper uses to mark the boss cleared).
 */

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BossArena3D from './BossArena3D.jsx'
import { ROUND_BUILDERS } from './bossFightContent.js'
import { BOSS_FLAVOR } from './bossFlavor.js'

const PLAYER_MAX_HP = 3

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function HeartRow({ hp, max }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ fontSize: 18, opacity: i < hp ? 1 : 0.25 }}>
          {i < hp ? '❤️' : '🖤'}
        </span>
      ))}
    </div>
  )
}

export default function BossFight({ unitId, scenario, onVictory }) {
  const flavor = BOSS_FLAVOR[unitId]
  const [runSeed, setRunSeed] = useState(0)
  const [roundIndex, setRoundIndex] = useState(0)
  const [playerHP, setPlayerHP] = useState(PLAYER_MAX_HP)
  const [guess, setGuess] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(null)
  const [hitId, setHitId] = useState(0)
  const [victoryId, setVictoryId] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const rounds = useMemo(() => {
    const builder = ROUND_BUILDERS[unitId]
    return builder ? builder(scenario) : []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId, scenario, runSeed])

  const totalRounds = rounds.length
  const round = rounds[roundIndex]
  const bossHpFraction = totalRounds > 0 ? Math.max(0, 1 - correctCount / totalRounds) : 1
  const defeated = playerHP <= 0
  const victorious = correctCount >= totalRounds && totalRounds > 0

  // Victory is decided by the answer that finishes the last round, so it's
  // resolved right here in the click handler — not derived + re-triggered
  // via an effect, which would fire an extra render for no reason.
  const submit = useCallback(() => {
    if (!guess || revealed) return
    const correct = guess === round.correctKey
    setRevealed(true)
    setLastCorrect(correct)
    if (correct) {
      const newCount = correctCount + 1
      setCorrectCount(newCount)
      setHitId((id) => id + 1)
      if (newCount >= totalRounds) {
        setVictoryId((id) => id + 1)
        onVictory?.()
      }
    } else {
      setPlayerHP((hp) => Math.max(0, hp - 1))
    }
  }, [guess, revealed, round, correctCount, totalRounds, onVictory])

  const next = useCallback(() => {
    setGuess(null)
    setRevealed(false)
    setLastCorrect(null)
    setRoundIndex((i) => i + 1)
  }, [])

  const retry = useCallback(() => {
    setRunSeed((s) => s + 1)
    setRoundIndex(0)
    setPlayerHP(PLAYER_MAX_HP)
    setGuess(null)
    setRevealed(false)
    setLastCorrect(null)
    setCorrectCount(0)
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px, 380px)', gap: 20 }}>
      {/* ── 3D arena ─────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        height: 380,
        borderRadius: 16,
        overflow: 'hidden',
        background: `radial-gradient(circle at 50% 40%, ${flavor.color}22, #05050a 70%)`,
        border: `1px solid ${flavor.color}40`,
      }}>
        <BossArena3D
          color={flavor.color}
          geometry={flavor.geometry}
          hitId={hitId}
          victoryId={victoryId}
          defeated={defeated}
        />

        {/* boss HP bar */}
        <div style={{ position: 'absolute', top: 14, left: 14, right: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4, color: '#fff' }}>
            <span>{flavor.name}</span>
            <span>{Math.round(bossHpFraction * 100)}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${bossHpFraction * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${flavor.color}, #fff)` }}
            />
          </div>
        </div>

        {/* player HP */}
        <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
          <HeartRow hp={playerHP} max={PLAYER_MAX_HP} />
        </div>

        <AnimatePresence>
          {defeated && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 14,
                background: 'rgba(120,0,0,0.35)', backdropFilter: 'blur(2px)',
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>DEFEATED</div>
              <div style={{ fontSize: 13, color: '#fff', opacity: 0.85 }}>The boss got the better of you this time.</div>
              <motion.button
                onClick={retry}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ padding: '10px 22px', borderRadius: 999, border: 'none', background: '#fff', color: '#111', fontWeight: 800, cursor: 'pointer' }}
              >
                Try again ↻
              </motion.button>
            </motion.div>
          )}
          {victorious && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 10,
                background: `radial-gradient(circle, ${flavor.color}33, rgba(0,0,0,0.5))`,
              }}
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: 1 }}
              >
                🏆 VICTORY
              </motion.div>
              <div style={{ fontSize: 13, color: '#fff', opacity: 0.9 }}>{flavor.name} is defeated.</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── question panel ──────────────────────────────── */}
      <div style={{
        borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.03)', padding: 18,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {!defeated && !victorious && round && (
          <>
            <div style={{ fontSize: 11, opacity: 0.55 }}>Round {roundIndex + 1} of {totalRounds}</div>
            <div style={{
              fontSize: 14, fontWeight: 700,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              lineHeight: 1.5,
            }}>
              {round.prompt}
            </div>
            <div style={{ fontSize: 12, opacity: 0.65 }}>{round.subtitle}</div>

            <div style={{ display: 'grid', gridTemplateColumns: round.options.length > 2 ? '1fr 1fr' : '1fr', gap: 8, marginTop: 4 }}>
              {round.options.map((opt) => {
                const selected = guess === opt.key
                const showCorrect = revealed && opt.key === round.correctKey
                const showWrong = revealed && selected && opt.key !== round.correctKey
                return (
                  <motion.button
                    key={opt.key}
                    disabled={revealed}
                    onClick={() => setGuess(opt.key)}
                    whileHover={!revealed ? { scale: 1.02 } : {}}
                    whileTap={!revealed ? { scale: 0.96 } : {}}
                    style={{
                      padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                      border: showCorrect ? '2px solid #22c55e' : showWrong ? '2px solid #dc2626' : selected ? `2px solid ${flavor.color}` : '2px solid rgba(255,255,255,0.1)',
                      background: showCorrect ? 'rgba(34,197,94,0.12)' : showWrong ? 'rgba(220,38,38,0.12)' : selected ? `${flavor.color}22` : 'rgba(255,255,255,0.03)',
                      color: 'inherit', cursor: revealed ? 'default' : 'pointer',
                      fontWeight: 700, fontSize: 13,
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
                  marginTop: 6, padding: '11px 0', borderRadius: 10, border: 'none',
                  background: guess ? `linear-gradient(135deg, ${flavor.color}, #db2777)` : 'rgba(255,255,255,0.08)',
                  color: '#fff', fontWeight: 800, fontSize: 13,
                  cursor: guess ? 'pointer' : 'not-allowed',
                }}
              >
                Attack 🗡️
              </motion.button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, padding: '8px 10px', borderRadius: 8,
                  background: lastCorrect ? 'rgba(34,197,94,0.12)' : 'rgba(220,38,38,0.1)',
                  color: lastCorrect ? '#22c55e' : '#dc2626',
                }}>
                  {lastCorrect ? pick(flavor.hitTaunts) : `${pick(flavor.missTaunts)} (it was "${round.options.find(o => o.key === round.correctKey)?.label}")`}
                </div>
                <motion.button
                  onClick={next}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                  style={{
                    padding: '10px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent', color: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  {roundIndex + 1 >= totalRounds ? 'Finish →' : 'Next round →'}
                </motion.button>
              </div>
            )}
          </>
        )}

        {defeated && (
          <div style={{ fontSize: 13, opacity: 0.7, margin: 'auto' }}>
            You're out of HP — hit "Try again" on the left to restart this fight.
          </div>
        )}
        {victorious && (
          <div style={{ fontSize: 13, opacity: 0.85, margin: 'auto', textAlign: 'center' }}>
            🎉 Boss cleared! Scroll down to explore the tool freely, or head back to the Arcade.
          </div>
        )}
      </div>
    </div>
  )
}
