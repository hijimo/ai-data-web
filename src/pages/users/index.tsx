import { PageContainer } from '@ant-design/pro-components';
import UserTable from './components/Table/UserTable';
import styles from './index.module.css';

/**
 * 用户管理主页面
 */
const UsersPage: React.FC = () => {
  return (
    <PageContainer className={styles.usersPage}>
      <UserTable />
    </PageContainer>
  );
};

export default UsersPage;
