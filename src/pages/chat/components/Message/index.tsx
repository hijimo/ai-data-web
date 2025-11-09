/**
 * 单条消息组件
 * 显示用户或 AI 的消息，支持编辑、删除、复制等操作
 */

import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { message as antMessage, Avatar, Button, Tooltip } from 'antd';
import React, { useState } from 'react';
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
  /** 编辑回调 */
  onEdit?: () => void;
  /** 删除回调 */
  onDelete?: () => void;
}

/**
 * 单条消息组件
 */
export const Message: React.FC<MessageProps> = React.memo(
  ({ message, isUser, onEdit, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);

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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* AI 消息显示头像在左侧 */}
        {!isUser && (
          <Avatar
            icon={<RobotOutlined />}
            className={styles.avatar}
            style={{ backgroundColor: '#14b8a6' }}
          />
        )}

        <div className={styles.messageContent}>
          {/* 消息内容 */}
          <div className={styles.messageText}>
            <MessageMarkdown content={message.content || ''} />
          </div>

          {/* 操作按钮（悬停显示） */}
          {isHovered && (
            <div className={styles.messageActions}>
              <Tooltip title="复制">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={handleCopy}
                  className={styles.actionButton}
                />
              </Tooltip>
              {isUser && onEdit && (
                <Tooltip title="编辑">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
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
                    icon={<DeleteOutlined />}
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
            icon={<UserOutlined />}
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
