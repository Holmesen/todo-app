import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Task priority type from database schema
export type TaskPriority = 'low' | 'medium' | 'high';

// Task status type from database schema
export type TaskStatus = 'pending' | 'completed' | 'overdue';

// Reminder type from database schema
export type ReminderType = 'none' | 'at_time' | '5_min_before' | '15_min_before' | '30_min_before' | '1_hour_before' | '1_day_before';

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

class TaskService {
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
        const subtasksWithTaskId = input.subtasks.map(subtask => ({
          ...subtask,
          task_id: taskId
        }));

        const { error: subtaskError } = await supabase
          .from('todo_subtasks')
          .insert(subtasksWithTaskId);

        if (subtaskError) throw subtaskError;
      }

      // 3. Insert reminder if provided
      if (input.reminder) {
        const { error: reminderError } = await supabase
          .from('todo_reminders')
          .insert({
            ...input.reminder,
            task_id: taskId
          });

        if (reminderError) throw reminderError;
      }

      // 4. Log activity
      await supabase
        .from('todo_activity_logs')
        .insert({
          user_id: input.task.user_id,
          task_id: taskId,
          action_type: 'create',
          action_details: { task_title: input.task.title }
        });

      return { data: taskData, error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
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
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  }

  /**
   * Get task by ID with subtasks
   */
  async getTaskById(taskId: number): Promise<ServiceResponse<Task & { subtasks: Subtask[] }>> {
    try {
      // Get task
      const { data: taskData, error: taskError } = await supabase
        .from('todo_tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;
      if (!taskData) throw new Error('Task not found');

      // Get subtasks
      const { data: subtasksData, error: subtasksError } = await supabase
        .from('todo_subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (subtasksError) throw subtasksError;

      const taskWithSubtasks = {
        ...taskData,
        subtasks: subtasksData || []
      };

      return { data: taskWithSubtasks, error: null };
    } catch (error) {
      console.error('Error fetching task details:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  }

  /**
   * Calculate reminder time based on due date, due time and reminder type
   */
  calculateReminderTime(
    dueDate: string,
    dueTime: string | null,
    reminderType: ReminderType
  ): string | null {
    if (reminderType === 'none') return null;
    if (!dueTime && reminderType !== '1_day_before') return null;

    const dueDateStr = dueDate;
    const dueTimeStr = dueTime || '00:00:00';
    const dueDateTimeStr = `${dueDateStr}T${dueTimeStr}`;
    const dueDateTime = new Date(dueDateTimeStr);

    switch (reminderType) {
      case 'at_time':
        return dueDateTime.toISOString();
      case '5_min_before':
        return new Date(dueDateTime.getTime() - 5 * 60 * 1000).toISOString();
      case '15_min_before':
        return new Date(dueDateTime.getTime() - 15 * 60 * 1000).toISOString();
      case '30_min_before':
        return new Date(dueDateTime.getTime() - 30 * 60 * 1000).toISOString();
      case '1_hour_before':
        return new Date(dueDateTime.getTime() - 60 * 60 * 1000).toISOString();
      case '1_day_before':
        return new Date(dueDateTime.getTime() - 24 * 60 * 60 * 1000).toISOString();
      default:
        return null;
    }
  }
}

export const taskService = new TaskService(); 