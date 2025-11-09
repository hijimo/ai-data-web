/**
 * 滚动控制 Hook
 * 管理消息列表的滚动行为和滚动按钮显示
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MessageDetailResponse } from '@/types/api/messageDetailResponse';

/**
 * useScroll Hook 返回值
 */
interface UseScrollReturn {
  /** 滚动容器引用 */
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  /** 滚动到顶部 */
  scrollToTop: () => void;
  /** 滚动到底部 */
  scrollToBottom: () => void;
  /** 是否显示"滚动到顶部"按钮 */
  showScrollToTop: boolean;
  /** 是否显示"滚动到底部"按钮 */
  showScrollToBottom: boolean;
}

/**
 * 滚动控制 Hook
 * @param messages 消息列表
 * @returns 滚动控制相关的状态和方法
 */
export const useScroll = (messages: MessageDetailResponse[]): UseScrollReturn => {
  // 滚动容器引用
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 按钮显示状态
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // 上次消息数量（用于判断是否有新消息）
  const lastMessageCountRef = useRef(messages.length);

  // 滚动到顶部
  const scrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, []);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  // 更新按钮显示状态
  const updateButtonVisibility = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromTop = scrollTop;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // 距离顶部 > 100px 时显示"滚动到顶部"按钮
    setShowScrollToTop(distanceFromTop > 100);

    // 距离底部 > 100px 时显示"滚动到底部"按钮
    setShowScrollToBottom(distanceFromBottom > 100);
  }, []);

  // 监听滚动事件
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // 初始化按钮状态
    updateButtonVisibility();

    // 添加滚动事件监听
    container.addEventListener('scroll', updateButtonVisibility);

    return () => {
      container.removeEventListener('scroll', updateButtonVisibility);
    };
  }, [updateButtonVisibility]);

  // 新消息到达时自动滚动到底部
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // 检查是否有新消息
    const hasNewMessages = messages.length > lastMessageCountRef.current;
    lastMessageCountRef.current = messages.length;

    if (!hasNewMessages) return;

    // 计算距离底部的距离
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // 仅当用户在底部附近时（距离底部 < 150px）才自动滚动
    if (distanceFromBottom < 150) {
      // 使用 setTimeout 确保 DOM 更新后再滚动
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  }, [messages]);

  return {
    scrollContainerRef,
    scrollToTop,
    scrollToBottom,
    showScrollToTop,
    showScrollToBottom,
  };
};
