import type { User } from '@/types/api';

/**
 * 用户表格组件属性
 */
export interface UserTableProps {
  // 预留接口以便未来扩展
}

/**
 * 创建用户抽屉引用接口
 */
export interface UserCreateDrawerRef {
  open: () => void;
  close: () => void;
}

/**
 * 编辑用户抽屉引用接口
 */
export interface UserEditDrawerRef {
  open: (user: User) => void;
  close: () => void;
}
