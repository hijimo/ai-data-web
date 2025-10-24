import type { ActionType } from '@ant-design/pro-components';
import { useMutation } from '@tanstack/react-query';
import { Button, message, Popconfirm } from 'antd';
import { produce } from 'immer';
import { values as _values } from 'lodash-es';
import React, { useCallback, useMemo, useRef } from 'react';
import CommonTable from '@/components/CommonTable';
import OptionMenu from '@/components/CommonTable/OptionMenu';
import { useTableRequest } from '@/hooks/useTableRequest';
import type {
  TenantCreateDrawerRef,
  TenantEditDrawerRef,
  TenantTableProps,
} from '@/pages/tenants/types';
import { tenantColumns } from '@/configurify/columns/tenantColumns';
import { handleError } from '@/utils/errorHandler';
import { getTenantManagement } from '@/services/api/tenant-management/tenant-management';
import type { Tenant } from '@/types/api';
import type { ResponsePaginationData } from '@/types';
import TenantCreateDrawer from '../../Drawer/TenantCreateDrawer';
import TenantEditDrawer from '../../Drawer/TenantEditDrawer';
import styles from './index.module.css';

const TenantTable: React.FC<TenantTableProps> = () => {
  const actionRef = useRef<ActionType>(null);
  const createDrawerRef = useRef<TenantCreateDrawerRef>(null);
  const editDrawerRef = useRef<TenantEditDrawerRef>(null);

  const { getTenants, deleteTenantsId } = getTenantManagement();

  // 删除租户的 mutation
  const { mutate: deleteTenantMutate } = useMutation({
    mutationFn: async (id: string) => deleteTenantsId({ id }),
    onSuccess: (response) => {
      if (response.code === 200) {
        message.success('删除租户成功');
        // 刷新表格
        actionRef.current?.reload();
      } else {
        const errorMsg = String(response.message || '删除租户失败');
        message.error(errorMsg);
        console.error('删除租户失败 - API 响应错误:', {
          code: response.code,
          message: response.message,
        });
      }
    },
    onError: (error: unknown) => {
      const errorMessage = handleError(error, '删除租户');
      message.error(errorMessage);
    },
  });

  // 处理编辑操作
  const handleEdit = useCallback((record: Tenant) => {
    editDrawerRef.current?.open(record);
  }, []);

  // 处理删除操作
  const handleDelete = useCallback(
    (id: string | undefined) => {
      if (!id) {
        message.error('租户 ID 不存在');
        return;
      }
      deleteTenantMutate(id);
    },
    [deleteTenantMutate],
  );

  // 处理创建操作
  const handleCreate = useCallback(() => {
    createDrawerRef.current?.open();
  }, []);

  // 处理操作成功后的刷新
  const handleSuccess = useCallback(() => {
    actionRef.current?.reload();
  }, []);

  // 表格数据请求函数
  const fetchData = useTableRequest(
    getTenants as unknown as (params: Record<string, unknown>) => Promise<ResponsePaginationData>,
  );

  // 配置表格列
  const columns = useMemo(() => {
    return _values(
      produce(tenantColumns, (draft) => {
        // 配置操作列
        draft.option!.render = (_, record: Tenant) => {
          return (
            <OptionMenu>
              <a key="edit" onClick={() => handleEdit(record)}>
                编辑
              </a>
              <Popconfirm
                key="delete"
                title="确认删除"
                description="删除后该租户将无法恢复，确认删除吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确认"
                cancelText="取消"
              >
                <a className="text-red-500">删除</a>
              </Popconfirm>
            </OptionMenu>
          );
        };
      }),
    );
  }, [handleEdit, handleDelete]);

  return (
    <div className={styles.tenantTable}>
      <CommonTable
        headerTitle="租户列表"
        scroll={{ x: 1200, y: 'calc(100vh - 380px)' }}
        rowKey="id"
        actionRef={actionRef}
        request={fetchData as any}
        columns={columns as any}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={handleCreate}>
            创建租户
          </Button>,
        ]}
      />
      <TenantCreateDrawer ref={createDrawerRef} onSuccess={handleSuccess} />
      <TenantEditDrawer ref={editDrawerRef} onSuccess={handleSuccess} />
    </div>
  );
};

export default TenantTable;
