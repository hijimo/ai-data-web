/**
 * 知识库卡片组件
 * 用于展示单个知识库的信息
 */
import { DeleteOutlined, EditOutlined, FolderOutlined } from '@ant-design/icons';
import { Dropdown, Typography } from 'antd';
import type { MenuProps } from 'antd';
import React from 'react';
import type { LexiangSpaceItem } from '@/types/api';

const { Text, Paragraph } = Typography;

interface SpaceCardProps {
  /** 知识库数据 */
  readonly space: LexiangSpaceItem;
  /** 编辑回调 */
  readonly onEdit?: (space: LexiangSpaceItem) => void;
  /** 删除回调 */
  readonly onDelete?: (space: LexiangSpaceItem) => void;
  /** 点击卡片回调 */
  readonly onClick?: (space: LexiangSpaceItem) => void;
}

/**
 * 知识库卡片组件
 */
export const SpaceCard: React.FC<SpaceCardProps> = ({ space, onEdit, onDelete, onClick }) => {
  // 右键菜单项
  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
      onClick: (e) => {
        e.domEvent.stopPropagation();
        onEdit?.(space);
      },
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: (e) => {
        e.domEvent.stopPropagation();
        onDelete?.(space);
      },
    },
  ];

  const handleClick = () => {
    onClick?.(space);
  };

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
      <div
        className="group relative flex h-28 cursor-pointer flex-col rounded-lg bg-blue-50 p-4 transition-all hover:bg-blue-100 hover:shadow-md"
        onClick={handleClick}
      >
        {/* 知识库图标和名称 */}
        <div className="flex items-start gap-3">
          {space.logo ? (
            <img src={space.logo} alt={space.name} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-200">
              <FolderOutlined className="text-xl text-blue-600" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Text strong className="block truncate text-base" title={space.name}>
              {space.name || '未命名知识库'}
            </Text>
          </div>
        </div>

        {/* 操作按钮 - 悬停时显示 */}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            className="flex h-7 w-7 items-center justify-center rounded bg-white/80 text-gray-600 hover:bg-white hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(space);
            }}
            title="编辑"
          >
            <EditOutlined />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded bg-white/80 text-gray-600 hover:bg-white hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(space);
            }}
            title="删除"
          >
            <DeleteOutlined />
          </button>
        </div>
      </div>
    </Dropdown>
  );
};

export default SpaceCard;
