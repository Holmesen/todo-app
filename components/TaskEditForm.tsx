import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Picker } from '@react-native-picker/picker';
import { TaskWithRelations } from '@/services/taskService';

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

const TaskEditForm: React.FC<TaskEditFormProps> = ({ task, onSave, onCancel, isSaving }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [date, setDate] = useState(task.date);
  const [time, setTime] = useState(task.time ? new Date(`2000-01-01T${task.time}`) : null);
  const [subtasks, setSubtasks] = useState<SubtaskInput[]>(
    task.subtasks?.map(st => ({
      id: st.id,
      title: st.title,
      completed: st.completed
    })) || []
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      validateForm();
    }
  };

  // Handle time change
  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
      validateForm();
    }
  };

  // Add a new subtask
  const addSubtask = () => {
    const newSubtask: SubtaskInput = {
      id: null, // 新子任务没有ID，数据库会自动分配
      title: '',
      completed: false,
      isNew: true
    };
    setSubtasks([...subtasks, newSubtask]);
  };

  // Update subtask title
  const updateSubtaskTitle = (index: number, newTitle: string) => {
    setSubtasks(
      subtasks.map((st, idx) => (idx === index ? { ...st, title: newTitle } : st))
    );
  };

  // Toggle subtask completion
  const toggleSubtaskCompletion = (index: number) => {
    setSubtasks(
      subtasks.map((st, idx) => (idx === index ? { ...st, completed: !st.completed } : st))
    );
  };

  // Remove subtask
  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, idx) => idx !== index));
  };

  // Validate the form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    }

    const hasEmptySubtasks = subtasks.some(st => !st.title.trim());
    if (hasEmptySubtasks) {
      errors.subtasks = 'All subtasks must have a title';
    }

    setFormErrors(errors);
    setHasErrors(Object.keys(errors).length > 0);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    // Format time string if time is selected
    const timeString = time ? format(time, 'HH:mm:ss') : null;

    // 将子任务分为已有的和新增的
    const existingSubtasks = subtasks.filter(st => st.id !== null && !st.isNew);
    const newSubtasks = subtasks.filter(st => st.isNew || st.id === null);

    // Create updated task object
    const updatedTask: Partial<TaskWithRelations> = {
      id: task.id,
      title,
      description: description || null,
      priority,
      date,
      time: timeString,
      subtasks: [
        // 已有子任务保留ID
        ...existingSubtasks.map(st => ({
          id: st.id!,
          title: st.title,
          completed: st.completed,
          task_id: task.id
        })),
        // 新子任务不传ID
        ...newSubtasks.map(st => ({
          id: null,
          title: st.title,
          completed: st.completed,
          task_id: task.id
        }))
      ]
    };

    try {
      await onSave(updatedTask);
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task changes.');
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  // Format time for display
  const formatTime = (time: Date | null) => {
    if (!time) return 'No time set';
    return format(time, 'h:mm a');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={[styles.input, formErrors.title ? styles.inputError : null]}
            value={title}
            onChangeText={text => {
              setTitle(text);
              validateForm();
            }}
            placeholder="Task title"
          />
          {formErrors.title ? (
            <Text style={styles.errorText}>{formErrors.title}</Text>
          ) : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Task description (optional)"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={priority}
              onValueChange={(itemValue) => setPriority(itemValue as 'low' | 'medium' | 'high')}
              style={styles.picker}
            >
              <Picker.Item label="Low" value="low" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="High" value="high" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <FontAwesome name="calendar" size={18} color="#007aff" style={styles.dateTimeIcon} />
            <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Due Time (Optional)</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <FontAwesome name="clock-o" size={18} color="#007aff" style={styles.dateTimeIcon} />
            <Text style={styles.dateTimeText}>{time ? formatTime(time) : 'Set time'}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time || new Date()}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <View style={styles.subtasksHeader}>
            <Text style={styles.label}>Subtasks</Text>
            <TouchableOpacity style={styles.addSubtaskButton} onPress={addSubtask}>
              <FontAwesome name="plus" size={16} color="#007aff" />
              <Text style={styles.addSubtaskText}>Add Subtask</Text>
            </TouchableOpacity>
          </View>
          {formErrors.subtasks ? (
            <Text style={styles.errorText}>{formErrors.subtasks}</Text>
          ) : null}
          <View style={styles.subtasksList}>
            {subtasks.map((subtask, index) => (
              <View key={index} style={styles.subtaskItem}>
                <TouchableOpacity
                  style={styles.subtaskCheckbox}
                  onPress={() => toggleSubtaskCompletion(index)}
                >
                  {subtask.completed ? (
                    <FontAwesome name="check" size={16} color="#007aff" />
                  ) : null}
                </TouchableOpacity>
                <TextInput
                  style={styles.subtaskInput}
                  value={subtask.title}
                  onChangeText={text => updateSubtaskTitle(index, text)}
                  placeholder="Subtask title"
                />
                <TouchableOpacity
                  style={styles.subtaskRemoveButton}
                  onPress={() => removeSubtask(index)}
                >
                  <FontAwesome name="trash" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.formActions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, hasErrors ? styles.disabledButton : null]}
            onPress={handleSubmit}
            disabled={hasErrors || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
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