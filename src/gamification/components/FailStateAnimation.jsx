/**
 * FailStateAnimation — meme-able wrong-answer animations, keyed by failure
 * type. Purely presentational; never influences engine state. Kept under
 * ~800ms and skippable (click/tap to dismiss early) so it never slows down
 * fast retry loops.
 *
 * Usage: <FailStateAnimation kind="adder.overflow" show={showFail} onDone={...} />
 */

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFailMessage } from '../content/failMessages.js'

const VARIANTS = {
  explode: {
    initial: { scale: 0.6, opacity: 0, rotate: 0 },
    animate: { scale: [0.6, 1.15, 1], opacity: 1, rotate: [0, -4, 4, 0] },
    exit: { scale: 0.8, opacity: 0 },
  },
  'bounce-wrong-way': {
    initial: { x: 0, opacity: 0 },
    animate: { x: [0, -14, 10, -6, 0], opacity: 1 },
    exit: { opacity: 0 },
  },
  'alarm-flash': {
    initial: { opacity: 0 },
    animate: { opacity: [0, 1, 0.4, 1] },
    exit: { opacity: 0 },
  },
  shake: {
    initial: { x: 0, opacity: 0 },
    animate: { x: [0, -8, 8, -4, 4, 0], opacity: 1 },
    exit: { opacity: 0 },
  },
}

export default function FailStateAnimation({ kind, show, onDone }) {
  const { caption, animation, durationMs } = getFailMessage(kind)
  const variant = VARIANTS[animation] || VARIANTS.shake

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!show) return undefined
    const t = setTimeout(() => onDone?.(), durationMs)
    return () => clearTimeout(t)
  }, [show, durationMs, onDone])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="alert"
          onClick={() => onDone?.()}
          initial={prefersReducedMotion ? { opacity: 0 } : variant.initial}
          animate={prefersReducedMotion ? { opacity: 1 } : variant.animate}
          exit={variant.exit}
          transition={{ duration: durationMs / 1000 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 10,
            background: 'rgba(220, 38, 38, 0.12)',
            color: '#dc2626',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {caption}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
