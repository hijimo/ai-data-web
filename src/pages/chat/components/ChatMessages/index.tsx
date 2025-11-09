/**
 * 消息列表组件
 * 显示聊天消息列表，支持滚动和消息分组
 */

import React, { useEffect, useRef } from 'react';
import type { MessageDetailResponse } from '@/types/api/messageDetailResponse';
import styles from './index.module.css';

/**
 * ChatMessages 组件属性
 */
interface ChatMessagesProps {
  /** 消息列表 */
  messages: MessageDetailResponse[];
  /** 是否正在生成回复 */
  isGenerating?: boolean;
  /** 编辑消息回调 */
  onEditMessage?: (messageId: string) => void;
  /** 删除消息回调 */
  onDeleteMessage?: (messageId: string) => void;
  /** 滚动容器引用（可选，用于父组件控制滚动） */
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

/**
 * 格式化时间戳
 */
const formatTimestamp = (dateString?: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 今天
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // 昨天
  if (diff < 48 * 60 * 60 * 1000) {
    return `昨天 ${date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  // 更早
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 判断两条消息是否需要显示时间分隔符
 * 相隔 > 5 分钟显示
 */
const shouldShowTimestamp = (
  currentMessage: MessageDetailResponse,
  previousMessage?: MessageDetailResponse,
): boolean => {
  if (!previousMessage || !currentMessage.createdAt || !previousMessage.createdAt) {
    return true;
  }

  const currentTime = new Date(currentMessage.createdAt).getTime();
  const previousTime = new Date(previousMessage.createdAt).getTime();
  const diff = currentTime - previousTime;

  // 相隔超过 5 分钟
  return diff > 5 * 60 * 1000;
};

/**
 * 消息列表组件
 */
export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isGenerating = false,
  onEditMessage,
  onDeleteMessage,
  scrollContainerRef,
}) => {
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const scrollRef = scrollContainerRef || internalScrollRef;

  return (
    <div ref={scrollRef} className={styles.chatMessages} role="log" aria-live="polite">
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>暂无消息，开始对话吧</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : undefined;
            const showTimestamp = shouldShowTimestamp(message, previousMessage);

            return (
              <div key={message.id || index}>
                {/* 时间戳分隔符 */}
                {showTimestamp && message.createdAt && (
                  <div className={styles.timestampDivider}>
                    <span className={styles.timestamp}>{formatTimestamp(message.createdAt)}</span>
                  </div>
                )}

                {/* 消息内容 */}
                <div
                  className={`${styles.messageWrapper} ${
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage
                  }`}
                >
                  <div className={styles.messageContent}>
                    <div className={styles.messageRole}>
                      {message.role === 'user' ? '你' : 'AI'}
                    </div>
                    <div className={styles.messageText}>{message.content || '...'}</div>
                    {message.role === 'user' && (
                      <div className={styles.messageActions}>
                        {onEditMessage && (
                          <button
                            onClick={() => message.id && onEditMessage(message.id)}
                            className={styles.actionButton}
                          >
                            编辑
                          </button>
                        )}
                        {onDeleteMessage && (
                          <button
                            onClick={() => message.id && onDeleteMessage(message.id)}
                            className={styles.actionButton}
                          >
                            删除
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* 正在生成提示 */}
        {isGenerating && (
          <div className={styles.generatingIndicator}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessages;
