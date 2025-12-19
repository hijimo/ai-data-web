/**
 * 知识库创建/编辑抽屉组件
 */
import { Button, Drawer, Form, Input, Space } from 'antd';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useCreateLexiangSpace, useUpdateLexiangSpace } from '@/hooks/services/useLexiangSpaces';
import type { LexiangSpaceItem } from '@/types/api';

export interface SpaceDrawerRef {
  /** 打开抽屉 */
  open: (data?: LexiangSpaceItem) => void;
  /** 关闭抽屉 */
  close: () => void;
}

interface SpaceDrawerProps {
  /** 操作成功回调 */
  readonly onSuccess?: () => void;
}

interface FormValues {
  name: string;
}

/**
 * 知识库创建/编辑抽屉组件
 */
export const SpaceDrawer = forwardRef<SpaceDrawerRef, SpaceDrawerProps>(({ onSuccess }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form] = Form.useForm<FormValues>();
  const [currentSpace, setCurrentSpace] = useState<LexiangSpaceItem | null>(null);

  const isEdit = !!currentSpace?.id;

  // 创建知识库
  const { mutate: createSpace, isPending: isCreating } = useCreateLexiangSpace();
  // 更新知识库
  const { mutate: updateSpace, isPending: isUpdating } = useUpdateLexiangSpace();

  const isLoading = isCreating || isUpdating;

  useImperativeHandle(ref, () => ({
    open: (data?: LexiangSpaceItem) => {
      setCurrentSpace(data || null);
      setIsOpen(true);
      if (data) {
        // 编辑模式，设置表单值
        setTimeout(() => {
          form.setFieldsValue({
            name: data.name || '',
          });
        }, 100);
      } else {
        // 新建模式，重置表单
        form.resetFields();
      }
    },
    close: () => {
      setIsOpen(false);
      setCurrentSpace(null);
      form.resetFields();
    },
  }));

  const handleClose = () => {
    setIsOpen(false);
    setCurrentSpace(null);
    form.resetFields();
  };

  const handleSubmit = async (values: FormValues) => {
    if (isEdit && currentSpace?.id) {
      // 更新知识库
      updateSpace(
        { id: currentSpace.id, data: { name: values.name } },
        {
          onSuccess: () => {
            handleClose();
            onSuccess?.();
          },
        },
      );
    } else {
      // 创建知识库
      createSpace(
        { name: values.name },
        {
          onSuccess: () => {
            handleClose();
            onSuccess?.();
          },
        },
      );
    }
  };

  return (
    <Drawer
      title={isEdit ? '编辑知识库' : '新建知识库'}
      open={isOpen}
      onClose={handleClose}
      width={480}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={handleClose}>取消</Button>
          <Button type="primary" loading={isLoading} onClick={() => form.submit()}>
            {isEdit ? '保存' : '创建'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <Form.Item
          name="name"
          label="知识库名称"
          rules={[
            { required: true, message: '请输入知识库名称' },
            { max: 255, message: '知识库名称不能超过255个字符' },
          ]}
        >
          <Input placeholder="请输入知识库名称" maxLength={255} />
        </Form.Item>
      </Form>
    </Drawer>
  );
});

SpaceDrawer.displayName = 'SpaceDrawer';

export default SpaceDrawer;
