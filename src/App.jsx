import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import TopBar from './components/shell/TopBar'
import Home from './pages/Home'
import UnitPage from './pages/UnitPage'
import ToolPage from './pages/ToolPage'

function Layout() {
  return (
    <>
      <TopBar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </>
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