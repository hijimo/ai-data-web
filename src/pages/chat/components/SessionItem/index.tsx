/**
 * 会话项组件
 * 显示单个会话的信息，包括标题、最后消息、时间等
 */

import { DeleteOutlined, InboxOutlined, PushpinFilled, PushpinOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import React, { useState } from 'react';
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
    const [isHovered, setIsHovered] = useState(false);

    // 处理置顶
    const handlePin = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onPin?.(!session.isPinned);
      },
      [onPin, session.isPinned],
    );

    // 处理归档
    const handleArchive = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onArchive?.(!session.isArchived);
      },
      [onArchive, session.isArchived],
    );

    // 处理删除
    const handleDelete = React.useCallback(() => {
      onDelete?.();
    }, [onDelete]);

    return (
      <div
        className={`${styles.sessionItem} ${isActive ? styles.active : ''} ${
          session.isPinned ? styles.pinned : ''
        }`}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 会话标题和置顶图标 */}
        <div className={styles.header}>
          <div className={styles.title}>
            {session.isPinned && <PushpinFilled className={styles.pinnedIcon} title="已置顶" />}
            {session.title || '未命名会话'}
          </div>
          {isHovered && (
            <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
              <Button
                type="text"
                size="small"
                icon={session.isPinned ? <PushpinFilled /> : <PushpinOutlined />}
                onClick={handlePin}
                title={session.isPinned ? '取消置顶' : '置顶'}
                className={styles.actionButton}
              />
              <Button
                type="text"
                size="small"
                icon={<InboxOutlined />}
                onClick={handleArchive}
                title={session.isArchived ? '取消归档' : '归档'}
                className={styles.actionButton}
              />
              <Popconfirm
                title="确定删除此会话吗？"
                description="删除后将无法恢复"
                onConfirm={handleDelete}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                  title="删除"
                  className={styles.actionButton}
                />
              </Popconfirm>
            </div>
          )}
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
