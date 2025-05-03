-- TodoList 应用数据库表结构 (PostgreSQL版本)
-- 创建日期: 2023-09-08

-- 用户表
CREATE TABLE todo_users (
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
COMMENT ON TABLE todo_users IS '存储用户账户信息';
COMMENT ON COLUMN todo_users.id IS '用户ID，主键';
COMMENT ON COLUMN todo_users.username IS '用户名';
COMMENT ON COLUMN todo_users.email IS '电子邮箱，唯一';
COMMENT ON COLUMN todo_users.password_hash IS '密码哈希值';
COMMENT ON COLUMN todo_users.full_name IS '用户全名';
COMMENT ON COLUMN todo_users.profile_image IS '头像图片URL';
COMMENT ON COLUMN todo_users.time_zone IS '用户时区设置';
COMMENT ON COLUMN todo_users.theme IS '界面主题 (light/dark)';
COMMENT ON COLUMN todo_users.created_at IS '创建时间';
COMMENT ON COLUMN todo_users.updated_at IS '更新时间';
COMMENT ON COLUMN todo_users.last_login_at IS '最后登录时间';
COMMENT ON COLUMN todo_users.is_premium IS '是否为高级会员';

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_todo_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为users表创建更新时间触发器
CREATE TRIGGER update_todo_users_modtime
BEFORE UPDATE ON todo_users
FOR EACH ROW
EXECUTE FUNCTION update_todo_modified_column();

-- 用户设置表
CREATE TABLE todo_user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    app_lock_enabled BOOLEAN DEFAULT FALSE,
    data_sync_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES todo_users(id) ON DELETE CASCADE
);
COMMENT ON TABLE todo_user_settings IS '存储用户偏好设置';
COMMENT ON COLUMN todo_user_settings.id IS '设置ID，主键';
COMMENT ON COLUMN todo_user_settings.user_id IS '关联的用户ID';
COMMENT ON COLUMN todo_user_settings.notifications_enabled IS '是否启用通知';
COMMENT ON COLUMN todo_user_settings.app_lock_enabled IS '是否启用应用锁';
COMMENT ON COLUMN todo_user_settings.data_sync_enabled IS '是否启用数据同步';
COMMENT ON COLUMN todo_user_settings.created_at IS '创建时间';
COMMENT ON COLUMN todo_user_settings.updated_at IS '更新时间';

-- 为user_settings表创建更新时间触发器
CREATE TRIGGER update_todo_user_settings_modtime
BEFORE UPDATE ON todo_user_settings
FOR EACH ROW
EXECUTE FUNCTION update_todo_modified_column();

-- 类别表
CREATE TABLE todo_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    icon VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES todo_users(id) ON DELETE CASCADE,
    UNIQUE (user_id, name)
);
COMMENT ON TABLE todo_categories IS '存储任务类别信息';
COMMENT ON COLUMN todo_categories.id IS '类别ID，主键';
COMMENT ON COLUMN todo_categories.user_id IS '关联的用户ID';
COMMENT ON COLUMN todo_categories.name IS '类别名称';
COMMENT ON COLUMN todo_categories.color IS '类别颜色代码';
COMMENT ON COLUMN todo_categories.icon IS '类别图标名称';
COMMENT ON COLUMN todo_categories.is_featured IS '是否为精选类别';
COMMENT ON COLUMN todo_categories.created_at IS '创建时间';
COMMENT ON COLUMN todo_categories.updated_at IS '更新时间';

-- 为categories表创建更新时间触发器
CREATE TRIGGER update_todo_categories_modtime
BEFORE UPDATE ON todo_categories
FOR EACH ROW
EXECUTE FUNCTION update_todo_modified_column();

-- 创建任务优先级和状态的枚举类型
CREATE TYPE todo_task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE todo_task_status AS ENUM ('pending', 'completed', 'overdue');

-- 任务表
CREATE TABLE todo_tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    due_time TIME,
    priority todo_task_priority DEFAULT 'medium',
    status todo_task_status DEFAULT 'pending',
    reminder_time TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES todo_users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES todo_categories(id) ON DELETE SET NULL
);
COMMENT ON TABLE todo_tasks IS '存储任务信息';
COMMENT ON COLUMN todo_tasks.id IS '任务ID，主键';
COMMENT ON COLUMN todo_tasks.user_id IS '关联的用户ID';
COMMENT ON COLUMN todo_tasks.category_id IS '关联的类别ID';
COMMENT ON COLUMN todo_tasks.title IS '任务标题';
COMMENT ON COLUMN todo_tasks.description IS '任务描述';
COMMENT ON COLUMN todo_tasks.due_date IS '截止日期';
COMMENT ON COLUMN todo_tasks.due_time IS '截止时间';
COMMENT ON COLUMN todo_tasks.priority IS '优先级';
COMMENT ON COLUMN todo_tasks.status IS '任务状态';
COMMENT ON COLUMN todo_tasks.reminder_time IS '提醒时间';
COMMENT ON COLUMN todo_tasks.completed_at IS '完成时间';
COMMENT ON COLUMN todo_tasks.created_at IS '创建时间';
COMMENT ON COLUMN todo_tasks.updated_at IS '更新时间';

