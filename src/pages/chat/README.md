# 聊天会话页面

## 功能概述

完整的聊天会话管理和消息交互界面，支持：

- ✅ 会话列表管理（创建、删除、置顶、归档、搜索）
- ✅ 消息展示（用户/AI 消息区分、时间分组）
- ✅ 消息输入（自动高度调整、快捷键支持）
- ✅ 流式响应（实时显示 AI 生成内容、支持停止生成）
- ✅ 滚动控制（智能自动滚动、快速导航按钮）
- ✅ 聊天设置（模型选择、温度、TopP、系统提示词）
- ✅ Markdown 渲染（代码高亮、表格、列表等）
- ✅ 代码块展示（复制、折叠功能）

## 安装依赖

在使用 Markdown 渲染功能前，需要安装以下依赖：

```bash
yarn add react-markdown remark-gfm
```

或使用 npm：

```bash
npm install react-markdown remark-gfm
```

## 组件结构

```
src/pages/chat/
├── index.tsx                    # 聊天主页面
├── components/
│   ├── SessionList/            # 会话列表
│   ├── SessionItem/            # 会话项
│   ├── ChatUI/                 # 聊天界面容器
│   ├── ChatHeader/             # 聊天头部
│   ├── ChatMessages/           # 消息列表
│   ├── Message/                # 单条消息
│   ├── MessageMarkdown/        # Markdown 渲染
│   ├── MessageCodeBlock/       # 代码块
│   ├── ChatInput/              # 消息输入
│   ├── ChatScrollButtons/      # 滚动控制按钮
│   └── ChatSettings/           # 聊天设置
```

## 使用方式

### 访问页面

```
/chat                           # 聊天页面（无会话选中）
/chat?sessionId=xxx            # 打开指定会话
```

### 快捷键

#### 消息输入

- `Enter` - 发送消息
- `Shift + Enter` - 换行

#### 全局快捷键

- `Ctrl + L` (Windows/Linux) 或 `Cmd + L` (macOS) - 聚焦输入框

详细说明请参考 [快捷键文档](../../docs/chat-sessions-page/keyboard-shortcuts.md)

### 滚动控制

#### 智能自动滚动

- 新消息到达时，仅在用户位于底部附近（距离底部 < 150px）时自动滚动
- 用户查看历史消息时，不会被新消息打断

#### 快速导航按钮

- 滚动到顶部按钮：距离顶部 > 100px 时显示
- 滚动到底部按钮：距离底部 > 100px 时显示
- 点击按钮平滑滚动到目标位置

详细说明请参考 [滚动控制文档](../../docs/chat-sessions-page/task-6-summary.md)

详细说明请参考 [快捷键文档](../../docs/chat-sessions-page/keyboard-shortcuts.md)

### 流式响应

#### 实时生成

- AI 回复以流式方式实时显示，无需等待完整响应
- 使用 Server-Sent Events (SSE) 格式接收数据
- 支持停止生成功能

#### 乐观更新

- 发送消息后立即显示用户消息
- 创建空的 AI 消息占位符
- 流式内容实时更新到占位符中

详细说明请参考 [流式响应文档](../../docs/chat-sessions-page/task-7-summary.md)

### 聊天设置

#### 可配置参数

- **模型选择**: 从所有可用的 AI 模型中选择
- **温度 (Temperature)**: 控制输出随机性（0-2）
- **Top P**: 控制输出多样性（0-1）
- **系统提示词**: 定义 AI 的角色和行为

#### 自动保存

- 修改参数后 500ms 自动保存
- 无需手动点击保存按钮
- 显示保存状态提示

详细说明请参考 [聊天设置文档](../../docs/chat-sessions-page/task-9-summary.md)

## 技术栈

- React 18.3
- TypeScript 5.8
- Ant Design 5.25
- React Query (TanStack Query)
- Zustand
- React Markdown
- TailwindCSS 4.1

## 主题色

使用 Teal 主题色系：

