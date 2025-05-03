import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Task } from '../services/taskService';
import { useAuthStore } from 'store/authStore';

interface UseTasksReturn {
  tasks: Task[];
  todayTasks: Task[];
  upcomingTasks: Task[];
  completedTasks: Task[];
  overdueTasks: Task[];
  filteredTasks: Task[];
  allTasks: Task[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setActiveFilter: (filterId: string) => void;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // 从认证存储中获取用户
  const { user } = useAuthStore();

  // 根据认证方式获取用户ID
  const getUserId = (): number => {
    if (user) {
      return user.id;
    }
    throw new Error('用户未认证');
  };

  // 从Supabase获取任务
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getUserId();

      // 从Supabase获取任务
      const { data, error } = await supabase
        .from('todo_tasks')
        .select('*, category:todo_categories(name, color, icon)')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) {
        throw error;
      }

      // 将数据库格式转换为应用格式
      const parsedTasks = data.map((task) => {
        try {
          return {
            id: task.id.toString(),
            title: task.title,
            description: task.description,
            priority: task.priority,
            category: task.category?.name || null,
            category_id: task.category_id?.toString() || null,
            date: new Date(task.due_date),
            time: task.due_time,
            reminder: task.reminder_time ? new Date(task.reminder_time).toISOString() : null,
            completed: task.status === 'completed',
            user_id: task.user_id.toString(),
            created_at: new Date(task.created_at),
            updated_at: new Date(task.updated_at),
          } as Task;
        } catch (err) {
          console.error('解析任务时出错:', task, err);
          throw err;
        }
      });

      setTasks(parsedTasks);

      // 初始过滤
      filterTasks(parsedTasks, 'all');
    } catch (err) {
      console.error('获取任务时出错:', err);
      setError(err instanceof Error ? err.message : '加载任务失败');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 根据活跃过滤器过滤任务
  const filterTasks = useCallback((taskList: Task[], filterId: string) => {
    // 获取今天午夜时间用于比较
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 获取明天的日期用于即将到来的任务
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 获取7天后的日期用于即将到来的任务
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    let filtered: Task[];

    switch (filterId) {
      case 'all':
        // 所有未完成的任务
        filtered = taskList.filter((task) => !task.completed);
        break;
      case 'today':
        // 今天的未完成任务
        filtered = taskList.filter((task) => {
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          return !task.completed && taskDate.getTime() === today.getTime();
        });
        break;
      case 'upcoming':
        // 即将到来的未完成任务（未来7天，不包括今天）
        filtered = taskList.filter((task) => {
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          return !task.completed && taskDate.getTime() > today.getTime() && taskDate.getTime() <= nextWeek.getTime();
        });
        break;
      case 'completed':
        // 已完成的任务
        filtered = taskList.filter((task) => task.completed);
        break;
      default:
        // 如果过滤器是分类ID
        if (filterId) {
          filtered = taskList.filter((task) => !task.completed && task.category_id === filterId);
        } else {
          filtered = taskList.filter((task) => !task.completed);
        }
    }

    setFilteredTasks(filtered);
  }, []);

  // 当任务或活跃过滤器变化时应用过滤器
  useEffect(() => {
    filterTasks(tasks, activeFilter);
  }, [tasks, activeFilter, filterTasks]);

  // 初始获取
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 设置活跃过滤器
  const handleSetActiveFilter = useCallback((filterId: string) => {
    setActiveFilter(filterId);
  }, []);

  // 创建派生任务列表
  const todayTasks = tasks.filter((task) => {
    const taskDate = new Date(task.date);
    const today = new Date();
    return (
      !task.completed &&
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  });

  const upcomingTasks = tasks.filter((task) => {
    const taskDate = new Date(task.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return !task.completed && taskDate.getTime() > today.getTime() && taskDate.getTime() <= nextWeek.getTime();
  });

  const completedTasks = tasks.filter((task) => task.completed);

  const overdueTasks = tasks.filter(
    (task) => !task.completed && new Date().toLocaleDateString() > task.date.toLocaleDateString()
  );

  const allTasks = tasks.filter((task) => !task.completed);

  return {
    tasks,
    todayTasks,
    upcomingTasks,
    completedTasks,
    overdueTasks,
    filteredTasks,
    allTasks,
    isLoading,
    error,
    refetch: fetchTasks,
    setActiveFilter: handleSetActiveFilter,
  };
}
