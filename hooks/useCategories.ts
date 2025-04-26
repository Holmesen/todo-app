import { useState, useEffect, useCallback } from 'react';
import { categoryService, Category, CategoryResult } from '../services/categoryService';
import { supabase } from '../lib/supabase';

// 钩子返回类型的接口
interface UseCategoriesReturn {
  categories: Category[];
  featuredCategories: Category[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// 默认用户ID - 在真实应用中，这将来自auth上下文
const DEFAULT_USER_ID = 1;

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 获取所有分类的函数
  const fetchCategories = useCallback(async (): Promise<CategoryResult> => {
    return await categoryService.getCategories(DEFAULT_USER_ID);
  }, []);

  // 获取精选分类的函数
  const fetchFeaturedCategories = useCallback(async (): Promise<CategoryResult> => {
    return await categoryService.getFeaturedCategories(DEFAULT_USER_ID);
  }, []);

  // 重新获取所有分类的函数
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [categoriesResult, featuredResult] = await Promise.all([
        fetchCategories(),
        fetchFeaturedCategories(),
      ]);

      if (categoriesResult.error) {
        throw new Error(categoriesResult.error.message);
      }

      if (featuredResult.error) {
        throw new Error(featuredResult.error.message);
      }

      setCategories(categoriesResult.data || []);
      setFeaturedCategories(featuredResult.data || []);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '获取分类失败';
      setError(errorMessage);
      console.error('获取分类时出错:', e);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCategories, fetchFeaturedCategories]);

  // 初始数据获取
  useEffect(() => {
    refetch();

    // 为分类表设置实时订阅
    const categoriesSubscription = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todo_categories' },
        (payload) => {
          // 当分类发生变化时，重新获取数据
          refetch();
        }
      )
      .subscribe();

    // 清理订阅
    return () => {
      supabase.removeChannel(categoriesSubscription);
    };
  }, [refetch]);

  return {
    categories,
    featuredCategories,
    isLoading,
    error,
    refetch,
  };
} 