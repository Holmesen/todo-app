import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  iconColor?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  style?: ViewStyle;
}

export const StatCard = ({
  label,
  value,
  icon,
  iconColor = '#007AFF',
  change,
  style
}: StatCardProps) => {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <FontAwesome name={icon as any} size={18} color="#FFFFFF" />
        </View>
      )}

      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>

      {change && (
        <View style={styles.changeContainer}>
          <FontAwesome
            name={change.isPositive ? 'arrow-up' : 'arrow-down'}
            size={10}
            color={change.isPositive ? '#34C759' : '#FF3B30'}
            style={styles.changeIcon}
          />
          <Text
            style={[
              styles.changeText,
              { color: change.isPositive ? '#34C759' : '#FF3B30' }
            ]}
          >
            {Math.abs(change.value)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2.5,
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  changeIcon: {
    marginRight: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 