import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CategoryIcon } from './CategoryIcon';
import { CategoryWithStats } from '../store/categoryStore';

interface CategoryCardProps {
  category: CategoryWithStats;
  onPress?: (category: CategoryWithStats) => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
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
        size="large"
      />
      <Text style={styles.categoryName}>{category.name}</Text>
      <Text style={styles.taskCount}>{category.taskCount} tasks</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressValue,
            { width: `${category.progressPercentage}%`, backgroundColor: category.color }
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    width: '50%'
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 13,
    color: '#8e8e93',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e5e5ea',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressValue: {
    height: '100%',
    borderRadius: 3,
  },
}); 