-- 为tasks表创建更新时间触发器
CREATE TRIGGER update_todo_tasks_modtime
BEFORE UPDATE ON todo_tasks
FOR EACH ROW
EXECUTE FUNCTION update_todo_modified_column();

-- 子任务表
CREATE TABLE todo_subtasks (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES todo_tasks(id) ON DELETE CASCADE
);
COMMENT ON TABLE todo_subtasks IS '存储子任务信息';
COMMENT ON COLUMN todo_subtasks.id IS '子任务ID，主键';
COMMENT ON COLUMN todo_subtasks.task_id IS '关联的主任务ID';
COMMENT ON COLUMN todo_subtasks.title IS '子任务标题';
COMMENT ON COLUMN todo_subtasks.is_completed IS '是否已完成';
COMMENT ON COLUMN todo_subtasks.created_at IS '创建时间';
COMMENT ON COLUMN todo_subtasks.updated_at IS '更新时间';
COMMENT ON COLUMN todo_subtasks.completed_at IS '完成时间';

-- 为subtasks表创建更新时间触发器
CREATE TRIGGER update_todo_subtasks_modtime
BEFORE UPDATE ON todo_subtasks
FOR EACH ROW
EXECUTE FUNCTION update_todo_modified_column();

-- 任务附件表
CREATE TABLE todo_attachments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    file_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES todo_tasks(id) ON DELETE CASCADE
);
COMMENT ON TABLE todo_attachments IS '存储任务附件信息';
COMMENT ON COLUMN todo_attachments.id IS '附件ID，主键';
COMMENT ON COLUMN todo_attachments.task_id IS '关联的任务ID';
COMMENT ON COLUMN todo_attachments.file_name IS '文件名';
COMMENT ON COLUMN todo_attachments.file_type IS '文件类型';
COMMENT ON COLUMN todo_attachments.file_size IS '文件大小(字节)';
COMMENT ON COLUMN todo_attachments.file_url IS '文件URL';
COMMENT ON COLUMN todo_attachments.created_at IS '创建时间';

-- 创建提醒类型的枚举
CREATE TYPE todo_reminder_type AS ENUM ('none', 'at_time', '5_min_before', '15_min_before', '30_min_before', '1_hour_before', '1_day_before');

-- 提醒设置表
CREATE TABLE todo_reminders (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    reminder_type todo_reminder_type NOT NULL,
    reminder_time TIMESTAMP NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES todo_tasks(id) ON DELETE CASCADE
);
COMMENT ON TABLE todo_reminders IS '存储任务提醒设置';
COMMENT ON COLUMN todo_reminders.id IS '提醒ID，主键';
COMMENT ON COLUMN todo_reminders.task_id IS '关联的任务ID';
COMMENT ON COLUMN todo_reminders.reminder_type IS '提醒类型';
COMMENT ON COLUMN todo_reminders.reminder_time IS '提醒时间';
COMMENT ON COLUMN todo_reminders.is_sent IS '是否已发送提醒';
COMMENT ON COLUMN todo_reminders.created_at IS '创建时间';
COMMENT ON COLUMN todo_reminders.updated_at IS '更新时间';

-- 为reminders表创建更新时间触发器
CREATE TRIGGER update_todo_reminders_modtime
BEFORE UPDATE ON todo_reminders
FOR EACH ROW
EXECUTE FUNCTION update_todo_modified_column();

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
    FOREIGN KEY (user_id) REFERENCES todo_users(id) ON DELETE CASCADE,
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
CREATE TRIGGER update_todo_task_statistics_modtime
BEFORE UPDATE ON task_statistics
FOR EACH ROW
EXECUTE FUNCTION update_todo_modified_column();

-- 创建活动日志操作类型的枚举
CREATE TYPE todo_action_type AS ENUM ('create', 'update', 'delete', 'complete', 'reopen');

