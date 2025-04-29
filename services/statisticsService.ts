import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { TaskStatus } from './taskService';

// Define types for statistics
export interface TaskStatistic {
  date: string;
  created_count: number;
  completed_count: number;
  overdue_count: number;
  completion_rate: number;
  avg_completion_time: number;
}

export interface ServiceResponse<T> {
  data: T | null;
  tasks: Partial<Task>[];
  error: PostgrestError | Error | null;
}

export interface TaskStatsByCategory {
  category_name: string;
  category_color: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
}

export interface TaskStatsByPriority {
  priority: string;
  task_count: number;
  completed_count: number;
}

// Define additional interfaces for database responses
interface Category {
  name: string;
  color: string;
}

export interface Task {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  priority: string;
  status: TaskStatus;
  reminder_time: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export const statisticsService = {
  // Get tasks for a specific date range
  async getTasksByDateRange(userId: number, startDate: string, endDate: string): Promise<ServiceResponse<Task[]>> {
    try {
      const { data, error } = await supabase
        .from('todo_tasks')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);

      return { data, tasks: data || [], error };
    } catch (error) {
      return { data: null, tasks: [], error: error as Error };
    }
  },

  // Calculate statistics from tasks for a date range
  async calculateStatisticsForDateRange(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<ServiceResponse<TaskStatistic[]>> {
    try {
      const tasksResponse = await this.getTasksByDateRange(userId, startDate, endDate);

      if (tasksResponse.error) {
        return { data: null, tasks: [], error: tasksResponse.error };
      }

      if (!tasksResponse.data || tasksResponse.data.length === 0) {
        return {
          data: this.generateEmptyStatisticsForDateRange(startDate, endDate),
          tasks: [],
          error: null,
        };
      }

      const tasks = tasksResponse.data;
      const statsByDate = this.groupTasksByDate(tasks, startDate, endDate);

      return { data: statsByDate, tasks, error: null };
    } catch (error) {
      return { data: null, tasks: [], error: error as Error };
    }
  },

  // Group tasks by date and calculate statistics
  groupTasksByDate(tasks: Task[], startDate: string, endDate: string): TaskStatistic[] {
    // Create a map to store tasks by date
    const dateMap: { [key: string]: TaskStatistic } = {};

    // Initialize the map with all dates in the range
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap[dateStr] = {
        date: dateStr,
        created_count: 0,
        completed_count: 0,
        overdue_count: 0,
        completion_rate: 0,
        avg_completion_time: 0,
      };
    }

    // Count created tasks by date
    tasks.forEach((task) => {
      const createdDate = new Date(task.created_at).toISOString().split('T')[0];

      // Increment created count if the date is in our range
      if (dateMap[createdDate]) {
        dateMap[createdDate].created_count += 1;
      }

      // Count completed tasks
      if (task.status === 'completed' && task.completed_at) {
        const completedDate = new Date(task.completed_at).toISOString().split('T')[0];

        // Increment completed count if the date is in our range
        if (dateMap[completedDate]) {
          dateMap[completedDate].completed_count += 1;

          // Calculate completion time in hours if created and completed on same day
          const completionTimeMs = new Date(task.completed_at).getTime() - new Date(task.created_at).getTime();
          const completionTimeHours = completionTimeMs / (1000 * 60 * 60);

          // Update avg completion time
          const currentStats = dateMap[completedDate];
          const currentTotal = currentStats.avg_completion_time * (currentStats.completed_count - 1);
          const newAvg = (currentTotal + completionTimeHours) / currentStats.completed_count;
          dateMap[completedDate].avg_completion_time = newAvg;
        }
      }

      // Count overdue tasks
      if (
        task.status === 'overdue' ||
        (task.status === 'pending' && task.due_date && new Date(task.due_date) < new Date())
      ) {
        const overdueDate = task.due_date
          ? new Date(task.due_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        // Increment overdue count if the date is in our range
        if (dateMap[overdueDate]) {
          dateMap[overdueDate].overdue_count += 1;
        }
      }
    });

    // Calculate completion rates for each date
    Object.keys(dateMap).forEach((date) => {
      const stats = dateMap[date];
      const total = stats.created_count;
      stats.completion_rate = total > 0 ? (stats.completed_count / total) * 100 : 0;
    });

    // Convert map to array sorted by date
    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  },

  // Generate empty statistics for a date range
  generateEmptyStatisticsForDateRange(startDate: string, endDate: string): TaskStatistic[] {
    const result: TaskStatistic[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        created_count: 0,
        completed_count: 0,
        overdue_count: 0,
        completion_rate: 0,
        avg_completion_time: 0,
      });
    }

