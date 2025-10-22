import { createBrowserRouter, Outlet } from 'react-router'

import { AuthProvider } from './components/AuthProvider'
import Layout from './components/Layout/Layout'
import Index from './pages/Index'
import Login from './pages/Login'
import Notfound from './pages/Notfound'

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        path: '/',
        element: (
          <Layout>
            <Index />
          </Layout>
        ),
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '*',
        element: (
          <Layout>
            <Notfound />
          </Layout>
        ),
      },
    ],
  },
])

export default router
