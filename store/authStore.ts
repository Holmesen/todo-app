import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { userAuthService } from '../services/userAuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 原生用户类型
export interface NativeUser {
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

// 认证方式
export type AuthMethod = 'supabase' | 'native';

interface AuthState {
  // Supabase 认证
  session: Session | null;
  user: User | null;

  // 原生用户认证
  nativeUser: NativeUser | null;

  // 共享状态
  authMethod: AuthMethod | null; // 当前认证方式
  isLoading: boolean;
  error: string | null;

  // Supabase 认证方法
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;

  // 原生用户认证方法
  nativeSignIn: (email: string, password: string) => Promise<void>;
  nativeSignUp: (username: string, email: string, password: string, fullName: string) => Promise<void>;
  nativeSignOut: () => Promise<void>;
}

// 存储原生用户信息的键
const NATIVE_USER_STORAGE_KEY = 'native_user';
const AUTH_METHOD_STORAGE_KEY = 'auth_method';

export const useAuthStore = create<AuthState>((set, get) => ({
  // Supabase 认证
  session: null,
  user: null,

  // 原生用户认证
  nativeUser: null,

  // 共享状态
  authMethod: null,
  isLoading: true,
  error: null,

  // 初始化 - 检查现有会话
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // 1. 检查认证方式
      const authMethodStr = await AsyncStorage.getItem(AUTH_METHOD_STORAGE_KEY);
      const authMethod = authMethodStr ? authMethodStr as AuthMethod : null;

      // 2. 根据认证方式加载用户信息
      if (authMethod === 'native') {
        // 从 AsyncStorage 加载原生用户
        const nativeUserStr = await AsyncStorage.getItem(NATIVE_USER_STORAGE_KEY);
        if (nativeUserStr) {
          const nativeUser = JSON.parse(nativeUserStr) as NativeUser;
          set({
            nativeUser,
            authMethod: 'native',
            isLoading: false
          });
        } else {
          set({ isLoading: false });
        }
      } else {
        // 获取 Supabase 会话
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data?.session) {
          set({
            session: data.session,
            user: data.session.user,
            authMethod: 'supabase',
            isLoading: false
          });
        } else {
          set({ isLoading: false });
        }
      }
    } catch (error) {
      console.error('初始化会话时出错:', error);
      set({
        error: (error as Error).message,
        isLoading: false
      });
    }
  },

  // Supabase 登录方法
  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // 登录成功后设置用户和会话
      set({
        session: data.session,
        user: data.user,
        authMethod: 'supabase',
        isLoading: false
      });

      // 保存认证方式
      await AsyncStorage.setItem(AUTH_METHOD_STORAGE_KEY, 'supabase');
    } catch (error) {
      console.error('Supabase 登录时出错:', error);
      set({
        error: (error as Error).message,
        isLoading: false
      });
    }
  },

  // Supabase 注册方法
  signUp: async (email: string, password: string, fullName: string) => {
    try {
      set({ isLoading: true, error: null });

      // 注册用户
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // 添加用户元数据
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      // 注册成功后，设置用户和会话
      if (data.session) {
        set({
          session: data.session,
          user: data.user,
          authMethod: 'supabase',
          isLoading: false
        });

        // 保存认证方式
        await AsyncStorage.setItem(AUTH_METHOD_STORAGE_KEY, 'supabase');
      } else {
        // 在某些情况下，注册后可能需要电子邮件确认
        set({
          isLoading: false,
          error: '注册成功！请检查您的电子邮件以确认您的帐户。'
        });
      }
    } catch (error) {
      console.error('Supabase 注册时出错:', error);
      set({
        error: (error as Error).message,
        isLoading: false
      });
    }
  },

  // 原生用户登录方法
  nativeSignIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      // 调用原生登录服务
      const nativeUser = await userAuthService.login({ email, password });

      if (!nativeUser) {
        throw new Error('登录失败');
      }

      // 存储用户信息到 AsyncStorage
      await AsyncStorage.setItem(NATIVE_USER_STORAGE_KEY, JSON.stringify(nativeUser));
      await AsyncStorage.setItem(AUTH_METHOD_STORAGE_KEY, 'native');

      // 更新状态
      set({
        nativeUser,
        authMethod: 'native',
        isLoading: false
      });
    } catch (error) {
      console.error('原生登录时出错:', error);
      set({
        error: (error as Error).message,
        isLoading: false
      });
    }
  },

  // 原生用户注册方法
  nativeSignUp: async (username: string, email: string, password: string, fullName: string) => {
    try {
      set({ isLoading: true, error: null });

      // 调用原生注册服务
      const nativeUser = await userAuthService.register({
        username,
        email,
        password,
        fullName
      });

      if (!nativeUser) {
        throw new Error('注册失败');
      }

      // 存储用户信息到 AsyncStorage
      await AsyncStorage.setItem(NATIVE_USER_STORAGE_KEY, JSON.stringify(nativeUser));
      await AsyncStorage.setItem(AUTH_METHOD_STORAGE_KEY, 'native');

      // 更新状态
      set({
        nativeUser,
        authMethod: 'native',
        isLoading: false
      });
    } catch (error) {
      console.error('原生注册时出错:', error);
      set({
        error: (error as Error).message,
        isLoading: false
      });
    }
  },

  // 登出方法 (适用于两种认证方式)
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });

      const { authMethod } = get();

      if (authMethod === 'native') {
        // 原生用户登出
        await AsyncStorage.removeItem(NATIVE_USER_STORAGE_KEY);
      } else if (authMethod === 'supabase') {
        // Supabase 登出
        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }
      }

      // 清除认证方式
      await AsyncStorage.removeItem(AUTH_METHOD_STORAGE_KEY);

      // 清除会话和用户数据
      set({
        session: null,
        user: null,
        nativeUser: null,
        authMethod: null,
        isLoading: false
      });
    } catch (error) {
      console.error('登出时出错:', error);
      set({
        error: (error as Error).message,
        isLoading: false
      });
    }
  },

  // 原生用户登出方法 (兼容性保留，内部调用 signOut)
  nativeSignOut: async () => {
    await get().signOut();
  },
})); 