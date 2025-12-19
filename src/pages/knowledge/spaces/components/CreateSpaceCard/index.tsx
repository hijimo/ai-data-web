/**
 * 新建知识库卡片组件
 * 用于触发创建新知识库的操作
 */
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';

interface CreateSpaceCardProps {
  /** 点击回调 */
  readonly onClick?: () => void;
}

/**
 * 新建知识库卡片组件
 */
export const CreateSpaceCard: React.FC<CreateSpaceCardProps> = ({ onClick }) => {
  return (
    <div
      className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50"
      onClick={onClick}
    >
      <PlusOutlined className="mb-2 text-2xl text-gray-400" />
      <span className="text-sm text-gray-500">新建第一个知识库</span>
    </div>
  );
};

export default CreateSpaceCard;
