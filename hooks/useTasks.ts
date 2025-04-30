import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Task } from '../services/taskService';
import { useAuthStore } from 'store/authStore';

interface UseTasksReturn {
  tasks: Task[];
  todayTasks: Task[];
  upcomingTasks: Task[];
  completedTasks: Task[];
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

  // Fetch tasks from Supabase
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getUserId();

      // Fetch tasks from Supabase
      const { data, error } = await supabase
        .from('todo_tasks')
        .select('*, category:todo_categories(name, color, icon)')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) {
        throw error;
      }

      // Convert DB format to app format
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
          console.error('Error parsing task:', task, err);
          throw err;
        }
      });

      setTasks(parsedTasks);

      // Initial filtering
      filterTasks(parsedTasks, 'all');
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter tasks based on active filter
  const filterTasks = useCallback((taskList: Task[], filterId: string) => {
    // Get today's date at midnight for comparing
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tomorrow's date for upcoming tasks
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get date 7 days from now for upcoming tasks
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    let filtered: Task[];

    switch (filterId) {
      case 'all':
        // All incomplete tasks
        filtered = taskList.filter((task) => !task.completed);
        break;
      case 'today':
        // Today's incomplete tasks
        filtered = taskList.filter((task) => {
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          return !task.completed && taskDate.getTime() === today.getTime();
        });
        break;
      case 'upcoming':
        // Upcoming incomplete tasks (next 7 days, excluding today)
        filtered = taskList.filter((task) => {
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          return !task.completed && taskDate.getTime() > today.getTime() && taskDate.getTime() <= nextWeek.getTime();
        });
        break;
      case 'completed':
        // Completed tasks
        filtered = taskList.filter((task) => task.completed);
        break;
      default:
        // If the filter is a category ID
        if (filterId) {
          filtered = taskList.filter((task) => !task.completed && task.category_id === filterId);
        } else {
          filtered = taskList.filter((task) => !task.completed);
        }
    }

    setFilteredTasks(filtered);
  }, []);

  // Apply filters when tasks or active filter changes
  useEffect(() => {
    filterTasks(tasks, activeFilter);
  }, [tasks, activeFilter, filterTasks]);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Set active filter
  const handleSetActiveFilter = useCallback((filterId: string) => {
    setActiveFilter(filterId);
  }, []);

  // Create derived task lists
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

  const allTasks = tasks.filter((task) => !task.completed);

  return {
    tasks,
    todayTasks,
    upcomingTasks,
    completedTasks,
    filteredTasks,
    allTasks,
    isLoading,
    error,
    refetch: fetchTasks,
    setActiveFilter: handleSetActiveFilter,
  };
}
