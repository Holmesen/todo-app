# 📝 TaskMaster 待办事项应用

一个使用 React Native、Expo 和 Supabase 构建的美观且功能强大的待办事项应用。

## 🌟 功能特点

- ✅ 创建、更新和删除任务
- 📋 通过分类组织任务
- 🗓️ 查看今日和即将到来的任务
- 🔔 为任务设置提醒
- 🎨 使用颜色和图标自定义分类
- 📱 美观的跨平台 UI，适用于 iOS、Android 和 Web
- 💎 高级会员计划，提供更多强大功能
- 🔄 在多设备间同步数据
- 📊 任务统计和效率分析

## 🛠️ 使用的技术

- **前端**: React Native, Expo
- **后端**: Supabase (PostgreSQL)
- **状态管理**: React Query, Zustand
- **UI**: 精心设计的自定义组件
- **导航**: Expo Router
- **数据获取**: 带实时订阅的 Supabase JS 客户端
- **支付集成**: 模拟支付流程（计划集成实际支付服务）

## 📱 应用结构

应用程序由以下主要部分组成：

- **任务管理**: 创建和管理任务的核心功能
- **个人资料**: 用户个人信息和设置管理
- **高级计划**: 订阅选项和高级功能展示
- **帮助与支持**: 常见问题和用户支持选项

## 📋 前提条件

- Node.js (v14 或更新版本)
- Yarn 或 npm
- Expo CLI
- Supabase 账户和项目

## 🚀 开始使用

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/todo-app.git
cd todo-app
```

### 2. 设置 Supabase

1. 在 [https://supabase.com](https://supabase.com) 创建一个新的 Supabase 项目
2. 在 SQL 编辑器中导入 `postgresql/schema.sql` 中的数据库模式
3. 运行 `scripts/seed-data.sql` 中的种子数据脚本
4. 从 API 设置中复制您的 Supabase URL 和匿名密钥

### 3. 配置应用程序

在 `lib/supabase.ts` 中更新 Supabase 配置，添加您的项目 URL 和匿名密钥：

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

## 📱 应用配置

应用使用集中式配置系统来管理所有基本信息：

### 配置文件

应用信息存储在 `app/config/app-info.ts` 文件中，包括：

- **基本信息**: 应用名称、版本号、构建号和发布日期
- **公司信息**: 公司名称和版权年份
- **联系信息**: 支持电子邮件、网站和社交媒体链接
- **法律链接**: 隐私政策和使用条款的 URL
- **订阅计划**: 不同订阅级别的价格和详情

要更新应用信息，只需修改此配置文件，更改将自动应用到整个应用。

```typescript
// app/config/app-info.ts 示例
export const APP_INFO = {
  NAME: 'TaskMaster',
  VERSION: '2.1.0',
  BUILD_NUMBER: '210',
  // ... 其他配置
};
```

## 📁 项目结构

```
todo-app/
├── app/ - Expo Router 应用目录
│   ├── (tabs)/ - 主要标签页面
│   ├── (profile)/ - 个人资料相关页面
│   └── config/ - 应用配置文件
├── assets/ - 图像和其他静态资源
├── components/ - 可重用UI组件
├── hooks/ - 自定义React钩子
├── lib/ - 实用函数和Supabase客户端
├── postgresql/ - 数据库模式
├── store/ - 状态管理 (Zustand)
└── services/ - API服务函数
```

## 🔒 数据库设计

TaskMaster 应用使用 PostgreSQL 数据库（通过 Supabase 提供），具有以下主要特性：

- **枚举类型**: 用于任务优先级、状态和操作类型
- **JSONB 数据类型**: 存储活动日志的详细信息
- **触发器函数**: 自动更新记录的修改时间戳
- **关系模型**: 用户、任务、分类之间的清晰关系

主要数据表包括：

- **users**: 用户账户信息
- **user_settings**: 用户偏好设置
- **categories**: 任务分类
- **tasks**: 主要任务数据
- **subtasks**: 子任务数据
- **attachments**: 任务附件
- **reminders**: 任务提醒设置

## 🧪 默认测试账户

种子脚本创建了一个演示用户，具有以下凭据：

- **电子邮件**: demo@example.com
- **密码**: demo123

## 📄 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件。

## 👏 贡献

欢迎提交问题和拉取请求。对于重大更改，请先开启一个问题讨论您想要改变的内容。

## 📅 开发路线图

- [ ] 实现真实支付集成
- [ ] 添加更多的任务统计和分析
- [ ] 实现团队协作功能
- [ ] 添加自定义主题和更多界面定制选项
- [ ] 离线支持和数据同步改进
