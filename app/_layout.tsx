import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { AuthProvider } from '../context/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationService } from '../services/notificationService';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { checkMissedReminders, refreshActiveReminders } from '../lib/notifications';

function AppStateManager() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // 初始化通知系统
    const initNotifications = async () => {
      await NotificationService.initializeNotifications(router);

      if (user) {
        await checkMissedReminders(user.id.toString());
        await refreshActiveReminders(user.id.toString());
      }
    };

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && user) {
        // 应用回到前台时
        console.log('应用恢复前台，检查提醒');

        // 检查错过的提醒
        const missedCount = await checkMissedReminders(user.id.toString());
        if (missedCount > 0) {
          console.log(`发现 ${missedCount} 个错过的提醒`);
        }

        // 刷新活跃提醒
        await refreshActiveReminders(user.id.toString());
      }
    };

    // 注册应用状态变化监听器
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    initNotifications();

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return null; // 这是一个纯逻辑组件，不渲染任何UI
}

// 应用入口布局组件
export default function RootLayout() {
  return (
    <AuthProvider>
      <AppStateManager />
      <SafeAreaView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'white' },
          }}
        />
      </SafeAreaView>
    </AuthProvider>
  );
}
