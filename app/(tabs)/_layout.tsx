import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          height: 83 - insets.bottom,
          paddingBottom: 30 - insets.bottom,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5EA',
        },
        tabBarItemStyle: {
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: '分类',
          tabBarIcon: ({ color, size }) => <FontAwesome name="folder" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-task"
        options={{
          title: '添加',
          tabBarIcon: ({ color, size }) => <FontAwesome name="plus-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: '统计',
          tabBarIcon: ({ color, size }) => <FontAwesome name="bar-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => <FontAwesome name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
