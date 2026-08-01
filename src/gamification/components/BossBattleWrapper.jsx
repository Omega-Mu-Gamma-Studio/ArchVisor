/**
 * BossBattleWrapper — wraps an existing tool component with a scripted
 * "boss" scenario for a unit. Renders the wrapped tool unmodified, passing
 * the boss scenario in as a prop (`initialScenario`) — it never forks or
 * copy-pastes the tool's internals.
 *
 * Props:
 *   unitId: string — e.g. 'unit3'
 *   ToolComponent: React component — the existing tool to preload
 *   onCleared?: () => void
 *
 * The wrapped ToolComponent is expected to accept an `initialScenario` prop
 * it can use to seed its own existing state (this is the same shape of
 * prop a "Challenge a Friend" link would pass in via decodeChallenge).
 * If a given tool doesn't yet support `initialScenario`, this wrapper still
 * renders it — the intro screen and scenario metadata work regardless;
 * full preloading support can be layered in per-tool without any of this
 * wrapper's code changing.
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGamificationStore from '../store/gamificationStore.js'
import { getBossScenario } from '../content/bossScenarios.js'
import BossFight from '../bossfight/BossFight.jsx'

export default function BossBattleWrapper({ unitId, ToolComponent, onCleared, toolProps = {} }) {
  const boss = getBossScenario(unitId)
  const [phase, setPhase] = useState('intro') // 'intro' | 'fight' | 'cleared'
  const cleared = useGamificationStore((state) => state.bossesCleared.includes(unitId))
  const clearBoss = useGamificationStore((state) => state.clearBoss)

  const handleCleared = useCallback(() => {
    clearBoss(unitId)
    onCleared?.()
    setPhase('cleared')
  }, [clearBoss, unitId, onCleared])

  if (!boss) {
    return <div style={{ padding: 24 }}>No boss battle is defined for this unit yet.</div>
  }

  return (
    <div style={{ position: 'relative' }}>
      <AnimatePresence mode="wait">
        {phase === 'intro' ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            <div style={{ fontSize: 13, letterSpacing: 1, opacity: 0.6, marginBottom: 8 }}>
              BOSS BATTLE
            </div>
            <h2 style={{ fontSize: 28, marginBottom: 12 }}>{boss.title}</h2>
            <p style={{ opacity: 0.8, marginBottom: 24 }}>{boss.intro}</p>
            {cleared && (
              <div style={{ marginBottom: 16, fontSize: 13, color: '#16a34a' }}>
                ✓ Already cleared — you can replay any time.
              </div>
            )}
            <button
              onClick={() => setPhase('fight')}
              style={{
                padding: '10px 22px',
                borderRadius: 10,
                border: 'none',
                background: '#111',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Enter Battle
            </button>
          </motion.div>
        ) : (
          <motion.div key="battle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BossFight unitId={unitId} scenario={boss.scenario} onVictory={handleCleared} />

            {phase === 'cleared' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ marginTop: 28 }}
              >
                <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 10, textAlign: 'center' }}>
                  Want to poke at the real tool behind this fight? It's preloaded with the same scenario.
                </div>
                <ToolComponent
                  {...toolProps}
                  initialScenario={boss.scenario}
                  onScenarioSolved={() => {}}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
