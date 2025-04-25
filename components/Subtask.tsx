import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface SubtaskItemProps {
  title: string;
  onRemove: () => void;
}

export function SubtaskItem({ title, onRemove }: SubtaskItemProps) {
  return (
    <View style={styles.subtaskItem}>
      <Text style={styles.subtaskTitle}>{title}</Text>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <FontAwesome name="times" size={16} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );
}

interface SubtaskListProps {
  subtasks: string[];
  onRemoveSubtask: (index: number) => void;
  onAddSubtask: () => void;
}

export function SubtaskList({ subtasks, onRemoveSubtask, onAddSubtask }: SubtaskListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Subtasks</Text>

      <View style={styles.subtaskList}>
        {subtasks.map((subtask, index) => (
          <SubtaskItem
            key={index}
            title={subtask}
            onRemove={() => onRemoveSubtask(index)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.addSubtaskBtn} onPress={onAddSubtask}>
        <FontAwesome name="plus-circle" size={16} color="#007AFF" style={styles.addSubtaskIcon} />
        <Text style={styles.addSubtaskText}>Add Subtask</Text>
      </TouchableOpacity>
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
  subtaskList: {
    marginTop: 12,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginBottom: 8,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 15,
  },
  removeButton: {
    padding: 4,
  },
  addSubtaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginTop: 8,
  },
  addSubtaskIcon: {
    marginRight: 8,
  },
  addSubtaskText: {
    color: '#007AFF',
    fontWeight: '600',
  },
}); 