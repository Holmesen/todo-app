import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

// 表单输入框属性接口，继承自 TextInput 属性
interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
}

/**
 * 表单输入组件
 * 带有标签和错误提示的文本输入框
 */
export function FormInput({ label, error, style, ...props }: FormInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, error && styles.inputError, style]} placeholderTextColor="#A0A0A0" {...props} />
      {error && <Text style={styles.errorText}>{error}</Text>}
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
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});
