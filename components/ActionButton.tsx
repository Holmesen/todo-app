import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface ActionButtonProps {
  label: string;
  isActive?: boolean;
  onPress: () => void;
  color?: string;
  icon?: string | null;
}

export function ActionButton({ label, isActive = false, onPress, color, icon }: ActionButtonProps) {
  // 活动/非活动状态的默认颜色
  const defaultActiveColor = '#E3F2FD';
  const defaultActiveTextColor = '#007AFF';
  const defaultInactiveColor = '#F2F2F7';
  const defaultInactiveTextColor = '#666666';

  // 如果提供了自定义颜色，则使用它，否则使用默认值
  const activeColor = color ? `${color}20` : defaultActiveColor; // 20是十六进制，表示12%不透明度
  const activeTextColor = color || defaultActiveTextColor;

  const hasIcon = icon && icon.length > 0;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isActive
          ? { backgroundColor: activeColor, borderColor: activeTextColor, borderWidth: 1 }
          : { backgroundColor: defaultInactiveColor },
      ]}
      onPress={onPress}
    >
      {hasIcon && (
        <FontAwesome
          name={icon as any}
          size={12}
          color={isActive ? activeTextColor : defaultInactiveTextColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.buttonText, { color: isActive ? activeTextColor : defaultInactiveTextColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  icon: {
    marginRight: 6,
  },
});
