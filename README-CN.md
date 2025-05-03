# 📝 待办事项应用

一个使用 React Native、Expo 和 Supabase 构建的美观且功能强大的待办事项应用。

## 🌟 功能特点

- ✅ 创建、更新和删除任务
- 📋 通过分类组织任务
- 🗓️ 查看今日和即将到来的任务
- 🔔 为任务设置提醒
- 🎨 使用颜色和图标自定义分类
- 📱 美观的跨平台 UI，适用于 iOS、Android 和 Web

## 🛠️ 使用的技术

- **前端**: React Native, Expo
- **后端**: Supabase (PostgreSQL)
- **状态管理**: React Query, React Context
- **UI**: 精心设计的自定义组件
- **导航**: Expo Router
- **数据获取**: 带实时订阅的 Supabase JS 客户端

## 📋 前提条件

- Node.js (v14 或更新版本)
- Yarn 或 npm
- Expo CLI
- Supabase 账户和项目

## 🚀 开始使用

### 1. 克隆仓库

```bash
git clone https://github.com/Holmesen/todo-app.git
cd todo-app
```

### 2. 设置 Supabase

1. 在[https://supabase.com](https://supabase.com)创建一个新的 Supabase 项目
2. 在 SQL 编辑器中导入`postgresql/schema.sql`中的数据库模式
3. 运行`scripts/seed-data.sql`中的种子数据脚本
4. 从 API 设置中复制您的 Supabase URL 和匿名密钥

### 3. 配置应用程序

在`lib/supabase.ts`中更新 Supabase 配置，添加您的项目 URL 和匿名密钥：

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 4. 安装依赖并运行

```bash
# 安装依赖
yarn install

# 运行应用
yarn start
```

## 📱 使用应用

启动应用后，您可以：

- 按分类查看和筛选任务
- 添加新任务
- 将任务标记为已完成
- 为重要任务设置提醒
- 创建和管理自定义分类

## 🧪 默认测试账户

种子脚本创建了一个演示用户，具有以下凭据：

- **电子邮件**: demo@example.com
- **密码**: demo123

## 📁 项目结构

```
todo-app/
├── app/ - Expo Router应用目录
├── assets/ - 图像和其他静态资源
├── components/ - 可重用UI组件
├── context/ - 用于状态管理的React Context
├── hooks/ - 自定义React钩子
├── lib/ - 实用函数和Supabase客户端
├── postgresql/ - 数据库模式
├── scripts/ - 设置和实用脚本
└── services/ - API服务函数
```

## 🧩 关键组件

- **TaskItem**: 显示带有优先级、到期时间和操作按钮的单个任务
- **TaskSection**: 按部分分组任务（今天、即将到来）
- **ActionButton**: 带有颜色和图标支持的分类筛选按钮
- **SearchBar**: 允许搜索任务

## 🔄 状态管理

应用使用 React 钩子进行状态管理，配合 Supabase 的实时订阅保持 UI 与数据库同步。

## 🔒 身份验证

身份验证通过 Supabase Auth 管理，支持电子邮件/密码和 OAuth 提供商。

## 📅 未来增强

- 任务共享和协作
- 高级筛选和排序选项
- 暗黑模式支持
- 提醒推送通知
- 离线支持和数据同步

## 📄 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件。

## 👏 鸣谢

- 图标来自[Font Awesome](https://fontawesome.com/)
- UI 灵感来自各种生产力应用
