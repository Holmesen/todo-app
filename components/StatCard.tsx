import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface Change {
  value: number;
  isPositive: boolean;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: string;
  iconColor?: string;
  change?: Change;
  style?: ViewStyle;
}

/**
 * 统计卡片组件
 * 用于显示带有图标和可选变化指标的统计数据
 */
export function StatCard({ label, value, icon, iconColor = '#007AFF', change, style }: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          {icon && <FontAwesome name={icon as any} size={14} color={iconColor} />}
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={styles.value}>{value}</Text>

      {change && (
        <View style={styles.changeContainer}>
          <FontAwesome
            name={change.isPositive ? 'arrow-up' : 'arrow-down'}
            size={12}
            color={change.isPositive ? '#34C759' : '#FF3B30'}
            style={styles.changeIcon}
          />
          <Text style={[styles.changeText, { color: change.isPositive ? '#34C759' : '#FF3B30' }]}>
            {Math.abs(change.value)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeIcon: {
    marginRight: 2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