    return result;
  },

  // Get statistics by category
  async getStatisticsByCategory(userId: number): Promise<ServiceResponse<TaskStatsByCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('todo_tasks')
        .select(
          `
          id,
          status,
          category_id,
          todo_categories:category_id (
            name,
            color
          )
        `
        )
        .eq('user_id', userId);

      if (error) {
        return { data: null, tasks: [], error };
      }

      if (!data || data.length === 0) {
        return { data: [], tasks: [], error: null };
      }

      // Group tasks by category
      const categoryStats: { [key: string]: TaskStatsByCategory } = {};

      data.forEach((task: any) => {
        // Handle the categories object properly
        const categoryName = task.categories && task.categories.name ? task.categories.name : 'Uncategorized';
        const categoryColor = task.categories && task.categories.color ? task.categories.color : '#CCCCCC';
        const categoryKey = `${categoryName}-${categoryColor}`;

        if (!categoryStats[categoryKey]) {
          categoryStats[categoryKey] = {
            category_name: categoryName,
            category_color: categoryColor,
            total_tasks: 0,
            completed_tasks: 0,
            pending_tasks: 0,
            overdue_tasks: 0,
          };
        }

        categoryStats[categoryKey].total_tasks += 1;

        if (task.status === 'completed') {
          categoryStats[categoryKey].completed_tasks += 1;
        } else if (task.status === 'pending') {
          categoryStats[categoryKey].pending_tasks += 1;
        } else if (task.status === 'overdue') {
          categoryStats[categoryKey].overdue_tasks += 1;
        }
      });

      return {
        data: Object.values(categoryStats).sort((a, b) => b.total_tasks - a.total_tasks),
        tasks: data,
        error: null,
      };
    } catch (error) {
      return { data: null, tasks: [], error: error as Error };
    }
  },

  // Get statistics by priority
  async getStatisticsByPriority(userId: number): Promise<ServiceResponse<TaskStatsByPriority[]>> {
    try {
      const { data, error } = await supabase.from('todo_tasks').select('id, priority, status').eq('user_id', userId);

      if (error) {
        return { data: null, tasks: [], error };
      }

      if (!data || data.length === 0) {
        return { data: [], tasks: [], error: null };
      }

      // Group tasks by priority
      const priorityStats: { [key: string]: TaskStatsByPriority } = {
        high: { priority: 'high', task_count: 0, completed_count: 0 },
        medium: { priority: 'medium', task_count: 0, completed_count: 0 },
        low: { priority: 'low', task_count: 0, completed_count: 0 },
      };

      data.forEach((task) => {
        const priority = task.priority || 'medium';

        if (!priorityStats[priority]) {
          priorityStats[priority] = {
            priority,
            task_count: 0,
            completed_count: 0,
          };
        }

        priorityStats[priority].task_count += 1;

        if (task.status === 'completed') {
          priorityStats[priority].completed_count += 1;
        }
      });

      return {
        data: Object.values(priorityStats).sort((a, b) => {
          // Sort high, medium, low
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return (
            priorityOrder[a.priority as keyof typeof priorityOrder] -
            priorityOrder[b.priority as keyof typeof priorityOrder]
          );
        }),
        tasks: data,
        error: null,
      };
    } catch (error) {
      return { data: null, tasks: [], error: error as Error };
    }
  },

  // Get average completion time
  async getAverageCompletionTime(userId: number, days: number = 30): Promise<ServiceResponse<number>> {
    try {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - days);

      const { data, error } = await supabase
        .from('todo_tasks')
        .select('created_at, completed_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .gte('completed_at', startDate.toISOString());

      if (error) {
        return { data: null, tasks: [], error };
      }

      if (!data || data.length === 0) {
        return { data: 0, tasks: [], error: null };
      }

      // Calculate average completion time in hours
      let totalHours = 0;
      data.forEach((task) => {
        const completionTimeMs = new Date(task.completed_at).getTime() - new Date(task.created_at).getTime();
        totalHours += completionTimeMs / (1000 * 60 * 60);
      });

      return { data: totalHours / data.length, tasks: data, error: null };
    } catch (error) {
      return { data: null, tasks: [], error: error as Error };
    }
  },

  // Get most productive day of the week
  async getMostProductiveDay(userId: number, days: number = 30): Promise<ServiceResponse<string>> {
    try {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - days);

      const { data, error } = await supabase
        .from('todo_tasks')
        .select('completed_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .gte('completed_at', startDate.toISOString());

      if (error) {
        return { data: null, tasks: [], error };
      }

      if (!data || data.length === 0) {
        return { data: '-', tasks: data, error: null };
      }

      // Count completions by day of week
      const dayCompletions = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, ..., Sat
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      data.forEach((task) => {
        const dayOfWeek = new Date(task.completed_at).getDay();
        dayCompletions[dayOfWeek] += 1;
      });

      // Find the day with most completions
      let maxDay = 0;
      let maxCompletions = dayCompletions[0];

      for (let i = 1; i < 7; i++) {
        if (dayCompletions[i] > maxCompletions) {
          maxDay = i;
          maxCompletions = dayCompletions[i];
        }
      }

      return { data: dayNames[maxDay], tasks: data, error: null };
    } catch (error) {
      return { data: null, tasks: [], error: error as Error };
    }
  },
};
