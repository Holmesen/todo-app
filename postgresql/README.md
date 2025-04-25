# TodoList 应用数据库设计说明 (PostgreSQL 版本)

本文档描述了基于原型图设计的 TodoList 应用数据库结构，使用 PostgreSQL 数据库实现。

## PostgreSQL 特性使用

相比于 MySQL 版本，本 PostgreSQL 实现利用了以下 PostgreSQL 特有功能:

1. **枚举类型**: 使用`CREATE TYPE ... AS ENUM`创建了自定义枚举类型，用于任务优先级、状态和操作类型等
2. **JSONB 数据类型**: 使用`JSONB`类型存储活动日志的详细信息，提供更高效的 JSON 操作
3. **独立的列注释**: 使用`COMMENT ON COLUMN`为每个列添加单独的中文说明
4. **触发器函数**: 创建了`update_modified_column()`函数并为各表添加触发器，自动更新`updated_at`字段
5. **INTERVAL 语法**: 查询中使用了 PostgreSQL 的`INTERVAL`语法进行日期计算

## 数据库表概览

数据库包含以下表：

1. **users** - 用户账户信息
2. **user_settings** - 用户设置和偏好
3. **categories** - 任务分类
4. **tasks** - 主要任务数据
5. **subtasks** - 子任务数据
6. **attachments** - 任务附件
7. **reminders** - 任务提醒设置
8. **task_statistics** - 任务完成统计
9. **activity_logs** - 用户活动日志

## 表结构说明

### 用户相关表

- **users**: 存储用户基本信息，包括身份验证数据、个人资料和账户状态
- **user_settings**: 存储用户应用程序设置，如通知、主题等偏好设置

### 任务相关表

- **categories**: 存储任务分类，包括名称、颜色和图标等属性
- **tasks**: 存储主要任务信息，包括标题、描述、截止日期、优先级和状态等
- **subtasks**: 存储子任务，每个子任务都关联到一个主任务
- **attachments**: 存储任务附件，如文档、图片等
- **reminders**: 存储任务提醒设置

### 统计和日志表

- **task_statistics**: 存储每日任务统计数据，用于生成报表和图表
- **activity_logs**: 记录用户活动，用于审计和活动历史

## 主要关系

- 用户拥有多个类别
- 用户拥有多个任务
- 类别包含多个任务
- 任务包含多个子任务
- 任务可以有多个附件
- 任务可以有提醒设置

## 自定义枚举类型

PostgreSQL 版本使用以下自定义枚举类型：

- **task_priority**: 任务优先级 (`low`, `medium`, `high`)
- **task_status**: 任务状态 (`pending`, `completed`, `overdue`)
- **reminder_type**: 提醒类型 (`none`, `at_time`, `5_min_before`, `15_min_before`, `30_min_before`, `1_hour_before`, `1_day_before`)
- **action_type**: 操作类型 (`create`, `update`, `delete`, `complete`, `reopen`)

## 数据库索引

为了优化查询性能，对关键字段创建了索引：

- 任务表的用户 ID、类别 ID、状态、截止日期和优先级字段
- 类别表的用户 ID 和精选标志字段
- 统计表的用户 ID 和日期字段
- 活动日志表的用户 ID 和创建时间字段

## 自动更新时间戳

使用 PostgreSQL 触发器实现自动更新时间戳功能：

```sql
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

此触发器函数应用于所有需要跟踪更新时间的表。

## 查询示例

查看`query_examples.sql`文件获取常见查询操作的 PostgreSQL 实现示例，包括：

- 基于日期和类别的任务查询
- 任务统计和分析
- 子任务和附件管理
- 用户活动记录和统计
