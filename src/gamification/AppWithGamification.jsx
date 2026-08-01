/**
 * AppWithGamification — a drop-in, additive alternative to App.jsx.
 *
 * This file achieves full integration WITHOUT modifying App.jsx, any page,
 * or any existing component: it re-imports the same pieces App.jsx uses,
 * re-declares an equivalent Layout (now also mounting AchievementToast,
 * EasterEgg, and the v2 systems alongside <Outlet />), and adds the new
 * gamification routes as siblings to the existing ones.
 *
 * To use it, main.jsx would import AppWithGamification instead of App —
 * that one-line swap in main.jsx is the only integration step, and it's
 * outside src/App.jsx itself. See INTEGRATION.md for exact instructions,
 * including why this is preferred over editing App.jsx directly.
 */

import { createBrowserRouter, RouterProvider, Outlet, Link } from 'react-router-dom'
import TopBar from '../components/shell/TopBar.jsx'
import Sidebar from '../components/shell/Sidebar.jsx'
import Home from '../pages/Home.jsx'
import UnitPage from '../pages/UnitPage.jsx'
import ToolPage from '../pages/ToolPage.jsx'

import AchievementToast from './components/AchievementToast.jsx'
import EasterEgg from './components/EasterEgg.jsx'
import AchievementsPage from './pages/AchievementsPage.jsx'
import BossBattlePage from './pages/BossBattlePage.jsx'
import ArcadeHub from './pages/ArcadeHub.jsx'

import XPBar from './v2/components/XPBar.jsx'
import LevelUpToast from './v2/components/LevelUpToast.jsx'
import WeakSpotNudge from './v2/components/WeakSpotNudge.jsx'
import MasteryMap from './v2/components/MasteryMap.jsx'
import GauntletMode from './v2/components/GauntletMode.jsx'
import useV2SettingsStore from './v2/store/v2SettingsStore.js'

function V2Toggle() {
  const v2Enabled = useV2SettingsStore((s) => s.v2Enabled)
  const toggleV2Enabled = useV2SettingsStore((s) => s.toggleV2Enabled)
  return (
    <button
      onClick={toggleV2Enabled}
      title={v2Enabled ? 'Turn off the fun layer (XP, mastery map, nudges)' : 'Turn the fun layer back on'}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 190,
        zIndex: 200,
        padding: '8px 12px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(20,20,26,0.85)',
        color: '#fff',
        fontSize: 12,
        cursor: 'pointer',
      }}
    >
      {v2Enabled ? '✨ Fun layer: on' : '⭘ Fun layer: off'}
    </button>
  )
}

function ArcadeFab() {
  const v2Enabled = useV2SettingsStore((s) => s.v2Enabled)
  return (
    <Link
      to="/arcade"
      title="Open the Arcade — badges, boss battles, and a live demo"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        borderRadius: 999,
        background: 'linear-gradient(135deg, #6d28d9, #db2777)',
        color: '#fff',
        fontWeight: 600,
        fontSize: 13,
        textDecoration: 'none',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      }}
    >
      <span aria-hidden="true">🎮</span> Arcade
      {v2Enabled && <XPBar compact />}
    </Link>
  )
}

function GamifiedLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1, paddingTop: '56px' }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
      <AchievementToast />
      <LevelUpToast />
      <WeakSpotNudge />
      <EasterEgg />
      <V2Toggle />
      <ArcadeFab />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <GamifiedLayout />,
    children: [
      { index: true,                            element: <Home /> },
      { path: 'unit/:unitId',                   element: <UnitPage /> },
      { path: 'unit/:unitId/tool/:toolId',      element: <ToolPage /> },
      { path: 'unit/:unitId/boss',              element: <BossBattlePage /> },
      { path: 'achievements',                   element: <AchievementsPage /> },
      { path: 'arcade',                         element: <ArcadeHub /> },
      { path: 'mastery-map',                    element: <MasteryMap /> },
      { path: 'gauntlet',                       element: <GauntletMode /> },
    ],
  },
])

export default function AppWithGamification() {
  return <RouterProvider router={router} />
}
