import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import FeedbackForm from '../../components/FeedbackForm';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

export default function FeedbackScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 将反馈提交到数据库
  const handleSubmitFeedback = async (feedback: {
    feedbackType: string;
    title: string;
    description: string;
    screenshotUrl?: string;
  }) => {
    try {
      if (!user?.id) {
        Alert.alert('错误', '您需要登录后才能提交反馈');
        return;
      }

      setIsSubmitting(true);

      // 获取设备信息
      const deviceName = Device.deviceName || '未知设备';
      const osName = Platform.OS === 'ios' ? 'iOS' : 'Android';
      const osVersion = Platform.Version.toString();
      const appVersion = Constants.expoConfig?.version || '1.0.0';
      const deviceInfo = `${deviceName}, ${osName} ${osVersion}`;

      // 准备提交到Supabase的数据
      const feedbackData = {
        user_id: user.id,
        feedback_type: feedback.feedbackType,
        title: feedback.title,
        description: feedback.description,
        app_version: appVersion,
        device_info: deviceInfo,
        screenshot_url: feedback.screenshotUrl,
        // 默认状态为submitted
        status: 'submitted',
      };

      // 提交到数据库
      const { error } = await supabase.from('todo_user_feedback').insert(feedbackData);

      if (error) {
        throw error;
      }

      // 成功提交后显示提示
      Alert.alert('提交成功', '感谢您的反馈！我们会认真处理您的意见和建议。', [
        {
          text: '返回首页',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error) {
      console.error('提交反馈失败:', error);
      Alert.alert('提交失败', '很抱歉，提交反馈时发生错误，请稍后再试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    // 用户未登录，显示提示或重定向
    Alert.alert('提示', '请先登录后再提交反馈', [
      {
        text: '确定',
        onPress: () => router.back(),
      },
    ]);
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '用户反馈',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#fff',
          },
        }}
      />
      <FeedbackForm onSubmit={handleSubmitFeedback} isSubmitting={isSubmitting} userId={String(user.id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
