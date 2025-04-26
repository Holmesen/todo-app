import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 附件选择器属性接口
interface AttachmentPickerProps {
  onPress: () => void;
}

export function AttachmentPicker({ onPress }: AttachmentPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>附件</Text>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Ionicons name="attach" size={20} color="#007AFF" />
        <Text style={styles.buttonText}>添加附件</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3A3A3C',
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#007AFF',
    borderRadius: 10,
    backgroundColor: '#F0F7FF',
  },
  buttonText: {
    fontSize: 15,
    color: '#007AFF',
    marginLeft: 8,
  },
}); 