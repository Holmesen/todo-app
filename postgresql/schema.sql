-- TodoList 应用数据库表结构 (PostgreSQL版本)
-- 创建日期: 2023-09-08

-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    profile_image VARCHAR(255),
    time_zone VARCHAR(50) DEFAULT 'UTC+0',
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_premium BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE users IS '存储用户账户信息';
COMMENT ON COLUMN users.id IS '用户ID，主键';
COMMENT ON COLUMN users.username IS '用户名';
COMMENT ON COLUMN users.email IS '电子邮箱，唯一';
COMMENT ON COLUMN users.password_hash IS '密码哈希值';
COMMENT ON COLUMN users.full_name IS '用户全名';
COMMENT ON COLUMN users.profile_image IS '头像图片URL';
COMMENT ON COLUMN users.time_zone IS '用户时区设置';
COMMENT ON COLUMN users.theme IS '界面主题 (light/dark)';
COMMENT ON COLUMN users.created_at IS '创建时间';
COMMENT ON COLUMN users.updated_at IS '更新时间';
COMMENT ON COLUMN users.last_login_at IS '最后登录时间';
COMMENT ON COLUMN users.is_premium IS '是否为高级会员';

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为users表创建更新时间触发器
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 用户设置表
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    app_lock_enabled BOOLEAN DEFAULT FALSE,
    data_sync_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
COMMENT ON TABLE user_settings IS '存储用户偏好设置';
COMMENT ON COLUMN user_settings.id IS '设置ID，主键';
COMMENT ON COLUMN user_settings.user_id IS '关联的用户ID';
COMMENT ON COLUMN user_settings.notifications_enabled IS '是否启用通知';
COMMENT ON COLUMN user_settings.app_lock_enabled IS '是否启用应用锁';
COMMENT ON COLUMN user_settings.data_sync_enabled IS '是否启用数据同步';
COMMENT ON COLUMN user_settings.created_at IS '创建时间';
COMMENT ON COLUMN user_settings.updated_at IS '更新时间';

-- 为user_settings表创建更新时间触发器
CREATE TRIGGER update_user_settings_modtime
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 类别表
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    icon VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, name)
);
COMMENT ON TABLE categories IS '存储任务类别信息';
COMMENT ON COLUMN categories.id IS '类别ID，主键';
COMMENT ON COLUMN categories.user_id IS '关联的用户ID';
COMMENT ON COLUMN categories.name IS '类别名称';
COMMENT ON COLUMN categories.color IS '类别颜色代码';
COMMENT ON COLUMN categories.icon IS '类别图标名称';
COMMENT ON COLUMN categories.is_featured IS '是否为精选类别';
COMMENT ON COLUMN categories.created_at IS '创建时间';
COMMENT ON COLUMN categories.updated_at IS '更新时间';

-- 为categories表创建更新时间触发器
CREATE TRIGGER update_categories_modtime
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 创建任务优先级和状态的枚举类型
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_status AS ENUM ('pending', 'completed', 'overdue');

-- 任务表
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    due_time TIME,
    priority task_priority DEFAULT 'medium',
    status task_status DEFAULT 'pending',
    reminder_time TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
COMMENT ON TABLE tasks IS '存储任务信息';
COMMENT ON COLUMN tasks.id IS '任务ID，主键';
COMMENT ON COLUMN tasks.user_id IS '关联的用户ID';
COMMENT ON COLUMN tasks.category_id IS '关联的类别ID';
COMMENT ON COLUMN tasks.title IS '任务标题';
COMMENT ON COLUMN tasks.description IS '任务描述';
COMMENT ON COLUMN tasks.due_date IS '截止日期';
COMMENT ON COLUMN tasks.due_time IS '截止时间';
COMMENT ON COLUMN tasks.priority IS '优先级';
COMMENT ON COLUMN tasks.status IS '任务状态';
COMMENT ON COLUMN tasks.reminder_time IS '提醒时间';
COMMENT ON COLUMN tasks.completed_at IS '完成时间';
COMMENT ON COLUMN tasks.created_at IS '创建时间';
COMMENT ON COLUMN tasks.updated_at IS '更新时间';

