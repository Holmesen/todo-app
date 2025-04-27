import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { z } from 'zod';
import { useAuthStore } from 'store/authStore';

// Category schema using Zod
const CategorySchema = z.object({
  id: z.union([z.string(), z.number()]).transform((v) => v.toString()),
  name: z.string(),
  color: z.string(),
  icon: z.string().optional(),
  user_id: z.union([z.string(), z.number()]).transform((v) => v.toString()),
  created_at: z.string().transform((str) => new Date(str)),
  updated_at: z.string().transform((str) => new Date(str)),
  // Handle both is_featured and featured field names
  featured: z
    .union([
      z.boolean(),
      z.literal(1).transform(() => true),
      z.literal(0).transform(() => false),
      z.literal('true').transform(() => true),
      z.literal('false').transform(() => false),
    ])
    .optional()
    .default(false)
    .or(z.object({ is_featured: z.boolean() }).transform((obj) => obj.is_featured)),
});

export type Category = z.infer<typeof CategorySchema>;

interface UseCategoriesReturn {
  categories: Category[];
  featuredCategories: Category[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从认证存储中获取用户
  const { user } = useAuthStore();

  // 根据认证方式获取用户ID
  const getUserId = (): number => {
    if (user) {
      return user.id;
    }
    throw new Error('用户未认证');
  };

  // Fetch categories from Supabase
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getUserId();

      // Fetch categories from Supabase
      const { data, error } = await supabase
        .from('todo_categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      // Parse the data with Zod schema
      const parsedCategories = data.map((category) => {
        try {
          return CategorySchema.parse(category);
        } catch (err) {
          console.error('Error parsing category:', category, err);
          throw err;
        }
      });

      setCategories(parsedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Get featured categories
  const featuredCategories = categories.filter((category) => category.featured);

  return {
    categories,
    featuredCategories,
    isLoading,
    error,
    refetch: fetchCategories,
  };
}
