-- TodoMaster 应用常用SQL查询示例 (PostgreSQL版本)
-- 本文件包含基于数据库结构的常见查询操作

-- 1. 获取用户的所有任务（按到期日期排序）
SELECT t.*, c.name as category_name, c.color as category_color 
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = 1 -- 替换为实际用户ID
ORDER BY t.due_date, t.due_time;

-- 2. 获取今天的任务
SELECT t.*, c.name as category_name, c.color as category_color 
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = 1 -- 替换为实际用户ID
AND t.due_date = CURRENT_DATE
ORDER BY t.due_time;

-- 3. 获取未来任务（明天及以后）
SELECT t.*, c.name as category_name, c.color as category_color 
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = 1 -- 替换为实际用户ID
AND t.due_date > CURRENT_DATE
ORDER BY t.due_date, t.due_time;

-- 4. 获取任务的详细信息（包括子任务和附件）
SELECT 
    t.*,
    c.name as category_name, 
    c.color as category_color,
    (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id) as subtask_count,
    (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id AND is_completed = TRUE) as completed_subtask_count,
    (SELECT COUNT(*) FROM attachments WHERE task_id = t.id) as attachment_count
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.id = 1; -- 替换为实际任务ID

-- 5. 获取任务的子任务
SELECT * FROM subtasks 
WHERE task_id = 1 -- 替换为实际任务ID
ORDER BY created_at;

-- 6. 获取任务的附件
SELECT * FROM attachments 
WHERE task_id = 1 -- 替换为实际任务ID
ORDER BY created_at DESC;

-- 7. 获取用户的所有类别及任务计数
SELECT 
    c.*,
    COUNT(t.id) as task_count,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
    ROUND(
        CASE WHEN COUNT(t.id) > 0 
        THEN (SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END)::DECIMAL / COUNT(t.id) * 100) 
        ELSE 0 END, 
    2) as completion_rate
FROM categories c
LEFT JOIN tasks t ON c.id = t.category_id
WHERE c.user_id = 1 -- 替换为实际用户ID
GROUP BY c.id
ORDER BY c.is_featured DESC, c.name;

-- 8. 获取用户的统计数据（过去7天）
SELECT * FROM task_statistics
WHERE user_id = 1 -- 替换为实际用户ID
AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date;

-- 9. 更新任务状态为已完成
UPDATE tasks
SET 
    status = 'completed', 
    completed_at = NOW()
WHERE id = 1; -- 替换为实际任务ID

-- 10. 更新子任务状态
UPDATE subtasks
SET 
    is_completed = TRUE, 
    completed_at = NOW()
WHERE id = 1; -- 替换为实际子任务ID

-- 11. 获取用户的逾期任务
SELECT t.*, c.name as category_name, c.color as category_color 
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = 1 -- 替换为实际用户ID
AND t.status = 'pending'
AND t.due_date < CURRENT_DATE
ORDER BY t.due_date;

-- 12. 按类别分组统计任务数量
SELECT 
    c.name as category_name,
    c.color as category_color,
    COUNT(t.id) as total_tasks,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
    SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
    SUM(CASE WHEN t.status = 'overdue' THEN 1 ELSE 0 END) as overdue_tasks
FROM categories c
LEFT JOIN tasks t ON c.id = t.category_id
WHERE c.user_id = 1 -- 替换为实际用户ID
GROUP BY c.id, c.name, c.color
ORDER BY total_tasks DESC;

-- 13. 获取用户的每日任务完成率（过去30天）
SELECT 
    date,
    completed_count,
    created_count,
    completion_rate
FROM task_statistics
WHERE user_id = 1 -- 替换为实际用户ID
AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date;

-- 14. 搜索用户的任务
SELECT t.*, c.name as category_name, c.color as category_color 
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = 1 -- 替换为实际用户ID
AND (
    t.title ILIKE '%搜索关键词%' OR 
    t.description ILIKE '%搜索关键词%'
)
ORDER BY t.created_at DESC;

-- 15. 获取用户最近活动日志
SELECT al.*, t.title as task_title
FROM activity_logs al
LEFT JOIN tasks t ON al.task_id = t.id
WHERE al.user_id = 1 -- 替换为实际用户ID
ORDER BY al.created_at DESC
LIMIT 20;

-- 16. 获取用户最常用的类别（按任务数量）
SELECT 
    c.name,
    c.color,
    c.icon,
    COUNT(t.id) as task_count
FROM categories c
LEFT JOIN tasks t ON c.id = t.category_id
WHERE c.user_id = 1 -- 替换为实际用户ID
GROUP BY c.id, c.name, c.color, c.icon
ORDER BY task_count DESC
LIMIT 5;

-- 17. 获取各优先级的任务数量
SELECT 
    priority,
    COUNT(*) as task_count,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
FROM tasks
WHERE user_id = 1 -- 替换为实际用户ID
GROUP BY priority
ORDER BY 
    CASE 
        WHEN priority = 'high' THEN 1 
        WHEN priority = 'medium' THEN 2 
        WHEN priority = 'low' THEN 3 
    END;

-- 18. 查找即将到期的任务（未来24小时内）
SELECT t.*, c.name as category_name, c.color as category_color 
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = 1 -- 替换为实际用户ID
AND t.status = 'pending'
AND t.due_date = CURRENT_DATE 
AND t.due_time BETWEEN CURRENT_TIME AND CURRENT_TIME + INTERVAL '24 hours'
ORDER BY t.due_time;

-- 19. 获取用户的提醒设置
SELECT 
    r.*,
    t.title as task_title,
    t.due_date,
    t.due_time
FROM reminders r
JOIN tasks t ON r.task_id = t.id
WHERE t.user_id = 1 -- 替换为实际用户ID
AND r.is_sent = FALSE
AND r.reminder_time <= NOW() + INTERVAL '24 hours'
ORDER BY r.reminder_time;

-- 20. 获取用户最具生产力的日期（过去30天）
SELECT 
    date,
    completed_count,
    completion_rate
FROM task_statistics
WHERE user_id = 1 -- 替换为实际用户ID
AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY completed_count DESC, completion_rate DESC
LIMIT 1; 