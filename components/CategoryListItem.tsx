import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CategoryIcon } from './CategoryIcon';
import { CategoryWithStats } from '../store/categoryStore';

interface CategoryListItemProps {
  category: CategoryWithStats;
  onPress?: (category: CategoryWithStats) => void;
}

export function CategoryListItem({ category, onPress }: CategoryListItemProps) {
  const handlePress = () => {
    if (onPress) {
      onPress(category);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <CategoryIcon
        name={category.icon || 'tag'}
        color={category.color}
        size="small"
      />
      <View style={styles.details}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.taskCount}>{category.taskCount} tasks</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressValue,
              { width: `${category.progressPercentage}%`, backgroundColor: category.color }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{category.progressPercentage}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  details: {
    flex: 1,
    marginLeft: 16,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  taskCount: {
    fontSize: 14,
    color: '#8e8e93',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    width: 70,
    height: 4,
    backgroundColor: '#e5e5ea',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressValue: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '500',
  },
}); 