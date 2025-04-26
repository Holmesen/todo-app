import { useState } from 'react';
import { Alert } from 'react-native';
import { format } from 'date-fns';

import { useAuthStore } from '../store/authStore';
import { taskService, TaskPriority, ReminderType, TaskStatus } from '../services/taskService';
import { categoryService } from '../services/categoryService';
import { Category } from '../services/categoryService';

// 表单数据类型
export interface AddTaskFormData {
  title: string;
  description: string;
  category: string | null;
  date: Date;
  time: Date | null;
  priority: TaskPriority;
  reminder: string;
  subtasks: string[];
}

// 默认表单数据
const defaultFormData: AddTaskFormData = {
  title: '',
  description: '',
  category: null,
  date: new Date(),
  time: new Date(),
  priority: 'medium',
  reminder: 'none',
  subtasks: [],
};

// 从UI提醒值映射到数据库提醒类型
const reminderTypeMap: Record<string, ReminderType> = {
  'none': 'none',
  'at_time': 'at_time',
  '5min': '5_min_before',
  '15min': '15_min_before',
  '30min': '30_min_before',
  '1hour': '1_hour_before',
  '1day': '1_day_before',
};

export function useAddTaskForm() {
  // 表单状态
  const [formData, setFormData] = useState<AddTaskFormData>(defaultFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [newSubtask, setNewSubtask] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);

  // 从认证存储中获取用户
  const { nativeUser, user, authMethod } = useAuthStore();

  // 根据认证方式获取用户ID
  const getUserId = (): number => {
    if (authMethod === 'native' && nativeUser) {
      return nativeUser.id;
    } else if (authMethod === 'supabase' && user) {
      // 对于Supabase认证，我们需要从profiles表中获取user_id
      // 这是一个简化 - 您可能需要根据实际的数据库结构进行调整
      return parseInt(user.id);
    }
    throw new Error('用户未认证');
  };

  // 钩子挂载时获取分类
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const userId = getUserId();
      const { data, error } = await categoryService.getCategories(userId);

      if (error) throw error;
      if (data) {
        setCategories(data);

        // 如果有可用分类，设置默认分类
        if (data.length > 0 && !formData.category) {
          setFormData(prev => ({
            ...prev,
            category: data[0].id?.toString() || null
          }));
        }
      }
    } catch (error) {
      console.error('获取分类出错:', error);
      Alert.alert('错误', '无法加载分类');
    } finally {
      setCategoriesLoading(false);
    }
  };

  // 更新表单数据
  const updateFormData = (key: keyof AddTaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // 处理添加子任务
  const handleAddSubtask = () => {
    if (showSubtaskInput) {
      if (newSubtask.trim()) {
        updateFormData('subtasks', [...formData.subtasks, newSubtask]);
        setNewSubtask('');
      }
      setShowSubtaskInput(false);
    } else {
      setShowSubtaskInput(true);
    }
  };

  // 处理移除子任务
  const handleRemoveSubtask = (index: number) => {
    const updatedSubtasks = [...formData.subtasks];
    updatedSubtasks.splice(index, 1);
    updateFormData('subtasks', updatedSubtasks);
  };

  // 重置表单数据
  const resetForm = () => {
    setFormData(defaultFormData);
    setNewSubtask('');
    setShowSubtaskInput(false);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      // 验证表单
      if (!formData.title.trim()) {
        Alert.alert('错误', '请输入任务标题');
        return;
      }

      setLoading(true);

      const userId = getUserId();
      const categoryId = formData.category ? parseInt(formData.category) : null;

      // 格式化日期和时间
      const dueDate = format(formData.date, 'yyyy-MM-dd');
      const dueTime = formData.time ? format(formData.time, 'HH:mm:ss') : null;

      // 转换提醒类型
      const reminderType = reminderTypeMap[formData.reminder] || 'none';

      // 如果需要，计算提醒时间
      const reminderTime = formData.reminder !== 'none' && dueDate
        ? taskService.calculateReminderTime(dueDate, dueTime, reminderType)
        : null;

      // 创建任务输入
      const taskInput = {
        task: {
          user_id: userId,
          category_id: categoryId,
          title: formData.title,
          description: formData.description || null,
          due_date: dueDate,
          due_time: dueTime,
          priority: formData.priority,
          status: 'pending' as TaskStatus,
          reminder_time: reminderTime,
          completed_at: null,
        },
        subtasks: formData.subtasks.map(title => ({
          title,
          is_completed: false,
        })),
        reminder: reminderType !== 'none' && reminderTime
          ? {
            reminder_type: reminderType,
            reminder_time: reminderTime,
            is_sent: false,
          }
          : undefined,
      };

      // 保存任务到Supabase
      const { data, error } = await taskService.createTask(taskInput);

      if (error) throw error;

      // 成功
      Alert.alert('成功', '任务创建成功！');
      resetForm();
      return data;

    } catch (error) {
      console.error('创建任务出错:', error);
      Alert.alert('错误', (error as Error).message || '创建任务失败');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    updateFormData,
    newSubtask,
    setNewSubtask,
    showSubtaskInput,
    setShowSubtaskInput,
    handleAddSubtask,
    handleRemoveSubtask,
    handleSubmit,
    loading,
    resetForm,
    categories,
    categoriesLoading,
    fetchCategories,
  };
} 