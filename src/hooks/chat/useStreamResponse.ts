/**
 * 流式响应处理 Hook
 * 处理 AI 流式响应，支持实时更新和中止
 */

import { message } from 'antd';
import { useCallback, useRef, useState } from 'react';
import { getChat } from '@/services/api/chat/chat';
import type { ChatRequestBody } from '@/types/api/chatRequestBody';

/**
 * 流式响应状态
 */
interface StreamState {
  /** 当前流式内容 */
  currentStreamContent: string;
  /** 是否正在流式传输 */
  isStreaming: boolean;
  /** 流式错误 */
  streamError: Error | null;
}

/**
 * useStreamResponse Hook 返回值
 */
interface UseStreamResponseReturn {
  /** 当前流式内容 */
  currentStreamContent: string;
  /** 是否正在流式传输 */
  isStreaming: boolean;
  /** 流式错误 */
  streamError: Error | null;
  /** 开始流式消息 */
  streamMessage: (request: ChatRequestBody) => Promise<string>;
  /** 停止流式响应 */
  stopStream: () => void;
  /** 重置流式状态 */
  resetStream: () => void;
}

/**
 * 流式响应处理 Hook
 */
export const useStreamResponse = (): UseStreamResponseReturn => {
  // 流式状态
  const [state, setState] = useState<StreamState>({
    currentStreamContent: '',
    isStreaming: false,
    streamError: null,
  });

  // AbortController 引用，用于中止请求
  const abortControllerRef = useRef<AbortController | null>(null);

  // 重置流式状态
  const resetStream = useCallback(() => {
    setState({
      currentStreamContent: '',
      isStreaming: false,
      streamError: null,
    });
  }, []);

  // 停止流式响应
  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isStreaming: false,
    }));
  }, []);

  // 解析 SSE 数据
  const parseSSEData = (line: string): string | null => {
    // SSE 格式: data: {...}
    if (line.startsWith('data: ')) {
      const data = line.slice(6).trim();

      // 检查是否是 [DONE] 标记
      if (data === '[DONE]') {
        return null;
      }

      try {
        const parsed = JSON.parse(data);
        // 根据实际 API 返回格式调整
        return parsed.content || parsed.message || parsed.delta || '';
      } catch (error) {
        console.warn('解析 SSE 数据失败:', error);
        return null;
      }
    }
    return null;
  };

  // 开始流式消息
  const streamMessage = useCallback(
    async (request: ChatRequestBody): Promise<string> => {
      // 重置状态
      resetStream();

      // 创建新的 AbortController
      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        isStreaming: true,
        streamError: null,
      }));

      let fullContent = '';

      try {
        // 调用流式 API
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('响应体为空');
        }

        // 获取 ReadableStream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // 读取流式数据
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // 解码数据
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          // 处理每一行
          for (const line of lines) {
            if (line.trim() === '') continue;

            const content = parseSSEData(line);
            if (content !== null) {
              fullContent += content;

              // 更新流式内容
              setState((prev) => ({
                ...prev,
                currentStreamContent: fullContent,
              }));
            }
          }
        }

        // 流式完成
        setState((prev) => ({
          ...prev,
          isStreaming: false,
        }));

        return fullContent;
      } catch (error: any) {
        // 处理中止错误
        if (error.name === 'AbortError') {
          message.info('已停止生成');
          setState((prev) => ({
            ...prev,
            isStreaming: false,
          }));
          return fullContent;
        }

        // 处理其他错误
        console.error('流式响应错误:', error);
        message.error(error.message || '流式响应失败');

        setState((prev) => ({
          ...prev,
          isStreaming: false,
          streamError: error,
        }));

        throw error;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [resetStream],
  );

  return {
    currentStreamContent: state.currentStreamContent,
    isStreaming: state.isStreaming,
    streamError: state.streamError,
    streamMessage,
    stopStream,
    resetStream,
  };
};
