import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import TopBar from './components/shell/TopBar'
import Sidebar from './components/shell/Sidebar'
import Home from './pages/Home'
import UnitPage from './pages/UnitPage'
import ToolPage from './pages/ToolPage'

function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1, paddingTop: '56px' }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,                           element: <Home /> },
      { path: 'unit/:unitId',                  element: <UnitPage /> },
      { path: 'unit/:unitId/tool/:toolId',     element: <ToolPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}