/**
 * Gamification Store
 *
 * New, additive Zustand store for the fun/engagement layer.
 * Does NOT modify or replace any existing store (navigationStore, mipsStore,
 * pipelineStore, cacheStore) — it only reads from them via selectors passed
 * in by callers, and persists its own state independently.
 *
 * Persisted to localStorage under a single namespaced key.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ACHIEVEMENTS } from '../content/achievements.js'

const STORAGE_KEY = 'archvisor-gamification'

const initialModeToggles = {
  narrator: false,
  analogy: false,
  sandbox: false,
}

const useGamificationStore = create(
  persist(
    (set, get) => ({
      // ── Mode toggles ─────────────────────────────────────────
      modes: { ...initialModeToggles },
      setMode: (mode, value) =>
        set((state) => ({ modes: { ...state.modes, [mode]: value } })),
      toggleMode: (mode) =>
        set((state) => ({ modes: { ...state.modes, [mode]: !state.modes[mode] } })),

      // ── Speedrun best times: { [toolId]: { bestMs, lastMs, runs } } ─
      bestTimes: {},
      recordRun: (toolId, elapsedMs) => {
        const { bestTimes } = get()
        const prev = bestTimes[toolId]
        const isNewBest = !prev || elapsedMs < prev.bestMs
        const next = {
          bestMs: isNewBest ? elapsedMs : prev.bestMs,
          lastMs: elapsedMs,
          runs: (prev?.runs || 0) + 1,
        }
        set({ bestTimes: { ...bestTimes, [toolId]: next } })
        get()._checkAchievements()
        return { isNewBest, best: next.bestMs }
      },

      // ── Streaks: { [toolId]: { current, best } } + a global one ─
      streaks: { global: { current: 0, best: 0 } },
      registerCorrect: (toolId = 'global') => {
        const { streaks } = get()
        const toolStreak = streaks[toolId] || { current: 0, best: 0 }
        const globalStreak = streaks.global || { current: 0, best: 0 }

        const nextTool = {
          current: toolStreak.current + 1,
          best: Math.max(toolStreak.best, toolStreak.current + 1),
        }
        const nextGlobal =
          toolId === 'global'
            ? nextTool
            : {
                current: globalStreak.current + 1,
                best: Math.max(globalStreak.best, globalStreak.current + 1),
              }

        set({
          streaks: {
            ...streaks,
            [toolId]: nextTool,
            global: nextGlobal,
          },
        })
        get()._checkAchievements()
      },
      registerIncorrect: (toolId = 'global') => {
        const { streaks } = get()
        set({
          streaks: {
            ...streaks,
            [toolId]: { ...(streaks[toolId] || { current: 0, best: 0 }), current: 0 },
            global: { ...(streaks.global || { current: 0, best: 0 }), current: 0 },
          },
        })
      },

      // ── Boss battles cleared: Set-like array of unit IDs ────────
      bossesCleared: [],
      clearBoss: (unitId) => {
        const { bossesCleared } = get()
        if (!bossesCleared.includes(unitId)) {
          set({ bossesCleared: [...bossesCleared, unitId] })
          get()._checkAchievements()
        }
      },

      // ── Sandbox "chaos" events triggered, by tool ────────────────
      chaosTriggered: {},
      registerChaos: (toolId, chaosLevel) => {
        const { chaosTriggered } = get()
        const current = chaosTriggered[toolId] || []
        if (!current.includes(chaosLevel)) {
          set({ chaosTriggered: { ...chaosTriggered, [toolId]: [...current, chaosLevel] } })
          get()._checkAchievements()
        }
      },

      // ── Comebacks (v2): count of miss->correct recoveries on the same
      // concept tag, tracked here (not in weakSpotStore) purely so the
      // existing achievement checker — which reads gamificationStore's
      // own state — can react to it without a cross-store dependency.
      comebackCount: 0,
      registerComeback: () => {
        set((state) => ({ comebackCount: state.comebackCount + 1 }))
        get()._checkAchievements()
      },

      // ── Achievements ─────────────────────────────────────────
      unlockedAchievements: [],
      pendingToast: null, // most recently unlocked achievement, for AchievementToast to consume
      dismissToast: () => set({ pendingToast: null }),

      // Internal: recompute achievements. O(#achievements) per call, no history rescans.
      _checkAchievements: () => {
        const state = get()
        const alreadyUnlocked = new Set(state.unlockedAchievements)
        let newlyUnlocked = null

        for (const achievement of ACHIEVEMENTS) {
          if (alreadyUnlocked.has(achievement.id)) continue
          if (achievement.condition(state)) {
            alreadyUnlocked.add(achievement.id)
            newlyUnlocked = achievement
          }
        }

        if (newlyUnlocked) {
          set({
            unlockedAchievements: Array.from(alreadyUnlocked),
            pendingToast: newlyUnlocked,
          })
        }
      },

      // ── Reset (dev/testing convenience, exposed on /achievements page) ─
      resetGamification: () =>
        set({
          modes: { ...initialModeToggles },
          bestTimes: {},
          streaks: { global: { current: 0, best: 0 } },
          bossesCleared: [],
          chaosTriggered: {},
          unlockedAchievements: [],
          pendingToast: null,
          comebackCount: 0,
        }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        modes: state.modes,
        bestTimes: state.bestTimes,
        streaks: state.streaks,
        bossesCleared: state.bossesCleared,
        chaosTriggered: state.chaosTriggered,
        unlockedAchievements: state.unlockedAchievements,
        comebackCount: state.comebackCount,
      }),
    }
  )
)

export default useGamificationStore
