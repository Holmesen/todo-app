import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface FormSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: Array<{ label: string; value: string }>;
}

export function FormSelect({ label, value, onValueChange, items }: FormSelectProps) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          {items.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50, // Fixed height for better appearance
  },
}); 