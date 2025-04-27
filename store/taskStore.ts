import { create } from 'zustand';
import { taskService, Task, Subtask, TaskPriority, TaskStatus, CreateTaskInput } from '../services/taskService';
import { Category, categoryService } from '../services/categoryService';
import { useAuthStore } from './authStore';

interface TaskState {
  // Task data
  tasks: Task[];
  categories: Category[];
  selectedTask: (Task & { subtasks: Subtask[] }) | null;

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  categoriesLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTaskById: (taskId: number) => Promise<void>;
  addTask: (task: Task, subtasks?: Omit<Subtask, 'id' | 'task_id'>[]) => Promise<Task | null>;
  completeTask: (taskId: number) => Promise<void>;
  updateTaskStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  updateTaskPriority: (taskId: number, priority: TaskPriority) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Task data
  tasks: [],
  categories: [],
  selectedTask: null,

  // UI state
  isLoading: false,
  isSaving: false,
  categoriesLoading: false,
  error: null,

  // Fetch all tasks for the current user
  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null });

      // Get user ID from auth store
      const { user } = useAuthStore.getState();

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Fetch tasks from service
      const { data, error } = await taskService.getUserTasks(String(user.id));

      if (error) throw error;

      set({ tasks: data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({
        error: (error as Error).message || 'Failed to fetch tasks',
        isLoading: false,
      });
    }
  },

  // Fetch all categories for the current user
  fetchCategories: async () => {
    try {
      set({ categoriesLoading: true, error: null });

      // Get user ID from auth store
      const { user } = useAuthStore.getState();

      // Determine user ID based on auth method
      let userId: number;
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Fetch categories from service
      const { data, error } = await categoryService.getCategories(String(user.id));

      if (error) throw error;

      set({ categories: data || [], categoriesLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({
        error: (error as Error).message || 'Failed to fetch categories',
        categoriesLoading: false,
      });
    }
  },

  // Fetch a single task by ID
  fetchTaskById: async (taskId: number) => {
    try {
      set({ isLoading: true, error: null });

      // Fetch task with subtasks
      const data = await taskService.getTaskById(taskId);

      set({ selectedTask: (data as TaskState['selectedTask']) || null, isLoading: false });
    } catch (error) {
      console.error('Error fetching task:', error);
      set({
        error: (error as Error).message || 'Failed to fetch task details',
        isLoading: false,
      });
    }
  },

  // Add a new task
  addTask: async (task: Task, subtasks?: Omit<Subtask, 'id' | 'task_id'>[]) => {
    try {
      set({ isSaving: true, error: null });

      // Create task input
      const taskInput = {
        ...task,
        subtasks: subtasks || [],
      };

      // Create task
      const { data, error } = await taskService.createTask(taskInput as unknown as CreateTaskInput);

      if (error) throw error;

      // 将DbTask转换为Task类型
      const transformedTask = data
        ? ({
            ...data,
            date: new Date(data.due_date || Date.now()),
            completed: data.status === 'completed',
          } as unknown as Task)
        : null;

      // Update tasks list
      if (transformedTask) {
        set(
          (state) =>
            ({
              tasks: [...state.tasks, transformedTask],
              isSaving: false,
            } as TaskState)
        );
      }

      return transformedTask;
    } catch (error) {
      console.error('Error adding task:', error);
      set({
        error: (error as Error).message || 'Failed to add task',
        isSaving: false,
      });
      return null;
    }
  },

  // Mark a task as completed
  completeTask: async (taskId: number) => {
    try {
      set({ isSaving: true, error: null });

      // Update task in Supabase (implementation would be in taskService)
      // This is a placeholder for now

      // Update local state
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === String(taskId)
            ? { ...task, status: 'completed' as TaskStatus, completed_at: new Date().toISOString() }
            : task
        ),
        isSaving: false,
      }));
    } catch (error) {
      console.error('Error completing task:', error);
      set({
        error: (error as Error).message || 'Failed to complete task',
        isSaving: false,
      });
    }
  },

  // Update task status
  updateTaskStatus: async (taskId: number, status: TaskStatus) => {
    try {
      set({ isSaving: true, error: null });

      // Update task in Supabase (implementation would be in taskService)
      // This is a placeholder for now

      // Update local state
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === String(taskId) ? { ...task, status } : task)),
        isSaving: false,
      }));
    } catch (error) {
      console.error('Error updating task status:', error);
      set({
        error: (error as Error).message || 'Failed to update task status',
        isSaving: false,
      });
    }
  },

  // Update task priority
  updateTaskPriority: async (taskId: number, priority: TaskPriority) => {
    try {
      set({ isSaving: true, error: null });

      // Update task in Supabase (implementation would be in taskService)
      // This is a placeholder for now

      // Update local state
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === String(taskId) ? { ...task, priority } : task)),
        isSaving: false,
      }));
    } catch (error) {
      console.error('Error updating task priority:', error);
      set({
        error: (error as Error).message || 'Failed to update task priority',
        isSaving: false,
      });
    }
  },

  // Delete a task
  deleteTask: async (taskId: number) => {
    try {
      set({ isSaving: true, error: null });

      // Delete task in Supabase (implementation would be in taskService)
      // This is a placeholder for now

      // Update local state
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== String(taskId)),
        isSaving: false,
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      set({
        error: (error as Error).message || 'Failed to delete task',
        isSaving: false,
      });
    }
  },
}));
