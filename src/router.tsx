import { createBrowserRouter, Outlet } from 'react-router'

import { AuthProvider } from './components/AuthProvider'
import Layout from './components/Layout/Layout'
import BasicLayout from './layouts/BasicLayout'
import Index from './pages/Index'
import Login from './pages/Login'
import Notfound from './pages/Notfound'
import Tenants from './pages/tenants'

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <BasicLayout>
          <Outlet />
        </BasicLayout>
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
        path: '/tenants',
        element: <Tenants />,
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
