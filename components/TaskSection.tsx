import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TaskSectionProps {
  title: string;
  children: ReactNode;
  onSeeAll?: () => void;
}

/**
 * 任务部分组件
 * 用于将任务组织成带标题和"查看全部"按钮的部分
 */
export function TaskSection({ title, children, onSeeAll }: TaskSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>查看全部</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAllText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionContent: {
    // 可添加额外样式
  },
});
