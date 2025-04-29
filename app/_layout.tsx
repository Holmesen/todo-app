import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

// 应用入口布局组件
export default function RootLayout() {
  return (
    <AuthProvider>
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

// 可选的屏幕组配置
export const unstable_settings = {
  // 初始路由设置为 screens 组
  initialRouteName: 'screens',
};
