import { supabase } from './supabase';
import { NotificationService } from '../services/notificationService';
import * as Notifications from 'expo-notifications';
import { formatISO, parseISO, isPast } from 'date-fns';

// 定义数据库返回的提醒类型
interface DbReminder {
  id: number;
  task_id: number;
  reminder_type: string;
  reminder_time: string;
  is_sent: boolean;
  todo_tasks: {
    id: number;
    title: string;
    description: string | null;
    due_date: string;
    due_time: string | null;
    user_id: number;
  };
}

/**
 * 同步用户所有提醒并调度通知
 * @param userId 用户ID
 */
export async function syncUserReminders(userId: string): Promise<boolean> {
  try {
    // 获取所有未发送且未过期的提醒
    const { data: reminders, error } = await supabase
      .from('todo_reminders')
      .select(
        `
        id,
        task_id,
        reminder_type,
        reminder_time,
        is_sent,
        todo_tasks!inner (
          id,
          title,
          description,
          due_date,
          due_time,
          user_id
        )
      `
      )
      .eq('is_sent', false)
      .eq('todo_tasks.user_id', userId)
      .gte('reminder_time', formatISO(new Date()))
      .order('reminder_time', { ascending: true });

    if (error) {
      console.error('获取提醒时出错:', error);
      return false;
    }

    if (!reminders || reminders.length === 0) {
      // 没有需要同步的提醒
      return true;
    }

    // 转换提醒格式用于通知服务
    const formattedReminders = (reminders as unknown as DbReminder[]).map((reminder) => ({
      id: reminder.id.toString(),
      taskId: reminder.task_id.toString(),
      reminderTime: reminder.reminder_time,
      title: '任务提醒',
      content: `【${reminder.todo_tasks.title}】即将到期`,
    }));

    // 使用通知服务同步提醒
    return await NotificationService.syncReminders(formattedReminders);
  } catch (error) {
    console.error('同步用户提醒时出错:', error);
    return false;
  }
}

/**
 * 标记提醒为已发送
 * @param reminderId 提醒ID
 */
export async function markReminderAsSent(reminderId: string | number): Promise<boolean> {
  try {
    const { error } = await supabase.from('todo_reminders').update({ is_sent: true }).eq('id', reminderId);

    if (error) {
      console.error('标记提醒为已发送时出错:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('标记提醒为已发送时出错:', error);
    return false;
  }
}

/**
 * 为特定任务创建或更新提醒
 * @param taskId 任务ID
 * @param title 任务标题
 * @param dueDate 截止日期
 * @param dueTime 截止时间
 * @param reminderType 提醒类型
 */
export async function setupTaskReminder(
  taskId: string | number,
  title: string,
  dueDate: string,
  dueTime: string | null,
  reminderType: string
): Promise<string | number | null> {
  try {
    if (reminderType === 'none') {
      // 如果没有提醒，删除所有与此任务相关的提醒
      await deleteTaskReminders(taskId);
      return null;
    }

    // 计算提醒时间
    const reminderTime = calculateReminderTime(dueDate, dueTime, reminderType);
    console.log('reminderTime: ', reminderTime);
    if (!reminderTime) return null;

    // 检查是否已经存在相同任务的提醒
    const { data: existingReminder, error: checkError } = await supabase
      .from('todo_reminders')
      .select('id')
      .eq('task_id', taskId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = not found
      console.error('检查现有提醒出错:', checkError);
    }

    let reminderId;

    // 更新或创建提醒记录
    if (existingReminder) {
      // 更新提醒
      const { data, error } = await supabase
        .from('todo_reminders')
        .update({
          reminder_type: reminderType,
          reminder_time: formatISO(reminderTime),
          is_sent: false,
        })
        .eq('id', existingReminder.id)
        .select()
        .single();

      if (error) {
        console.error('更新提醒时出错:', error);
        return null;
      }

      reminderId = data.id;
    } else {
      // 创建新提醒
      const { data, error } = await supabase
        .from('todo_reminders')
        .insert({
          task_id: taskId,
          reminder_type: reminderType,
          reminder_time: formatISO(reminderTime),
          is_sent: false,
        })
        .select()
        .single();

      if (error) {
        console.error('创建提醒时出错:', error);
        return null;
      }

      reminderId = data.id;
    }

    // 如果提醒时间已过，则标记为已发送
    if (isPast(reminderTime)) {
      await markReminderAsSent(reminderId);
      return reminderId;
    }

    return reminderId;
  } catch (error) {
    console.error('设置任务提醒时出错:', error);
    return null;
  }
}

/**
 * 删除任务的所有提醒
 * @param taskId 任务ID
 */
export async function deleteTaskReminders(taskId: string | number): Promise<boolean> {
  try {
    // 获取任务所有提醒的ID
    const { data, error } = await supabase.from('todo_reminders').select('id').eq('task_id', taskId);

    if (error) {
      console.error('获取任务提醒时出错:', error);
      return false;
    }

    // 如果存在提醒，删除它们
    if (data && data.length > 0) {
      // 从数据库中删除提醒
      const { error: deleteError } = await supabase.from('todo_reminders').delete().eq('task_id', taskId);

      if (deleteError) {
        console.error('删除提醒记录时出错:', deleteError);
        return false;
      }

      // 取消相关通知
      for (const reminder of data) {
        await NotificationService.cancelReminderNotification(reminder.id.toString());
      }
    }

    return true;
  } catch (error) {
    console.error('删除任务提醒时出错:', error);
    return false;
  }
}

// 在应用启动或恢复前台时调用
export async function checkMissedReminders(userId: string) {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 获取过去24小时内且未发送的提醒
  const { data: missedReminders } = await supabase
    .from('todo_reminders')
    .select(
      `
      id, 
      reminder_time,
      is_sent,
      todo_tasks!inner (
        id,
        title,
        description
      )
    `
    )
    .eq('is_sent', false)
    .eq('todo_tasks.user_id', userId)
    .gte('reminder_time', formatISO(twentyFourHoursAgo))
    .lte('reminder_time', formatISO(now))
    .order('reminder_time', { ascending: false });

  console.log('missedReminders: ', missedReminders);

  if (missedReminders && missedReminders.length > 0) {
    // 显示错过的提醒通知
    for (const reminder of missedReminders) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '错过的任务提醒',
          body: `您错过了任务 "${(reminder.todo_tasks as any).title}" 的提醒`,
          data: { taskId: (reminder.todo_tasks as any).id, missed: true },
        },
        trigger: null, // 立即显示
      });

      // 标记为已发送
      await supabase.from('todo_reminders').update({ is_sent: true }).eq('id', reminder.id);
    }

    return missedReminders.length;
  }

  return 0;
}