- 主色：`#14b8a6` (teal-500)
- 深色：`#0d9488` (teal-600)
- 浅色：`rgba(20, 184, 166, 0.1)`

应用位置：

- 用户消息背景
- 发送按钮
- 会话选中状态
- ChatHeader 渐变背景
- 保存指示器
- 生成中动画

详细说明请参考 [样式和主题文档](../../docs/chat-sessions-page/styling-theme.md)

## API 集成

已集成的 API：

- ✅ 会话列表获取
- ✅ 会话搜索
- ✅ 会话创建/删除/置顶/归档
- ✅ 消息列表获取
- ⏳ 消息发送（UI 已完成，待集成 API）

## 待实现功能

- 文件上传功能
- 图片粘贴支持
- 消息编辑功能

## 开发说明

### 添加新功能

1. 在 `components/` 目录下创建新组件
2. 使用 CSS Modules 进行样式隔离
3. 使用 TypeScript 定义完整的类型
4. 遵循 Ant Design 设计规范

### 状态管理

- 全局状态：使用 `src/stores/chatStore.ts`
- 服务器状态：使用 React Query
- 本地状态：使用 useState

### 样式规范

- 优先使用 TailwindCSS 工具类
- 组件特定样式使用 CSS Modules
- 遵循响应式设计原则

## 故障排除

### Markdown 渲染错误

如果遇到 `Cannot find module 'react-markdown'` 错误，请安装依赖：

```bash
yarn add react-markdown remark-gfm
```

### 类型错误

确保已安装所有类型定义：

```bash
yarn add -D @types/react @types/react-dom
```

## 性能优化

本项目采用了多种性能优化措施：

- **组件优化**: React.memo、useCallback、useMemo
- **代码分割**: React.lazy 懒加载 ChatSettings
- **缓存策略**: React Query 缓存（会话 30s，提供商 5min）
- **防抖节流**: 搜索 300ms、保存 500ms

详细说明请参考 [性能优化文档](../../docs/chat-sessions-page/performance-optimization.md)

## 错误处理

本项目实现了完善的错误处理机制：

- **错误类型**: 定义了 ChatErrorType 枚举
- **API 错误**: React Query onError 回调统一处理
- **流式错误**: 特殊处理中止和网络错误
- **乐观更新**: 失败时自动回滚
- **用户反馈**: Ant Design message 友好提示

详细说明请参考 [错误处理文档](../../docs/chat-sessions-page/error-handling.md)

## 可访问性和安全

本项目实现了完善的可访问性和安全防护：

**可访问性**:

- ARIA 属性（aria-label、role、aria-live）
- 键盘导航（Tab、Enter、快捷键）
- 焦点管理（自动聚焦、焦点指示）
- 语义化 HTML
- 良好的对比度和可读性

**安全**:

- XSS 防护（React 转义 + Markdown 安全模式）
- 外部链接安全（noopener noreferrer）
- 输入验证
- HTTPS 通信

详细说明请参考 [可访问性和安全文档](../../docs/chat-sessions-page/accessibility-security.md)

## 相关文档

- [快捷键文档](../../docs/chat-sessions-page/keyboard-shortcuts.md)
- [滚动控制文档](../../docs/chat-sessions-page/scroll-control.md)
- [流式响应文档](../../docs/chat-sessions-page/task-7-summary.md)
- [聊天设置文档](../../docs/chat-sessions-page/task-9-summary.md)
- [性能优化文档](../../docs/chat-sessions-page/performance-optimization.md)
- [错误处理文档](../../docs/chat-sessions-page/error-handling.md)
- [样式和主题文档](../../docs/chat-sessions-page/styling-theme.md)
- [可访问性和安全文档](../../docs/chat-sessions-page/accessibility-security.md)
- [完整实现总结](../../docs/chat-sessions-page/implementation-summary.md)

## 贡献指南

1. 遵循现有代码风格
2. 添加适当的注释
3. 确保类型安全
4. 测试所有功能

## 许可证

MIT
