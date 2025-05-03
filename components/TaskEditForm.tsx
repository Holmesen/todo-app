import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Picker } from '@react-native-picker/picker';
import { ReminderType, TaskWithRelations } from '@/services/taskService';
import { useAddTaskForm } from '@/hooks/useAddTaskForm';

interface SubtaskInput {
  id: number | null;
  title: string;
  completed: boolean;
  isNew?: boolean;
}

interface TaskEditFormProps {
  task: TaskWithRelations;
  onSave: (updatedTask: Partial<TaskWithRelations>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

type CategoryOptions = {
  label: string;
  value: string;
  color: string;
};

const TaskEditForm: React.FC<TaskEditFormProps> = ({ task, onSave, onCancel, isSaving }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [categoryId, setCategoryId] = useState<number | string | null>(task.category_id);
  const [date, setDate] = useState(task.date);
  const [time, setTime] = useState(task.time ? new Date(`2000-01-01T${task.time}`) : null);
  const [reminder, setReminder] = useState(task.reminder || 'none');
  const [subtasks, setSubtasks] = useState<SubtaskInput[]>(
    task.subtasks?.map((st) => ({
      id: st.id,
      title: st.title,
      completed: st.completed,
    })) || []
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [categoryOptions, setCategoryOptions] = useState<CategoryOptions[]>([]);

  const { categories, fetchCategories } = useAddTaskForm();

  // 定义提醒选项
  const REMINDERS = [
    { label: '无', value: 'none' },
    { label: '任务时间', value: 'at_time' },
    { label: '提前5分钟', value: '5min' },
    { label: '提前15分钟', value: '15min' },
    { label: '提前30分钟', value: '30min' },
    { label: '提前1小时', value: '1hour' },
    { label: '提前1天', value: '1day' },
  ];

  // 从UI提醒值映射到数据库提醒类型
  const reminderTypeMap: Record<string, ReminderType> = {
    none: 'none',
    at_time: 'at_time',
    '5min': '5_min_before',
    '15min': '15_min_before',
    '30min': '30_min_before',
    '1hour': '1_hour_before',
    '1day': '1_day_before',
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 格式化分类数据供选择器使用
    setCategoryOptions(
      categories.map((category) => ({
        label: category.name,
        value: category.id?.toString() || '',
        // 可以添加颜色信息用于UI展示
        color: category.color,
      }))
    );
  }, [categories]);

  // 处理日期变更
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      validateForm();
    }
  };

