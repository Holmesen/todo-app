import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

interface TaskItemProps {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  time: string;
  onPress?: (id: string) => void;
}

export function TaskItem({ id, title, priority, time, onPress }: TaskItemProps) {
  // 根据优先级定义边框颜色
  const getBorderColor = () => {
    switch (priority) {
      case 'high':
        return '#ff3b30';
      case 'medium':
        return '#ff9500';
      case 'low':
        return '#34c759';
      default:
        return '#007aff';
    }
  };

  // 定义优先级标签颜色
  const getPriorityColors = () => {
    switch (priority) {
      case 'high':
        return {
          bg: '#ffebe6',
          text: '#ff3b30',
          border: '#ff9489',
        };
      case 'medium':
        return {
          bg: '#fff4e6',
          text: '#ff9500',
          border: '#ffcc80',
        };
      case 'low':
        return {
          bg: '#e6f9f5',
          text: '#34c759',
          border: '#87dfa8',
        };
      default:
        return {
          bg: '#e3f2fd',
          text: '#007aff',
          border: '#64b5f6',
        };
    }
  };

  const borderColor = getBorderColor();
  const priorityColors = getPriorityColors();

  // 处理任务项点击
  const handlePress = () => {
    if (onPress) {
      onPress(id);
    }
  };

  // 翻译优先级显示文本
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    }
  };

  return (
    <TouchableOpacity style={styles.taskItem} onPress={handlePress}>
      <View style={[styles.taskCheckbox, { borderColor }]}>
        <FontAwesome name="check" size={12} color="white" />
      </View>
      <View style={styles.taskDetails}>
        <Text style={styles.taskTitle}>{title}</Text>
        <View style={styles.taskMeta}>
          <View
            style={[
              styles.taskCategory,
              {
                backgroundColor: priorityColors.bg,
                borderColor: priorityColors.border,
              },
            ]}
          >
            <Text style={{ color: priorityColors.text, fontSize: 12, fontWeight: '500' }}>
              {getPriorityText(priority)}
            </Text>
          </View>
          <Text style={styles.taskTime}>{time}</Text>
        </View>
      </View>
      <FontAwesome name="chevron-right" size={14} color="#8e8e93" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  taskItem: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontWeight: '600',
    fontSize: 17,
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCategory: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
  },
  taskTime: {
    fontSize: 13,
    color: '#8e8e93',
  },
}); 