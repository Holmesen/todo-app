import { create } from 'zustand';
import { Category, categoryService } from '../services/categoryService';
import { useAuthStore } from './authStore';
import { Task, taskService, TaskStatus } from '../services/taskService';

// Define category with stats
export interface CategoryWithStats extends Category {
  taskCount: number;
  completedCount: number;
  progressPercentage: number;
}

interface CategoryState {
  // Category data
  categories: Category[];
  categoriesWithStats: CategoryWithStats[];
  featuredCategories: CategoryWithStats[];
  searchQuery: string;

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchCategoriesWithStats: (options?: { forceRefresh?: boolean }) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<Category | null>;
  updateCategory: (
    id: number,
    category: Partial<Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  setSearchQuery: (query: string) => void;
  getFilteredCategories: () => CategoryWithStats[];
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  // Category data
  categories: [],
  categoriesWithStats: [],
  featuredCategories: [],
  searchQuery: '',

  // UI state
  isLoading: false,
  isSaving: false,
  error: null,

  // Fetch all categories
  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });

      // Get user ID from auth store
      const { user } = useAuthStore.getState();

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Fetch categories from service
      const { data, error } = await categoryService.getCategories(String(user.id));

      if (error) throw error;

      set({ categories: data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({
        error: (error as Error).message || 'Failed to fetch categories',
        isLoading: false,
      });
    }
  },

  // Fetch categories with task stats
  fetchCategoriesWithStats: async (options = {}) => {
    const { forceRefresh = false } = options;

    try {
      // If there's already data and we don't need to force refresh, don't re-fetch
      if (get().categoriesWithStats.length > 0 && !forceRefresh) {
        return;
      }

      set({ isLoading: true, error: null });

      // Get user ID from auth store
      const { user } = useAuthStore.getState();

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Fetch all categories
      const { data: categories, error: categoriesError } = await categoryService.getCategories(String(user.id));

      if (categoriesError) throw categoriesError;

      // Fetch all tasks to calculate stats
      const { data: tasks, error: tasksError } = await taskService.getUserTasks(String(user.id));

      if (tasksError) throw tasksError;

      // Calculate stats for each category
      const categoriesWithStats = (categories || []).map((category) => {
        const categoryTasks = (tasks || []).filter((task) => {
          // Handle string or number ID comparison safely
          const taskCategoryId = task.category_id ? Number(task.category_id) : null;
          return taskCategoryId === category.id;
        });

        const taskCount = categoryTasks.length;
        const completedCount = categoryTasks.filter((task) => {
          // Access the status field if it exists, otherwise use the completed flag
          return 'status' in task ? task.status === ('completed' as TaskStatus) : task.completed === true;
        }).length;

        const progressPercentage = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

        return {
          ...category,
          taskCount,
          completedCount,
          progressPercentage,
        };
      });

      // Filter featured categories
      const featuredCategories = categoriesWithStats.filter((category) => category.is_featured);

      set({
        categories: categories || [],
        categoriesWithStats,
        featuredCategories,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching categories with stats:', error);
      set({
        error: (error as Error).message || 'Failed to fetch category statistics',
        isLoading: false,
      });
    }
  },

  // Add a new category
  addCategory: async (category) => {
    try {
      set({ isSaving: true, error: null });

      const { data, error } = await categoryService.createCategory(category);

      if (error) throw error;

      if (data) {
        // Update local state
        set((state) => ({
          categories: [...state.categories, data],
          isSaving: false,
        }));

        // Refresh categories with stats to include the new category
        await get().fetchCategoriesWithStats({ forceRefresh: true });
      }

      return data;
    } catch (error) {
      console.error('Error adding category:', error);
      set({
        error: (error as Error).message || 'Failed to add category',
        isSaving: false,
      });
      return null;
    }
  },

  // Update a category
  updateCategory: async (id, categoryUpdate) => {
    try {
      set({ isSaving: true, error: null });

      const { error } = await categoryService.updateCategory(id, categoryUpdate);

      if (error) throw error;

      // Update local state
      set((state) => ({
        categories: state.categories.map((cat) => (cat.id === id ? { ...cat, ...categoryUpdate } : cat)),
        isSaving: false,
      }));

      // Refresh categories with stats
      await get().fetchCategoriesWithStats({ forceRefresh: true });
    } catch (error) {
      console.error('Error updating category:', error);
      set({
        error: (error as Error).message || 'Failed to update category',
        isSaving: false,
      });
    }
  },

  // Delete a category
  deleteCategory: async (id) => {
    try {
      set({ isSaving: true, error: null });

      const { error } = await categoryService.deleteCategory(id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
        categoriesWithStats: state.categoriesWithStats.filter((cat) => cat.id !== id),
        featuredCategories: state.featuredCategories.filter((cat) => cat.id !== id),
        isSaving: false,
      }));
    } catch (error) {
      console.error('Error deleting category:', error);
      set({
        error: (error as Error).message || 'Failed to delete category',
        isSaving: false,
      });
    }
  },

  // Set search query
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  // Get filtered categories based on search query
  getFilteredCategories: () => {
    const { categoriesWithStats, searchQuery } = get();

    if (!searchQuery.trim()) {
      return categoriesWithStats;
    }

    return categoriesWithStats.filter((category) => category.name.toLowerCase().includes(searchQuery.toLowerCase()));
  },
}));
