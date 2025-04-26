import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RNDateTimePicker from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 日期时间选择器属性接口
interface DateTimePickerProps {
  label: string;
  mode: 'date' | 'time';
  value: Date;
  onChange: (date: Date) => void;
}

export function DateTimePicker({ label, mode, value, onChange }: DateTimePickerProps) {
  // 控制选择器是否显示的状态
  const [isPickerVisible, setPickerVisible] = useState(false);

  // 格式化显示的日期或时间
  const formatValue = () => {
    if (mode === 'date') {
      return format(value, 'yyyy年MM月dd日', { locale: zhCN });
    } else {
      return format(value, 'HH:mm');
    }
  };

  // 处理日期时间变更
  const handleConfirm = (date: Date) => {
    onChange(date);
    setPickerVisible(false);
  };

  // 处理取消选择
  const handleCancel = () => {
    setPickerVisible(false);
  };

  return (
    <View style={[styles.container, mode === 'time' && styles.timeContainer]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.valueContainer}
        onPress={() => setPickerVisible(true)}
      >
        <Text style={styles.value}>{formatValue()}</Text>
      </TouchableOpacity>

      <RNDateTimePicker
        isVisible={isPickerVisible}
        mode={mode}
        date={value}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        locale="zh-CN"
        cancelTextIOS="取消"
        confirmTextIOS="确认"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
  },
  timeContainer: {
    marginLeft: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3A3A3C',
    marginBottom: 8,
  },
  valueContainer: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    backgroundColor: '#FFFFFF',
  },
  value: {
    fontSize: 16,
    color: '#000000',
  },
}); 