import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { ServiceResponse } from './taskService';

// Category type based on database schema
export interface Category {
  id?: number;
  user_id: number;
  name: string;
  color: string;
  icon: string | null;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

class CategoryService {
  /**
   * Get all categories for a user
   */
  async getUserCategories(userId: number): Promise<ServiceResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from('todo_categories')
        .select('*')
        // .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  }

  /**
   * Get featured categories for a user
   */
  async getFeaturedCategories(userId: number): Promise<ServiceResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from('todo_categories')
        .select('*')
        // .eq('user_id', userId)
        .eq('is_featured', true)
        .order('name', { ascending: true });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching featured categories:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  }

  /**
   * Create a new category
   */
  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from('todo_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating category:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  }

  /**
   * Update a category
   */
  async updateCategory(id: number, category: Partial<Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<ServiceResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from('todo_categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating category:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: number): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('todo_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: null, error: null };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  }
}

export const categoryService = new CategoryService(); 