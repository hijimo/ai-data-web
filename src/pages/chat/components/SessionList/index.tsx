/**
 * 会话列表组件
 * 显示所有聊天会话，支持搜索、新建、选择等操作
 */

import { Button, Input } from 'antd';
import { Plus } from 'lucide-react';
import React from 'react';
import type { SessionResponse } from '@/types/api/sessionResponse';
import { SessionItem } from '../SessionItem';
import styles from './index.module.css';

const { Search } = Input;

/**
 * SessionList 组件属性
 */
interface SessionListProps {
  /** 会话列表 */
  sessions: SessionResponse[];
  /** 当前选中的会话 ID */
  currentSessionId: string | null;
  /** 选择会话回调 */
  onSelectSession: (sessionId: string) => void;
  /** 创建新会话回调 */
  onCreateSession: () => void;
  /** 搜索回调 */
  onSearch?: (keyword: string) => void;
  /** 删除会话回调 */
  onDeleteSession?: (sessionId: string) => void;
  /** 置顶会话回调 */
  onPinSession?: (sessionId: string, pinned: boolean) => void;
  /** 归档会话回调 */
  onArchiveSession?: (sessionId: string, archived: boolean) => void;
  /** 加载状态 */
  loading?: boolean;
  /** 是否折叠 */
  collapsed?: boolean;
  /** 折叠状态改变回调 */
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * 会话列表组件
 */
export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onSearch,
  onPinSession,
  onArchiveSession,
  onDeleteSession,
  loading = false,
  collapsed = false,
}) => {
  // 排序：置顶的在前面
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  // 处理搜索
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearch?.(value);
  };

  if (collapsed) {
    return (
      <div className={styles.sessionListCollapsed}>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={onCreateSession}
          className={styles.newSessionButtonCollapsed}
        />
      </div>
    );
  }

  return (
    <div className={styles.sessionList}>
      {/* 顶部操作区 */}
      <div className={styles.header}>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={onCreateSession}
          block
          className={styles.newSessionButton}
        >
          新建会话
        </Button>
        <Search
          placeholder="搜索会话"
          allowClear
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>

      {/* 会话列表区 */}
      <div className={styles.sessionListContent}>
        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : sortedSessions.length === 0 ? (
          <div className={styles.empty}>暂无会话</div>
        ) : (
          sortedSessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === currentSessionId}
              onClick={() => session.id && onSelectSession(session.id)}
              onPin={
                onPinSession && session.id
                  ? (pinned) => onPinSession(session.id!, pinned)
                  : undefined
              }
              onArchive={
                onArchiveSession && session.id
                  ? (archived) => onArchiveSession(session.id!, archived)
                  : undefined
              }
              onDelete={
                onDeleteSession && session.id ? () => onDeleteSession(session.id!) : undefined
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SessionList;
