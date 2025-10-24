import { createBrowserRouter, Outlet } from 'react-router';
import Header from '@/components/Header';
import {
  ThemedLayout,
  ThemedSider,
  ThemedTitle,
  type LayoutThemedTitleProps,
} from '@/components/Layout';
import { AuthProvider } from './components/AuthProvider';
import Layout from './components/Layout/Layout';
import Index from './pages/Index';
import Login from './pages/Login';
import Notfound from './pages/Notfound';
import Tenants from './pages/tenants';

const renderTitle: React.FC<LayoutThemedTitleProps> = ({ collapsed }: { collapsed: boolean }) => (
  <ThemedTitle
    collapsed={collapsed}
    text="聚协云"
    icon={<img src="/logo.png" alt="logo" style={{ width: 24 }} />}
  />
);
const renderSider: React.FC<{
  Title?: React.FC<LayoutThemedTitleProps>;
  render?: (props: {
    items: JSX.Element[];
    logout: React.ReactNode;
    dashboard: React.ReactNode;
    collapsed: boolean;
  }) => React.ReactNode;
  meta?: Record<string, unknown>;
}> = (props) => (
  <ThemedSider
    {...props}
    render={({ items }) =>
      // 直接渲染不带 logout 的菜单项
      items
    }
    fixed
  />
);

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <ThemedLayout Header={Header} Title={renderTitle} Sider={renderSider}>
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
