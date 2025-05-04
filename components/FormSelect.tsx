import React, { ReactNode, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome } from '@expo/vector-icons';

interface SelectItem {
  label: string;
  value: string;
  color?: string;
  icon?: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: SelectItem[];
  error?: string;
  isLoading?: boolean;
  children?: ReactNode;
}

/**
 * 表单选择器组件
 * 提供下拉选择功能的表单控件
 */
export function FormSelect({
  label,
  value,
  onValueChange,
  items,
  error,
  isLoading = false,
  children,
}: FormSelectProps) {
  const [showPicker, setShowPicker] = useState(false);

  // 获取当前选择项的标签
  const getSelectedLabel = () => {
    const selectedItem = items.find((item) => item.value === value);
    return selectedItem ? selectedItem.label : '请选择';
  };

  // 获取当前选择项的颜色
  const getSelectedColor = () => {
    const selectedItem = items.find((item) => item.value === value);
    return selectedItem?.color;
  };

  // 渲染iOS的选择器按钮
  const renderIOSButton = () => (
    <TouchableOpacity
      style={[styles.selectButton, error && styles.selectButtonError]}
      onPress={() => setShowPicker(true)}
    >
      {getSelectedColor() && <View style={[styles.colorIndicator, { backgroundColor: getSelectedColor() }]} />}
      <Text style={styles.selectButtonText}>{getSelectedLabel()}</Text>
      <FontAwesome name="angle-down" size={16} color="#8E8E93" />
      {children}
    </TouchableOpacity>
  );

  // 渲染安卓的选择器
  const renderAndroidPicker = () => (
    <View style={[styles.androidPickerContainer, error && styles.selectButtonError]}>
      <Picker selectedValue={value} onValueChange={onValueChange} style={styles.androidPicker} enabled={!isLoading}>
        {items.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} color={item.color} />
        ))}
      </Picker>
      {children}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {Platform.OS === 'ios' ? renderIOSButton() : renderAndroidPicker()}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {Platform.OS === 'ios' && showPicker && (
        <View style={styles.iosPickerContainer}>
          <View style={styles.iosPickerHeader}>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={styles.iosPickerDoneText}>完成</Text>
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => {
              onValueChange(itemValue as string);
            }}
            enabled={!isLoading}
          >
            {items.map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} color={item.color} />
            ))}
          </Picker>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333333',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    padding: 12,
  },
  selectButtonError: {
    borderColor: '#FF3B30',
  },
  selectButtonText: {
    fontSize: 16,
    flex: 1,
    color: '#000000',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  iosPickerContainer: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D1D6',
  },
  iosPickerDoneText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  androidPickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
  },
  androidPicker: {
    height: 48,
    marginHorizontal: -7, // 修复对齐问题
    flex: 1,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
});
