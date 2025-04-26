import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// These should be stored in your .env file or using Expo's secure constants
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and anon key must be defined in your environment variables!');
}

// Initialize Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Task-related types
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  task_id: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  category_id?: string;
  date: Date;
  time?: string;
  reminder?: string;
  completed: boolean;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  subtasks?: Subtask[];
  attachments?: Array<{
    id: string;
    uri: string;
    type: string;
    task_id: string;
  }>;
}

// Task service helpers
export const taskService = {
  // Get a task by ID including subtasks and attachments
  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      // Fetch the task
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;
      if (!taskData) return null;

      // Fetch subtasks
      const { data: subtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', taskId);

      if (subtasksError) throw subtasksError;

      // Fetch attachments (if available)
      const { data: attachments, error: attachmentsError } = await supabase
        .from('attachments')
        .select('*')
        .eq('task_id', taskId);

      // Don't throw on attachments error, just log it
      if (attachmentsError) {
        console.error('Error fetching attachments:', attachmentsError);
      }

      return {
        ...taskData,
        date: new Date(taskData.date),
        created_at: new Date(taskData.created_at),
        updated_at: new Date(taskData.updated_at),
        subtasks: subtasks || [],
        attachments: attachments || [],
      };
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  // Update a task
  async updateTask(task: Partial<Task> & { id: string }): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(task)
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        date: new Date(data.date),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Toggle subtask completion
  async toggleSubtaskCompletion(subtaskId: string, completed: boolean): Promise<Subtask> {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .update({ completed })
        .eq('id', subtaskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling subtask completion:', error);
      throw error;
    }
  },
}; 