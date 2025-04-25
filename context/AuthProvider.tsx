import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore, AuthMethod } from '../store/authStore';

// 创建认证上下文
interface AuthContextType {
  signOut: () => Promise<void>;
  authMethod: AuthMethod | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// 自定义钩子，用于使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 定义需要认证的路由组
const protectedRoutes = ['(app)'];

// 认证屏幕路径
const authScreenPaths = [
  '/screens/LoginScreen',
  '/screens/RegisterScreen',
  '/screens/NativeLoginScreen',
  '/screens/NativeRegisterScreen'
];

// 检查当前路由是否受保护
function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 检查是否在受保护的路由中
    const inProtectedRoute = segments.length > 0 && protectedRoutes.includes(segments[0]);

    // 检查当前路径是否为认证屏幕
    const currentPath = '/' + segments.join('/');
    const inAuthScreen = authScreenPaths.some(path => currentPath.startsWith(path));

    // 如果用户没有登录且路由受保护，则重定向到登录页面
    if (!isAuthenticated && inProtectedRoute) {
      router.replace('/screens/LoginScreen');
    } else if (isAuthenticated && inAuthScreen) {
      // 如果用户已登录但在登录或注册页面，则重定向到主页
      // router.replace('/');
    }
  }, [isAuthenticated, segments, router]);
}

// 认证提供者组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    session,
    nativeUser,
    authMethod,
    initialize,
    signOut,
    isLoading
  } = useAuthStore();

  // 判断用户是否已认证 (Supabase 或 原生认证)
  const isAuthenticated = !!session || !!nativeUser;

  // 在组件挂载时初始化会话
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 使用保护路由逻辑
  useProtectedRoute(isAuthenticated);

  // 如果正在加载，则显示加载指示器
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ signOut, authMethod }}>
      {children}
    </AuthContext.Provider>
  );
} 