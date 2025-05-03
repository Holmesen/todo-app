import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface StatisticsCardProps {
  title: string;
  children: ReactNode;
  periodText?: string;
  showPeriodSelector?: boolean;
  onPeriodChange?: () => void;
}

/**
 * 统计卡片组件
 * 用于显示统计数据的卡片容器，带有标题和可选的周期选择器
 */
export function StatisticsCard({
  title,
  children,
  periodText = '本周',
  showPeriodSelector = true,
  onPeriodChange,
}: StatisticsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showPeriodSelector && (
          <TouchableOpacity style={styles.periodSelector} onPress={onPeriodChange}>
            <Text style={styles.periodText}>{periodText}</Text>
            <FontAwesome name="angle-down" size={12} color="#8E8E93" style={styles.icon} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  periodText: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 4,
  },
  icon: {
    marginTop: 1,
  },
  content: {
    // 内容区域样式
  },
});
