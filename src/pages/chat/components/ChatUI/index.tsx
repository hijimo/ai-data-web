/**
 * 聊天界面组件
 * 包含聊天头部、消息列表和输入框
 */

import { Empty, Spin } from 'antd';
import React, { forwardRef, Suspense, useImperativeHandle, useRef, useState } from 'react';
import { useScroll } from '@/hooks/chat/useScroll';
import type { MessageDetailResponse } from '@/types/api/messageDetailResponse';
import type { SessionResponse } from '@/types/api/sessionResponse';
import type { StreamState } from '@/types/stream';
import { ChatHeader } from '../ChatHeader';
import { ChatInput, type ChatInputRef } from '../ChatInput';
import { ChatMessages } from '../ChatMessages';
import { ChatScrollButtons } from '../ChatScrollButtons';
import styles from './index.module.css';

// 懒加载 ChatSettings 组件
const ChatSettings = React.lazy(() => import('../ChatSettings'));

/**
 * ChatUI 组件属性
 */
interface ChatUIProps {
  /** 会话 ID */
  sessionId: string | null;
  /** 会话标题 */
  sessionTitle?: string;
  /** 会话数据 */
  session?: SessionResponse;
  /** 消息列表 */
  messages?: MessageDetailResponse[];
  /** 是否正在加载消息 */
  loading?: boolean;
  /** 是否正在生成回复 */
  isGenerating?: boolean;
  /** 流式状态 */
  streamState?: StreamState;
  /** 侧边栏是否折叠 */
  collapsed?: boolean;
  /** 切换侧边栏折叠状态 */
  onToggleCollapse?: () => void;
  /** 发送消息回调 */
  onSendMessage?: (content: string) => void;
  /** 停止生成回调 */
  onStopGeneration?: () => void;
}

/**
 * ChatUI 组件暴露的方法
 */
export interface ChatUIRef {
  /** 聚焦输入框 */
  focusInput: () => void;
}

/**
 * 聊天界面组件
 */
export const ChatUI = forwardRef<ChatUIRef, ChatUIProps>(
  (
    {
      sessionId,
      sessionTitle,
      session,
      messages = [],
      loading,
      isGenerating = false,
      streamState,
      collapsed,
      onToggleCollapse,
      onSendMessage,
      onStopGeneration,
    },
    ref,
  ) => {
    // 设置面板状态
    const [settingsOpen, setSettingsOpen] = useState(false);
    // 用户输入
    const [userInput, setUserInput] = useState('');
    // 输入框引用
    const inputRef = useRef<ChatInputRef>(null);

    // 滚动控制
    const { scrollContainerRef, scrollToTop, scrollToBottom, showScrollToTop, showScrollToBottom } =
      useScroll(messages);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      focusInput: () => {
        inputRef.current?.focus();
      },
    }));

    // 打开设置面板
    const handleOpenSettings = () => {
      setSettingsOpen(true);
    };

    // 发送消息
    const handleSend = () => {
      if (userInput.trim() && onSendMessage) {
        onSendMessage(userInput.trim());
        setUserInput(''); // 清空输入框
      }
    };

    // 停止生成
    const handleStop = () => {
      onStopGeneration?.();
    };

    // 合并真实消息和流式消息
    const displayMessages = React.useMemo(() => {
      // 直接返回消息列表，流式内容由 ChatPage 处理
      return messages;
    }, [messages]);

    // 无会话时显示空状态
    if (!sessionId) {
      return (
        <div className={styles.chatUIEmpty}>
          <Empty
            description="请选择一个会话或创建新会话开始聊天"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

    return (
      <div className={styles.chatUI}>
        {/* 聊天头部 */}
        <ChatHeader
          title={sessionTitle || '未命名会话'}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          onOpenSettings={handleOpenSettings}
        />

        {/* 消息列表区域 */}
        <div className={styles.messagesWrapper}>
          <ChatMessages
            messages={displayMessages}
            isGenerating={isGenerating}
            streamState={streamState}
            scrollContainerRef={scrollContainerRef}
          />

          {/* 滚动控制按钮 */}
          <ChatScrollButtons
            showScrollToTop={showScrollToTop}
            showScrollToBottom={showScrollToBottom}
            onScrollToTop={scrollToTop}
            onScrollToBottom={scrollToBottom}
          />
        </div>

        {/* 输入框区域 */}
        <ChatInput
          ref={inputRef}
          value={userInput}
          onChange={setUserInput}
          onSend={handleSend}
          onStop={handleStop}
          isGenerating={isGenerating}
          disabled={loading}
        />

        {/* 设置面板（懒加载） */}
        <Suspense fallback={<Spin />}>
          <ChatSettings
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            sessionId={sessionId}
            session={session}
          />
        </Suspense>
      </div>
    );
  },
);

ChatUI.displayName = 'ChatUI';

export default ChatUI;
