import React from 'react'
import type { ProColumns } from '@ant-design/pro-table'
import { Badge, Select, Tag } from 'antd'
import dayjs from 'dayjs'
import ColumnEllipsisWrap from '@/components/CommonTable/ColumnEllipsisWrap'
import type { Tenant, TenantType } from '@/types/api'
import { DATE_FORMAT_FULL_TIME } from '@/variables'
import { createTime, creatorName, option } from './baseColumns'

// 租户名称列
export const tenantName: ProColumns<Tenant> = {
  title: '租户名称',
  dataIndex: 'name',
  className: 'nowrap',
  ellipsis: true,
  width: 180,
  fixed: 'left',
  fieldProps: {
    placeholder: '请输入租户名称',
  },
  render: (_, record) => {
    if (!record.name) return <span>--</span>
    return (
      <ColumnEllipsisWrap width={160}>
        <span className="font-medium">{record.name}</span>
      </ColumnEllipsisWrap>
    )
  },
}

// 租户域名列
export const tenantDomain: ProColumns<Tenant> = {
  title: '租户域名',
  dataIndex: 'domain',
  className: 'nowrap',
  ellipsis: true,
  width: 220,
  search: false,
  render: (_, record) => {
    if (!record.domain) return <span className="text-gray-400">--</span>
    return (
      <ColumnEllipsisWrap width={200}>
        <span className="text-blue-600">{record.domain}</span>
      </ColumnEllipsisWrap>
    )
  },
}

// 租户类型列（表格显示）
export const tenantType: ProColumns<Tenant> = {
  title: '租户类型',
  dataIndex: 'type',
  className: 'nowrap',
  width: 120,
  search: false,
  render: (_, record) => {
    const typeMap: Record<string, { text: string; color: string }> = {
      system: { text: '平台租户', color: 'blue' },
      tenant: { text: '业务租户', color: 'green' },
    }
    const config = typeMap[record.type as string] || {
      text: record.type,
      color: 'default',
    }
    return <Tag color={config.color}>{config.text}</Tag>
  },
}

// 租户类型搜索列
export const tenantTypeSearch: ProColumns<Tenant> = {
  title: '租户类型',
  dataIndex: 'type',
  className: 'nowrap',
  hideInTable: true,
  renderFormItem: () => (
    <Select placeholder="请选择租户类型" allowClear>
      <Select.Option value="system">平台租户</Select.Option>
      <Select.Option value="tenant">业务租户</Select.Option>
    </Select>
  ),
}

// 租户状态列
export const tenantStatus: ProColumns<Tenant> = {
  title: '状态',
  dataIndex: 'status',
  className: 'nowrap',
  width: 100,
  valueType: 'select',
  fieldProps: {
    options: [
      { label: '全部', value: undefined },
      { label: '启用', value: true },
      { label: '禁用', value: false },
    ],
  },
  render: (_, record) =>
    record.status ? (
      <Badge status="success" text="启用" />
    ) : (
      <Badge status="error" text="禁用" />
    ),
}

// 租户创建时间列（使用基础列定义并覆盖 dataIndex）
export const tenantCreateTime: ProColumns<Tenant> = {
  ...createTime,
  dataIndex: 'createdAt',
  width: 180,
  renderText: (_) => (_ ? dayjs(_).format(DATE_FORMAT_FULL_TIME) : '--'),
}

// 租户创建人列（使用基础列定义并覆盖 dataIndex）
export const tenantCreatorName: ProColumns<Tenant> = {
  ...creatorName,
  dataIndex: 'createdBy',
  width: 140,
  render: (_, record) => {
    if (!record.createdBy) return <span className="text-gray-400">--</span>
    return (
      <ColumnEllipsisWrap width={120}>
        <span>{record.createdBy}</span>
      </ColumnEllipsisWrap>
    )
  },
}

// 导出租户表格列配置
export const tenantColumns: Record<string, ProColumns<Tenant>> = {
  tenantName,
  tenantDomain,
  tenantType,
  tenantTypeSearch,
  tenantStatus,
  tenantCreateTime,
  tenantCreatorName,
  option,
}
