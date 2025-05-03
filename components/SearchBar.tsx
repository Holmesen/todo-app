import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

/**
 * 搜索栏组件
 * 用于搜索功能的输入框，带有搜索图标和清除按钮
 */
export function SearchBar({ value, onChangeText, placeholder = '搜索...', onClear }: SearchBarProps) {
  // 处理清除按钮点击
  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <View style={styles.container}>
      <FontAwesome name="search" size={16} color="#8E8E93" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        clearButtonMode="never" // iOS自带的清除按钮
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <FontAwesome name="times-circle" size={16} color="#8E8E93" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    height: 24,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
});
