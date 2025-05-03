import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { formatISO, startOfDay, endOfDay, addDays, parseISO } from 'date-fns';
import { z } from 'zod';
import { setupTaskReminder, deleteTaskReminders } from '../lib/notifications';

// 数据库模式中的枚举类型
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed' | 'overdue';
export type ReminderType =
  | 'none'
  | 'at_time'
  | '5_min_before'
  | '15_min_before'
  | '30_min_before'
  | '1_hour_before'
  | '1_day_before';

// 与数据库模式对齐的类型定义
export interface DbTask {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  due_date: string; // ISO日期字符串格式
  due_time: string | null; // ISO时间字符串格式
  priority: TaskPriority;
  status: TaskStatus;
  reminder_time: string | null; // ISO日期时间字符串格式
  completed_at: string | null; // ISO日期时间字符串格式
  created_at?: string;
  updated_at?: string;
}

// 与模式对齐的分类定义
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

// 与模式对齐的子任务定义
export interface DbSubtask {
  id: number;
  task_id: number;
  title: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
}

// 与模式对齐的附件定义
export interface Attachment {
  id: number;
  task_id: number;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  file_url: string;
  created_at?: string;
}

// 与模式对齐的提醒定义
export interface Reminder {
  id: number;
  task_id: number;
  reminder_type: ReminderType;
  reminder_time: string;
  is_sent: boolean;
  created_at?: string;
  updated_at?: string;
}

// 创建任务输入
export interface CreateTaskInput {
  task: Omit<DbTask, 'id' | 'created_at' | 'updated_at'>;
  subtasks?: Omit<DbSubtask, 'id' | 'task_id' | 'created_at' | 'updated_at' | 'completed_at'>[];
  reminder?: Omit<Reminder, 'id' | 'task_id' | 'created_at' | 'updated_at'>;
}

// 响应类型
export interface ServiceResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

export interface TaskWithCategory extends Omit<DbTask, 'category'> {
  category?: {
    name: string;
    color: string;
    icon: string | null;
  } | null;
}

export interface TaskResult {
  data: TaskWithCategory[] | null;
  error: PostgrestError | null;
}

// API层的Zod模式
// 用于验证和转换数据库与应用程序之间的数据

