/**
 * EasterEgg — one hidden interaction, mounted ONCE at the layout level
 * (alongside <Outlet />, not inside it).
 *
 * Implements a Konami-code-style key sequence: ArrowUp ArrowUp ArrowDown
 * ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a
 * On success, shows a small one-off visual joke and unlocks nothing
 * required — purely a low-stakes surprise.
 *
 * Mounting this requires a single global keydown listener at the app
 * shell level. Per the spec's one narrow exception, if App.jsx cannot be
 * avoided, only a single line should be added there:
 *   <EasterEgg />
 * placed as a sibling to <Outlet /> inside the Layout component.
 * See INTEGRATION.md for the exact diff and the zero-edit alternative
 * (AppWithGamification.jsx) that avoids touching App.jsx at all.
 */

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

export default function EasterEgg() {
  const [triggered, setTriggered] = useState(false)
  const bufferRef = useRef([])

  useEffect(() => {
    function handleKeyDown(e) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const buffer = [...bufferRef.current, key].slice(-KONAMI.length)
      bufferRef.current = buffer

      if (buffer.length === KONAMI.length && buffer.every((k, i) => k === KONAMI[i])) {
        setTriggered(true)
        bufferRef.current = []
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!triggered) return undefined
    const timer = setTimeout(() => setTriggered(false), 3500)
    return () => clearTimeout(timer)
  }, [triggered])

  return (
    <AnimatePresence>
      {triggered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: [0, -3, 3, 0] }}
          exit={{ opacity: 0, scale: 0.8 }}
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            padding: '14px 22px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #6d28d9, #db2777)',
            color: '#fff',
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          🎮 30 extra lives granted. (Not really — this is a CPU, not a game console.)
        </motion.div>
      )}
    </AnimatePresence>
  )
}
