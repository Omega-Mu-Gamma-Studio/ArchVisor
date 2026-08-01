/**
 * MiniGamePlayer — plays N rounds of a given mini-game config (from
 * gameContent.js), then shows a score summary with a replay button.
 * Same composition pattern as ArcadeHub's existing LiveDemo/CacheDemoRound:
 * it wraps existing gamification primitives, never edits them.
 */

import { useMemo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import StreakBadge from '../components/StreakBadge.jsx'
import ConfettiBurst from '../components/ConfettiBurst.jsx'
import MiniGameRound from './MiniGameRound.jsx'

const ROUNDS_PER_GAME = 5

const FAIL_KIND_BY_GAME = {
  'register-rush': 'mips.wrongRegisterValue',
  'binary-blitz': 'generic',
  'hazard-hunter': 'hazard.misclassified',
}

export default function MiniGamePlayer({ game }) {
  const [seed, setSeed] = useState(0) // bump to force a fresh set of rounds
  const [roundIndex, setRoundIndex] = useState(0)
  const [results, setResults] = useState([])
  const [usedIndices] = useState(() => new Set())

  const rounds = useMemo(() => {
    usedIndices.clear()
    const generated = []
    for (let i = 0; i < ROUNDS_PER_GAME; i++) {
      const round = game.generate(usedIndices)
      if (round._idx !== undefined) usedIndices.add(round._idx)
      generated.push(round)
    }
    return generated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, seed])

  const finished = roundIndex >= rounds.length
  const score = results.filter(Boolean).length

  const handleResult = useCallback((correct) => {
    setResults((prev) => {
      const next = [...prev]
      next[roundIndex] = correct
      return next
    })
  }, [roundIndex])

  const handleNext = useCallback(() => {
    setRoundIndex((i) => i + 1)
  }, [])

  const playAgain = useCallback(() => {
    setSeed((s) => s + 1)
    setRoundIndex(0)
    setResults([])
  }, [])

  if (finished) {
    const perfect = score === rounds.length
    return (
      <div style={{ position: 'relative', textAlign: 'center', padding: '10px 4px' }}>
        <ConfettiBurst show={perfect} count={24} />
        <div style={{ fontSize: 34, marginBottom: 6 }}>{perfect ? '🏆' : '🎮'}</div>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
          {score} / {rounds.length} correct
        </div>
        <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 18 }}>
          {perfect
            ? "Flawless run! You've got this cold."
            : score >= rounds.length / 2
              ? 'Solid round — go again to push the streak.'
              : "Rough round — that's exactly what this game is for. Try again."}
        </div>
        <motion.button
          onClick={playAgain}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          style={{
            padding: '10px 22px',
            borderRadius: 999,
            border: 'none',
            background: `linear-gradient(135deg, ${game.color}, #db2777)`,
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Play again ↻
        </motion.button>
      </div>
    )
  }

  const round = rounds[roundIndex]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <StreakBadge toolId={game.toolId} compact />
      </div>
      <MiniGameRound
        toolId={game.toolId}
        conceptTag={round.conceptTag}
        color={game.color}
        round={round}
        index={roundIndex}
        total={rounds.length}
        isLast={roundIndex === rounds.length - 1}
        onNext={handleNext}
        onResult={handleResult}
        failKind={FAIL_KIND_BY_GAME[game.id] || 'generic'}
      />
    </div>
  )
}