// 应用层的子任务模式
export const SubtaskSchema = z.object({
  id: z.union([z.number(), z.null()]).transform((n) => n ?? null),
  title: z.string(),
  completed: z.union([
    z.boolean(),
    z.literal(1).transform(() => true),
    z.literal(0).transform(() => false),
    z.literal('true').transform(() => true),
    z.literal('false').transform(() => false),
  ]),
  task_id: z.union([z.number(), z.string()]).transform((n) => n.toString()),
  user_id: z
    .union([z.number(), z.string()])
    .transform((n) => n.toString())
    .optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// 应用层的任务模式
export const TaskSchema = z.object({
  id: z.union([z.number(), z.string()]).transform((n) => n.toString()),
  title: z.string(),
  description: z.string().nullable().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  category: z.string().nullable().optional(),
  category_id: z
    .union([z.number(), z.string(), z.null()])
    .nullable()
    .optional()
    .transform((n) => (n === null || n === undefined ? null : n.toString())),
  date: z.union([z.string().transform((str) => new Date(str)), z.date()]),
  time: z.string().nullable().optional(),
  reminder: z.string().nullable().optional(),
  completed: z.union([
    z.boolean(),
    z.literal('pending').transform(() => false),
    z.literal('completed').transform(() => true),
    z.literal('overdue').transform(() => false),
  ]),
  user_id: z.union([z.number(), z.string()]).transform((n) => n.toString()),
  created_at: z.union([z.string().transform((str) => new Date(str)), z.date()]),
  updated_at: z.union([z.string().transform((str) => new Date(str)), z.date()]),
});

// 带关联的任务模式
export const TaskWithRelationsSchema = TaskSchema.extend({
  subtasks: z.array(SubtaskSchema).optional(),
  attachments: z
    .array(
      z.object({
        id: z.union([z.number(), z.string()]).transform((n) => n.toString()),
        uri: z.string(),
        type: z.string(),
        task_id: z.union([z.number(), z.string()]).transform((n) => n.toString()),
      })
    )
    .optional(),
});

// 应用程序中使用的类型
export type Task = z.infer<typeof TaskSchema>;
export type TaskWithRelations = z.infer<typeof TaskWithRelationsSchema>;
export type Subtask = z.infer<typeof SubtaskSchema>;

// 将数据库任务转换为应用任务
function transformDbTaskToAppTask(dbTask: DbTask): Task {
  return {
    id: dbTask.id.toString(),
    title: dbTask.title,
    description: dbTask.description,
    priority: dbTask.priority,
    category_id: dbTask.category_id?.toString() || null,
    date: new Date(dbTask.due_date),
    time: dbTask.due_time,
    completed: dbTask.status === 'completed',
    user_id: dbTask.user_id.toString(),
    created_at: new Date(dbTask.created_at || Date.now()),
    updated_at: new Date(dbTask.updated_at || Date.now()),
  };
}

class TaskService {
  // 计算提醒时间
  calculateReminderTime(dueDate: string, dueTime: string | null, reminderType: string) {
    if (reminderType === 'none') return null;
    if (reminderType === 'at_time') return formatISO(startOfDay(parseISO(dueDate)));
    if (reminderType === '5_min_before') return formatISO(subtractMinutes(dueDate, dueTime, 5));
    if (reminderType === '15_min_before') return formatISO(subtractMinutes(dueDate, dueTime, 15));
    if (reminderType === '30_min_before') return formatISO(subtractMinutes(dueDate, dueTime, 30));
    if (reminderType === '1_hour_before') return formatISO(subtractHours(dueDate, dueTime, 1));
    if (reminderType === '1_day_before') return formatISO(subtractDays(dueDate, 1));
    return null;
  }

  /**
   * Creates a new task with optional subtasks and reminder
   */
  async createTask(input: CreateTaskInput): Promise<ServiceResponse<DbTask>> {
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

        // 4. 设置提醒通知
        const reminderType = input.reminder.reminder_type;
        if (reminderType !== 'none') {
          await setupTaskReminder(taskId, taskData.title, taskData.due_date, taskData.due_time, reminderType);
        }
      }

      // 5. Log activity
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
  async getUserTasks(userId: string): Promise<ServiceResponse<Task[]>> {
    try {
      const { data, error } = await supabase
        .from('todo_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) throw error;

      const transformedTasks = data ? data.map((task) => transformDbTaskToAppTask(task)) : [];
      return { data: transformedTasks, error: null };
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
  async getTasks(userId: string, filter: string): Promise<TaskResult> {
    let query = supabase
      .from('todo_tasks')
      .select(
        `
        *,
        category:todo_categories(name, color, icon)
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
        query = query.eq('category_id', filter);
      }
    }

    const { data, error } = await query;

    return {
      data: (data as unknown as TaskWithCategory[]) || null,
      error,
    };
  }

  /**
   * 获取今天的任务
   * @param userId 用户ID
   * @returns 今天的任务数据及任何可能的错误
   */
  async getTodayTasks(userId: string): Promise<TaskResult> {
    const today = new Date();
    const startOfToday = formatISO(startOfDay(today));
    const endOfToday = formatISO(endOfDay(today));

    const { data, error } = await supabase
      .from('todo_tasks')
      .select(
        `
        *,
        category:todo_categories(name, color, icon)
      `
      )
      .eq('user_id', userId)
      .gte('due_date', startOfToday.split('T')[0])
      .lte('due_date', endOfToday.split('T')[0])
      .order('due_date', { ascending: true })
      .order('due_time', { ascending: true });

    return {
      data: (data as unknown as TaskWithCategory[]) || null,
      error,
    };
  }

  /**
   * 获取即将到来的任务
   * @param userId 用户ID
   * @param limit 要返回的任务数量
   * @returns 即将到来的任务数据及任何可能的错误
   */
  async getUpcomingTasks(userId: string, limit: number = 5): Promise<TaskResult> {
    const tomorrow = addDays(new Date(), 1);
    const startOfTomorrow = formatISO(startOfDay(tomorrow));

    const { data, error } = await supabase
      .from('todo_tasks')
      .select(
        `
        *,
        category:todo_categories(name, color, icon)
      `
      )
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('due_date', startOfTomorrow.split('T')[0])
      .order('due_date', { ascending: true })
      .order('due_time', { ascending: true })
      .limit(limit);

    return {
      data: (data as unknown as TaskWithCategory[]) || null,
      error,
    };
  }

  /**
   * Format task time for display
   * @param task The task object
   * @returns Formatted time string
   */
  formatTaskTime(task: Task): string {
    // Convert task date to a string for comparison
    const taskDate = task.date;

    if (!taskDate) {
      return 'No due date';
    }

    const today = new Date();
    const tomorrow = addDays(today, 1);

    const isToday =
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear();

    const isTomorrow =
      taskDate.getDate() === tomorrow.getDate() &&
      taskDate.getMonth() === tomorrow.getMonth() &&
      taskDate.getFullYear() === tomorrow.getFullYear();

    let dateStr = '';
    if (isToday) {
      dateStr = '今天';
    } else if (isTomorrow) {
      dateStr = '明天';
    } else {
      dateStr = taskDate.toLocaleDateString('zh-CN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }

    if (task.time) {
      // Format time (assuming time is in HH:MM:SS format)
      const timeParts = task.time.split(':');
      let hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12; // Convert '0' to '12'

      return `${dateStr}, ${hours}:${minutes} ${ampm}`;
    }

    return dateStr;
  }

  /**
   * Get a task by ID
   * @param taskId Task ID
   * @returns Task with relations or null
   */
  async getTaskById(taskId: string | number): Promise<TaskWithRelations | null> {
    try {
      // Fetch the task
      const { data: taskData, error: taskError } = await supabase
        .from('todo_tasks')
        .select('*, category:todo_categories(name, color, icon)')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;
      if (!taskData) return null;

      // Fetch subtasks
      const { data: subtasksData, error: subtasksError } = await supabase
        .from('todo_subtasks')
        .select('*')
        .eq('task_id', taskId);

      if (subtasksError) throw subtasksError;

      // Fetch attachments
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('todo_attachments')
        .select('*')
        .eq('task_id', taskId);

      // Don't throw on attachment error, just log it
      if (attachmentsError) {
        console.error('Error fetching attachments:', attachmentsError);
      }

      // Transform DB data to app format
      const transformedTask = {
        id: taskData.id.toString(),
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        category: taskData.category?.name || null,
        category_id: taskData.category_id?.toString() || null,
        date: new Date(taskData.due_date),
        time: taskData.due_time,
        reminder: taskData.reminder_time ? new Date(taskData.reminder_time).toISOString() : null,
        completed: taskData.status === 'completed',
        user_id: taskData.user_id.toString(),
        created_at: new Date(taskData.created_at),
        updated_at: new Date(taskData.updated_at),
        subtasks:
          subtasksData?.map((subtask) => ({
            id: subtask.id,
            title: subtask.title,
            completed: subtask.is_completed,
            task_id: subtask.task_id.toString(),
          })) || [],
        attachments:
          attachmentsData?.map((attachment) => ({
            id: attachment.id,
            uri: attachment.file_url,
            type: attachment.file_type || 'unknown',
            task_id: attachment.task_id.toString(),
          })) || [],
      };

      return transformedTask as TaskWithRelations;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  /**
   * Update a task
   * @param task Task with ID to update
   * @returns Updated task
   */
  async updateTask(task: Partial<Task> & { id: string }): Promise<Task> {
    try {
      // Convert app format to DB format
      const dbTask: Record<string, any> = {};

      if (task.title) dbTask.title = task.title;
      if (task.description !== undefined) dbTask.description = task.description;
      if (task.priority) dbTask.priority = task.priority;
      if (task.category_id) dbTask.category_id = task.category_id;
      if (task.date) dbTask.due_date = formatISO(task.date).split('T')[0];
      if (task.time) dbTask.due_time = task.time;
      if (task.completed !== undefined) {
        dbTask.status = task.completed ? 'completed' : 'pending';
        if (task.completed) {
          dbTask.completed_at = formatISO(new Date());
        } else {
          dbTask.completed_at = null;
        }
      }

      const { data, error } = await supabase.from('todo_tasks').update(dbTask).eq('id', task.id).select('*').single();

      if (error) throw error;

      // 如果更新了日期、时间，更新相关的提醒
      if (task.date || task.time) {
        // 获取任务的提醒类型
        const { data: reminderData } = await supabase
          .from('todo_reminders')
          .select('reminder_type')
          .eq('task_id', task.id)
          .maybeSingle();

        if (reminderData && reminderData.reminder_type) {
          // 更新提醒
          await setupTaskReminder(task.id, data.title, data.due_date, data.due_time, reminderData.reminder_type);
        }
      }

      // 处理完成状态变化
      if (task.completed) {
        // 如果任务标记为完成，删除相关的提醒
        await deleteTaskReminders(task.id);
      }

      // Transform back to app format
      return {
        id: data.id.toString(),
        title: data.title,
        description: data.description,
        priority: data.priority,
        category_id: data.category_id?.toString() || null,
        date: new Date(data.due_date),
        time: data.due_time,
        completed: data.status === 'completed',
        user_id: data.user_id.toString(),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   * @param taskId Task ID to delete
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      // 删除与任务相关的提醒通知
      await deleteTaskReminders(taskId);

      // 删除任务
      const { error } = await supabase.from('todo_tasks').delete().eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Toggle subtask completion
   * @param subtaskId Subtask ID
   * @param completed New completion status
   * @returns Updated subtask
   */
  async toggleSubtaskCompletion(subtaskId: number, completed: boolean): Promise<Subtask> {
    try {
      const { data, error } = await supabase
        .from('todo_subtasks')
        .update({
          is_completed: completed,
          completed_at: completed ? formatISO(new Date()) : null,
        })
        .eq('id', subtaskId)
        .select()
        .single();

      if (error) throw error;

      // Transform to app format
      return {
        id: data.id.toString(),
        title: data.title,
        completed: data.is_completed,
        task_id: data.task_id.toString(),
      };
    } catch (error) {
      console.error('Error toggling subtask completion:', error);
      throw error;
    }
  }
}

export const taskService = new TaskService();

function subtractMinutes(dueDate: string, dueTime: string | null, minutes: number): string | number | Date {
  if (!dueTime) {
    return '';
  }

  const date = new Date(`${dueDate} ${dueTime}`);
  date.setMinutes(date.getMinutes() - minutes);
  return date;
}

function subtractHours(dueDate: string, dueTime: string | null, hours: number): string | number | Date {
  if (!dueTime) {
    return '';
  }

  const date = new Date(`${dueDate} ${dueTime}`);
  date.setHours(date.getHours() - hours);
  return date;
}

function subtractDays(dueDate: string, days: number): string | number | Date {
  const date = new Date(dueDate);
  date.setDate(date.getDate() - days);
  return date;
}
