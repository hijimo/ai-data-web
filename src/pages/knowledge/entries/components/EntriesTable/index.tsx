/**
 * 知识库条目表格组件
 */
import { FileOutlined, FileTextOutlined, FolderOutlined } from '@ant-design/icons';
import { Popconfirm, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';
import 'dayjs/locale/zh-cn';
import { useDeleteLexiangEntry } from '@/hooks/services/useLexiangEntries';
import type { LexiangEntryItem } from '@/types/api';

// 配置 dayjs 相对时间插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

interface EntriesTableProps {
  /** 数据源 */
  dataSource: LexiangEntryItem[];
  /** 加载状态 */
  loading?: boolean;
  /** 点击条目 */
  onEntryClick?: (entry: LexiangEntryItem) => void;
}

/**
 * 获取条目类型图标
 */
const getEntryTypeIcon = (entryType?: string): React.ReactNode => {
  switch (entryType) {
    case 'folder':
      return <FolderOutlined className="text-lg text-yellow-500" />;
    case 'page':
      return <FileTextOutlined className="text-lg text-blue-500" />;
    case 'file':
    default:
      return <FileOutlined className="text-lg text-gray-500" />;
  }
};

/**
 * 知识库条目表格
 */
const EntriesTable: React.FC<EntriesTableProps> = ({ dataSource, loading, onEntryClick }) => {
  const deleteEntry = useDeleteLexiangEntry();

  // 处理删除
  const handleDelete = (id: string) => {
    deleteEntry.mutate(id);
  };

  const columns: TableColumnsType<LexiangEntryItem> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (_, record) => (
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => onEntryClick?.(record)}
        >
          {getEntryTypeIcon(record.entryType)}
          <span className="truncate hover:text-blue-500">{record.name || '--'}</span>
        </div>
      ),
    },
    {
      title: '所有者',
      dataIndex: 'owner',
      key: 'owner',
      width: 120,
      render: () => '--',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (value) => (value ? dayjs(value).fromNow() : '--'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="确认删除"
          description={`确定要删除「${record.name}」吗？`}
          onConfirm={() => record.id && handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <a className="text-red-500 hover:text-red-600">删除</a>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table<LexiangEntryItem>
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey="id"
      pagination={false}
      size="middle"
    />
  );
};

export default EntriesTable;
