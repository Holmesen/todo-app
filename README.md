# TodoList App

一个基于 React Native 和 Expo 构建的待办事项应用，使用 Supabase 提供身份验证和数据存储功能。

## 功能特性

- 多种用户认证方式:
  - Supabase Auth 认证 (默认)
  - 原生数据库用户认证 (基于自定义用户表)
- 社交账号登录 (Apple、Google)
- 待办事项管理
- ...

## 开始使用

### 前提条件

- Node.js (推荐最新 LTS 版本)
- npm 或 yarn
- Expo CLI (`npm install -g expo-cli`)
- [Supabase 账号](https://supabase.com/)

### 安装

1. 克隆仓库：

```bash
git clone <仓库URL>
cd todo-app
```

2. 安装依赖：

```bash
npm install
# 或
yarn
```

### Supabase 配置

1. 在 [Supabase](https://supabase.com/) 创建一个新项目
2. 在项目设置中找到 API URL 和 anon public API key
3. 编辑 `app/lib/supabase.ts` 文件，替换 URL 和 API key：

```typescript
const supabaseUrl = '你的 Supabase URL';
const supabaseAnonKey = '你的 Supabase 匿名密钥';
```

### 数据库设置

在 Supabase 中，需要创建用户表和任务表：

1. **用户表**: 运行 `setup/create_users_table.sql` 中的 SQL 命令创建自定义用户表
2. **任务表**: 运行以下 SQL 创建任务表:

```sql
-- 创建 todos 表
CREATE TABLE todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 行级安全策略
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 策略: 只允许查看和修改自己的待办事项
CREATE POLICY "Users can only access their own todos" ON todos
  FOR ALL USING (auth.uid() = user_id);

-- 触发器: 自动更新 updated_at 字段
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);
```

### 启动项目

```bash
npm start
# 或
yarn start
```

通过 Expo Go 应用扫描二维码在移动设备上运行，或使用 iOS/Android 模拟器。

## 多种认证方式

应用程序支持两种不同的认证方式：

### 1. Supabase Auth 认证 (默认)

- 使用 Supabase 提供的内置认证系统
- 用户数据存储在 `auth.users` 表中
- 支持电子邮件验证和密码重置等高级功能
- 支持社交媒体登录 (如 Google, Apple 等)

### 2. 原生数据库用户认证

- 使用自定义 `users` 表存储用户数据
- 密码使用 bcrypt 加密存储
- 支持更多自定义用户字段和设置
- 更灵活的用户数据管理

用户可以在登录界面切换这两种认证方式，应用将根据用户选择的认证方式相应地处理登录和注册请求。

## 项目架构

- `/app` - 应用程序主目录
  - `/(app)` - 经过身份验证后的主应用屏幕
  - `/screens` - 登录和注册屏幕
  - `/lib` - 工具和配置
  - `/store` - 状态管理 (Zustand)
  - `/context` - React 上下文提供者

## 许可证

[MIT](LICENSE)
