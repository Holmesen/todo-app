import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NotificationService } from '../../services/notificationService';
import { syncUserReminders } from '../../lib/notifications';
import { useAuthStore } from '../../store/authStore';
import * as Notifications from 'expo-notifications';
import { Link, useRouter } from 'expo-router';

// 任务通知测试页面
export default function TestNotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<Notifications.NotificationRequest[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 初始化通知和获取权限
  useEffect(() => {
    const initNotifications = async () => {
      const initialized = await NotificationService.initializeNotifications(router);
      setIsInitialized(initialized);

      if (initialized) {
        const { status } = await Notifications.getPermissionsAsync();
        setHasPermission(status === 'granted');
        await Promise.resolve();
        handleSendImmediateNotification();
      }
    };

    initNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 获取已调度的通知
  useEffect(() => {
    const getScheduledNotifications = async () => {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledNotifications(notifications);
    };

    getScheduledNotifications();
  }, [refreshTrigger]);

  // 同步用户提醒
  const handleSyncReminders = async () => {
    if (!user) {
      Alert.alert('错误', '请先登录');
      return;
    }

    try {
      const result = await syncUserReminders(String(user.id));
      if (result) {
        Alert.alert('成功', '已同步用户提醒');
        setRefreshTrigger((prev) => prev + 1); // 触发刷新
      } else {
        Alert.alert('错误', '同步提醒失败');
      }
    } catch (error) {
      console.error('同步提醒出错:', error);
      Alert.alert('错误', '同步提醒失败: ' + String(error));
    }
  };

  // 测试立即发送通知
  const handleSendImmediateNotification = async () => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '测试通知',
          body: '这是一个立即发送的测试通知',
          data: { type: 'immediate' },
        },
        trigger: null, // 立即触发
      });

      Alert.alert('成功', `已发送立即通知，ID: ${notificationId}`);
      setRefreshTrigger((prev) => prev + 1); // 触发刷新
    } catch (error) {
      console.error('发送通知出错:', error);
      Alert.alert('错误', '发送通知失败: ' + String(error));
    }
  };

  // 测试定时通知（5秒后）
  const handleScheduleDelayedNotification = async () => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '延迟通知',
          body: '这是一个5秒后发送的测试通知',
          data: { type: 'delayed' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
        },
      });

      Alert.alert('成功', `已调度5秒后触发的通知，ID: ${notificationId}`);
      setRefreshTrigger((prev) => prev + 1); // 触发刷新
    } catch (error) {
      console.error('发送通知出错:', error);
      Alert.alert('错误', '发送通知失败: ' + String(error));
    }
  };

  // 测试特定时间通知（1分钟后）
  const handleScheduleTimeNotification = async () => {
    try {
      const date = new Date();
      date.setMinutes(date.getMinutes() + 1);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '定时通知',
          body: `这是一个在 ${date.toLocaleTimeString()} 发送的测试通知`,
          data: { type: 'time' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: date.getTime(),
        },
      });

      Alert.alert('成功', `已调度定时通知，触发时间: ${date.toLocaleTimeString()}, ID: ${notificationId}`);
      setRefreshTrigger((prev) => prev + 1); // 触发刷新
    } catch (error) {
      console.error('发送通知出错:', error);
      Alert.alert('错误', '发送通知失败: ' + String(error));
    }
  };

  // 取消所有通知
  const handleCancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert('成功', '已取消所有通知');
      setRefreshTrigger((prev) => prev + 1); // 触发刷新
    } catch (error) {
      console.error('取消通知出错:', error);
      Alert.alert('错误', '取消通知失败: ' + String(error));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="/" style={styles.backButton}>
          <Text style={styles.backButtonText}>返回</Text>
        </Link>
        <Text style={styles.title}>通知测试中心</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知状态</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>初始化状态:</Text>
            <Text style={[styles.statusValue, { color: isInitialized ? 'green' : 'red' }]}>
              {isInitialized ? '已初始化' : '未初始化'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>通知权限:</Text>
            <Text style={[styles.statusValue, { color: hasPermission ? 'green' : 'red' }]}>
              {hasPermission ? '已获取' : '未获取'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知操作</Text>
          <TouchableOpacity
            style={[styles.button, !user && styles.disabledButton]}
            onPress={handleSyncReminders}
            disabled={!user}
          >
            <Text style={styles.buttonText}>同步用户提醒</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSendImmediateNotification}>
            <Text style={styles.buttonText}>发送即时通知</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleScheduleDelayedNotification}>
            <Text style={styles.buttonText}>发送5秒延迟通知</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleScheduleTimeNotification}>
            <Text style={styles.buttonText}>发送1分钟后的通知</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancelAllNotifications}>
            <Text style={styles.buttonText}>取消所有通知</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>已调度的通知 ({scheduledNotifications.length})</Text>
          {scheduledNotifications.length === 0 ? (
            <Text style={styles.emptyText}>暂无已调度的通知</Text>
          ) : (
            scheduledNotifications.map((notification, index) => (
              <View key={notification.identifier} style={styles.notificationItem}>
                <Text style={styles.notificationTitle}>{`#${index + 1} ${notification.content.title}`}</Text>
                <Text style={styles.notificationBody}>{notification.content.body}</Text>
                <Text style={styles.notificationMeta}>ID: {notification.identifier}</Text>
                <Text style={styles.notificationMeta}>触发器: {JSON.stringify(notification.trigger)}</Text>
                <TouchableOpacity
                  style={[styles.button, styles.cancelItemButton]}
                  onPress={async () => {
                    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                    setRefreshTrigger((prev) => prev + 1);
                  }}
                >
                  <Text style={styles.buttonText}>取消此通知</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#007aff',
    paddingTop: 45,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: '#555',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007aff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  cancelItemButton: {
    backgroundColor: '#ff9500',
    padding: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007aff',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  notificationMeta: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    padding: 20,
  },
});
