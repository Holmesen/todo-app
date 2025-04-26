import { PostgrestError } from '@supabase/supabase-js';

export type Task = {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  due_date: string | null; // ISO date string
  due_time: string | null; // format: 'HH:MM:SS'
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  reminder_time: string | null; // ISO datetime string
  completed_at: string | null; // ISO datetime string
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
};

export type Category = {
  id: number;
  user_id: number;
  name: string;
  color: string;
  icon: string | null;
  is_featured: boolean;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
};

export type Subtask = {
  id: number;
  task_id: number;
  title: string;
  is_completed: boolean;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  completed_at: string | null; // ISO datetime string
};

export type User = {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  profile_image: string | null;
  time_zone: string;
  theme: string;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  last_login_at: string | null; // ISO datetime string
  is_premium: boolean;
};

export type DatabaseError = PostgrestError;

export type Filter = 'all' | 'today' | 'upcoming' | string; 