import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

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

export interface CategoryResult {
  data: Category[] | null;
  error: PostgrestError | null;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

class CategoryService {
  /**
   * 获取用户的所有分类
   * @param userId 用户ID
   * @returns 分类数据及任何可能的错误
   */
  async getCategories(userId: number | string): Promise<CategoryResult> {
    const { data, error } = await supabase
      .from('todo_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    return {
      data: (data as Category[]) || null,
      error,
    };
  }

  /**
   * 获取用户的精选分类
   * @param userId 用户ID
   * @returns 精选分类数据及任何可能的错误
   */
  async getFeaturedCategories(userId: number | string): Promise<CategoryResult> {
    const { data, error } = await supabase
      .from('todo_categories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_featured', true)
      .order('name', { ascending: true });

    return {
      data: (data as Category[]) || null,
      error,
    };
  }

  /**
   * 根据ID获取分类
   * @param categoryId 分类ID
   * @returns 分类数据及任何可能的错误
   */
  async getCategoryById(categoryId: number): Promise<{ data: Category | null; error: PostgrestError | null }> {
    const { data, error } = await supabase.from('todo_categories').select('*').eq('id', categoryId).single();

    return {
      data: (data as Category) || null,
      error,
    };
  }

  /**
   * 创建新分类
   */
  async createCategory(
    category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ServiceResponse<Category>> {
    try {
      const { data, error } = await supabase.from('todo_categories').insert(category).select().single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating category:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * 更新分类
   */
  async updateCategory(
    id: number,
    category: Partial<Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<ServiceResponse<Category>> {
    try {
      const { data, error } = await supabase.from('todo_categories').update(category).eq('id', id).select().single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating category:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: number): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase.from('todo_categories').delete().eq('id', id);

      if (error) throw error;

      return { data: null, error: null };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }
}

export const categoryService = new CategoryService();
