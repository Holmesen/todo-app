import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

// Import taskService and types
import { taskService, TaskWithRelations } from '@/services/taskService';
// Import TaskEditForm component
import TaskEditForm from '@/components/TaskEditForm';

// Define the Priority type
type Priority = 'high' | 'medium' | 'low';

export default function TaskDetailScreen() {
  const { id: taskId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [task, setTask] = useState<TaskWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    fetchTaskDetails(taskId.toString());
  }, [taskId]);

  // Function to fetch task details from Supabase using taskService
  async function fetchTaskDetails(id: string) {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const taskData = await taskService.getTaskById(id);
      if (!taskData) {
        throw new Error('Task not found');
      }

      setTask(taskData);
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load task details');
    } finally {
      setIsLoading(false);
    }
  }

  // Function to toggle subtask completion
  const toggleSubtaskCompletion = async (subtaskId: number) => {
    if (!task) return;

    try {
      // Find the current subtask
      const subtask = task.subtasks?.find((st) => st.id === subtaskId);
      if (!subtask) return;

      // Optimistic UI update
      setTask((prevTask) => {
        if (!prevTask) return null;

        return {
          ...prevTask,
          subtasks: prevTask.subtasks?.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st)),
        };
      });

      // Update in Supabase via taskService
      await taskService.toggleSubtaskCompletion(subtaskId, !subtask.completed);
    } catch (err) {
      console.error('Error updating subtask:', err);
      Alert.alert('Error', 'Failed to update subtask');
      // Revert the optimistic update
      if (taskId) fetchTaskDetails(taskId.toString());
    }
  };

  // Function to save task edits
  const saveTaskEdits = async (updatedTask: Partial<TaskWithRelations>) => {
    if (!task) return;

    setIsSaving(true);
    try {
      // First, update the task basic information
      const baseUpdateData = {
        id: updatedTask.id!,
        title: updatedTask.title!,
        description: updatedTask.description,
        priority: updatedTask.priority!,
        date: updatedTask.date!,
        time: updatedTask.time || null,
      };

      // Update task in Supabase
      await taskService.updateTask(baseUpdateData);

      // Handle subtasks updates
      if (updatedTask.subtasks) {
        // 分离子任务为已有的和新增的
        const existingSubtasks = updatedTask.subtasks.filter((st) => st.id !== null);
        const newSubtasks = updatedTask.subtasks.filter((st) => st.id === null);

        // 获取数据库中当前的子任务
        const { data: currentSubtasks } = await supabase.from('todo_subtasks').select('id').eq('task_id', task.id);

        const currentSubtaskIds = Array.from(new Set(currentSubtasks?.map((st) => st.id) || []));
        const updatedSubtaskIds = Array.from(new Set(existingSubtasks.map((st) => st.id)));

        // 找出要删除的子任务（在当前数据库中但不在更新列表中）
        const subtasksIdsToDelete = currentSubtaskIds.filter((id) => !updatedSubtaskIds.includes(id)) || [];

        // 删除子任务
        for (const subtaskId of subtasksIdsToDelete) {
          console.log('subtaskId: ', subtaskId);
          await supabase.from('todo_subtasks').delete().eq('id', subtaskId);
        }

        // 更新现有子任务
        for (const subtask of existingSubtasks) {
          await supabase
            .from('todo_subtasks')
            .update({
              title: subtask.title,
              is_completed: subtask.completed,
            })
            .eq('id', subtask.id);
        }

        // 添加新子任务
        if (newSubtasks.length > 0) {
          const newSubtasksData = newSubtasks.map((st) => ({
            task_id: task.id,
            title: st.title,
            is_completed: st.completed,
          }));

          await supabase.from('todo_subtasks').insert(newSubtasksData);
        }
      }

      // Refresh task data
      fetchTaskDetails(task.id);
      setShowEditModal(false);
      Alert.alert('Success', 'Task updated successfully');
    } catch (err) {
      console.error('Error updating task:', err);
      Alert.alert('Error', 'Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to mark task as complete
  const completeTask = async () => {
    if (!task) return;

    Alert.alert('Complete Task', 'Are you sure you want to mark this task as complete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          setIsSaving(true);
          try {
            await taskService.updateTask({
              id: task.id,
              completed: true,
            });

            setTask((prevTask) => (prevTask ? { ...prevTask, completed: true } : null));
            Alert.alert('Success', 'Task marked as complete');
            setTimeout(() => router.back(), 1500);
          } catch (err) {
            console.error('Error completing task:', err);
            Alert.alert('Error', 'Failed to complete task');
          } finally {
            setIsSaving(false);
          }
        },
      },
    ]);
  };

  // Function to edit task
  const editTask = () => {
    if (task) {
      setShowEditModal(true);
    }
  };

  // Function to delete task
  const deleteTask = () => {
    if (!task) return;

    Alert.alert('Delete Task', 'Are you sure you want to delete this task? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsSaving(true);
          try {
            await taskService.deleteTask(task.id);
            Alert.alert('Success', 'Task deleted successfully');
            setTimeout(() => router.back(), 1500);
          } catch (err) {
            console.error('Error deleting task:', err);
            Alert.alert('Error', 'Failed to delete task');
          } finally {
            setIsSaving(false);
          }
        },
      },
    ]);
  };

  // Calculate completed subtasks
  const completedSubtasks = task?.subtasks?.filter((st) => st.completed)?.length || 0;
  const totalSubtasks = task?.subtasks?.length || 0;

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
  const getPriorityStyles = (priority: Priority) => {
    switch (priority) {
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

  const priorityStyles = task ? getPriorityStyles(task.priority) : { backgroundColor: '#e3f2fd', color: '#007aff' };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => taskId && fetchTaskDetails(taskId.toString())}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No task found
  if (!task) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Task not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={16} color="#007aff" />
          <Text style={styles.backButtonText}>Tasks</Text>
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
          <View style={[styles.priorityBadge, { backgroundColor: priorityStyles.backgroundColor }]}>
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
                {formatDate(task.date)}
                {task.time ? `, ${task.time}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.taskMeta}>
            {task.category && (
              <View style={styles.metaItem}>
                <FontAwesome name="folder" size={14} color="#007aff" style={styles.metaIcon} />
                <Text style={styles.metaText}>{task.category}</Text>
              </View>
            )}
            {task.reminder && (
              <View style={styles.metaItem}>
                <FontAwesome name="bell" size={14} color="#007aff" style={styles.metaIcon} />
                <Text style={styles.metaText}>{task.reminder}</Text>
              </View>
            )}
          </View>

          {/* Description Section */}
          {task.description && (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.taskDescription}>{task.description}</Text>
            </>
          )}

          {/* Subtasks Section */}
          {task.subtasks && task.subtasks.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                Subtasks ({completedSubtasks}/{totalSubtasks})
              </Text>
              <View style={styles.subtasksList}>
                {task.subtasks.map((subtask) => (
                  <TouchableOpacity
                    key={subtask.id}
                    style={styles.subtaskItem}
                    onPress={() => toggleSubtaskCompletion(subtask.id!)}
                  >
                    <View style={[styles.subtaskCheckbox, subtask.completed && styles.subtaskCheckboxChecked]}>
                      {subtask.completed && <FontAwesome name="check" size={12} color="#FFFFFF" />}
                    </View>
                    <Text style={[styles.subtaskTitle, subtask.completed && styles.subtaskTitleCompleted]}>
                      {subtask.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Attachments Section */}
          {task.attachments && task.attachments.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Attachments</Text>
              <View style={styles.attachments}>
                {task.attachments.map((attachment) => (
                  <TouchableOpacity
                    key={attachment.id}
                    style={styles.attachment}
                    onPress={() =>
                      Alert.alert('View Attachment', 'Attachment viewer will be available in a future update.')
                    }
                  >
                    <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
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
              style={[styles.actionBtn, styles.btnComplete, (isSaving || task.completed) && styles.disabledButton]}
              onPress={completeTask}
              disabled={isSaving || task.completed}
            >
              <FontAwesome name="check" size={16} color="#FFFFFF" style={styles.actionBtnIcon} />
              <Text style={styles.btnCompleteText}>{task.completed ? '已完成' : '完成'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.btnEdit, isSaving && styles.disabledButton]}
              onPress={editTask}
              disabled={isSaving}
            >
              <FontAwesome name="edit" size={16} color="#3A3A3C" style={styles.actionBtnIcon} />
              <Text style={styles.btnEditText}>修改</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.btnDelete, isSaving && styles.disabledButton]}
              onPress={deleteTask}
              disabled={isSaving}
            >
              <FontAwesome name="trash" size={16} color="#FFFFFF" style={styles.actionBtnIcon} />
              <Text style={styles.btnDeleteText}>删除</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Task Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEditModal(false)}
              disabled={isSaving}
            >
              <FontAwesome name="times" size={20} color="#3A3A3C" />
            </TouchableOpacity>
          </View>
          {task && (
            <TaskEditForm
              task={task}
              onSave={saveTaskEdits}
              onCancel={() => setShowEditModal(false)}
              isSaving={isSaving}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007aff',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  disabledButton: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  modalCloseButton: {
    padding: 5,
  },
});
