/**
 * 模型选择器组件
 * 用于在聊天输入框中选择 AI 模型
 */

import { Button, Dropdown, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAvailableModelConfigurations } from '@/hooks/useModelConfigurations';
import type { ModelConfiguration } from '@/types/api';
import styles from './index.module.css';

/**
 * 本地存储的键名
 */
const STORAGE_KEY = 'selected_model_value';

/**
 * ModelSelector 组件属性
 */
interface ModelSelectorProps {
  /** 模型变化回调 */
  onChange?: (value: string, model: ModelConfiguration) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 保存时使用的字段名，默认为 "model" */
  valueField?: keyof ModelConfiguration;
}

/**
 * 模型选择器组件
 */
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  onChange,
  disabled = false,
  valueField = 'model',
}) => {
  // 获取可用模型列表
  const { data: response, isLoading } = useAvailableModelConfigurations();

  // 当前选中的模型值
  const [selectedValue, setSelectedValue] = useState<string>(() => {
    // 从 localStorage 读取上次选择的模型值
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  // 可用模型列表
  const models = useMemo(() => response?.data || [], [response]);

  // 当前选中的模型对象
  const selectedModel = useMemo(
    () => models.find((m) => m[valueField] === selectedValue),
    [models, selectedValue, valueField],
  );

  // 初始化：如果没有选中模型，自动选择第一个
  useEffect(() => {
    if (models.length > 0 && !selectedValue) {
      const firstModel = models[0];
      const firstValue = firstModel[valueField] as string;
      if (firstValue) {
        setSelectedValue(firstValue);
        localStorage.setItem(STORAGE_KEY, firstValue);
        onChange?.(firstValue, firstModel);
      }
    }
  }, [models, selectedValue, valueField, onChange]);

  // 处理模型选择
  const handleMenuClick = useCallback<NonNullable<MenuProps['onClick']>>(
    (info) => {
      const { key } = info;
      const model = models.find((m) => m[valueField] === key);
      if (model) {
        const value = model[valueField] as string;
        if (value) {
          setSelectedValue(value);
          localStorage.setItem(STORAGE_KEY, value);
          onChange?.(value, model);
        }
      }
    },
    [models, valueField, onChange],
  );

  // 构建下拉菜单项
  const menuItems: MenuProps['items'] = useMemo(
    () =>
      models.map((model) => ({
        key: (model[valueField] as string) || '',
        label: (
          <div className={styles.menuItem}>
            <div className={styles.modelName}>{model.name}</div>
            <div className={styles.modelInfo}>
              {model.modelProvider} · {model.model}
            </div>
          </div>
        ),
      })),
    [models, valueField],
  );

  // 加载中状态
  if (isLoading) {
    return (
      <Button size="small" disabled className={styles.button}>
        <Spin size="small" />
      </Button>
    );
  }

  // 没有可用模型
  if (models.length === 0) {
    return (
      <Button size="small" disabled className={styles.button}>
        无可用模型
      </Button>
    );
  }

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: handleMenuClick,
        selectedKeys: selectedValue ? [selectedValue] : [],
      }}
      trigger={['click']}
      disabled={disabled}
    >
      <Button size="small" className={styles.button} disabled={disabled}>
        <span className={styles.buttonText}>{selectedModel?.name || '选择模型'}</span>
        <ChevronDown size={14} className={styles.icon} />
      </Button>
    </Dropdown>
  );
};

export default ModelSelector;
