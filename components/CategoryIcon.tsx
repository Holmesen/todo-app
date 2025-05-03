import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface CategoryIconProps {
  name: string | null;
  color: string;
  size?: number;
  showBackground?: boolean;
  style?: any;
}

/**
 * 分类图标组件
 * 显示带有背景色的分类图标
 */
export function CategoryIcon({ name, color, size = 24, showBackground = true, style }: CategoryIconProps) {
  // 确保图标名称有效，如果无效则使用默认图标
  const iconName = isValidIconName(name);

  return (
    <View
      style={[
        styles.container,
        showBackground && {
          backgroundColor: `${color}20`, // 添加透明度
          borderColor: `${color}40`,
        },
        style,
        {
          width: size * 1.5,
          height: size * 1.5,
          borderRadius: size,
        },
      ]}
    >
      <FontAwesome name={iconName as any} size={size} color={color} />
    </View>
  );
}

// 检查图标名称是否有效
function isValidIconName(name: string | null): string {
  if (!name) return 'bookmark';

  // 这是FontAwesome图标库中常用的图标列表，可根据需要扩展
  const validIcons = [
    'home',
    'book',
    'bookmark',
    'briefcase',
    'calendar',
    'check',
    'circle',
    'clock-o',
    'cog',
    'envelope',
    'heart',
    'heartbeat',
    'list',
    'map-marker',
    'money',
    'pencil',
    'phone',
    'picture-o',
    'plus',
    'search',
    'shopping-cart',
    'star',
    'trash',
    'user',
    'users',
    'briefcase',
    'graduation-cap',
    'money',
    'medkit',
    'cutlery',
    'car',
    'plane',
    'laptop',
    'music',
    'film',
    'gamepad',
    'gift',
    'leaf',
    'sun-o',
    'moon-o',
    'coffee',
    'shopping-bag',
    'tag',
  ];

  const names = name.split('-');
  const pre = names.length > 1 ? names[0] + '-' : '';

  const isValidIcon = validIcons.includes(name.substring(pre.length));
  return isValidIcon ? name.substring(pre.length) : 'bookmark';
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
