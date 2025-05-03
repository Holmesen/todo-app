import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PrioritySelectorProps {
  selectedPriority: string;
  onSelectPriority: (priority: string) => void;
  label?: string;
}

// 优先级选项及其配置
const PRIORITIES = [
  {
    id: 'low',
    label: '低',
    colors: {
      bg: '#e6f9f5',
      border: '#87dfa8',
      text: '#34c759',
    },
  },
  {
    id: 'medium',
    label: '中',
    colors: {
      bg: '#fff4e6',
      border: '#ffcc80',
      text: '#ff9500',
    },
  },
  {
    id: 'high',
    label: '高',
    colors: {
      bg: '#ffebe6',
      border: '#ff9489',
      text: '#ff3b30',
    },
  },
];

/**
 * 优先级选择器组件
 * 用于选择任务优先级的按钮组
 */
export function PrioritySelector({ selectedPriority, onSelectPriority, label = '优先级' }: PrioritySelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.priorityButtons}>
        {PRIORITIES.map((priority) => {
          const isSelected = selectedPriority === priority.id;
          return (
            <TouchableOpacity
              key={priority.id}
              style={[
                styles.priorityButton,
                {
                  backgroundColor: isSelected ? priority.colors.bg : 'transparent',
                  borderColor: isSelected ? priority.colors.border : '#D1D1D6',
                },
              ]}
              onPress={() => onSelectPriority(priority.id)}
            >
              <Text style={[styles.priorityButtonText, { color: isSelected ? priority.colors.text : '#8E8E93' }]}>
                {priority.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333333',
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  priorityButtonText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
