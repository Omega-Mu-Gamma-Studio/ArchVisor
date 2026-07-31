# ArchVisor Gamification & Fun Layer

A new, fully additive engagement layer for ArchVisor. **Zero existing files
were modified** — everything here is new, under `src/gamification/`.

See `INTEGRATION.md` for how to turn it on.

## Structure

```
src/gamification/
├── AppWithGamification.jsx   # zero-edit drop-in replacement for App.jsx
├── INTEGRATION.md
├── store/
│   └── gamificationStore.js  # streaks, best times, badges, mode toggles (persisted)
├── components/
│   ├── SpeedrunTimer.jsx
│   ├── StreakBadge.jsx
│   ├── PredictionGate.jsx
│   ├── BossBattleWrapper.jsx
│   ├── SandboxModeWrapper.jsx
│   ├── RaceModeWrapper.jsx
│   ├── NarratorToggle.jsx
│   ├── AnalogyToggle.jsx
│   ├── AchievementToast.jsx
│   ├── FailStateAnimation.jsx
│   ├── EasterEgg.jsx
│   └── ChallengeShareCard.jsx
├── content/
│   ├── narratorLines.js
│   ├── analogies.js
│   ├── achievements.js
│   ├── failMessages.js
│   └── bossScenarios.js
├── hooks/
│   ├── useNarratorLine.js
│   └── useAnalogy.js
├── pages/
│   ├── AchievementsPage.jsx   # new route: /achievements
│   └── BossBattlePage.jsx     # new route: /unit/:unitId/boss
└── utils/
    ├── encodeChallenge.js
    └── decodeChallenge.js
```

## Feature → file map

| Feature | Primary files |
|---|---|
| Speedrun Mode | `components/SpeedrunTimer.jsx` |
| Boss Battles | `components/BossBattleWrapper.jsx`, `content/bossScenarios.js`, `pages/BossBattlePage.jsx` |
| Streak Tracker | `store/gamificationStore.js`, `components/StreakBadge.jsx`, `components/PredictionGate.jsx` |
| Narrator Mode | `components/NarratorToggle.jsx`, `hooks/useNarratorLine.js`, `content/narratorLines.js` |
| Analogy Mode | `components/AnalogyToggle.jsx`, `hooks/useAnalogy.js`, `content/analogies.js` |
| Achievement Badges | `content/achievements.js`, `components/AchievementToast.jsx`, `pages/AchievementsPage.jsx` |
| Sandbox Mode | `components/SandboxModeWrapper.jsx` |
| Race Mode | `components/RaceModeWrapper.jsx` |
| Meme-able Failures | `components/FailStateAnimation.jsx`, `content/failMessages.js` |
| Easter Egg | `components/EasterEgg.jsx` |
| Challenge a Friend | `components/ChallengeShareCard.jsx`, `utils/encodeChallenge.js`, `utils/decodeChallenge.js` |

## v2 layer (Mastery Map, XP, Weak Spots, Ghost Replay, Report Cards, Gauntlet)

Adds nine more systems under `src/gamification/v2/`, all reading/writing
their own namespaced localStorage keys, all subscribing to the same
`PredictionGate` correct/incorrect event stream as the core layer (no
parallel event paths):

| Feature | Files |
|---|---|
| XP + Levels | `v2/store/xpStore.js`, `v2/content/xpRules.js`, `v2/utils/xpCalculator.js`, `v2/components/XPBar.jsx`, `v2/components/LevelUpToast.jsx` |
| Weak Spot Tracking | `v2/store/weakSpotStore.js`, `v2/content/weakSpotTaxonomy.js`, `v2/utils/conceptTagger.js`, `v2/components/WeakSpotNudge.jsx` |
| Comeback Rewards | `v2/components/ComebackBadge.jsx` (+ new `comebackCount` key added to the core `gamificationStore.js`, and a new `comeback-kid` entry in `achievements.js` — both additive-only, per the spec's allowance) |
| Mastery Map | `v2/store/masteryStore.js`, `v2/components/MasteryMap.jsx`, `v2/content/toolCatalog.js` — new route `/mastery-map` |
| Ghost Replay | `v2/store/ghostStore.js`, `v2/components/GhostRaceOverlay.jsx` |
| Report Card Export | `v2/utils/reportCardRenderer.js`, `v2/components/ReportCardExporter.jsx` |
| Gauntlet Mode | `v2/content/gauntletConfig.js`, `v2/utils/gauntletQuestions.js`, `v2/components/GauntletMode.jsx` — new route `/gauntlet` |
| Opt-out | `v2/store/v2SettingsStore.js` — single toggle (the "✨ Fun layer" pill next to the Arcade button) hides the entire v2 layer at once |

**`toolCatalog.js` uses the real 23 tool ids/unit ids** pulled directly
from `ToolPage.jsx`'s component map and `Sidebar.jsx`'s unit list (numeric
unit ids `'1'`–`'5'`, kebab-case tool ids) — not invented ones.

**Gauntlet Mode calls real engines directly** (`boothMultiply`,
`restoringDivide`, `classifyHazards`, `simulateCache`), so every question's
correct answer is engine-computed, never hand-authored.

**`navigationStore.markCompleted` is now actually called** (from
`PredictionGate`, on a correct answer, when a `unitId` is passed in) — it
existed in the original app but was never invoked anywhere, so
`completedSubtools` was always empty. This only calls the store's own
existing public action; the store file itself is untouched.

### Deferred: Rival Mode-dependent features

The v2 spec's `RivalCommentaryBox.jsx` and `ClutchAnimation.jsx` extend a
"Rival Character mode" from an earlier prompt that was never actually
built in this project — there's no `RivalStatusBadge`, `DefeatAnimation`,
or `PowerUpAnimation` to extend. Rather than build v2 hooks pointing at
nonexistent v1 components, both were skipped this round. If Rival Mode's
core is wanted, it's a clean addition on top of the same `PredictionGate`
stream everything else already uses — happy to build it next.



- All persistent state lives in one Zustand store (`gamificationStore.js`)
  using `persist` under the localStorage key `archvisor-gamification`.
- Achievement checking is `O(#achievements)` per relevant event — it never
  rescans full history.
- Narrator/Analogy modes are strictly display-layer overlays: they read an
  event/concept key and return alternate copy, always falling back to (or
  sitting alongside) the tool's existing default text/label. They never
  touch engine computation.
- Sandbox Mode calls existing engine functions unmodified; it only relaxes
  what inputs are allowed to reach them, and turns thrown errors into a
  visible "chaos" state instead of a normal validation message.
- All animations respect `prefers-reduced-motion` and are capped under
  ~800ms so they never slow down retry loops.
- No new dependencies were added — everything is built on the existing
  Zustand, Framer Motion, and React Router already in `package.json`.
