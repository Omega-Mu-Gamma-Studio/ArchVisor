/**
 * ConfettiBurst — a small burst of animated particles for celebratory
 * moments (achievement unlocks, correct streaks, boss clears). Pure CSS/
 * Framer Motion, no new dependencies. Respects prefers-reduced-motion by
 * rendering nothing.
 */

import { motion } from 'framer-motion'

const COLORS = ['#ff7a18', '#db2777', '#6d28d9', '#16a34a', '#0ea5e9', '#eab308']

function makeParticles(count) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
    const distance = 60 + Math.random() * 50
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 20,
      color: COLORS[i % COLORS.length],
      size: 5 + Math.random() * 5,
      rotate: Math.random() * 360,
    }
  })
}

export default function ConfettiBurst({ show, count = 16 }) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  if (!show || prefersReducedMotion) return null

  const particles = makeParticles(count)

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 0.6 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: p.size,
            height: p.size,
            borderRadius: 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  )
}
