import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface ActionButtonProps {
  label: string;
  icon?: string;
  onPress: () => void;
  isActive?: boolean;
  color?: string;
}

/**
 * 操作按钮组件
 * 用于带图标的交互按钮，支持激活状态
 */
export function ActionButton({ label, icon, onPress, isActive = false, color = '#007AFF' }: ActionButtonProps) {
  // 计算活跃和非活跃状态的颜色
  const backgroundColor = isActive ? `${color}20` : 'transparent';
  const borderColor = isActive ? color : '#D1D1D6';
  const textColor = isActive ? color : '#8E8E93';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && <FontAwesome name={icon as any} size={14} color={textColor} style={styles.icon} />}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
