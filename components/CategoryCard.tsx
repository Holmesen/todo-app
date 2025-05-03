import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CategoryIcon } from './CategoryIcon';
import { CategoryWithStats } from '../store/categoryStore';

interface CategoryCardProps {
  category: CategoryWithStats;
  onPress: (category: CategoryWithStats) => void;
}

/**
 * 分类卡片组件
 * 显示带有图标、名称和任务数量的分类卡片
 */
export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const { name, color, icon, taskCount } = category;

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: color }]}
      onPress={() => onPress(category)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <CategoryIcon name={icon} color={color} size={20} />
        <Text style={[styles.badgeText, { color: color }]}>{`${taskCount}个任务`}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
    minWidth: '45%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    width: 48,
    height: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
