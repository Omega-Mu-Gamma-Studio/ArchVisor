/**
 * SandboxModeWrapper — "Break the CPU" mode.
 *
 * Relaxes normal input validation for a wrapped tool and visibly shows what
 * breaks, via an animated "chaos" state instead of a plain validation
 * error. Calls the existing engine function AS-IS — this wrapper only
 * changes which inputs are allowed to reach it, never the engine's logic.
 *
 * Props:
 *   toolId: string
 *   engineFn: (input) => result — the existing, unmodified engine function
 *   classifyChaos?: (input, error) => 'mild' | 'severe' | 'extreme'
 *   children: ({ run, chaosResult, resetChaos }) => ReactNode
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGamificationStore from '../store/gamificationStore.js'

const defaultClassify = () => 'mild'

export default function SandboxModeWrapper({ toolId, engineFn, classifyChaos = defaultClassify, children }) {
  const [chaosResult, setChaosResult] = useState(null)
  const registerChaos = useGamificationStore((state) => state.registerChaos)

  const run = useCallback(
    (input) => {
      try {
        const result = engineFn(input)
        setChaosResult({ ok: true, result, level: null })
        return result
      } catch (error) {
        const level = classifyChaos(input, error)
        registerChaos(toolId, level)
        setChaosResult({ ok: false, error: error?.message || String(error), level })
        return null
      }
    },
    [engineFn, classifyChaos, registerChaos, toolId]
  )

  const resetChaos = useCallback(() => setChaosResult(null), [])

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 10px',
          borderRadius: 999,
          background: 'rgba(220, 38, 38, 0.1)',
          color: '#dc2626',
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        ⚠ Sandbox Mode — experimental, may show broken/undefined behavior
      </div>

      {children({ run, chaosResult, resetChaos })}

      <AnimatePresence>
        {chaosResult && !chaosResult.ok && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
            animate={{ opacity: 1, scale: 1, rotate: [0, -1.5, 1.5, 0] }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(220, 38, 38, 0.12)',
              color: '#991b1b',
              fontSize: 13,
            }}
          >
            💥 It broke: {chaosResult.error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