// 在应用恢复到前台时调用
export async function refreshActiveReminders(userId: string) {
  try {
    // 1. 取消所有现有的通知
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 2. 重新调度未来的提醒
    const { data: activeReminders } = await supabase
      .from('todo_reminders')
      .select(
        `
          id,
          task_id,
          reminder_type,
          reminder_time,
          is_sent,
          todo_tasks!inner (
            id,
            title,
            description,
            user_id
          )
        `
      )
      .eq('is_sent', false)
      .eq('todo_tasks.user_id', userId)
      .gte('reminder_time', formatISO(new Date()))
      .order('reminder_time', { ascending: true });

    console.log('activeReminders: ', activeReminders);

    if (!activeReminders || activeReminders.length === 0) return true;

    console.log(`找到 ${activeReminders.length} 个活跃提醒需要刷新`);

    // 3. 为每个活跃提醒设置通知
    const formattedReminders = activeReminders.map((reminder) => ({
      id: reminder.id.toString(),
      taskId: reminder.task_id.toString(),
      reminderTime: reminder.reminder_time,
      title: '任务提醒',
      content: `【${reminder.todo_tasks.map((task) => task.title).join(', ')}】即将到期`,
    }));

    // 4. 使用通知服务同步提醒
    return await NotificationService.syncReminders(formattedReminders);
  } catch (error) {
    console.error('刷新活跃提醒时出错:', error);
    return false;
  }
}

/**
 * 计算提醒时间
 * @param dueDate 截止日期
 * @param dueTime 截止时间
 * @param reminderType 提醒类型
 */
function calculateReminderTime(dueDate: string, dueTime: string | null, reminderType: string): Date | null {
  if (reminderType === 'none') return null;

  // 创建完整的到期日期时间
  let dueDateTime: Date;
  if (dueTime) {
    // 如果有具体时间，则合并日期和时间
    const [hours, minutes] = dueTime.split(':').map(Number);
    const date = parseISO(dueDate);
    dueDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
  } else {
    // 如果没有具体时间，默认为当天上午9点
    const date = parseISO(dueDate);
    dueDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0);
  }

  // 根据提醒类型计算提醒时间
  switch (reminderType) {
    case 'at_time':
      return dueDateTime;
    case '5_min_before':
      return new Date(dueDateTime.getTime() - 5 * 60 * 1000);
    case '15_min_before':
      return new Date(dueDateTime.getTime() - 15 * 60 * 1000);
    case '30_min_before':
      return new Date(dueDateTime.getTime() - 30 * 60 * 1000);
    case '1_hour_before':
      return new Date(dueDateTime.getTime() - 60 * 60 * 1000);
    case '1_day_before':
      return new Date(dueDateTime.getTime() - 24 * 60 * 60 * 1000);
    default:
      return dueDateTime;
  }
}
