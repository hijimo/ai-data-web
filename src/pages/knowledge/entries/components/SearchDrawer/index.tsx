/**
 * AI 搜索抽屉组件
 * 提供知识库内容搜索功能
 */
import { FileTextOutlined, LinkOutlined, SearchOutlined } from '@ant-design/icons';
import { Card, Drawer, Empty, Input, Spin, Tag, Tooltip, Typography } from 'antd';
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { useLexiangSearch } from '@/hooks/services/useLexiangSearch';
import type { AITargetSwagger, LexiangAISearchResultItem } from '@/types/api';

const { Text, Paragraph, Link } = Typography;

export interface SearchDrawerRef {
  open: () => void;
  close: () => void;
}

interface SearchDrawerProps {
  /** 搜索目标配置（可选） */
  targets?: AITargetSwagger[];
}

/**
 * 搜索结果卡片组件
 */
const SearchResultCard: React.FC<{ item: LexiangAISearchResultItem; index: number }> = ({
  item,
  index,
}) => {
  // 处理链接点击
  const handleLinkClick = () => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card
      size="small"
      className="mb-3 cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleLinkClick}
    >
      <div className="flex items-start gap-3">
        {/* 序号标识 */}
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-600">
          {index + 1}
        </div>

        <div className="min-w-0 flex-1">
          {/* 标题行 */}
          <div className="mb-2 flex items-center gap-2">
            <FileTextOutlined className="shrink-0 text-gray-400" />
            <Text strong className="line-clamp-1 flex-1" title={item.title}>
              {item.title || '无标题'}
            </Text>
            {item.url && (
              <Tooltip title="打开链接">
                <Tag
                  icon={<LinkOutlined />}
                  color="blue"
                  className="shrink-0 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLinkClick();
                  }}
                >
                  查看
                </Tag>
              </Tooltip>
            )}
          </div>

          {/* 内容摘要 */}
          {item.content && (
            <Paragraph
              type="secondary"
              className="mb-0! text-sm leading-relaxed"
              ellipsis={{ rows: 4, expandable: true, symbol: '展开' }}
            >
              {item.content}
            </Paragraph>
          )}

          {/* URL 显示 */}
          {item.url && (
            <div className="mt-2">
              <Link
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {item.url.length > 60 ? `${item.url.slice(0, 60)}...` : item.url}
              </Link>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

/**
 * AI 搜索抽屉
 */
const SearchDrawer = forwardRef<SearchDrawerRef, SearchDrawerProps>((props, ref) => {
  const { targets } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // 搜索 mutation
  const { mutate: search, data: searchResult, isPending, reset } = useLexiangSearch();

  // 搜索结果列表
  const resultList = searchResult?.data?.list || [];

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    open: () => {
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
      // 关闭时清空状态
      setSearchValue('');
      reset();
    },
  }));

  // 执行搜索
  const handleSearch = useCallback(
    (value: string) => {
      const trimmedValue = value.trim();
      if (!trimmedValue) return;

      search({
        query: trimmedValue,
        topN: 20,
        targets,
      });
    },
    [search, targets],
  );

  // 关闭抽屉
  const handleClose = () => {
    setIsOpen(false);
    setSearchValue('');
    reset();
  };

  return (
    <Drawer
      title="AI 智能搜索"
      open={isOpen}
      onClose={handleClose}
      width={560}
      destroyOnHidden
      styles={{
        body: { padding: '16px 24px' },
      }}
    >
      {/* 搜索框 */}
      <div className="mb-4">
        <Input.Search
          placeholder="输入关键词搜索知识库内容..."
          allowClear
          enterButton={
            <span className="flex items-center gap-1">
              <SearchOutlined />
              搜索
            </span>
          }
          size="large"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          loading={isPending}
        />
        <Text type="secondary" className="mt-2 block text-xs">
          支持自然语言搜索，AI 将为您匹配最相关的知识内容
        </Text>
      </div>

      {/* 搜索结果区域 */}
      <div className="mt-4">
        {/* 加载状态 */}
        {isPending && (
          <div className="flex flex-col items-center justify-center py-12">
            <Spin size="large" />
            <Text type="secondary" className="mt-4">
              正在搜索中...
            </Text>
          </div>
        )}

        {/* 搜索结果 */}
        {!isPending && resultList.length > 0 && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <Text type="secondary">
                找到 <Text strong>{resultList.length}</Text> 条相关结果
              </Text>
            </div>
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              {resultList.map((item, index) => (
                <SearchResultCard key={`${item.title}-${index}`} item={item} index={index} />
              ))}
            </div>
          </>
        )}

        {/* 无结果状态 */}
        {!isPending && searchResult && resultList.length === 0 && (
          <Empty description="未找到相关内容，请尝试其他关键词" className="py-12" />
        )}

        {/* 初始状态 */}
        {!isPending && !searchResult && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <SearchOutlined className="mb-4 text-4xl text-gray-300" />
            <Text type="secondary">输入关键词开始搜索</Text>
            <Text type="secondary" className="mt-1 text-xs">
              例如：产品使用说明、常见问题、操作指南
            </Text>
          </div>
        )}
      </div>
    </Drawer>
  );
});

SearchDrawer.displayName = 'SearchDrawer';

export default SearchDrawer;
