import { supabase } from '../lib/supabase';
import * as Crypto from 'expo-crypto';

interface UserRegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

interface UserLoginData {
  email: string;
  password: string;
}

interface User {
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

interface UserSettings {
  user_id: number;
  notifications_enabled: boolean;
  app_lock_enabled: boolean;
  data_sync_enabled: boolean;
}

// 辅助函数：哈希密码
async function hashPassword(password: string): Promise<string> {
  const salt = Math.random().toString(36).substring(2, 15);
  const hashedPassword = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt
  );
  return `${salt}:${hashedPassword}`;
}

// 辅助函数：验证密码
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  const calculatedHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt
  );
  return calculatedHash === hash;
}

/**
 * 自定义用户认证服务，使用 schema.sql 中定义的 users 表
 */
export const userAuthService = {
  /**
   * 注册新用户
   */
  async register(userData: UserRegisterData): Promise<User | null> {
    try {
      // 检查邮箱是否已被使用
      const { data: existingUser } = await supabase
        .from('todo_users')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        throw new Error('该邮箱已被注册');
      }

      // 对密码进行哈希处理
      const passwordHash = await hashPassword(userData.password);

      // 开始数据库事务
      // 注意：由于 Supabase JavaScript 客户端不直接支持事务，
      // 我们将分两步操作，并在出错时尝试回滚

      // 1. 插入新用户
      const { data: newUser, error: userError } = await supabase
        .from('todo_users')
        .insert([
          {
            username: userData.username,
            email: userData.email,
            password_hash: passwordHash,
            full_name: userData.fullName,
            time_zone: 'UTC+8', // 默认中国时区
            theme: 'light',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (userError) {
        throw userError;
      }

      // 2. 为新用户创建默认设置
      const defaultSettings: UserSettings = {
        user_id: newUser.id,
        notifications_enabled: true,
        app_lock_enabled: false,
        data_sync_enabled: true
      };

      const { error: settingsError } = await supabase
        .from('todo_user_settings')
        .insert([defaultSettings]);

      // 如果创建设置失败，尝试删除刚创建的用户
      if (settingsError) {
        console.error('创建用户设置失败:', settingsError);

        // 尝试删除用户（回滚）
        const { error: deleteError } = await supabase
          .from('todo_users')
          .delete()
          .eq('id', newUser.id);

        if (deleteError) {
          console.error('回滚用户创建失败:', deleteError);
        }

        throw new Error('创建用户设置失败，注册过程已回滚');
      }

      return newUser as User;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  },

  /**
   * 用户登录
   */
  async login(loginData: UserLoginData): Promise<User | null> {
    try {
      // 根据邮箱查找用户
      const { data: user, error } = await supabase
        .from('todo_users')
        .select('*')
        .eq('email', loginData.email)
        .single();

      if (error || !user) {
        throw new Error('用户不存在');
      }

      // 验证密码
      const isPasswordValid = await verifyPassword(loginData.password, user.password_hash);

      if (!isPasswordValid) {
        throw new Error('密码错误');
      }

      // 更新最后登录时间
      const { error: updateError } = await supabase
        .from('todo_users')
        .update({
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('更新登录时间失败:', updateError);
      }

      return user as User;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  /**
   * 获取当前登录用户信息
   */
  async getCurrentUser(userId: number): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('todo_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return user as User;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  },

  /**
   * 获取用户设置
   */
  async getUserSettings(userId: number): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('todo_user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data as UserSettings;
    } catch (error) {
      console.error('获取用户设置失败:', error);
      return null;
    }
  },

  /**
   * 更新用户信息
   */
  async updateUserProfile(
    userId: number,
    updates: Partial<Omit<User, 'id' | 'created_at' | 'password_hash'>>
  ): Promise<User | null> {
    try {
      const { data: updatedUser, error } = await supabase
        .from('todo_users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedUser as User;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  },
};