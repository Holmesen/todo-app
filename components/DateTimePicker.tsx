import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';

interface DateTimePickerProps {
  label: string;
  mode: 'date' | 'time';
  value: Date;
  onChange: (date: Date) => void;
  format?: string;
}

export function DateTimePicker({
  label,
  mode,
  value,
  onChange,
  format: dateFormat
}: DateTimePickerProps) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    onChange(date);
    hideDatePicker();
  };

  const getFormattedValue = () => {
    if (mode === 'date') {
      return format(value, dateFormat || 'yyyy-MM-dd');
    } else {
      return format(value, dateFormat || 'HH:mm');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={showDatePicker}>
        <Text style={styles.inputText}>{getFormattedValue()}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode={mode}
        date={value}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3A3A3C',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    backgroundColor: '#FFFFFF',
  },
  inputText: {
    fontSize: 16,
    color: '#000000',
  },
}); 