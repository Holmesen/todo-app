import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SegmentOption {
  label: string;
  value: string | number;
}

interface SegmentControlProps {
  options: SegmentOption[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
}

export const SegmentControl = ({
  options,
  selectedValue,
  onValueChange
}: SegmentControlProps) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <TouchableOpacity
            key={option.value.toString()}
            style={[
              styles.segment,
              isSelected && styles.selectedSegment
            ]}
            onPress={() => onValueChange(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                isSelected && styles.selectedSegmentText
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 9,
    padding: 2,
    marginBottom: 20,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 7,
  },
  selectedSegment: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  selectedSegmentText: {
    color: '#000000',
  },
}); 