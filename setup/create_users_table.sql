-- 创建用户表
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

-- 创建行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 策略: 只允许用户访问和修改自己的数据
CREATE POLICY "Users can only access their own data" ON users
FOR ALL
USING (auth.uid()::text = id::text OR auth.uid() IN (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
));

-- 插入示例用户数据 (密码: Password123)
INSERT INTO users (username, email, password_hash, full_name, time_zone, created_at, updated_at)
VALUES 
('johndoe', 'john@example.com', '$2a$10$W5/6LfRwikN8WT5C7nAy7OaKcxZ5kBGKHP9irEz.4XsV/EgOUNUOK', 'John Doe', 'UTC+8', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('janedoe', 'jane@example.com', '$2a$10$W5/6LfRwikN8WT5C7nAy7OaKcxZ5kBGKHP9irEz.4XsV/EgOUNUOK', 'Jane Doe', 'UTC+8', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 创建用户设置表
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

-- 添加示例用户设置
INSERT INTO user_settings (user_id, notifications_enabled, app_lock_enabled, data_sync_enabled)
VALUES 
(1, TRUE, FALSE, TRUE),
(2, TRUE, TRUE, TRUE); 