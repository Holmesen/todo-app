import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface SelectItem {
  label: string;
  value: string;
  color?: string; // 添加颜色属性用于类别展示
}

interface FormSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: SelectItem[];
  placeholder?: string;
  isLoading?: boolean;
  children?: React.ReactNode
}

export function FormSelect({
  label,
  value,
  onValueChange,
  items,
  placeholder = '请选择',
  isLoading = false,
  children,
}: FormSelectProps) {
  // 为每个选项添加颜色指示器
  const renderCustomPickerItem = (item: SelectItem, index: number) => {
    return (
      <Picker.Item
        key={index}
        label={item.label}
        value={item.value}
        color={item.color} // 在 iOS 上这会直接改变文字颜色
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : (
          <Picker
            selectedValue={value}
            onValueChange={onValueChange}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label={placeholder} value="" color="#999" />
            {items.map((item, index) => renderCustomPickerItem(item, index))}
          </Picker>
        )}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
  },
  picker: {
    height: 50,
    // width: '100%',
    flex: 1,
  },
  pickerItem: {
    fontSize: 16,
  },
  loadingContainer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#8E8E93',
  },
}); 