-- 为tasks表创建更新时间触发器
CREATE TRIGGER update_tasks_modtime
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 子任务表
CREATE TABLE subtasks (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
COMMENT ON TABLE subtasks IS '存储子任务信息';
COMMENT ON COLUMN subtasks.id IS '子任务ID，主键';
COMMENT ON COLUMN subtasks.task_id IS '关联的主任务ID';
COMMENT ON COLUMN subtasks.title IS '子任务标题';
COMMENT ON COLUMN subtasks.is_completed IS '是否已完成';
COMMENT ON COLUMN subtasks.created_at IS '创建时间';
COMMENT ON COLUMN subtasks.updated_at IS '更新时间';
COMMENT ON COLUMN subtasks.completed_at IS '完成时间';

-- 为subtasks表创建更新时间触发器
CREATE TRIGGER update_subtasks_modtime
BEFORE UPDATE ON subtasks
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 任务附件表
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    file_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
COMMENT ON TABLE attachments IS '存储任务附件信息';
COMMENT ON COLUMN attachments.id IS '附件ID，主键';
COMMENT ON COLUMN attachments.task_id IS '关联的任务ID';
COMMENT ON COLUMN attachments.file_name IS '文件名';
COMMENT ON COLUMN attachments.file_type IS '文件类型';
COMMENT ON COLUMN attachments.file_size IS '文件大小(字节)';
COMMENT ON COLUMN attachments.file_url IS '文件URL';
COMMENT ON COLUMN attachments.created_at IS '创建时间';

-- 创建提醒类型的枚举
CREATE TYPE reminder_type AS ENUM ('none', 'at_time', '5_min_before', '15_min_before', '30_min_before', '1_hour_before', '1_day_before');

-- 提醒设置表
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    reminder_type reminder_type NOT NULL,
    reminder_time TIMESTAMP NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
COMMENT ON TABLE reminders IS '存储任务提醒设置';
COMMENT ON COLUMN reminders.id IS '提醒ID，主键';
COMMENT ON COLUMN reminders.task_id IS '关联的任务ID';
COMMENT ON COLUMN reminders.reminder_type IS '提醒类型';
COMMENT ON COLUMN reminders.reminder_time IS '提醒时间';
COMMENT ON COLUMN reminders.is_sent IS '是否已发送提醒';
COMMENT ON COLUMN reminders.created_at IS '创建时间';
COMMENT ON COLUMN reminders.updated_at IS '更新时间';

-- 为reminders表创建更新时间触发器
CREATE TRIGGER update_reminders_modtime
BEFORE UPDATE ON reminders
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 数据统计表
CREATE TABLE task_statistics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    created_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    overdue_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    avg_completion_time DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, date)
);
COMMENT ON TABLE task_statistics IS '存储任务统计信息';
COMMENT ON COLUMN task_statistics.id IS '统计ID，主键';
COMMENT ON COLUMN task_statistics.user_id IS '关联的用户ID';
COMMENT ON COLUMN task_statistics.date IS '统计日期';
COMMENT ON COLUMN task_statistics.created_count IS '创建任务数';
COMMENT ON COLUMN task_statistics.completed_count IS '完成任务数';
COMMENT ON COLUMN task_statistics.overdue_count IS '逾期任务数';
COMMENT ON COLUMN task_statistics.completion_rate IS '完成率百分比';
COMMENT ON COLUMN task_statistics.avg_completion_time IS '平均完成时间(小时)';
COMMENT ON COLUMN task_statistics.created_at IS '创建时间';
COMMENT ON COLUMN task_statistics.updated_at IS '更新时间';

-- 为task_statistics表创建更新时间触发器
CREATE TRIGGER update_task_statistics_modtime
BEFORE UPDATE ON task_statistics
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 创建活动日志操作类型的枚举
CREATE TYPE action_type AS ENUM ('create', 'update', 'delete', 'complete', 'reopen');

-- 活动日志表
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    task_id INTEGER,
    action_type action_type NOT NULL,
    action_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);
COMMENT ON TABLE activity_logs IS '存储用户活动日志';
COMMENT ON COLUMN activity_logs.id IS '日志ID，主键';
COMMENT ON COLUMN activity_logs.user_id IS '关联的用户ID';
COMMENT ON COLUMN activity_logs.task_id IS '关联的任务ID';
COMMENT ON COLUMN activity_logs.action_type IS '操作类型';
COMMENT ON COLUMN activity_logs.action_details IS '操作详情';
COMMENT ON COLUMN activity_logs.created_at IS '创建时间';

-- 创建默认类别
INSERT INTO categories (user_id, name, color, icon, is_featured) VALUES
(1, '工作', '#5E5CE6', 'fa-briefcase', TRUE),
(1, '个人', '#30C48D', 'fa-user', TRUE),
(1, '购物', '#FF9500', 'fa-shopping-cart', TRUE),
(1, '健康', '#FF2D55', 'fa-heartbeat', TRUE),
(1, '财务', '#007AFF', 'fa-dollar-sign', FALSE),
(1, '教育', '#AF52DE', 'fa-book', FALSE);

-- 创建索引以提高查询性能

-- 任务索引
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- 统计索引
CREATE INDEX idx_task_statistics_user_date ON task_statistics(user_id, date);

-- 类别索引
CREATE INDEX idx_categories_user_featured ON categories(user_id, is_featured);

-- 活动日志索引
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at); 