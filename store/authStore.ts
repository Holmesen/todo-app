import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { userAuthService } from '../services/userAuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 用户类型
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  profile_image: string | null;
  time_zone: string;
  theme: string;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  is_premium: boolean;
}

interface AuthState {
  // 用户认证
  user: User | null;

  // 共享状态
  isLoading: boolean;
  error: string | null;

  // 用户认证方法
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  // 添加更新用户信息的方法
  updateUser: (userData: Partial<User>) => Promise<void>;
}

// 存储用户信息的键
const USER_STORAGE_KEY = 'user';

export const useAuthStore = create<AuthState>((set, get) => ({
  // 用户认证
  user: null,

  // 共享状态
  isLoading: true,
  error: null,

  // 初始化 - 检查现有会话
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // 从 AsyncStorage 加载用户
      const userStr = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (userStr) {
        const user = JSON.parse(userStr) as User;
        set({
          user,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('初始化会话时出错:', error);
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  // 用户登录方法
  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      // 调用原生登录服务
      const user = await userAuthService.login({ email, password });

      if (!user) {
        throw new Error('登录失败');
      }

      // 存储用户信息到 AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

      // 更新状态
      set({
        user,
        isLoading: false,
      });
    } catch (error) {
      console.error('登录时出错:', error);
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  // 用户注册方法
  signUp: async (username: string, email: string, password: string, fullName: string) => {
    try {
      set({ isLoading: true, error: null });

      // 调用原生注册服务
      const user = await userAuthService.register({
        username,
        email,
        password,
        fullName,
      });

      if (!user) {
        throw new Error('注册失败');
      }

      // 存储用户信息到 AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

      // 更新状态
      set({
        user,
        isLoading: false,
      });
    } catch (error) {
      console.error('注册时出错:', error);
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  // 注销方法
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });

      // 清除存储的用户信息
      await AsyncStorage.removeItem(USER_STORAGE_KEY);

      // 重置状态
      set({
        user: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('注销时出错:', error);
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  // 更新用户信息方法
  updateUser: async (userData: Partial<User>) => {
    try {
      const currentUser = get().user;
      if (!currentUser) {
        throw new Error('没有登录用户');
      }

      // 合并用户数据
      const updatedUser = {
        ...currentUser,
        ...userData,
      };

      // 存储更新后的用户信息到 AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      // 更新状态
      set({
        user: updatedUser,
      });
    } catch (error) {
      console.error('更新用户信息时出错:', error);
      throw error;
    }
  },
}));
