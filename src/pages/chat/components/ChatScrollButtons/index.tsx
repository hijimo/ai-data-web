/**
 * 滚动控制按钮组件
 * 提供快速滚动到顶部和底部的功能
 */

import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import React from 'react';
import styles from './index.module.css';

/**
 * ChatScrollButtons 组件属性
 */
interface ChatScrollButtonsProps {
  /** 是否显示"滚动到顶部"按钮 */
  showScrollToTop?: boolean;
  /** 是否显示"滚动到底部"按钮 */
  showScrollToBottom?: boolean;
  /** 滚动到顶部回调 */
  onScrollToTop?: () => void;
  /** 滚动到底部回调 */
  onScrollToBottom?: () => void;
}

/**
 * 滚动控制按钮组件
 */
export const ChatScrollButtons: React.FC<ChatScrollButtonsProps> = ({
  showScrollToTop = false,
  showScrollToBottom = false,
  onScrollToTop,
  onScrollToBottom,
}) => {
  // 如果两个按钮都不显示，则不渲染组件
  if (!showScrollToTop && !showScrollToBottom) {
    return null;
  }

  return (
    <div className={styles.scrollButtons}>
      <FloatButton.Group shape="circle" style={{ right: 24, bottom: 24 }}>
        {/* 滚动到顶部按钮 */}
        {showScrollToTop && (
          <FloatButton
            icon={<UpOutlined />}
            tooltip="滚动到顶部"
            onClick={onScrollToTop}
            aria-label="滚动到顶部"
          />
        )}

        {/* 滚动到底部按钮 */}
        {showScrollToBottom && (
          <FloatButton
            icon={<DownOutlined />}
            tooltip="滚动到底部"
            onClick={onScrollToBottom}
            aria-label="滚动到底部"
          />
        )}
      </FloatButton.Group>
    </div>
  );
};

export default ChatScrollButtons;
