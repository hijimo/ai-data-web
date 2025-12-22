/**
 * 知识库详情页面
 * 展示知识库信息和知识节点列表
 */
import { ArrowLeftOutlined, MoreOutlined, ShareAltOutlined, StarOutlined } from '@ant-design/icons';
import { Button, Spin, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router';
import React, { useCallback } from 'react';
import { useLexiangEntries } from '@/hooks/services/useLexiangEntries';
import { useLexiangSpaceDetail } from '@/hooks/services/useLexiangSpaces';
import type { LexiangEntryItem } from '@/types/api';
import EntriesTable from './components/EntriesTable';
import UploadButton from './components/UploadButton';

const { Title, Text } = Typography;

/**
 * 知识库详情页面
 */
const KnowledgeEntriesPage: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();

  // 获取知识库详情
  const { data: spaceData, isLoading: spaceLoading } = useLexiangSpaceDetail(spaceId || '');

  // 获取知识节点列表
  const {
    data: entriesData,
    isLoading: entriesLoading,
    refetch,
  } = useLexiangEntries({
    spaceId: spaceId || '',
    limit: 100,
  });

  const space = spaceData?.data;
  const entries = entriesData?.data || [];

  // 返回知识库列表
  const handleBack = () => {
    navigate('/knowledge/spaces');
  };

  // 上传成功后刷新列表
  const handleUploadSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // 点击条目
  const handleEntryClick = (entry: LexiangEntryItem) => {
    if (entry.entryType === 'folder' && entry.id) {
      // 如果是文件夹，可以进入子目录（后续扩展）
      console.log('进入文件夹:', entry);
    } else {
      // 如果是文件或文档，可以打开预览（后续扩展）
      console.log('打开文件:', entry);
    }
  };

  const isLoading = spaceLoading || entriesLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack}>
            知识库主页
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {spaceId && (
            <UploadButton
              spaceId={spaceId}
              parentId={space?.rootEntryId}
              onSuccess={handleUploadSuccess}
            />
          )}
          <Button type="text" icon={<StarOutlined />} />
          <Button type="text" icon={<ShareAltOutlined />} />
          <Button type="text" icon={<MoreOutlined />} />
        </div>
      </div>

      <Spin spinning={isLoading}>
        {/* Banner 区域 */}
        <div className="relative h-40 overflow-hidden bg-linear-to-r from-green-100 to-green-50">
          {/* 装饰图案 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-60">
            <svg viewBox="0 0 800 200" className="h-full w-full">
              {/* 左侧圆圈 */}
              <circle cx="80" cy="100" r="30" fill="none" stroke="#d1d5db" strokeWidth="2" />
              <circle cx="200" cy="140" r="15" fill="none" stroke="#d1d5db" strokeWidth="2" />
              {/* 中间日历图标 */}
              <g transform="translate(350, 50)">
                <rect
                  x="0"
                  y="20"
                  width="100"
                  height="80"
                  rx="8"
                  fill="#86efac"
                  stroke="#22c55e"
                  strokeWidth="2"
                />
                <rect x="0" y="20" width="100" height="25" rx="8" fill="#22c55e" />
                <text x="20" y="38" fill="white" fontSize="12" fontWeight="bold">
                  1. ✓
                </text>
                <text x="20" y="55" fill="white" fontSize="12" fontWeight="bold">
                  2. ✓
                </text>
                <text x="20" y="72" fill="white" fontSize="12" fontWeight="bold">
                  3. ✓
                </text>
                {/* 复选框 */}
                <rect x="10" y="55" width="15" height="15" rx="2" fill="white" stroke="#22c55e" />
                <rect x="10" y="75" width="15" height="15" rx="2" fill="white" stroke="#22c55e" />
                {/* 时钟 */}
                <circle cx="85" cy="85" r="20" fill="white" stroke="#22c55e" strokeWidth="2" />
                <line x1="85" y1="85" x2="85" y2="72" stroke="#22c55e" strokeWidth="2" />
                <line x1="85" y1="85" x2="95" y2="85" stroke="#22c55e" strokeWidth="2" />
              </g>
              {/* 右侧叶子 */}
              <g transform="translate(550, 60)">
                <path d="M0,60 Q30,0 60,60 Q30,40 0,60" fill="#86efac" />
                <path d="M70,40 Q100,-20 130,40 Q100,20 70,40" fill="#86efac" />
              </g>
              {/* 右侧圆圈 */}
              <circle cx="700" cy="60" r="20" fill="none" stroke="#d1d5db" strokeWidth="2" />
              <circle cx="750" cy="140" r="30" fill="none" stroke="#d1d5db" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* 知识库信息 */}
        <div className="px-6 py-6">
          <div className="mb-6 flex items-center gap-4">
            {/* 知识库图标 */}
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-100">
              <span className="text-2xl">📋</span>
            </div>
            {/* 知识库名称 */}
            <Title level={3} className="mb-0!">
              {space?.name || '知识库'}
            </Title>
          </div>

          {/* 最近更新标题 */}
          <div className="mb-4">
            <Text className="text-base font-medium text-gray-700">最近更新</Text>
          </div>

          {/* 条目列表 */}
          <EntriesTable
            dataSource={entries}
            loading={entriesLoading}
            onEntryClick={handleEntryClick}
          />
        </div>
      </Spin>
    </div>
  );
};

export default KnowledgeEntriesPage;
