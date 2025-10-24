import { createBrowserRouter, Outlet } from 'react-router';
import Header from '@/components/Header';
import { ThemedLayout } from '@/components/Layout';
import { AuthProvider } from './components/AuthProvider';
import Layout from './components/Layout/Layout';
import Index from './pages/Index';
import Login from './pages/Login';
import Notfound from './pages/Notfound';
import Tenants from './pages/tenants';

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <ThemedLayout Header={Header}>
          <Outlet />
        </ThemedLayout>
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
]);

export default router;
