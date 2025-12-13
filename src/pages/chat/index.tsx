/**
 * 聊天会话页面
 * 包含会话列表和聊天界面
 */

import { useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import { useSearchParams } from 'react-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChatHandler } from '@/hooks/chat/useChatHandler';
import { useMessagesPagination } from '@/hooks/chat/useMessagesPagination';
import { useSessionOperations } from '@/hooks/chat/useSessionOperations';
import { getSessions } from '@/services/api/sessions/sessions';
import { ChatUI, type ChatUIRef } from './components/ChatUI';
import { SessionList } from './components/SessionList';

const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSessionId = searchParams.get('sessionId');

  // ChatUI 引用，用于快捷键操作
  const chatUIRef = useRef<ChatUIRef>(null);

  // 搜索关键词状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  // 侧边栏折叠状态（从 localStorage 读取）
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('chat-sidebar-collapsed');
    return saved === 'true';
  });

  // 保存折叠状态到 localStorage
  useEffect(() => {
    localStorage.setItem('chat-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  // 全局快捷键支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+L 或 Cmd+L 聚焦输入框
      if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
        event.preventDefault();
        chatUIRef.current?.focusInput();
      }
      // Esc 键清除选中（可选）
      if (event.key === 'Escape' && currentSessionId) {
        // 可以添加其他 Esc 键行为，如关闭设置面板等
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSessionId]);

  // 切换侧边栏折叠状态
  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  // 获取会话列表 API 实例
  const sessionsApi = getSessions();

  // 搜索防抖：延迟 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // 获取会话操作方法
  const { createSession, isCreating, pinSession, archiveSession, deleteSession } =
    useSessionOperations();

  // 获取消息处理方法（使用流式响应）
  const { sendStreamMessage, sendMessage, streamState, tempMessageId, stopGeneration } =
    useChatHandler(currentSessionId || '');

  // 使用 React Query 加载全部会话列表
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      try {
        const response = await sessionsApi.getChatSessions({
          pageNo: 1,
          pageSize: 50,
          isArchived: false,
        });
        return response;
      } catch (err) {
        message.error('加载会话列表失败');
        throw err;
      }
    },
    retry: 2,
    staleTime: 30000, // 30秒内数据视为新鲜
    enabled: !debouncedKeyword, // 没有搜索关键词时才加载全部列表
  });

  // 使用 React Query 加载搜索结果
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useQuery({
    queryKey: ['sessions', 'search', debouncedKeyword],
    queryFn: async () => {
      try {
        const response = await sessionsApi.getChatSessionsSearch({
          keyword: debouncedKeyword,
          pageNo: 1,
          pageSize: 20,
        });
        return response;
      } catch (err) {
        message.error('搜索会话失败');
        throw err;
      }
    },
    retry: 1,
    enabled: !!debouncedKeyword, // 有搜索关键词时才执行搜索
  });

  // 使用消息分页 Hook 加载消息
  const {
    messages: paginatedMessages,
    isLoading: isLoadingMessages,
    isFetchingNextPage: isLoadingMoreMessages,
    hasNextPage: hasMoreMessages,
    loadMore: loadMoreMessages,
    totalCount: totalMessagesCount,
    loadedCount: loadedMessagesCount,
  } = useMessagesPagination({
    sessionId: currentSessionId,
    pageSize: 20,
    enabled: !!currentSessionId,
  });

  // 根据是否有搜索关键词决定显示哪个数据
  const displaySessions = useMemo(() => {
    if (debouncedKeyword) {
      return searchData?.data?.data || [];
    }
    return sessionsData?.data?.data || [];
  }, [debouncedKeyword, searchData, sessionsData]);

  // 合并加载状态和错误
  const isLoading = isLoadingSessions || isSearching;
  const error = sessionsError || searchError;

  // 合并真实消息和流式消息
  const displayMessages = useMemo(() => {
    // 如果正在流式传输，更新临时消息的内容
    if (streamState.isStreaming && tempMessageId) {
      // 使用输出内容或完整内容
      const streamContent = streamState.outputContent || streamState.fullContent;
      return paginatedMessages.map((msg) =>
        msg.id === tempMessageId ? { ...msg, content: streamContent } : msg,
      );
    }

    return paginatedMessages;
  }, [
    paginatedMessages,
    streamState.isStreaming,
    streamState.outputContent,
    streamState.fullContent,
    tempMessageId,
  ]);

  // 加载更多历史消息
  const handleLoadMore = useCallback(() => {
    if (hasMoreMessages && !isLoadingMoreMessages) {
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMoreMessages, loadMoreMessages]);

  // 处理会话选择
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setSearchParams({ sessionId });
    },
    [setSearchParams],
  );

  // 处理创建新会话
  const handleCreateSession = useCallback(async () => {
    try {
      const newSession = await createSession({
        title: '新会话',
        modelName: 'gpt-4',
        temperature: 0.7,
      });
      // 创建成功后自动选中新会话
      if (newSession?.data?.id) {
        setSearchParams({ sessionId: newSession.data.id });
      }
    } catch (error) {
      // 错误已在 hook 中处理
    }
  }, [createSession, setSearchParams]);

  // 处理置顶会话
  const handlePinSession = useCallback(
    async (sessionId: string, pinned: boolean) => {
      try {
        await pinSession({ sessionId, pinned });
      } catch (error) {
        // 错误已在 hook 中处理
      }
    },
    [pinSession],
  );

  // 处理归档会话
  const handleArchiveSession = useCallback(
    async (sessionId: string, archived: boolean) => {
      try {
        await archiveSession({ sessionId, archived });
        // 如果归档的是当前会话，清除选中状态
        if (archived && sessionId === currentSessionId) {
          setSearchParams({});
        }
      } catch (error) {
        // 错误已在 hook 中处理
      }
    },
    [archiveSession, currentSessionId, setSearchParams],
  );

  // 处理删除会话
  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await deleteSession(sessionId);
        // 如果删除的是当前会话，清除选中状态
        if (sessionId === currentSessionId) {
          setSearchParams({});
        }
      } catch (error) {
        // 错误已在 hook 中处理
      }
    },
    [deleteSession, currentSessionId, setSearchParams],
  );

  // 处理搜索
  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  // 处理发送消息（使用流式响应）
  const handleSendMessage = useCallback(
    async (content: string, modelId?: string) => {
      if (!currentSessionId) {
        message.warning('请先选择一个会话');
        return;
      }
      try {
        await sendStreamMessage(content, modelId);
        // await sendMessage(content);
      } catch (error) {
        // 错误已在 hook 中处理
      }
    },
    [currentSessionId, sendStreamMessage],
  );

  // 处理停止生成
  const handleStopGeneration = useCallback(() => {
    stopGeneration();
  }, [stopGeneration]);

  // 错误处理
  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>{debouncedKeyword ? '搜索失败' : '加载会话列表失败'}</p>
        <button onClick={() => (debouncedKeyword ? {} : refetchSessions())}>重试</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px - 48px)' }}>
      {/* 会话列表 */}
      {!collapsed && (
        <SessionList
          sessions={displaySessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onCreateSession={handleCreateSession}
          onPinSession={handlePinSession}
          onArchiveSession={handleArchiveSession}
          onDeleteSession={handleDeleteSession}
          onSearch={handleSearch}
          loading={isLoading || isCreating}
        />
      )}

      {/* 聊天界面 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ChatUI
          ref={chatUIRef}
          sessionId={currentSessionId}
          sessionTitle={displaySessions.find((s) => s.id === currentSessionId)?.title || undefined}
          session={displaySessions.find((s) => s.id === currentSessionId)}
          messages={displayMessages}
          loading={isLoadingMessages}
          isGenerating={streamState.isStreaming}
          streamState={streamState}
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          onLoadMore={handleLoadMore}
          isLoadingMore={isLoadingMoreMessages}
          hasMoreMessages={hasMoreMessages}
          totalMessagesCount={totalMessagesCount}
          loadedMessagesCount={loadedMessagesCount}
        />
      </div>
    </div>
  );
};

export default ChatPage;
