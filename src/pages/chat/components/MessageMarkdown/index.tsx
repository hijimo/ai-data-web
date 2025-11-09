/**
 * Markdown 渲染组件
 * 使用 react-markdown 渲染消息内容，支持 GitHub Flavored Markdown
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';
import { MessageCodeBlock } from '../MessageCodeBlock';
import styles from './index.module.css';

/**
 * MessageMarkdown 组件属性
 */
interface MessageMarkdownProps {
  /** Markdown 内容 */
  content: string;
}

/**
 * Markdown 渲染组件
 */
export const MessageMarkdown: React.FC<MessageMarkdownProps> = React.memo(({ content }) => {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 代码块使用自定义组件
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            return !inline ? (
              <MessageCodeBlock code={codeString} language={language} />
            ) : (
              <code className={styles.inlineCode} {...props}>
                {children}
              </code>
            );
          },
          // 链接添加安全属性
          a({ node, children, href, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                {...props}
              >
                {children}
              </a>
            );
          },
          // 表格样式
          table({ node, children, ...props }) {
            return (
              <div className={styles.tableWrapper}>
                <table className={styles.table} {...props}>
                  {children}
                </table>
              </div>
            );
          },
          // 列表样式
          ul({ node, children, ...props }) {
            return (
              <ul className={styles.ul} {...props}>
                {children}
              </ul>
            );
          },
          ol({ node, children, ...props }) {
            return (
              <ol className={styles.ol} {...props}>
                {children}
              </ol>
            );
          },
          // 引用块样式
          blockquote({ node, children, ...props }) {
            return (
              <blockquote className={styles.blockquote} {...props}>
                {children}
              </blockquote>
            );
          },
        }}
        // 安全选项：禁止危险元素
        disallowedElements={['script', 'iframe']}
        unwrapDisallowed
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MessageMarkdown.displayName = 'MessageMarkdown';

export default MessageMarkdown;
