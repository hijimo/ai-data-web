/**
 * 聊天头部组件
 * 显示会话标题和操作按钮
 */

import { MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
import React from 'react';
import styles from './index.module.css';

const { Title } = Typography;

/**
 * ChatHeader 组件属性
 */
interface ChatHeaderProps {
  /** 会话标题 */
  title: string;
  /** 侧边栏是否折叠 */
  collapsed?: boolean;
  /** 切换侧边栏折叠状态 */
  onToggleCollapse?: () => void;
  /** 打开设置面板 */
  onOpenSettings?: () => void;
}

/**
 * 聊天头部组件
 *
 * 功能：
 * - 显示会话标题（支持长标题省略）
 * - 折叠/展开侧边栏按钮
 * - 打开设置面板按钮
 * - 应用 teal 主题色
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  collapsed = false,
  onToggleCollapse,
  onOpenSettings,
}) => {
  return (
    <div className={styles.chatHeader}>
      {/* 左侧：折叠按钮 + 标题 */}
      <div className={styles.leftSection}>
        {onToggleCollapse && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggleCollapse}
            className={styles.toggleButton}
            aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
          />
        )}
        <Title level={4} ellipsis={{ rows: 1 }} className={styles.title}>
          {title}
        </Title>
      </div>

      {/* 右侧：设置按钮 */}
      <div className={styles.rightSection}>
        {onOpenSettings && (
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={onOpenSettings}
            className={styles.settingsButton}
            aria-label="打开设置"
          />
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
