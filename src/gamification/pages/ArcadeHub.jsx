/**
 * ArcadeHub — new page (route: /arcade). This is the fun/engagement
 * layer's front door: badges, boss battles, and a live playable demo
 * round, all with real juice (motion, color, confetti, streak fire)
 * instead of a plain settings-style list.
 *
 * The live demo is original content (a short cache reference sequence)
 * exercising PredictionGate, StreakBadge, SpeedrunTimer, NarratorToggle,
 * AnalogyToggle, ConfettiBurst, and FailStateAnimation end-to-end — it
 * does not reach into CacheSimulator's internals.
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useGamificationStore from '../store/gamificationStore.js'
import StreakBadge from '../components/StreakBadge.jsx'
import SpeedrunTimer from '../components/SpeedrunTimer.jsx'
import PredictionGate from '../components/PredictionGate.jsx'
import NarratorToggle from '../components/NarratorToggle.jsx'
import AnalogyToggle from '../components/AnalogyToggle.jsx'
import FailStateAnimation from '../components/FailStateAnimation.jsx'
import ConfettiBurst from '../components/ConfettiBurst.jsx'
import useNarratorLine from '../hooks/useNarratorLine.js'
import useAnalogy from '../hooks/useAnalogy.js'
import { ACHIEVEMENTS } from '../content/achievements.js'
import XPBar from '../v2/components/XPBar.jsx'
import ReportCardExporter from '../v2/components/ReportCardExporter.jsx'
import useMasteryStore from '../v2/store/masteryStore.js'
import { TOOL_CATALOG } from '../v2/content/toolCatalog.js'
import MiniGamesSection from '../games/MiniGamesSection.jsx'

const UNITS = [
  { id: 'unit1', label: 'Register Gauntlet', sub: 'Unit I — MIPS Basics', icon: '🧠', color: '#0ea5e9' },
  { id: 'unit2', label: "Booth's Gambit", sub: 'Unit II — Arithmetic', icon: '🔢', color: '#eab308' },
  { id: 'unit3', label: 'Hazard Overload', sub: 'Unit III — Pipelining', icon: '⚡', color: '#db2777' },
  { id: 'unit4', label: 'The MESI Standoff', sub: 'Unit IV — Parallel', icon: '🖥️', color: '#16a34a' },
  { id: 'unit5', label: 'Thrash Mode', sub: 'Unit V — Memory', icon: '🗄️', color: '#6d28d9' },
]

const DEMO_SEQUENCE = ['0x10', '0x20', '0x10', '0x30', '0x10', '0x20', '0x10']

function StatChip({ icon, label, value, color }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 999,
        background: `${color}18`,
        border: `1px solid ${color}40`,
      }}
    >
      <span style={{ fontSize: 16 }} aria-hidden="true">{icon}</span>
      <span style={{ fontSize: 12, opacity: 0.7 }}>{label}</span>
      <span style={{ fontWeight: 800, fontSize: 14, color }}>{value}</span>
    </div>
  )
}

function BossCard({ unit, cleared }) {
  return (
    <Link to={`/unit/${unit.id}/boss`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '18px 18px',
          borderRadius: 16,
          background: cleared
            ? `linear-gradient(135deg, ${unit.color}25, ${unit.color}08)`
            : 'rgba(255,255,255,0.03)',
          border: cleared ? `1px solid ${unit.color}80` : '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            fontSize: 26,
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            background: `${unit.color}22`,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {unit.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{unit.label}</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>{unit.sub}</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: cleared ? unit.color : 'inherit', opacity: cleared ? 1 : 0.4 }}>
          {cleared ? '✓ CLEARED' : 'ENTER →'}
        </div>
      </motion.div>
    </Link>
  )
}

function CacheDemoRound({ index, address, expected, onNext, onCorrect }) {
  const [runComplete, setRunComplete] = useState(false)
  const [showFail, setShowFail] = useState(false)
  const [showCorrectBurst, setShowCorrectBurst] = useState(false)

  const missNarration = useNarratorLine('cache.miss', "Actually a miss — that wasn't cached.")
  const hitNarration = useNarratorLine('cache.hit', "Actually a hit — already in cache.")
  const { analogyOn, analogy } = useAnalogy('cache.general')

  return (
    <PredictionGate
      key={index}
      toolId="arcade-cache-demo"
      expected={expected}
      onReveal={(correct) => {
        setRunComplete(true)
        if (correct) {
          setShowCorrectBurst(true)
          onCorrect?.()
          setTimeout(() => setShowCorrectBurst(false), 700)
        } else {
          setShowFail(true)
        }
      }}
      renderPrompt={({ guess, setGuess, submit, revealed, isCorrect }) => (
        <div style={{ position: 'relative' }}>
          <SpeedrunTimer toolId="arcade-cache-demo" active={!runComplete} completed={runComplete} />

          <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>
            Reference <strong>#{index + 1}</strong> of {DEMO_SEQUENCE.length} — address{' '}
            <code style={{ padding: '1px 6px', borderRadius: 6, background: 'rgba(255,255,255,0.08)' }}>
              {address}
            </code>
          </div>
          {analogyOn && analogy && (
            <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 12 }}>💡 {analogy}</div>
          )}

          <div style={{ position: 'relative', display: 'flex', gap: 12, marginBottom: 14 }}>
            <ConfettiBurst show={showCorrectBurst} count={18} />
            {[
              { key: 'hit', emoji: '✅', label: 'HIT', color: '#16a34a' },
              { key: 'miss', emoji: '❌', label: 'MISS', color: '#dc2626' },
            ].map((opt) => (
              <motion.button
                key={opt.key}
                disabled={revealed}
                onClick={() => setGuess(opt.key)}
                whileHover={!revealed ? { scale: 1.04 } : {}}
                whileTap={!revealed ? { scale: 0.94 } : {}}
                style={{
                  flex: 1,
                  padding: '18px 0',
                  borderRadius: 14,
                  border: guess === opt.key ? `2px solid ${opt.color}` : '2px solid rgba(255,255,255,0.1)',
                  background: guess === opt.key ? `${opt.color}22` : 'rgba(255,255,255,0.03)',
                  color: 'inherit',
                  cursor: revealed ? 'default' : 'pointer',
                  fontSize: 15,
                  fontWeight: 800,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 26 }}>{opt.emoji}</span>
                {opt.label}
              </motion.button>
            ))}
          </div>

          {!revealed ? (
            <motion.button
              onClick={submit}
              disabled={!guess}
              whileHover={guess ? { scale: 1.03 } : {}}
              whileTap={guess ? { scale: 0.96 } : {}}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 12,
                border: 'none',
                background: guess ? 'linear-gradient(135deg, #6d28d9, #db2777)' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                cursor: guess ? 'pointer' : 'not-allowed',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Lock it in 🔒
            </motion.button>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={isCorrect ? 'correct' : 'wrong'}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    background: isCorrect ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.12)',
                    color: isCorrect ? '#22c55e' : '#f87171',
                  }}
                >
                  {isCorrect
                    ? `🎉 Nailed it — it was a ${expected}.`
                    : `${expected === 'miss' ? missNarration : hitNarration}`}
                </div>
                <FailStateAnimation
                  kind={expected === 'hit' ? 'cache.mispredictedMiss' : 'cache.mispredictedHit'}
                  show={showFail && !isCorrect}
                  onDone={() => setShowFail(false)}
                />
                {index < DEMO_SEQUENCE.length - 1 ? (
                  <motion.button
                    onClick={onNext}
                    whileHover={{ scale: 1.03 }}
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
                    Next reference →
                  </motion.button>
                ) : (
                  <div style={{ fontSize: 13, textAlign: 'center', opacity: 0.7, padding: '6px 0' }}>
                    🏁 Round complete! Refresh the page or scroll up to try for a better streak.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}
    />
  )
}

function LiveDemo() {
  const [roundIndex, setRoundIndex] = useState(0)
  const address = DEMO_SEQUENCE[roundIndex]
  const seenBefore = useMemo(
    () => DEMO_SEQUENCE.slice(0, roundIndex).includes(address),
    [roundIndex, address]
  )
  const expected = seenBefore ? 'hit' : 'miss'
  const streak = useGamificationStore((s) => s.streaks['arcade-cache-demo']?.current || 0)

  return (
    <div
      style={{
        position: 'relative',
        padding: '22px 22px',
        borderRadius: 18,
        background: 'linear-gradient(160deg, rgba(109,40,217,0.12), rgba(219,39,119,0.06))',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>⚡ Cache Ninja</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>Guess hit or miss before the CPU tells you</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <NarratorToggle />
          <AnalogyToggle />
        </div>
      </div>

      {streak >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: 14,
            padding: '8px 12px',
            borderRadius: 10,
            background: 'rgba(255,122,24,0.12)',
            color: '#ff7a18',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          🔥 You're on fire! {streak} in a row.
        </motion.div>
      )}

      <CacheDemoRound
        index={roundIndex}
        address={address}
        expected={expected}
        onNext={() => setRoundIndex((i) => Math.min(i + 1, DEMO_SEQUENCE.length - 1))}
      />

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <StreakBadge toolId="arcade-cache-demo" />
      </div>
    </div>
  )
}

export default function ArcadeHub() {
  const bossesCleared = useGamificationStore((state) => state.bossesCleared)
  const unlockedCount = useGamificationStore((state) => state.unlockedAchievements.length)
  const bestGlobalStreak = useGamificationStore((state) => state.streaks.global?.best || 0)
  const masteredCount = useMasteryStore((s) => s.masteredTools.length)

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 20px 80px' }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 900,
            marginBottom: 6,
            backgroundImage: 'linear-gradient(135deg, #6d28d9, #db2777, #ff7a18)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          🎮 The Arcade
        </h1>
        <p style={{ opacity: 0.65, fontSize: 14, marginBottom: 16 }}>
          Badges, boss fights, and a live round you can play right now.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <StatChip icon="🏆" label="Badges" value={`${unlockedCount}/${ACHIEVEMENTS.length}`} color="#eab308" />
          <StatChip icon="🔥" label="Best streak" value={bestGlobalStreak} color="#ff7a18" />
          <StatChip icon="⚔️" label="Bosses cleared" value={`${bossesCleared.length}/5`} color="#db2777" />
          <XPBar />
        </div>
      </motion.div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 30, flexWrap: 'wrap' }}>
        <Link to="/mastery-map" style={{ flex: 1, minWidth: 200, textDecoration: 'none', color: 'inherit' }}>
          <motion.div whileHover={{ y: -3 }} style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.25)' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>🗺️</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Mastery Map</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{masteredCount}/{TOOL_CATALOG.length} tools mastered</div>
          </motion.div>
        </Link>
        <Link to="/gauntlet" style={{ flex: 1, minWidth: 200, textDecoration: 'none', color: 'inherit' }}>
          <motion.div whileHover={{ y: -3 }} style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(219,39,119,0.08)', border: '1px solid rgba(219,39,119,0.25)' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>🥊</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Gauntlet Mode</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>Quick mixed review before an exam</div>
          </motion.div>
        </Link>
      </div>

      <div style={{ marginBottom: 30 }}>
        <LiveDemo />
      </div>

      <div style={{ marginBottom: 30 }}>
        <MiniGamesSection />
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 700, opacity: 0.8, marginBottom: 12 }}>⚔️ Boss battles</h2>
      <div style={{ display: 'grid', gap: 10, marginBottom: 30 }}>
        {UNITS.map((unit) => (
          <BossCard key={unit.id} unit={unit} cleared={bossesCleared.includes(unit.id)} />
        ))}
      </div>

      <Link
        to="/achievements"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 18px',
          borderRadius: 16,
          background: 'rgba(234,179,8,0.08)',
          border: '1px solid rgba(234,179,8,0.3)',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }} aria-hidden="true">🏆</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>View all achievements</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{unlockedCount} unlocked so far</div>
          </div>
        </div>
        <span style={{ opacity: 0.5 }}>→</span>
      </Link>

      <div style={{ marginTop: 30, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, opacity: 0.8, marginBottom: 12 }}>📤 Report card</h2>
        <ReportCardExporter />
      </div>
    </div>
  )
}
