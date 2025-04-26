import { useState, useEffect, useCallback } from 'react';
import { taskService, Task, TaskWithCategory, TaskResult } from '../services/taskService';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

// 钩子返回类型的接口
interface UseTasksReturn {
  todayTasks: Task[];
  upcomingTasks: Task[];
  filteredTasks: Task[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setActiveFilter: (filter: string) => void;
}

export function useTasks(): UseTasksReturn {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 从认证存储中获取用户
  const { nativeUser, user, authMethod } = useAuthStore();

  // 根据认证方式获取用户ID
  const getUserId = (): number => {
    if (authMethod === 'native' && nativeUser) {
      return nativeUser.id;
    } else if (authMethod === 'supabase' && user) {
      // 对于Supabase认证，我们需要从profiles表中获取user_id
      // 这是一个简化 - 您可能需要根据实际的数据库结构进行调整
      return parseInt(user.id);
    }
    throw new Error('用户未认证');
  };

  const userId = getUserId();

  // 获取今天任务的函数
  const fetchTodayTasks = useCallback(async (): Promise<TaskResult> => {
    return await taskService.getTodayTasks(userId);
  }, []);

  // 获取即将到来任务的函数
  const fetchUpcomingTasks = useCallback(async (): Promise<TaskResult> => {
    return await taskService.getUpcomingTasks(userId);
  }, []);

  // 获取过滤任务的函数
  const fetchFilteredTasks = useCallback(async (filter: string): Promise<TaskResult> => {
    return await taskService.getTasks(userId, filter);
  }, []);

  // 重新获取所有任务的函数
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [todayResult, upcomingResult, filteredResult] = await Promise.all([
        fetchTodayTasks(),
        fetchUpcomingTasks(),
        fetchFilteredTasks(activeFilter),
      ]);

      if (todayResult.error) {
        throw new Error(todayResult.error.message);
      }

      if (upcomingResult.error) {
        throw new Error(upcomingResult.error.message);
      }

      if (filteredResult.error) {
        throw new Error(filteredResult.error.message);
      }

      setTodayTasks(todayResult.data || []);
      setUpcomingTasks(upcomingResult.data || []);
      setFilteredTasks(filteredResult.data || []);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '获取任务失败';
      setError(errorMessage);
      console.error('获取任务时出错:', e);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, fetchTodayTasks, fetchUpcomingTasks, fetchFilteredTasks]);

  // 处理过滤器更改
  const handleFilterChange = useCallback(
    async (filter: string) => {
      setActiveFilter(filter);
      setIsLoading(true);

      try {
        const result = await fetchFilteredTasks(filter);

        if (result.error) {
          throw new Error(result.error.message);
        }

        setFilteredTasks(result.data || []);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : '获取任务失败';
        setError(errorMessage);
        console.error('获取过滤任务时出错:', e);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFilteredTasks]
  );

  // 初始数据获取
  useEffect(() => {
    refetch();

    // 为tasks表设置实时订阅
    const tasksSubscription = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        // 当任务发生变化时，重新获取数据
        refetch();
      })
      .subscribe();

    // 清理订阅
    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, [refetch]);

  return {
    todayTasks,
    upcomingTasks,
    filteredTasks,
    isLoading,
    error,
    refetch,
    setActiveFilter: handleFilterChange,
  };
}
