/**
 * MiniGamesSection — new "🕹️ Mini-Games" block for ArcadeHub. Lets the
 * player pick one of the new mini-games (Register Rush, Binary Blitz,
 * Hazard Hunter) via tab chips, then renders it with <MiniGamePlayer />.
 * Purely additive: imported by ArcadeHub, doesn't touch anything else.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import useGamificationStore from '../store/gamificationStore.js'
import { MINI_GAMES } from './gameContent.js'
import MiniGamePlayer from './MiniGamePlayer.jsx'

function GameTab({ game, active, best, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        flex: '1 1 160px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 14,
        border: active ? `1px solid ${game.color}80` : '1px solid rgba(255,255,255,0.08)',
        background: active ? `${game.color}18` : 'rgba(255,255,255,0.03)',
        color: 'inherit',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 22 }} aria-hidden="true">{game.icon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{game.title}</div>
        <div style={{ fontSize: 11, opacity: 0.6 }}>
          {best > 0 ? `🔥 best streak ${best}` : game.unitLabel}
        </div>
      </div>
    </motion.button>
  )
}

export default function MiniGamesSection() {
  const [activeId, setActiveId] = useState(MINI_GAMES[0].id)
  const streaks = useGamificationStore((s) => s.streaks)
  const activeGame = MINI_GAMES.find((g) => g.id === activeId)

  return (
    <div
      style={{
        padding: '22px 22px',
        borderRadius: 18,
        background: 'linear-gradient(160deg, rgba(14,165,233,0.1), rgba(234,179,8,0.05))',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>🕹️ Mini-Games</div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>Five quick rounds each — pick one and go</div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        {MINI_GAMES.map((game) => (
          <GameTab
            key={game.id}
            game={game}
            active={game.id === activeId}
            best={streaks[game.toolId]?.best || 0}
            onClick={() => setActiveId(game.id)}
          />
        ))}
      </div>

      <div
        key={activeId}
        style={{
          padding: '18px 16px',
          borderRadius: 14,
          background: 'rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 12 }}>
          {activeGame.tagline}
        </div>
        <MiniGamePlayer game={activeGame} />
      </div>
    </div>
  )
}
