/**
 * 单条消息组件
 * 显示用户或 AI 的消息，支持编辑、删除、复制等操作
 */

import { message as antMessage, Avatar, Button, Tooltip } from 'antd';
import { Bot, Copy, Edit2, Trash2, User } from 'lucide-react';
import React from 'react';
import type { MessageDetailResponse } from '@/types/api/messageDetailResponse';
import { MessageMarkdown } from '../MessageMarkdown';
import styles from './index.module.css';

/**
 * Message 组件属性
 */
interface MessageProps {
  /** 消息数据 */
  message: MessageDetailResponse;
  /** 是否为用户消息 */
  isUser: boolean;
  /** 是否正在流式输出（显示打字机光标） */
  isStreaming?: boolean;
  /** 编辑回调 */
  onEdit?: () => void;
  /** 删除回调 */
  onDelete?: () => void;
}

/**
 * 单条消息组件
 * 参考 chatbot-ui-main 的实现，支持流式输出的实时渲染
 */
export const Message: React.FC<MessageProps> = React.memo(
  ({ message, isUser, isStreaming = false, onEdit, onDelete }) => {
    // 复制消息内容
    const handleCopy = React.useCallback(async () => {
      try {
        await navigator.clipboard.writeText(message.content || '');
        antMessage.success('已复制到剪贴板');
      } catch (error) {
        antMessage.error('复制失败');
      }
    }, [message.content]);

    return (
      <div
        className={`${styles.messageWrapper} ${isUser ? styles.userMessage : styles.assistantMessage}`}
      >
        {/* AI 消息显示头像在左侧 */}
        {!isUser && (
          <Avatar
            icon={<Bot size={18} />}
            className={styles.avatar}
            style={{ backgroundColor: '#14b8a6' }}
          />
        )}

        <div className={styles.messageContent}>
          {/* 错误信息显示 */}
          {message.error && (
            <div className={styles.errorContainer}>
              <div className={styles.errorHeader}>
                <span className={styles.errorIcon}>⚠️</span>
                <span className={styles.errorTitle}>请求失败</span>
              </div>
              <div className={styles.errorMessage}>{message.error}</div>
            </div>
          )}

          {/* 消息内容 */}
          {message.content && (
            <div className={styles.messageText}>
              <MessageMarkdown content={message.content} />
              {/* 流式输出时显示打字机光标 */}
              {isStreaming && !isUser && <span className={styles.streamingCursor} />}
            </div>
          )}

          {/* 操作按钮（长驻显示，流式输出时不显示） */}
          {!isStreaming && (
            <div className={styles.messageActions}>
              <Tooltip title="复制">
                <Button
                  type="text"
                  size="small"
                  icon={<Copy size={14} />}
                  onClick={handleCopy}
                  className={styles.actionButton}
                />
              </Tooltip>
              {isUser && onEdit && (
                <Tooltip title="编辑">
                  <Button
                    type="text"
                    size="small"
                    icon={<Edit2 size={14} />}
                    onClick={onEdit}
                    className={styles.actionButton}
                  />
                </Tooltip>
              )}
              {isUser && onDelete && (
                <Tooltip title="删除">
                  <Button
                    type="text"
                    size="small"
                    icon={<Trash2 size={14} />}
                    onClick={onDelete}
                    danger
                    className={styles.actionButton}
                  />
                </Tooltip>
              )}
            </div>
          )}
        </div>

        {/* 用户消息显示头像在右侧 */}
        {isUser && (
          <Avatar
            icon={<User size={18} />}
            className={styles.avatar}
            style={{ backgroundColor: '#1890ff' }}
          />
        )}
      </div>
    );
  },
);

Message.displayName = 'Message';

export default Message;