-- 活动日志表
CREATE TABLE todo_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    task_id INTEGER,
    action_type todo_action_type NOT NULL,
    action_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES todo_users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES todo_tasks(id) ON DELETE SET NULL
);
COMMENT ON TABLE todo_activity_logs IS '存储用户活动日志';
COMMENT ON COLUMN todo_activity_logs.id IS '日志ID，主键';
COMMENT ON COLUMN todo_activity_logs.user_id IS '关联的用户ID';
COMMENT ON COLUMN todo_activity_logs.task_id IS '关联的任务ID';
COMMENT ON COLUMN todo_activity_logs.action_type IS '操作类型';
COMMENT ON COLUMN todo_activity_logs.action_details IS '操作详情';
COMMENT ON COLUMN todo_activity_logs.created_at IS '创建时间';

-- 创建默认类别
INSERT INTO todo_categories (user_id, name, color, icon, is_featured) VALUES
(1, '工作', '#5E5CE6', 'fa-briefcase', TRUE),
(1, '个人', '#30C48D', 'fa-user', TRUE),
(1, '购物', '#FF9500', 'fa-shopping-cart', TRUE),
(1, '健康', '#FF2D55', 'fa-heartbeat', TRUE),
(1, '财务', '#007AFF', 'fa-money', FALSE),
(1, '教育', '#AF52DE', 'fa-book', FALSE);

-- 创建索引以提高查询性能

-- 任务索引
CREATE INDEX idx_todo_tasks_user_id ON todo_tasks(user_id);
CREATE INDEX idx_todo_tasks_category_id ON todo_tasks(category_id);
CREATE INDEX idx_todo_tasks_status ON todo_tasks(status);
CREATE INDEX idx_todo_tasks_due_date ON todo_tasks(due_date);
CREATE INDEX idx_todo_tasks_priority ON todo_tasks(priority);

-- 统计索引
CREATE INDEX idx_todo_task_statistics_user_date ON task_statistics(user_id, date);

-- 类别索引
CREATE INDEX idx_todo_categories_user_featured ON todo_categories(user_id, is_featured);

-- 活动日志索引
CREATE INDEX idx_todo_activity_logs_user_id ON todo_activity_logs(user_id);
CREATE INDEX idx_todo_activity_logs_created_at ON todo_activity_logs(created_at);

-- 创建反馈类型的枚举
CREATE TYPE todo_feedback_type AS ENUM ('bug_report', 'feature_request', 'general_feedback', 'usability_issue', 'performance_issue');

-- 创建反馈状态的枚举
CREATE TYPE todo_feedback_status AS ENUM ('submitted', 'under_review', 'resolved', 'rejected');

-- 用户反馈表
CREATE TABLE todo_user_feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    feedback_type todo_feedback_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status todo_feedback_status DEFAULT 'submitted',
    app_version VARCHAR(20),
    device_info VARCHAR(100),
    screenshot_url VARCHAR(255),
    admin_response TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES todo_users(id) ON DELETE CASCADE
);
COMMENT ON TABLE todo_user_feedback IS '存储用户反馈信息';
COMMENT ON COLUMN todo_user_feedback.id IS '反馈ID，主键';
COMMENT ON COLUMN todo_user_feedback.user_id IS '关联的用户ID';
COMMENT ON COLUMN todo_user_feedback.feedback_type IS '反馈类型';
COMMENT ON COLUMN todo_user_feedback.title IS '反馈标题';
COMMENT ON COLUMN todo_user_feedback.description IS '反馈详情描述';
COMMENT ON COLUMN todo_user_feedback.status IS '反馈状态';
COMMENT ON COLUMN todo_user_feedback.app_version IS '应用版本号';
COMMENT ON COLUMN todo_user_feedback.device_info IS '设备信息';
COMMENT ON COLUMN todo_user_feedback.screenshot_url IS '屏幕截图URL';
COMMENT ON COLUMN todo_user_feedback.admin_response IS '管理员回复';
COMMENT ON COLUMN todo_user_feedback.resolved_at IS '解决时间';
COMMENT ON COLUMN todo_user_feedback.created_at IS '创建时间';
COMMENT ON COLUMN todo_user_feedback.updated_at IS '更新时间';

-- 为user_feedback表创建更新时间触发器
CREATE TRIGGER update_todo_user_feedback_modtime
BEFORE UPDATE ON todo_user_feedback
FOR EACH ROW
EXECUTE FUNCTION update_todo_modified_column();

-- 创建用户反馈索引
CREATE INDEX idx_todo_user_feedback_user_id ON todo_user_feedback(user_id);
CREATE INDEX idx_todo_user_feedback_status ON todo_user_feedback(status);
CREATE INDEX idx_todo_user_feedback_type ON todo_user_feedback(feedback_type);
CREATE INDEX idx_todo_user_feedback_created_at ON todo_user_feedback(created_at); 