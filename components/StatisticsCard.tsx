import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StatisticsCardProps {
  title: string;
  children: ReactNode;
  onPeriodChange?: () => void;
  periodText?: string;
  showPeriodSelector?: boolean;
}

export const StatisticsCard = ({
  title,
  children,
  onPeriodChange,
  periodText = 'This Week',
  showPeriodSelector = true
}: StatisticsCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showPeriodSelector && (
          <TouchableOpacity
            onPress={onPeriodChange}
            activeOpacity={0.7}
          >
            <Text style={styles.periodText}>{periodText}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2.5,
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
    color: '#3A3A3C',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  content: {

  },
}); 