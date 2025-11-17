/**
 * 流式状态指示器组件
 * 显示流式响应的各个阶段状态
 */

import { Spin, Tag } from 'antd';
import { Lightbulb, Loader2, Search, Wrench } from 'lucide-react';
import React from 'react';
import type { StreamStage } from '@/types/stream';
import styles from './index.module.css';

/**
 * StreamStatusIndicator 组件属性
 */
interface StreamStatusIndicatorProps {
  /** 当前阶段 */
  stage: StreamStage;
  /** 阶段消息 */
  stageMessage?: string;
  /** 思考内容 */
  thinkingContent?: string;
  /** 是否显示思考过程 */
  showThinking?: boolean;
}

/**
 * 获取阶段图标
 */
const getStageIcon = (stage: StreamStage): React.ReactNode => {
  switch (stage) {
    case 'tool_call_start':
    case 'tool_call_progress':
    case 'tool_call_complete':
    case 'tool_call_error':
      return <Wrench size={14} />;
    case 'internal_searching':
    case 'finished_internal_searching':
    case 'resource_retrieval_start':
    case 'resource_retrieval_complete':
      return <Search size={14} />;
    case 'thinking':
      return <Lightbulb size={14} />;
    default:
      return <Loader2 size={14} />;
  }
};

/**
 * 获取阶段颜色
 */
const getStageColor = (stage: StreamStage): string => {
  switch (stage) {
    case 'tool_call_error':
      return 'error';
    case 'tool_call_complete':
    case 'finished_internal_searching':
    case 'resource_retrieval_complete':
      return 'success';
    case 'thinking':
      return 'processing';
    default:
      return 'default';
  }
};

/**
 * 流式状态指示器组件
 */
export const StreamStatusIndicator: React.FC<StreamStatusIndicatorProps> = ({
  stage,
  stageMessage,
  thinkingContent,
  showThinking = false,
}) => {
  // 如果没有阶段信息，不显示
  if (!stage && !stageMessage) {
    return null;
  }

  return (
    <div className={styles.statusIndicator}>
      {/* 阶段状态 */}
      {stageMessage && (
        <div className={styles.stageStatus}>
          <Tag icon={getStageIcon(stage)} color={getStageColor(stage)}>
            {stageMessage}
          </Tag>
        </div>
      )}

      {/* 思考过程（可选显示） */}
      {showThinking && stage === 'thinking' && thinkingContent && (
        <div className={styles.thinkingContent}>
          <div className={styles.thinkingLabel}>
            <Lightbulb size={14} /> 思考过程：
          </div>
          <div className={styles.thinkingText}>{thinkingContent}</div>
        </div>
      )}

      {/* 加载动画 */}
      {stage && stage !== '' && (
        <div className={styles.loadingDots}>
          <Spin size="small" />
        </div>
      )}
    </div>
  );
};

export default StreamStatusIndicator;
