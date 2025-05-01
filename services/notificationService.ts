import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Router } from 'expo-router';

// 定义与任务关联的提醒类型接口
interface ReminderWithTask {
  id: string;
  taskId: string;
  reminderTime: string; // ISO日期字符串
  title: string;
  content: string;
}

/**
 * 通知服务类
 * 负责管理应用的通知，包括初始化、调度和取消通知
 */
export class NotificationService {
  // 存储提醒ID和通知ID的映射关系的键
  private static REMINDERS_KEY = 'notifications_reminders_map';

  /**
   * 初始化通知系统
   * 设置通知处理程序并请求权限
   */
  static async initializeNotifications(router: Router): Promise<boolean> {
    try {
      // 设置通知处理程序，定义如何展示通知
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // 请求通知权限
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          Alert.alert('通知权限', '未能获取通知权限，请在设置中手动开启');
          return false;
        }
      } else {
        Alert.alert('注意', '必须使用实体设备才能接收通知');
        return false;
      }

      // 注册通知点击监听器
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { notification } = response;
        const data = notification.request.content.data as { taskId?: string };

        // 处理通知点击，可以添加导航到特定任务详情的逻辑
        if (data && data.taskId) {
          console.log(`用户点击了任务ID为${data.taskId}的通知`);
          // 这里可以添加导航逻辑（BUG: 跳转有问题，最后会跳转到首页）
          router.push(`/tasks/details/${data.taskId}`);
        }
      });

      return true;
    } catch (error) {
      console.error('初始化通知失败:', error);
      return false;
    }
  }

  /**
   * 同步提醒到通知系统
   * @param reminders 需要同步的提醒列表
   */
  static async syncReminders(reminders: ReminderWithTask[]): Promise<boolean> {
    try {
      // 取消所有现有的定时通知
      await Notifications.cancelAllScheduledNotificationsAsync();

      // 读取存储的提醒和通知映射
      // const storedMap = await this.getRemindersMap();
      let newMap: Record<string, string> = {};

      // 为每个提醒设置新的通知
      for (const reminder of reminders) {
        // 检查提醒时间是否在未来
        const reminderTime = new Date(reminder.reminderTime);
        if (reminderTime > new Date()) {
          // 创建通知
          const notificationId = await this.scheduleNotification(reminder);
          if (notificationId) {
            newMap[reminder.id] = notificationId;
          }
        }
      }

      // 保存新的映射关系
      await AsyncStorage.setItem(this.REMINDERS_KEY, JSON.stringify(newMap));

      return true;
    } catch (error) {
      console.error('同步提醒失败:', error);
      return false;
    }
  }

  /**
   * 安排单个通知
   * @param reminder 提醒信息
   */
  static async scheduleNotification(reminder: ReminderWithTask): Promise<string | null> {
    try {
      // 确保提醒时间有效
      if (!reminder.reminderTime) {
        console.error('提醒时间无效:', reminder);
        return null;
      }

      // 安排通知
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title || '任务提醒',
          body: reminder.content || '您有一个待处理的任务',
          data: { taskId: reminder.taskId },
          sound: true, // 播放声音
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(reminder.reminderTime).getTime(), // 使用时间戳
        },
      });

      return notificationId;
    } catch (error) {
      console.error('安排通知失败:', error);
      return null;
    }
  }

  /**
   * 取消特定提醒的通知
   * @param reminderId 提醒ID
   */
  static async cancelReminderNotification(reminderId: string): Promise<boolean> {
    try {
      const map = await this.getRemindersMap();
      const notificationId = map[reminderId];

      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);

        // 从映射中删除
        delete map[reminderId];
        await AsyncStorage.setItem(this.REMINDERS_KEY, JSON.stringify(map));
      }

      return true;
    } catch (error) {
      console.error('取消通知失败:', error);
      return false;
    }
  }

  /**
   * 更新特定提醒的通知
   * @param reminder 提醒信息
   */
  static async updateReminderNotification(reminder: ReminderWithTask): Promise<boolean> {
    try {
      // 先取消旧的通知
      await this.cancelReminderNotification(reminder.id);

      // 如果提醒时间在未来，则创建新通知
      const reminderTime = new Date(reminder.reminderTime);
      if (reminderTime > new Date()) {
        const notificationId = await this.scheduleNotification(reminder);

        if (notificationId) {
          // 更新映射
          const map = await this.getRemindersMap();
          map[reminder.id] = notificationId;
          await AsyncStorage.setItem(this.REMINDERS_KEY, JSON.stringify(map));
        }
      }

      return true;
    } catch (error) {
      console.error('更新通知失败:', error);
      return false;
    }
  }

  /**
   * 获取提醒和通知的映射关系
   * @private
   */
  private static async getRemindersMap(): Promise<Record<string, string>> {
    try {
      const mapJson = await AsyncStorage.getItem(this.REMINDERS_KEY);
      return mapJson ? JSON.parse(mapJson) : {};
    } catch (error) {
      console.error('获取提醒映射失败:', error);
      return {};
    }
  }
}
