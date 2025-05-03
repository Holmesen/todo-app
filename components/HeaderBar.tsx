import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

// 页面头部栏属性接口
interface HeaderBarProps {
  title: string;
  showBackButton?: boolean;
  showSaveButton?: boolean;
  onBack?: () => void;
  onSave?: () => void;
  saveDisabled?: boolean;
  rightElement?: React.ReactNode;
}

/**
 * 页面头部组件
 * 提供标题、返回按钮和可选的保存按钮
 */
export function HeaderBar({
  title,
  showBackButton = true,
  showSaveButton = false,
  onBack,
  onSave,
  saveDisabled = false,
  rightElement,
}: HeaderBarProps) {
  const router = useRouter();

  // 处理返回按钮点击
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <FontAwesome name="angle-left" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.rightSection}>
        {showSaveButton && onSave && (
          <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={saveDisabled}>
            <Text style={[styles.saveButtonText, saveDisabled && styles.disabledSaveButtonText]}>保存</Text>
          </TouchableOpacity>
        )}
        {rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 16,
  },
  leftSection: {
    width: 60,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  rightSection: {
    width: 60,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 4,
  },
  saveButton: {
    padding: 4,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledSaveButtonText: {
    opacity: 0.5,
  },
});
