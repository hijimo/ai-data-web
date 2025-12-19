/**
 * 知识库管理页面
 * 展示知识库列表，支持新建、编辑、删除操作
 */
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Empty, Modal, Spin } from 'antd';
import { useNavigate } from 'react-router';
import React, { useRef } from 'react';
import { useDeleteLexiangSpace, useLexiangSpaces } from '@/hooks/services/useLexiangSpaces';
import type { LexiangSpaceItem } from '@/types/api';
import CreateSpaceCard from './components/CreateSpaceCard';
import SpaceCard from './components/SpaceCard';
import SpaceDrawer, { type SpaceDrawerRef } from './components/SpaceDrawer';

/**
 * 知识库管理页面
 */
const KnowledgeSpacesPage: React.FC = () => {
  const drawerRef = useRef<SpaceDrawerRef>(null);
  const navigate = useNavigate();

  // 获取知识库列表
  const { data: spacesData, isLoading, refetch } = useLexiangSpaces({ limit: 100 });
  // 删除知识库
  const { mutate: deleteSpace } = useDeleteLexiangSpace();

  const spaces = spacesData?.data || [];

  // 打开新建抽屉
  const handleCreate = () => {
    drawerRef.current?.open();
  };

  // 打开编辑抽屉
  const handleEdit = (space: LexiangSpaceItem) => {
    drawerRef.current?.open(space);
  };

  // 删除知识库
  const handleDelete = (space: LexiangSpaceItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除知识库「${space.name}」吗？删除后无法恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        if (space.id) {
          deleteSpace(space.id);
        }
      },
    });
  };

  // 点击知识库卡片，跳转到详情页
  const handleCardClick = (space: LexiangSpaceItem) => {
    if (space.id) {
      navigate(`/knowledge/spaces/${space.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 团队头像 */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <TeamOutlined className="text-2xl text-blue-600" />
          </div>
          {/* 团队信息 */}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">团队知识库</h1>
            <p className="text-sm text-gray-500">
              <span className="mr-1">✏️</span>
              管理和组织团队的知识资源
            </p>
          </div>
        </div>
        {/* 新建按钮 */}
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建知识库
        </Button>
      </div>

      {/* 知识库标题 */}
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-base font-medium text-gray-800">团队知识库</h2>
        <span className="text-sm text-gray-400">({spaces.length})</span>
      </div>

      {/* 知识库列表 */}
      <Spin spinning={isLoading}>
        {spaces.length === 0 && !isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <CreateSpaceCard onClick={handleCreate} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* 新建卡片 */}
            <CreateSpaceCard onClick={handleCreate} />
            {/* 知识库卡片列表 */}
            {spaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}

        {/* 空状态 - 当没有数据且不在加载中时显示 */}
        {spaces.length === 0 && !isLoading && (
          <div className="mt-8">
            <Empty
              description="暂无知识库，点击上方按钮创建第一个知识库"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Spin>

      {/* 知识库抽屉 */}
      <SpaceDrawer ref={drawerRef} onSuccess={() => refetch()} />
    </div>
  );
};

export default KnowledgeSpacesPage;
