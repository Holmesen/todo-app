import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// 自定义组件
import { HeaderBar } from '../../components/HeaderBar';
import { FormInput } from '../../components/FormInput';
import { FormSelect } from '../../components/FormSelect';
import { DateTimePicker } from '../../components/DateTimePicker';
import { PrioritySelector } from '../../components/PrioritySelector';
import { SubtaskList } from '../../components/Subtask';
import { AttachmentPicker } from '../../components/AttachmentPicker';

// 自定义钩子
import { useAddTaskForm } from '../../hooks/useAddTaskForm';

// 按钮组件
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false
}: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.outlineButton,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#007AFF'} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            isPrimary ? styles.primaryButtonText : styles.outlineButtonText,
            disabled && styles.disabledButtonText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function AddTaskScreen() {
  const insets = useSafeAreaInsets();

  // 使用自定义表单钩子
  const {
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
    categories,
    categoriesLoading,
    fetchCategories,
  } = useAddTaskForm();

  // 组件挂载时获取分类数据
  useEffect(() => {
    fetchCategories();
  }, []);

  // 格式化分类数据供选择器使用
  const categoryOptions = categories.map(category => ({
    label: category.name,
    value: category.id?.toString() || '',
  }));

  // 保存并返回上一页
  const handleSave = async () => {
    const result = await handleSubmit();
    if (result) {
      // 保存成功后返回
      router.back();
    }
  };

  // 取消并返回
  const handleCancel = () => {
    router.back();
  };

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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{
            paddingBottom: 20 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          <HeaderBar title="添加任务" onSave={handleSave} />

          {/* 任务表单 */}
          <FormInput
            label="任务标题"
            placeholder="请输入任务标题"
            value={formData.title}
            onChangeText={(text) => updateFormData('title', text)}
          />

          <FormInput
            label="任务描述"
            placeholder="请输入任务描述"
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.textArea}
          />

          <FormSelect
            label="类别"
            value={formData.category || ''}
            onValueChange={(value) => updateFormData('category', value)}
            items={categoryOptions}
            isLoading={categoriesLoading}
          />

          <View style={styles.formGroup}>
            <View style={styles.row}>
              <DateTimePicker
                label="日期"
                mode="date"
                value={formData.date}
                onChange={(date) => updateFormData('date', date)}
              />
              <DateTimePicker
                label="时间"
                mode="time"
                value={formData.time || new Date()}
                onChange={(time) => updateFormData('time', time)}
              />
            </View>
          </View>

          <PrioritySelector
            selectedPriority={formData.priority}
            onSelectPriority={(priority) => updateFormData('priority', priority)}
          />

          <FormSelect
            label="提醒"
            value={formData.reminder}
            onValueChange={(value) => updateFormData('reminder', value)}
            items={REMINDERS}
          />

          <AttachmentPicker onPress={() => Alert.alert('即将推出', '附件功能将在未来版本中提供。')} />

          <View style={styles.formGroup}>
            <SubtaskList
              subtasks={formData.subtasks}
              onRemoveSubtask={handleRemoveSubtask}
              onAddSubtask={handleAddSubtask}
            />

            {showSubtaskInput && (
              <TextInput
                style={styles.subtaskInput}
                value={newSubtask}
                onChangeText={setNewSubtask}
                placeholder="请输入子任务"
                autoFocus
                onBlur={() => {
                  if (!newSubtask.trim()) {
                    setShowSubtaskInput(false);
                  }
                }}
                onSubmitEditing={handleAddSubtask}
                returnKeyType="done"
              />
            )}
          </View>

          <Button
            title="保存任务"
            onPress={handleSave}
            variant="primary"
            loading={loading}
            disabled={!formData.title.trim()}
          />
          <Button title="取消" onPress={handleCancel} variant="outline" disabled={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  subtaskInput: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    fontSize: 15,
    marginTop: 8,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#A5CFFF',
    borderColor: '#A5CFFF',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  outlineButtonText: {
    color: '#007AFF',
  },
  disabledButtonText: {
    color: '#FFFFFF',
  },
}); 