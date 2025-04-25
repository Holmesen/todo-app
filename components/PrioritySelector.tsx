import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Priority = 'low' | 'medium' | 'high';

interface PrioritySelectorProps {
  selectedPriority: Priority;
  onSelectPriority: (priority: Priority) => void;
}

export function PrioritySelector({ selectedPriority, onSelectPriority }: PrioritySelectorProps) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>Priority</Text>
      <View style={styles.priorityOptions}>
        <TouchableOpacity
          style={[
            styles.priorityOption,
            selectedPriority === 'low' && styles.selectedOption,
          ]}
          onPress={() => onSelectPriority('low')}
        >
          <Text
            style={[
              styles.priorityText,
              selectedPriority === 'low' && styles.selectedOptionText,
            ]}
          >
            Low
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.priorityOption,
            selectedPriority === 'medium' && styles.selectedOption,
          ]}
          onPress={() => onSelectPriority('medium')}
        >
          <Text
            style={[
              styles.priorityText,
              selectedPriority === 'medium' && styles.selectedOptionText,
            ]}
          >
            Medium
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.priorityOption,
            selectedPriority === 'high' && styles.selectedOption,
          ]}
          onPress={() => onSelectPriority('high')}
        >
          <Text
            style={[
              styles.priorityText,
              selectedPriority === 'high' && styles.selectedOptionText,
            ]}
          >
            High
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3A3A3C',
    marginBottom: 8,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    fontWeight: '500',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    backgroundColor: '#F9F9F9',
  },
  priorityText: {
    fontWeight: '500',
    fontSize: 15,
    color: '#000000',
  },
  selectedOption: {
    backgroundColor: '#F2F9FF',
    borderColor: '#007AFF',
  },
  selectedOptionText: {
    color: '#007AFF',
  },
}); 