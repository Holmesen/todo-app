import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export interface Subtask {
  id: number | null;
  title: string;
  completed: boolean;
}

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (id: number | null) => void;
  onRemove: (id: number | null) => void;
}

/**
 * 单个子任务项组件
 */
function SubtaskItem({ subtask, onToggle, onRemove }: SubtaskItemProps) {
  return (
    <View style={styles.subtaskItem}>
      <TouchableOpacity style={styles.checkbox} onPress={() => onToggle(subtask.id)}>
        {subtask.completed ? (
          <FontAwesome name="check-square-o" size={20} color="#007AFF" />
        ) : (
          <FontAwesome name="square-o" size={20} color="#8E8E93" />
        )}
      </TouchableOpacity>

      <Text style={[styles.subtaskTitle, subtask.completed && styles.completedSubtaskTitle]}>{subtask.title}</Text>

      <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(subtask.id)}>
        <FontAwesome name="times" size={16} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  );
}

interface SubtaskListProps {
  subtasks: Subtask[];
  onRemoveSubtask: (id: number | null) => void;
  onAddSubtask: () => void;
  onToggleSubtask?: (id: number | null) => void;
}

/**
 * 子任务列表组件
 * 显示子任务列表及添加子任务的功能
 */
export function SubtaskList({ subtasks, onRemoveSubtask, onAddSubtask, onToggleSubtask }: SubtaskListProps) {
  // 处理子任务状态切换
  const handleToggle = (id: number | null) => {
    if (onToggleSubtask) {
      onToggleSubtask(id);
    }
  };

  // 处理子任务删除
  const handleRemove = (id: number | null) => {
    Alert.alert('确认删除', '您确定要删除这个子任务吗？', [
      {
        text: '取消',
        style: 'cancel',
      },
      {
        text: '删除',
        onPress: () => onRemoveSubtask(id),
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>子任务</Text>
        <TouchableOpacity onPress={onAddSubtask} style={styles.addButton}>
          <FontAwesome name="plus" size={14} style={styles.addIcon} />
          <Text style={styles.addButtonText}>添加</Text>
        </TouchableOpacity>
      </View>

      {subtasks.length === 0 ? (
        <Text style={styles.emptyText}>没有子任务</Text>
      ) : (
        <View style={styles.subtaskList}>
          {subtasks.map((subtask, index) => (
            <SubtaskItem key={index} subtask={subtask} onToggle={handleToggle} onRemove={handleRemove} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addIcon: {
    color: '#007AFF',
    marginRight: 4,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  subtaskList: {
    marginTop: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  checkbox: {
    marginRight: 10,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 16,
  },
  completedSubtaskTitle: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  removeButton: {
    padding: 8,
  },
});
