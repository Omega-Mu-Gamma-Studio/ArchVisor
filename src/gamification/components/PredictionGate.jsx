/**
 * PredictionGate — minimal "predict before you see" wrapper, and the
 * single source of truth event stream for correct/incorrect predictions.
 *
 * Every v2 system (XP, weak-spot tracking, comeback detection, mastery
 * completion) subscribes to this same stream via the optional props
 * below, rather than each feature emitting its own parallel event — so
 * streaks/XP/weak-spots/mastery never drift out of sync with each other.
 *
 * Props:
 *   toolId: string — used to key the per-tool streak (and, if provided,
 *           as the toolId passed to navigationStore.markCompleted)
 *   expected: any — the correct value/answer, ALREADY computed by the
 *             existing engine (this component never computes it itself)
 *   onReveal?: (isCorrect: boolean) => void
 *   renderPrompt: ({ guess, setGuess, submit, revealed, isCorrect, isComeback }) => ReactNode
 *
 *   -- v2 (all optional; omitting them keeps v1 behavior identical) --
 *   conceptTag?: string — a weak-spot taxonomy key (see weakSpotTaxonomy.js).
 *                If omitted but toolId matches a known default, conceptTagger
 *                still resolves one; pass explicitly when you know it.
 *   difficulty?: 'easy'|'medium'|'hard' — for XP bonus, default 'medium'
 *   unitId?: string — if provided together with toolId, a correct answer
 *            calls the existing navigationStore.markCompleted(toolId) so
 *            Mastery Map has real signal (navigationStore itself is never
 *            modified — this only calls its existing public action).
 */

import { useState, useCallback } from 'react'
import useGamificationStore from '../store/gamificationStore.js'
import useXPStore from '../v2/store/xpStore.js'
import useWeakSpotStore from '../v2/store/weakSpotStore.js'
import useNavigationStore from '../../store/navigationStore.js'
import useMasteryStore from '../v2/store/masteryStore.js'
import { calculateXP } from '../v2/utils/xpCalculator.js'
import { tagConcept } from '../v2/utils/conceptTagger.js'

export default function PredictionGate({
  toolId,
  expected,
  onReveal,
  renderPrompt,
  conceptTag,
  difficulty = 'medium',
  unitId,
}) {
  const [guess, setGuess] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [isComeback, setIsComeback] = useState(false)
  const [startedAt, setStartedAt] = useState(() => performance.now())

  const registerCorrect = useGamificationStore((state) => state.registerCorrect)
  const registerIncorrect = useGamificationStore((state) => state.registerIncorrect)
  const registerComeback = useGamificationStore((state) => state.registerComeback)
  const awardXP = useXPStore((state) => state.awardXP)
  const registerMiss = useWeakSpotStore((state) => state.registerMiss)
  const registerCorrectAndCheckComeback = useWeakSpotStore((state) => state.registerCorrectAndCheckComeback)
  const markCompleted = useNavigationStore((state) => state.markCompleted)

  const submit = useCallback(() => {
    if (revealed) return
    const normalizedGuess = String(guess).trim().toLowerCase()
    const normalizedExpected = String(expected).trim().toLowerCase()
    const correct = normalizedGuess === normalizedExpected
    const elapsedMs = performance.now() - startedAt
    const resolvedTag = tagConcept(toolId, conceptTag)

    setIsCorrect(correct)
    setRevealed(true)

    if (correct) {
      registerCorrect(toolId)
      const comeback = registerCorrectAndCheckComeback(resolvedTag)
      setIsComeback(comeback)
      if (comeback) registerComeback()
      awardXP(calculateXP({ correct: true, difficulty, elapsedMs, isComeback: comeback }))
      if (unitId) {
        markCompleted(toolId)
        const currentStreak = useGamificationStore.getState().streaks[toolId]?.current || 0
        useMasteryStore.getState().checkMastery(`${unitId}/${toolId}`, currentStreak)
      }
    } else {
      registerIncorrect(toolId)
      registerMiss(resolvedTag)
      setIsComeback(false)
      awardXP(calculateXP({ correct: false, difficulty }))
    }
    onReveal?.(correct)
  }, [
    guess, expected, revealed, toolId, conceptTag, difficulty, unitId, onReveal, startedAt,
    registerCorrect, registerIncorrect, registerComeback, awardXP,
    registerMiss, registerCorrectAndCheckComeback, markCompleted,
  ])

  const reset = useCallback(() => {
    setGuess('')
    setRevealed(false)
    setIsCorrect(null)
    setIsComeback(false)
    setStartedAt(performance.now())
  }, [])

  return renderPrompt({ guess, setGuess, submit, reset, revealed, isCorrect, isComeback })
}
