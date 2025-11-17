/**
 * 会话项组件
 * 显示单个会话的信息，包括标题、最后消息、时间等
 */

import { Dropdown } from 'antd';
import { Archive, MoreVertical, Pin, PinOff, Trash2 } from 'lucide-react';
import React from 'react';
import type { SessionResponse } from '@/types/api/sessionResponse';
import styles from './index.module.css';

/**
 * SessionItem 组件属性
 */
interface SessionItemProps {
  /** 会话数据 */
  session: SessionResponse;
  /** 是否选中 */
  isActive: boolean;
  /** 点击回调 */
  onClick: () => void;
  /** 置顶回调 */
  onPin?: (pinned: boolean) => void;
  /** 归档回调 */
  onArchive?: (archived: boolean) => void;
  /** 删除回调 */
  onDelete?: () => void;
}

/**
 * 格式化时间显示
 */
const formatTime = (dateString?: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于 1 分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }

  // 小于 1 小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }

  // 小于 24 小时
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}小时前`;
  }

  // 小于 7 天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}天前`;
  }

  // 显示日期
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  });
};

/**
 * 会话项组件
 */
export const SessionItem: React.FC<SessionItemProps> = React.memo(
  ({ session, isActive, onClick, onPin, onArchive, onDelete }) => {
    // 处理置顶
    const handlePin = React.useCallback(() => {
      onPin?.(!session.isPinned);
    }, [onPin, session.isPinned]);

    // 处理归档
    const handleArchive = React.useCallback(() => {
      onArchive?.(!session.isArchived);
    }, [onArchive, session.isArchived]);

    // 处理删除
    const handleDelete = React.useCallback(() => {
      onDelete?.();
    }, [onDelete]);

    // 下拉菜单项
    const menuItems = [
      {
        key: 'pin',
        label: session.isPinned ? '取消置顶' : '置顶',
        icon: session.isPinned ? <PinOff size={16} /> : <Pin size={16} />,
        onClick: handlePin,
      },
      {
        key: 'archive',
        label: session.isArchived ? '取消归档' : '归档',
        icon: <Archive size={16} />,
        onClick: handleArchive,
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'delete',
        label: '删除',
        icon: <Trash2 size={16} />,
        danger: true,
        onClick: handleDelete,
      },
    ];

    return (
      <div
        className={`${styles.sessionItem} ${isActive ? styles.active : ''} ${
          session.isPinned ? styles.pinned : ''
        }`}
        onClick={onClick}
      >
        {/* 会话标题和置顶图标 */}
        <div className={styles.header}>
          <div className={styles.title}>
            {session.isPinned && (
              <span title="已置顶">
                <Pin size={14} className={styles.pinnedIcon} />
              </span>
            )}
            {session.title || '未命名会话'}
          </div>
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <div className={styles.moreButton} onClick={(e) => e.stopPropagation()}>
              <MoreVertical size={16} />
            </div>
          </Dropdown>
        </div>

        {/* 最后一条消息预览 */}
        {session.lastMessage && (
          <div className={styles.lastMessage}>{session.lastMessage.content || '...'}</div>
        )}

        {/* 底部信息：消息数量和更新时间 */}
        <div className={styles.footer}>
          <span className={styles.messageCount}>{session.messageCount || 0} 条消息</span>
          <span className={styles.updateTime}>{formatTime(session.updatedAt)}</span>
        </div>
      </div>
    );
  },
);

SessionItem.displayName = 'SessionItem';

export default SessionItem;
