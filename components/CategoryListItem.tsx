import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CategoryIcon } from './CategoryIcon';
import { CategoryWithStats } from '../store/categoryStore';
import { FontAwesome } from '@expo/vector-icons';

interface CategoryListItemProps {
  category: CategoryWithStats;
  onPress?: (category: CategoryWithStats) => void;
  onDelete?: (category: CategoryWithStats) => void;
  isDeleting?: boolean;
}

export function CategoryListItem({
  category,
  onPress,
  onDelete,
  isDeleting = false
}: CategoryListItemProps) {
  const handlePress = () => {
    if (onPress) {
      onPress(category);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      // 显示确认对话框
      Alert.alert(
        "删除类别",
        `确定要删除"${category.name}"类别吗？此操作不可恢复，该类别下的任务将不再属于任何类别。`,
        [
          {
            text: "取消",
            style: "cancel"
          },
          {
            text: "删除",
            onPress: () => onDelete(category),
            style: "destructive"
          }
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
      disabled={isDeleting}
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

      {/* 删除按钮 */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <View style={styles.loadingIndicator} />
          ) : (
            <FontAwesome name="trash" size={16} color="#FF3B30" />
          )}
        </TouchableOpacity>
      )}
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
    marginRight: 10,
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
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  loadingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF3B30',
    borderTopColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  }
}); 