import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

// Define the SubTask interface
interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

// Define the Attachment interface
interface Attachment {
  id: string;
  uri: string;
  type: string;
}

// Define the Priority type
type Priority = 'high' | 'medium' | 'low';

// Mock task data (in a real app, this would come from a state management solution like Zustand)
const mockTask = {
  id: '1',
  title: 'Complete project proposal',
  description: 'Finalize the project proposal for the client meeting. Include budget estimates, timeline, and resource allocation. Make sure to highlight the key benefits and ROI projections.',
  priority: 'high' as Priority,
  category: 'Work',
  date: new Date(),
  time: '9:00 AM - 11:00 AM',
  reminder: '30 min before',
  subtasks: [
    { id: '1', title: 'Research market trends', completed: true },
    { id: '2', title: 'Draft initial proposal', completed: true },
    { id: '3', title: 'Create budget estimates', completed: false },
    { id: '4', title: 'Review with team', completed: false },
  ],
  attachments: [
    {
      id: '1',
      uri: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9jdW1lbnR8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
      type: 'image',
    },
    {
      id: '2',
      uri: 'https://images.unsplash.com/photo-1664575599736-c5197c684153?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGV4Y2VsJTIwc2hlZXR8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
      type: 'image',
    },
  ],
  completed: false,
};

export default function TaskDetailScreen() {
  const { id: taskId } = useLocalSearchParams();

  const insets = useSafeAreaInsets();
  const [task, setTask] = useState(mockTask);

  // Function to toggle subtask completion
  const toggleSubtaskCompletion = (subtaskId: string) => {
    setTask(prevTask => ({
      ...prevTask,
      subtasks: prevTask.subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    }));
  };

  // Function to mark task as complete
  const completeTask = () => {
    Alert.alert(
      'Complete Task',
      'Are you sure you want to mark this task as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            setTask(prevTask => ({ ...prevTask, completed: true }));
            Alert.alert('Success', 'Task marked as complete');
            // In a real app, you would update the task in your state management
            // And navigate back after a delay
            setTimeout(() => router.back(), 1500);
          },
        },
      ]
    );
  };

  // Function to edit task
  const editTask = () => {
    router.push({
      pathname: '/add-task',
      params: { id: taskId }
    });
  };

  // Function to delete task
  const deleteTask = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, you would delete the task from your state management
            Alert.alert('Success', 'Task deleted successfully');
            setTimeout(() => router.back(), 1500);
          },
        },
      ]
    );
  };

  // Calculate completed subtasks
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  // Format date
  const formatDate = (date: Date) => {
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get priority styles
  const getPriorityStyles = () => {
    switch (task.priority) {
      case 'high':
        return {
          backgroundColor: '#ffebe6',
          color: '#ff3b30',
        };
      case 'medium':
        return {
          backgroundColor: '#fff4e6',
          color: '#ff9500',
        };
      case 'low':
        return {
          backgroundColor: '#e6f9f5',
          color: '#34c759',
        };
      default:
        return {
          backgroundColor: '#e3f2fd',
          color: '#007aff',
        };
    }
  };

  const priorityStyles = getPriorityStyles();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={16} color="#007aff" />
          <Text style={styles.backButtonText}>Tasks {taskId}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: 20 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Task Detail Card */}
        <View style={styles.detailCard}>
          {/* Priority Badge */}
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityStyles.backgroundColor }
            ]}
          >
            <Text style={[styles.priorityText, { color: priorityStyles.color }]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Text>
          </View>

          {/* Task Title */}
          <Text style={styles.taskTitle}>{task.title}</Text>

          {/* Task Meta Information */}
          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <FontAwesome name="calendar" size={14} color="#007aff" style={styles.metaIcon} />
              <Text style={styles.metaText}>
                {formatDate(task.date)}, {task.time}
              </Text>
            </View>
          </View>

          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <FontAwesome name="folder" size={14} color="#007aff" style={styles.metaIcon} />
              <Text style={styles.metaText}>{task.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <FontAwesome name="bell" size={14} color="#007aff" style={styles.metaIcon} />
              <Text style={styles.metaText}>{task.reminder}</Text>
            </View>
          </View>

          {/* Description Section */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>

          {/* Subtasks Section */}
          <Text style={styles.sectionTitle}>
            Subtasks ({completedSubtasks}/{totalSubtasks})
          </Text>
          <View style={styles.subtasksList}>
            {task.subtasks.map((subtask) => (
              <TouchableOpacity
                key={subtask.id}
                style={styles.subtaskItem}
                onPress={() => toggleSubtaskCompletion(subtask.id)}
              >
                <View
                  style={[
                    styles.subtaskCheckbox,
                    subtask.completed && styles.subtaskCheckboxChecked
                  ]}
                >
                  {subtask.completed && (
                    <FontAwesome name="check" size={12} color="#FFFFFF" />
                  )}
                </View>
                <Text
                  style={[
                    styles.subtaskTitle,
                    subtask.completed && styles.subtaskTitleCompleted
                  ]}
                >
                  {subtask.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Attachments Section */}
          {task.attachments && task.attachments.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Attachments</Text>
              <View style={styles.attachments}>
                {task.attachments.map((attachment) => (
                  <TouchableOpacity
                    key={attachment.id}
                    style={styles.attachment}
                    onPress={() => Alert.alert('View Attachment', 'Attachment viewer will be available in a future update.')}
                  >
                    <Image
                      source={{ uri: attachment.uri }}
                      style={styles.attachmentImage}
                    />
                    <View style={styles.attachmentIcon}>
                      <FontAwesome name="eye" size={12} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.btnComplete]}
              onPress={completeTask}
            >
              <FontAwesome name="check" size={16} color="#FFFFFF" style={styles.actionBtnIcon} />
              <Text style={styles.btnCompleteText}>完成</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.btnEdit]}
              onPress={editTask}
            >
              <FontAwesome name="edit" size={16} color="#3A3A3C" style={styles.actionBtnIcon} />
              <Text style={styles.btnEditText}>修改</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.btnDelete]}
              onPress={deleteTask}
            >
              <FontAwesome name="trash" size={16} color="#FFFFFF" style={styles.actionBtnIcon} />
              <Text style={styles.btnDeleteText}>删除</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 17,
    color: '#007aff',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 17,
    marginTop: 24,
    marginBottom: 12,
    color: '#3A3A3C',
  },
  taskDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#3A3A3C',
  },
  subtasksList: {
    marginTop: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  subtaskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007aff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskCheckboxChecked: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  subtaskTitle: {
    fontSize: 16,
    color: '#000000',
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  attachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  attachment: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  attachmentIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // marginHorizontal: 6,
  },
  actionBtnIcon: {
    marginRight: 8,
  },
  btnComplete: {
    backgroundColor: '#007aff',
  },
  btnCompleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  btnEdit: {
    backgroundColor: '#E5E5EA',
  },
  btnEditText: {
    color: '#3A3A3C',
    fontWeight: '600',
    fontSize: 16,
  },
  btnDelete: {
    backgroundColor: '#FF3B30',
  },
  btnDeleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});