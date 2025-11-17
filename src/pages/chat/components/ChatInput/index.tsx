/**
 * 消息输入组件
 * 支持文本输入和发送消息
 */

import { Button, Input } from 'antd';
import { Send, StopCircle } from 'lucide-react';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import styles from './index.module.css';

const { TextArea } = Input;

/**
 * ChatInput 组件属性
 */
interface ChatInputProps {
  /** 输入值 */
  value: string;
  /** 输入变化回调 */
  onChange: (value: string) => void;
  /** 发送消息回调 */
  onSend: () => void;
  /** 停止生成回调 */
  onStop?: () => void;
  /** 是否正在生成 */
  isGenerating?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 占位符文本 */
  placeholder?: string;
}

/**
 * ChatInput 组件暴露的方法
 */
export interface ChatInputRef {
  /** 聚焦输入框 */
  focus: () => void;
}

/**
 * 消息输入组件
 */
export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  (
    {
      value,
      onChange,
      onSend,
      onStop,
      isGenerating = false,
      disabled = false,
      placeholder = '输入消息...',
    },
    ref,
  ) => {
    // 输入框引用
    const textAreaRef = useRef<any>(null);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      focus: () => {
        textAreaRef.current?.focus();
      },
    }));
    // 处理输入变化
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    };

    // 处理键盘事件
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter 发送，Shift+Enter 换行
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isGenerating && value.trim()) {
          onSend();
        }
      }
    };

    // 处理发送按钮点击
    const handleSend = () => {
      if (value.trim()) {
        onSend();
      }
    };

    // 处理停止按钮点击
    const handleStop = () => {
      onStop?.();
    };

    return (
      <div className={styles.chatInput}>
        <div className={styles.inputContainer}>
          <TextArea
            ref={textAreaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoSize={{ minRows: 1, maxRows: 8 }}
            disabled={disabled || isGenerating}
            className={styles.textarea}
            aria-label="消息输入框"
          />
          <div className={styles.actions}>
            {isGenerating ? (
              <Button
                type="primary"
                danger
                icon={<StopCircle size={16} />}
                onClick={handleStop}
                className={styles.stopButton}
              >
                停止
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<Send size={16} />}
                onClick={handleSend}
                disabled={disabled || !value.trim()}
                className={styles.sendButton}
              >
                发送
              </Button>
            )}
          </div>
        </div>
        <div className={styles.hint}>
          <span>按 Enter 发送，Shift + Enter 换行</span>
        </div>
      </div>
    );
  },
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