  // 处理时间变更
  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
      validateForm();
    }
  };

  // 添加新子任务
  const addSubtask = () => {
    const newSubtask: SubtaskInput = {
      id: null, // 新子任务没有ID，数据库会自动分配
      title: '',
      completed: false,
      isNew: true,
    };
    setSubtasks([...subtasks, newSubtask]);
  };

  // 更新子任务标题
  const updateSubtaskTitle = (index: number, newTitle: string) => {
    setSubtasks(subtasks.map((st, idx) => (idx === index ? { ...st, title: newTitle } : st)));
  };

  // 切换子任务完成状态
  const toggleSubtaskCompletion = (index: number) => {
    setSubtasks(subtasks.map((st, idx) => (idx === index ? { ...st, completed: !st.completed } : st)));
  };

  // 删除子任务
  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, idx) => idx !== index));
  };

  // 表单验证
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = '标题不能为空';
    }

    const hasEmptySubtasks = subtasks.some((st) => !st.title.trim());
    if (hasEmptySubtasks) {
      errors.subtasks = '所有子任务必须有标题';
    }

    setFormErrors(errors);
    setHasErrors(Object.keys(errors).length > 0);
    return Object.keys(errors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('验证错误', '请在保存前修复错误。');
      return;
    }

    // 如果选择了时间则格式化时间字符串
    const timeString = time ? format(time, 'HH:mm:ss') : null;

    // 将子任务分为已有的和新增的
    const existingSubtasks = subtasks.filter((st) => st.id !== null && !st.isNew);
    const newSubtasks = subtasks.filter((st) => st.isNew || st.id === null);

    // 创建更新后的任务对象
    const updatedTask: Partial<TaskWithRelations> = {
      id: task.id,
      title,
      description: description || null,
      priority,
      category_id: categoryId ? String(categoryId) : null,
      date,
      time: timeString,
      reminder: reminderTypeMap[reminder] || 'none',
      subtasks: [
        // 已有子任务保留ID
        ...existingSubtasks.map((st) => ({
          id: st.id!,
          title: st.title,
          completed: st.completed,
          task_id: task.id,
        })),
        // 新子任务不传ID
        ...newSubtasks.map((st) => ({
          id: null,
          title: st.title,
          completed: st.completed,
          task_id: task.id,
        })),
      ],
    };

    // 调用保存回调
    await onSave(updatedTask);
  };

  // 格式化日期显示
  const formatDate = (date: Date) => {
    try {
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('格式化日期出错:', error);
      return '无效日期';
    }
  };

  // 格式化时间显示
  const formatTime = (time: Date | null) => {
    if (!time) return '未设置';
    try {
      return format(time, 'HH:mm');
    } catch (error) {
      console.error('格式化时间出错:', error);
      return '无效时间';
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.formGroup}>
          <Text style={styles.label}>标题</Text>
          <TextInput
            style={[styles.input, formErrors.title ? styles.inputError : null]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              validateForm();
            }}
            placeholder="任务标题"
          />
          {formErrors.title ? <Text style={styles.errorText}>{formErrors.title}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>描述</Text>
          <TextInput
            style={[styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="任务描述（可选）"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>分类</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoryId}
              onValueChange={(itemValue) => setCategoryId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="无分类" value={null} />
              {categoryOptions.map((category) => (
                <Picker.Item key={category.value} label={category.label} value={category.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>优先级</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={priority}
              onValueChange={(itemValue) => setPriority(itemValue as 'low' | 'medium' | 'high')}
              style={styles.picker}
            >
              <Picker.Item label="低" value="low" />
              <Picker.Item label="中" value="medium" />
              <Picker.Item label="高" value="high" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>截止日期</Text>
          <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
            <FontAwesome name="calendar" size={18} color="#007aff" style={styles.dateTimeIcon} />
            <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
          </TouchableOpacity>
          {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>截止时间（可选）</Text>
          <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
            <FontAwesome name="clock-o" size={18} color="#007aff" style={styles.dateTimeIcon} />
            <Text style={styles.dateTimeText}>{time ? formatTime(time) : '设置时间'}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker value={time || new Date()} mode="time" display="default" onChange={onTimeChange} />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>提醒</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={reminder}
              onValueChange={(itemValue) => setReminder(itemValue as string)}
              style={styles.picker}
            >
              {REMINDERS.map((item) => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.subtasksHeader}>
            <Text style={styles.label}>子任务</Text>
            <TouchableOpacity style={styles.addSubtaskButton} onPress={addSubtask}>
              <FontAwesome name="plus" size={16} color="#007aff" />
              <Text style={styles.addSubtaskText}>添加子任务</Text>
            </TouchableOpacity>
          </View>
          {formErrors.subtasks ? <Text style={styles.errorText}>{formErrors.subtasks}</Text> : null}
          <View style={styles.subtasksList}>
            {subtasks.map((subtask, index) => (
              <View key={index} style={styles.subtaskItem}>
                <TouchableOpacity style={styles.subtaskCheckbox} onPress={() => toggleSubtaskCompletion(index)}>
                  {subtask.completed ? <FontAwesome name="check" size={16} color="#007aff" /> : null}
                </TouchableOpacity>
                <TextInput
                  style={styles.subtaskInput}
                  value={subtask.title}
                  onChangeText={(text) => updateSubtaskTitle(index, text)}
                  placeholder="子任务标题"
                />
                <TouchableOpacity style={styles.subtaskRemoveButton} onPress={() => removeSubtask(index)}>
                  <FontAwesome name="trash" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.formActions}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel} disabled={isSaving}>
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, hasErrors ? styles.disabledButton : null]}
            onPress={handleSubmit}
            disabled={hasErrors || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>保存</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#3A3A3C',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9FB',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9FB',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    backgroundColor: '#F9F9FB',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9F9FB',
  },
  dateTimeIcon: {
    marginRight: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#3A3A3C',
  },
  subtasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addSubtaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addSubtaskText: {
    color: '#007aff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  subtasksList: {
    marginTop: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtaskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9FB',
  },
  subtaskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#F9F9FB',
  },
  subtaskRemoveButton: {
    padding: 8,
    marginLeft: 8,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    color: '#3A3A3C',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007aff',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default TaskEditForm;
