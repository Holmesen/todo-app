import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// 子任务列表属性接口
interface SubtaskListProps {
  subtasks: string[];
  onRemoveSubtask: (index: number) => void;
  onAddSubtask: () => void;
}

// 子任务项组件
function SubtaskItem({ title, onRemove }: { title: string; onRemove: () => void }) {
  return (
    <View style={styles.subtaskItem}>
      <View style={styles.subtaskContent}>
        <MaterialIcons name="check-box-outline-blank" size={20} color="#007AFF" />
        <Text style={styles.subtaskText}>{title}</Text>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <MaterialIcons name="delete-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );
}

// 子任务列表组件
export function SubtaskList({ subtasks, onRemoveSubtask, onAddSubtask }: SubtaskListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>子任务</Text>
        <TouchableOpacity onPress={onAddSubtask} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.addButtonText}>添加子任务</Text>
        </TouchableOpacity>
      </View>

      {subtasks.length > 0 ? (
        <FlatList
          data={subtasks}
          keyExtractor={(item, index) => `subtask-${index}`}
          renderItem={({ item, index }) => (
            <SubtaskItem
              title={item}
              onRemove={() => onRemoveSubtask(index)}
            />
          )}
          style={styles.list}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.emptyText}>没有子任务</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  header: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3A3A3C',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  list: {
    marginTop: 4,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  subtaskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subtaskText: {
    fontSize: 15,
    color: '#000000',
    marginLeft: 10,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
}); 