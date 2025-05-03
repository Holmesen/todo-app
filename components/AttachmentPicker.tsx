import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// 附件选择器属性接口
interface AttachmentPickerProps {
  onPress: () => void;
}

/**
 * 附件选择器组件
 * 用于添加文件或图片等附件
 */
export function AttachmentPicker({ onPress }: AttachmentPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>附件</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={onPress}>
        <FontAwesome name="paperclip" size={16} color="#8E8E93" style={styles.icon} />
        <Text style={styles.buttonText}>添加附件</Text>
      </TouchableOpacity>
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 12,
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
