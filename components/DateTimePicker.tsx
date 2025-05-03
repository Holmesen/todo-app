import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 日期时间选择器属性接口
interface DateTimePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
  error?: string;
}

/**
 * 日期时间选择器组件
 * 提供日期或时间的选择功能
 */
export function DateTimePicker({ label, value, onChange, mode = 'date', error }: DateTimePickerProps) {
  const [show, setShow] = useState(false);

  // 处理日期变更
  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  // 获取显示文本
  const getDisplayText = () => {
    if (!value) return '选择';

    if (mode === 'date') {
      return format(value, 'yyyy年MM月dd日', { locale: zhCN });
    } else {
      return format(value, 'HH:mm', { locale: zhCN });
    }
  };

  // 获取图标
  const getIcon = () => {
    return mode === 'date' ? 'calendar' : 'clock-o';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.pickerButton, error && styles.pickerButtonError]} onPress={() => setShow(true)}>
        <FontAwesome name={getIcon()} size={16} color="#8E8E93" style={styles.icon} />
        <Text style={styles.valueText}>{getDisplayText()}</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {show && (
        <RNDateTimePicker
          value={value || new Date()}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333333',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    padding: 12,
  },
  pickerButtonError: {
    borderColor: '#FF3B30',
  },
  icon: {
    marginRight: 8,
  },
  valueText: {
    fontSize: 16,
    color: '#000000',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});
