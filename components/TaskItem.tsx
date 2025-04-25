import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface TaskItemProps {
  title: string;
  priority: 'high' | 'medium' | 'low';
  time: string;
  onPress: () => void;
}

export function TaskItem({ title, priority, time, onPress }: TaskItemProps) {
  // Define border colors based on priority
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

  // Define priority label colors
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

  return (
    <TouchableOpacity style={styles.taskItem} onPress={onPress}>
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
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
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