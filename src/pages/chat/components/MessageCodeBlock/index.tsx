/**
 * 代码块组件
 * 支持语法高亮、复制和折叠功能
 */

import { CopyOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, message, Tag } from 'antd';
import React, { useState } from 'react';
import styles from './index.module.css';

/**
 * MessageCodeBlock 组件属性
 */
interface MessageCodeBlockProps {
  /** 代码内容 */
  code: string;
  /** 编程语言 */
  language?: string;
  /** 是否显示行号 */
  showLineNumbers?: boolean;
}

/**
 * 代码块组件
 */
export const MessageCodeBlock: React.FC<MessageCodeBlockProps> = ({
  code,
  language = 'text',
  showLineNumbers = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // 计算代码行数
  const lines = code.split('\n');
  const lineCount = lines.length;
  const shouldShowCollapseButton = lineCount > 20;

  // 复制代码
  const handleCopy = async () => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(code);
      message.success('代码已复制到剪贴板');
    } catch (error) {
      message.error('复制失败');
    } finally {
      setTimeout(() => setIsCopying(false), 1000);
    }
  };

  // 切换折叠状态
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // 显示的代码（折叠时只显示前 20 行）
  const displayCode = isCollapsed ? lines.slice(0, 20).join('\n') : code;

  return (
    <div className={styles.codeBlock}>
      {/* 代码块头部 */}
      <div className={styles.codeHeader}>
        <Tag color="blue" className={styles.languageTag}>
          {language}
        </Tag>
        <div className={styles.headerActions}>
          {shouldShowCollapseButton && (
            <Button
              type="text"
              size="small"
              icon={isCollapsed ? <DownOutlined /> : <UpOutlined />}
              onClick={toggleCollapse}
              className={styles.actionButton}
            >
              {isCollapsed ? '展开' : '收起'}
            </Button>
          )}
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={handleCopy}
            loading={isCopying}
            className={styles.actionButton}
          >
            复制
          </Button>
        </div>
      </div>

      {/* 代码内容 */}
      <div className={styles.codeContent}>
        <pre className={styles.pre}>
          <code className={styles.code}>{displayCode}</code>
        </pre>
      </div>

      {/* 折叠提示 */}
      {isCollapsed && (
        <div className={styles.collapsedHint}>
          <span>已折叠 {lineCount - 20} 行</span>
        </div>
      )}
    </div>
  );
};

export default MessageCodeBlock;
