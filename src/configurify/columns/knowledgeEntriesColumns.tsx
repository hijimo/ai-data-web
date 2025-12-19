/**
 * 知识库条目表格列定义
 */
import { FileOutlined, FileTextOutlined, FolderOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import React from 'react';
import type { LexiangEntryItem } from '@/types/api';
import { option } from './baseColumns';

/**
 * 获取条目类型图标
 */
const getEntryTypeIcon = (entryType?: string): React.ReactNode => {
  switch (entryType) {
    case 'folder':
      return <FolderOutlined className="text-yellow-500" />;
    case 'page':
      return <FileTextOutlined className="text-blue-500" />;
    case 'file':
    default:
      return <FileOutlined className="text-gray-500" />;
  }
};

/**
 * 名称列
 */
export const entryName: ProColumns<LexiangEntryItem> = {
  title: '名称',
  dataIndex: 'name',
  className: 'nowrap',
  ellipsis: true,
  search: false,
  render: (_, record) => (
    <div className="flex items-center gap-2">
      {getEntryTypeIcon(record.entryType)}
      <span className="truncate">{record.name || '--'}</span>
    </div>
  ),
};

/**
 * 条目类型列
 */
export const entryType: ProColumns<LexiangEntryItem> = {
  title: '类型',
  dataIndex: 'entryType',
  className: 'nowrap',
  width: 100,
  search: false,
  valueEnum: {
    folder: { text: '文件夹' },
    page: { text: '在线文档' },
    file: { text: '文件' },
  },
};

/**
 * 知识库条目列配置
 */
export const knowledgeEntriesColumns: Record<string, ProColumns<LexiangEntryItem>> = {
  entryName,
  entryType,
  option,
};
