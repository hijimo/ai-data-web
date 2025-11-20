/**
 * 聊天设置组件
 * 提供会话参数配置功能
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Drawer, Form, Input, message, Select, Slider } from 'antd';
import React, { useEffect, useState } from 'react';
import { getSessions } from '@/services/api/sessions/sessions';
import type { SessionResponse } from '@/types/api/sessionResponse';
import type { UpdateSessionRequest } from '@/types/api/updateSessionRequest';
import styles from './index.module.css';

const { TextArea } = Input;

/**
 * ChatSettings 组件属性
 */
interface ChatSettingsProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 会话 ID */
  sessionId: string | null;
  /** 当前会话数据 */
  session?: SessionResponse;
}

/**
 * 聊天设置组件
 */
export const ChatSettings: React.FC<ChatSettingsProps> = ({
  open,
  onClose,
  sessionId,
  session,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const sessionsApi = getSessions();

  // 保存状态
  const [isSaving, setIsSaving] = useState(false);

  // 获取提供商和模型列表
  const providersData = { data: [] };

  // 提取所有模型列表
  const models = React.useMemo(() => {
    const providers = providersData?.data || [];
    const allModels: Array<{ value: string; label: string; providerId: string }> = [];

    providers.forEach((provider: any) => {
      const providerModels = provider.models || {};
      // models 是一个对象，key 是模型类型，value 是模型数组
      Object.values(providerModels).forEach((modelList: any) => {
        if (Array.isArray(modelList)) {
          modelList.forEach((model: any) => {
            if (model.id) {
              allModels.push({
                value: model.id,
                label: `${provider.label?.zh || provider.id} - ${model.label?.zh || model.id}`,
                providerId: provider.id || '',
              });
            }
          });
        }
      });
    });

    return allModels;
  }, [providersData]);

  // 初始化表单值
  useEffect(() => {
    if (session && open) {
      form.setFieldsValue({
        modelName: session.modelName || '',
        temperature: session.temperature ?? 0.7,
        topP: session.topP ?? 1,
        systemPrompt: session.systemPrompt || '',
      });
    }
  }, [session, open, form]);

  // 防抖保存
  useEffect(() => {
    if (!open || !sessionId) return;

    const subscription = form.getFieldsValue();
    const timer = setTimeout(async () => {
      await handleSave();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.getFieldsValue(), open, sessionId]);

  // 保存设置
  const handleSave = async () => {
    if (!sessionId) return;

    try {
      const values = await form.validateFields();
      setIsSaving(true);

      const updateData: UpdateSessionRequest = {
        modelName: values.modelName,
        temperature: values.temperature,
        topP: values.topP,
        systemPrompt: values.systemPrompt,
      };

      await sessionsApi.patchChatSessionsId({ id: sessionId }, updateData);

      // 刷新会话数据
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });

      message.success('设置已保存');
    } catch (error: any) {
      console.error('保存设置失败:', error);
      // 验证错误不显示提示
      if (error.errorFields) {
        return;
      }
      message.error(error?.message || '保存设置失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 处理表单值变化
  const handleValuesChange = () => {
    // 防抖保存会在 useEffect 中处理
  };

  return (
    <Drawer
      title="聊天设置"
      placement="right"
      width={400}
      onClose={onClose}
      open={open}
      className={styles.chatSettings}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={{
          temperature: 0.7,
          topP: 1,
        }}
      >
        {/* 模型选择 */}
        <Form.Item
          name="modelName"
          label="模型"
          rules={[{ required: true, message: '请选择模型' }]}
        >
          <Select
            placeholder="请选择模型"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={models}
          />
        </Form.Item>

        {/* 温度参数 */}
        <Form.Item
          name="temperature"
          label={
            <span>
              温度 (Temperature)
              <span className={styles.paramDesc}>控制输出的随机性，值越高越随机</span>
            </span>
          }
        >
          <Slider
            min={0}
            max={2}
            step={0.1}
            marks={{
              0: '0',
              0.7: '0.7',
              1: '1',
              2: '2',
            }}
            tooltip={{ formatter: (value) => value?.toFixed(1) }}
          />
        </Form.Item>

        {/* TopP 参数 */}
        <Form.Item
          name="topP"
          label={
            <span>
              Top P<span className={styles.paramDesc}>控制输出的多样性，值越高越多样</span>
            </span>
          }
        >
          <Slider
            min={0}
            max={1}
            step={0.1}
            marks={{
              0: '0',
              0.5: '0.5',
              1: '1',
            }}
            tooltip={{ formatter: (value) => value?.toFixed(1) }}
          />
        </Form.Item>

        {/* 系统提示词 */}
        <Form.Item
          name="systemPrompt"
          label={
            <span>
              系统提示词 (System Prompt)
              <span className={styles.paramDesc}>定义 AI 的角色和行为</span>
            </span>
          }
        >
          <TextArea
            rows={4}
            placeholder="例如：你是一个专业的编程助手，擅长解答技术问题..."
            maxLength={2000}
            showCount
          />
        </Form.Item>
      </Form>

      {/* 保存状态提示 */}
      {isSaving && (
        <div className={styles.savingIndicator}>
          <span>正在保存...</span>
        </div>
      )}
    </Drawer>
  );
};

export default ChatSettings;
