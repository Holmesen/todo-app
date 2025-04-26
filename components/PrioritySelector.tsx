import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// 任务优先级类型
export type TaskPriority = 'low' | 'medium' | 'high';

// 优先级选择器属性接口
interface PrioritySelectorProps {
  selectedPriority: TaskPriority;
  onSelectPriority: (priority: TaskPriority) => void;
}

export function PrioritySelector({ selectedPriority, onSelectPriority }: PrioritySelectorProps) {
  // 优先级选项
  const priorities: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'low', label: '低', color: '#30C48D' },
    { value: 'medium', label: '中', color: '#FF9500' },
    { value: 'high', label: '高', color: '#FF2D55' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>优先级</Text>
      <View style={styles.buttonsContainer}>
        {priorities.map((priority) => (
          <TouchableOpacity
            key={priority.value}
            style={[
              styles.priorityButton,
              {
                backgroundColor: selectedPriority === priority.value ? priority.color : 'transparent',
                borderColor: priority.color
              }
            ]}
            onPress={() => onSelectPriority(priority.value)}
          >
            <Text
              style={[
                styles.priorityText,
                { color: selectedPriority === priority.value ? '#FFFFFF' : priority.color },
              ]}
            >
              {priority.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3A3A3C',
    marginBottom: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 15,
    fontWeight: '600',
  },
}); 