import React, { useState } from 'react';
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

// Custom Components
import { HeaderBar } from '../../components/HeaderBar';
import { FormInput } from '../../components/FormInput';
import { FormSelect } from '../../components/FormSelect';
import { DateTimePicker } from '../../components/DateTimePicker';
import { PrioritySelector } from '../../components/PrioritySelector';
import { SubtaskList } from '../../components/Subtask';
import { AttachmentPicker } from '../../components/AttachmentPicker';

// Types for form data
type TaskFormData = {
  title: string;
  description: string;
  category: string;
  date: Date;
  time: Date;
  priority: 'low' | 'medium' | 'high';
  reminder: string;
  subtasks: string[];
};

// Mock data for form selects
const CATEGORIES = [
  { label: 'Work', value: 'work' },
  { label: 'Personal', value: 'personal' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Health', value: 'health' },
  { label: 'Finance', value: 'finance' },
];

const REMINDERS = [
  { label: 'None', value: 'none' },
  { label: 'At time of task', value: 'at_time' },
  { label: '5 minutes before', value: '5min' },
  { label: '15 minutes before', value: '15min' },
  { label: '30 minutes before', value: '30min' },
  { label: '1 hour before', value: '1hour' },
  { label: '1 day before', value: '1day' },
];

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

  // State for form data
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: 'work',
    date: new Date(),
    time: new Date(),
    priority: 'high',
    reminder: '30min',
    subtasks: ['Research market trends', 'Draft initial proposal'],
  });

  // State for adding new subtask
  const [newSubtask, setNewSubtask] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);

  // Handle form submission
  const handleSave = () => {
    // Validate form
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    // In a real app, you would save the data to your backend or state management
    console.log('Saving task:', formData);
    Alert.alert('Success', 'Task saved successfully!');

    // Navigate back to home screen
    // router.back(); // Uncomment this when you're ready to navigate
  };

  // Update form data
  const updateFormData = (key: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Handle adding subtask
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

  // Handle removing subtask
  const handleRemoveSubtask = (index: number) => {
    const updatedSubtasks = [...formData.subtasks];
    updatedSubtasks.splice(index, 1);
    updateFormData('subtasks', updatedSubtasks);
  };

  // Handle picking attachments
  const handlePickAttachment = () => {
    Alert.alert('Feature Coming Soon', 'Attachment functionality will be available in a future update.');
  };

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
          {/* <HeaderBar title="Add Task" onSave={handleSave} /> */}

          {/* Task Form */}
          <FormInput
            label="Task Title"
            placeholder="Enter task title"
            value={formData.title}
            onChangeText={(text) => updateFormData('title', text)}
          />

          <FormInput
            label="Description"
            placeholder="Enter task description"
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.textArea}
          />

          <FormSelect
            label="Category"
            value={formData.category}
            onValueChange={(value) => updateFormData('category', value)}
            items={CATEGORIES}
          />

          <View style={styles.formGroup}>
            <View style={styles.row}>
              <DateTimePicker
                label="Date"
                mode="date"
                value={formData.date}
                onChange={(date) => updateFormData('date', date)}
              />
              <DateTimePicker
                label="Time"
                mode="time"
                value={formData.time}
                onChange={(time) => updateFormData('time', time)}
              />
            </View>
          </View>

          <PrioritySelector
            selectedPriority={formData.priority}
            onSelectPriority={(priority) => updateFormData('priority', priority)}
          />

          <FormSelect
            label="Reminder"
            value={formData.reminder}
            onValueChange={(value) => updateFormData('reminder', value)}
            items={REMINDERS}
          />

          <AttachmentPicker onPress={handlePickAttachment} />

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
                placeholder="Enter subtask"
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

          <Button title="Save Task" onPress={handleSave} variant="primary" />
          <Button title="Cancel" onPress={() => { }} variant="outline" />
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
    backgroundColor: isPrimary => isPrimary ? '#A5CFFF' : 'transparent',
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
    color: isPrimary => isPrimary ? '#FFFFFF' : '#A5CFFF',
  },
}); 