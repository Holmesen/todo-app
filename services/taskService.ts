import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { formatISO, startOfDay, endOfDay, addDays, parseISO } from 'date-fns';

// Task priority type from database schema
export type TaskPriority = 'low' | 'medium' | 'high';

// Task status type from database schema
export type TaskStatus = 'pending' | 'completed' | 'overdue';

// Reminder type from database schema
export type ReminderType =
  | 'none'
  | 'at_time'
  | '5_min_before'
  | '15_min_before'
  | '30_min_before'
  | '1_hour_before'
  | '1_day_before';

// Task type based on database schema
export interface Task {
  id?: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  due_date: string | null; // ISO date string format
  due_time: string | null; // ISO time string format
  priority: TaskPriority;
  status: TaskStatus;
  reminder_time: string | null; // ISO datetime string format
  completed_at: string | null; // ISO datetime string format
  created_at?: string;
  updated_at?: string;
}

// Category type based on database schema
export interface Category {
  id: number;
  user_id: number;
  name: string;
  color: string;
  icon: string | null;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

// Subtask type based on database schema
export interface Subtask {
  id?: number;
  task_id: number;
  title: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
}

// Attachment type based on database schema
export interface Attachment {
  id?: number;
  task_id: number;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  file_url: string;
  created_at?: string;
}

// Reminder type based on database schema
export interface Reminder {
  id?: number;
  task_id: number;
  reminder_type: ReminderType;
  reminder_time: string;
  is_sent: boolean;
  created_at?: string;
  updated_at?: string;
}

// Create task with subtasks and reminder
export interface CreateTaskInput {
  task: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
  subtasks?: Omit<Subtask, 'id' | 'task_id' | 'created_at' | 'updated_at' | 'completed_at'>[];
  reminder?: Omit<Reminder, 'id' | 'task_id' | 'created_at' | 'updated_at'>;
}

// Response types
export interface ServiceResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

export interface TaskWithCategory extends Task {
  category?: Category | null;
}

export interface TaskResult {
  data: TaskWithCategory[] | null;
  error: PostgrestError | null;
}

class TaskService {
  calculateReminderTime(dueDate: string, dueTime: string | null, reminderType: string) {
    if (reminderType === 'none') return null;
    if (reminderType === 'at_time') return formatISO(startOfDay(parseISO(dueDate)));
    if (reminderType === '5_min_before') return formatISO(subtractMinutes(dueTime, 5));
    if (reminderType === '15_min_before') return formatISO(subtractMinutes(dueTime, 15));
    if (reminderType === '30_min_before') return formatISO(subtractMinutes(dueTime, 30));
    if (reminderType === '1_hour_before') return formatISO(subtractHours(dueTime, 1));
    if (reminderType === '1_day_before') return formatISO(subtractDays(dueDate, 1));
    return null;
  }
  /**
   * Creates a new task with optional subtasks and reminder
   */
  async createTask(input: CreateTaskInput): Promise<ServiceResponse<Task>> {
    try {
      // 1. Insert task
      const { data: taskData, error: taskError } = await supabase
        .from('todo_tasks')
        .insert(input.task)
        .select('id, *')
        .single();

      if (taskError) throw taskError;
      if (!taskData) throw new Error('Failed to create task');

      const taskId = taskData.id;

      // 2. Insert subtasks if provided
      if (input.subtasks && input.subtasks.length > 0) {
        const subtasksWithTaskId = input.subtasks.map((subtask) => ({
          ...subtask,
          task_id: taskId,
        }));

        const { error: subtaskError } = await supabase.from('todo_subtasks').insert(subtasksWithTaskId);

        if (subtaskError) throw subtaskError;
      }

      // 3. Insert reminder if provided
      if (input.reminder) {
        const { error: reminderError } = await supabase.from('todo_reminders').insert({
          ...input.reminder,
          task_id: taskId,
        });

        if (reminderError) throw reminderError;
      }

      // 4. Log activity
      await supabase.from('todo_activity_logs').insert({
        user_id: input.task.user_id,
        task_id: taskId,
        action_type: 'create',
        action_details: { task_title: input.task.title },
      });

      return { data: taskData, error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Get all tasks for a user
   */
  async getUserTasks(userId: number): Promise<ServiceResponse<Task[]>> {
    try {
      const { data, error } = await supabase
        .from('todo_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * 根据过滤器获取任务
   * @param userId 用户ID
   * @param filter 过滤器类型 ('all', 'today', 'upcoming', 或类别ID)
   * @returns 任务数据及任何可能的错误
   */
  async getTasks(userId: number, filter: string): Promise<TaskResult> {
    let query = supabase
      .from('todo_tasks')
      .select(
        `
        *,
        category:todo_categories(*)
      `
      )
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
      .order('due_time', { ascending: true })
      .order('created_at', { ascending: false });

    // Apply filter
    if (filter !== 'all') {
      if (filter === 'today') {
        // Today's tasks
        const today = new Date();
        const startOfToday = formatISO(startOfDay(today));
        const endOfToday = formatISO(endOfDay(today));

        query = query.gte('due_date', startOfToday.split('T')[0]).lte('due_date', endOfToday.split('T')[0]);
      } else if (filter === 'upcoming') {
        // Upcoming tasks (tomorrow and later)
        const tomorrow = addDays(new Date(), 1);
        const startOfTomorrow = formatISO(startOfDay(tomorrow));

        query = query.gte('due_date', startOfTomorrow.split('T')[0]);
      } else if (!isNaN(parseInt(filter))) {
        // Filter by category ID
        query = query.eq('category_id', parseInt(filter));
      }
    }

    const { data, error } = await query;

    return {
      data: (data as TaskWithCategory[]) || null,
      error,
    };
  }

  /**
   * 获取今天的任务
   * @param userId 用户ID
   * @returns 今天的任务数据及任何可能的错误
   */
  async getTodayTasks(userId: number): Promise<TaskResult> {
    const today = new Date();
    const startOfToday = formatISO(startOfDay(today));
    const endOfToday = formatISO(endOfDay(today));

    const { data, error } = await supabase
      .from('todo_tasks')
      .select(
        `
        *,
        category:todo_categories(*)
      `
      )
      .eq('user_id', userId)
      .gte('due_date', startOfToday.split('T')[0])
      .lte('due_date', endOfToday.split('T')[0])
      .order('due_date', { ascending: true })
      .order('due_time', { ascending: true });

    return {
      data: (data as TaskWithCategory[]) || null,
      error,
    };
  }

  /**
   * 获取即将到来的任务
   * @param userId 用户ID
   * @param limit 要返回的任务数量
   * @returns 即将到来的任务数据及任何可能的错误
   */
  async getUpcomingTasks(userId: number, limit: number = 5): Promise<TaskResult> {
    const tomorrow = addDays(new Date(), 1);
    const startOfTomorrow = formatISO(startOfDay(tomorrow));

    const { data, error } = await supabase
      .from('todo_tasks')
      .select(
        `
        *,
        category:todo_categories(*)
      `
      )
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('due_date', startOfTomorrow.split('T')[0])
      .order('due_date', { ascending: true })
      .order('due_time', { ascending: true })
      .limit(limit);

    return {
      data: (data as TaskWithCategory[]) || null,
      error,
    };
  }

  /**
   * 格式化任务时间以便显示
   * @param task 任务对象
   * @returns 格式化的时间字符串
   */
  formatTaskTime(task: Task): string {
    if (!task.due_date) {
      return 'No due date';
    }

    const today = new Date();
    const tomorrow = addDays(today, 1);
    const dueDate = parseISO(task.due_date);

    const isToday =
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear();

    const isTomorrow =
      dueDate.getDate() === tomorrow.getDate() &&
      dueDate.getMonth() === tomorrow.getMonth() &&
      dueDate.getFullYear() === tomorrow.getFullYear();

    let dateStr = '';
    if (isToday) {
      dateStr = 'Today';
    } else if (isTomorrow) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = dueDate.toLocaleDateString();
    }

    if (task.due_time) {
      // Format time (assuming due_time is in HH:MM:SS format)
      const timeParts = task.due_time.split(':');
      let hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12; // Convert '0' to '12'

      return `${dateStr}, ${hours}:${minutes} ${ampm}`;
    }

    return dateStr;
  }
}

export const taskService = new TaskService();

function subtractMinutes(dueTime: string | null, arg1: number): string | number | Date {
  if (!dueTime) {
    return '';
  }

  const date = new Date(dueTime);
  date.setMinutes(date.getMinutes() - arg1);
  return date;
}
function subtractHours(dueTime: string | null, arg1: number): string | number | Date {
  if (!dueTime) {
    return '';
  }

  const date = new Date(dueTime);
  date.setHours(date.getHours() - arg1);
  return date;
}

function subtractDays(dueDate: string, arg1: number): string | number | Date {
  const date = new Date(dueDate);
  date.setDate(date.getDate() - arg1);
  return date;
}
