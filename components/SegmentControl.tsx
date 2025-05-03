import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SegmentOption {
  label: string;
  value: string | number;
}

interface SegmentControlProps {
  options: SegmentOption[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
}

/**
 * 分段控制组件
 * 提供多选一的选项组，常用于过滤或视图切换
 */
export function SegmentControl({ options, selectedValue, onValueChange }: SegmentControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        return (
          <TouchableOpacity
            key={option.value.toString()}
            style={[styles.option, isSelected && styles.selectedOption]}
            onPress={() => onValueChange(option.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 2,
    marginBottom: 16,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  selectedOption: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  selectedOptionText: {
    color: '#000000',
    fontWeight: '600',
  },
});
