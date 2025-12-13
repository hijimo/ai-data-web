/**
 * 消息列表组件
 * 显示聊天消息列表，支持滚动和消息分组
 * 参考 chatbot-ui-main 的流式输出实现
 */

import { Spin } from 'antd';
import React, { useEffect, useRef } from 'react';
import type { MessageDetailResponse } from '@/types/api/messageDetailResponse';
import type { StreamState } from '@/types/stream';
import { Message } from '../Message';
import { StreamStatusIndicator } from '../StreamStatusIndicator';
import styles from './index.module.css';

/**
 * ChatMessages 组件属性
 */
interface ChatMessagesProps {
  /** 消息列表 */
  messages: MessageDetailResponse[];
  /** 是否正在生成回复 */
  isGenerating?: boolean;
  /** 流式状态 */
  streamState?: StreamState;
  /** 编辑消息回调 */
  onEditMessage?: (messageId: string) => void;
  /** 删除消息回调 */
  onDeleteMessage?: (messageId: string) => void;
  /** 滚动容器引用（可选，用于父组件控制滚动） */
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
  /** 是否正在加载更多历史消息 */
  isLoadingMore?: boolean;
  /** 是否还有更多消息 */
  hasMoreMessages?: boolean;
  /** 总消息数 */
  totalMessagesCount?: number;
  /** 已加载消息数 */
  loadedMessagesCount?: number;
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
 * 参考 chatbot-ui-main 的实现，支持流式输出的实时渲染
 */
export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isGenerating = false,
  streamState,
  onEditMessage,
  onDeleteMessage,
  scrollContainerRef,
  isLoadingMore = false,
  hasMoreMessages = false,
  totalMessagesCount = 0,
  loadedMessagesCount = 0,
}) => {
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const scrollRef = scrollContainerRef || internalScrollRef;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部（当有新消息或流式内容更新时）
  useEffect(() => {
    if (isGenerating || messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, streamState?.outputContent, isGenerating]);

  return (
    <div ref={scrollRef} className={styles.chatMessages} role="log" aria-live="polite">
      <div className={styles.messagesContainer}>
        {/* 加载更多提示 */}
        {isLoadingMore && (
          <div className={styles.loadingMore}>
            <Spin size="small" />
            <span style={{ marginLeft: '8px' }}>加载历史消息中...</span>
          </div>
        )}

        {/* 已加载全部消息提示 */}
        {!hasMoreMessages && messages.length > 0 && (
          <div className={styles.allLoaded}>
            <span>
              已加载全部消息 ({loadedMessagesCount}/{totalMessagesCount})
            </span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>暂无消息，开始对话吧</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : undefined;
            const showTimestamp = shouldShowTimestamp(message, previousMessage);
            const isLastMessage = index === messages.length - 1;
            const isUser = message.role === 'user';

            // 如果是最后一条 AI 消息且正在生成，显示流式内容
            const displayContent =
              isLastMessage && !isUser && isGenerating && streamState?.outputContent
                ? streamState.outputContent
                : message.content || '';

            return (
              <div key={message.id || index}>
                {/* 时间戳分隔符 */}
                {showTimestamp && message.createdAt && (
                  <div className={styles.timestampDivider}>
                    <span className={styles.timestamp}>{formatTimestamp(message.createdAt)}</span>
                  </div>
                )}

                {/* 使用 Message 组件渲染消息 */}
                <Message
                  message={{ ...message, content: displayContent }}
                  isUser={isUser}
                  isStreaming={isLastMessage && !isUser && isGenerating}
                  onEdit={isUser && onEditMessage ? () => onEditMessage(message.id!) : undefined}
                  onDelete={
                    isUser && onDeleteMessage ? () => onDeleteMessage(message.id!) : undefined
                  }
                />

                {/* 在最后一条 AI 消息下方显示流式状态 */}
                {isLastMessage && !isUser && isGenerating && streamState && (
                  <div className={styles.streamIndicatorWrapper}>
                    <StreamStatusIndicator
                      stage={streamState.stage}
                      stageMessage={streamState.stageMessage}
                      thinkingContent={streamState.thinkingContent}
                      showThinking={streamState.stage === 'thinking'}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* 错误提示 */}
        {streamState?.error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>{streamState.error.message}</span>
          </div>
        )}

        {/* 滚动锚点 */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
