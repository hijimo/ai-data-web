/**
 * 模型设置页面
 */
import { PageContainer } from '@ant-design/pro-components';
import React from 'react';
import ModelConfigForm from './components/ModelConfigForm';
import ModelConfigList from './components/ModelConfigList';

const ModelSettings: React.FC = () => {
  return (
    <PageContainer title="模型设置">
      <div className="space-y-6">
        {/* 已配置的模型列表 */}
        <ModelConfigList />

        {/* 模型配置表单 */}
        <ModelConfigForm />
      </div>
    </PageContainer>
  );
};

export default ModelSettings;
