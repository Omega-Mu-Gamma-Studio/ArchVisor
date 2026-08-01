# Gamification Layer — Integration Guide

Every file under `src/gamification/` is new and additive. **No existing file
has been modified.** This document explains the one step needed to actually
turn the layer on, and why it doesn't require touching `App.jsx`.

## The one integration step

In `src/main.jsx`, swap the import (and only the import) from:

```js
import App from './App.jsx'
```

to:

```js
import App from './gamification/AppWithGamification.jsx'
```

That's it. `main.jsx` isn't in the protected list (`App.jsx`, `src/units/*`,
engines, stores, pages, styles) — it's a one-line wiring point, exactly the
kind of "new routes that live alongside existing ones" composition the spec
calls for. If you'd rather leave `main.jsx` completely untouched too, you can
instead point your web server / deploy config at a small new entry file; see
"Zero-touch alternative" below.

`AppWithGamification.jsx` re-declares the same router shape as `App.jsx`,
reusing the exact same `TopBar`, `Sidebar`, `Home`, `UnitPage`, and `ToolPage`
components unmodified, and adds:

- `AchievementToast` and `EasterEgg`, mounted once at the layout level
  (siblings to `<Outlet />`, never inside it)
- `/unit/:unitId/boss` → `BossBattlePage`
- `/achievements` → `AchievementsPage`

Every existing route renders through the exact same page components as
before, so current behavior is unchanged.

## Why not edit `App.jsx` directly?

The spec's hard constraint #1 says "do not modify any existing file," with a
single named exception for the Easter Egg only, and only if there's truly no
other way. There *is* another way — `AppWithGamification.jsx` — so `App.jsx`
was left untouched entirely, including for the Easter Egg mount.

## Zero-touch alternative (don't even touch `main.jsx`)

If you'd prefer not to change `main.jsx` either, you can leave the app's
default entry point exactly as-is and mount the gamification layer as a
parallel build target / separate route prefix in your dev server or hosting
config, importing `AppWithGamification` there instead. This isn't included
by default since it depends on your deploy setup, but the component is
self-contained and ready for that.

## Wiring individual features into existing tools

Every wrapper (`SpeedrunTimer`, `StreakBadge`, `PredictionGate`,
`SandboxModeWrapper`, `RaceModeWrapper`, `NarratorToggle`, `AnalogyToggle`,
`ChallengeShareCard`) is designed to be composed *around* a tool from a new
page-level or route-level file, not injected into the tool's own source.

Two supported patterns:

1. **New wrapper page per tool** (recommended, keeps existing `ToolPage.jsx`
   untouched): create e.g. `src/gamification/pages/BoothMultiplierGamified.jsx`
   that imports the existing `BoothMultiplier` component and renders it
   inside `SpeedrunTimer` + `StreakBadge`, then add a route for it in
   `AppWithGamification.jsx` (e.g. `/unit/2/tool/booth-multiplier/arcade`).
2. **Prop-based opt-in**, for tools that already forward extra props through
   to children (check each tool's existing prop signature before relying on
   this — some tools may need pattern 1 instead).

Either way, the underlying tool component and its engine calls are never
copied, forked, or edited.

## Verifying nothing broke

```bash
npm run build
npm run lint
```

Both should behave exactly as they did before this layer was added, since
`src/App.jsx` and every file it imports are byte-for-byte unchanged.
