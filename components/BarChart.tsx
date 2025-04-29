import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface BarChartData {
  label: string;
  value: number;
  date: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  barWidth?: number;
  barColor?: string;
  maxValue?: number;
  showGridLines?: boolean;
  gridLineCount?: number;
}

export const BarChart = ({
  data,
  height = 160,
  barWidth = 12,
  barColor = '#007AFF',
  maxValue: propMaxValue,
  showGridLines = true,
  gridLineCount = 4
}: BarChartProps) => {
  // Calculate max value for chart
  const maxValue = propMaxValue || Math.max(...data.map(item => item.value), 1);
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32; // Account for container padding

  // Generate grid lines
  const gridLines = [];
  if (showGridLines) {
    for (let i = 1; i <= gridLineCount; i++) {
      const position = height - (i * (height / gridLineCount));
      gridLines.push(
        <View
          key={`grid-${i}`}
          style={[styles.gridLine, { top: position }]}
        />
      );
    }
  }

  return (
    <View style={styles.container}>
      {/* Grid Lines */}
      {gridLines}

      {/* Bars */}
      <View style={[styles.barContainer, { height }]}>
        {data.map((item) => {
          const barHeight = (item.value / maxValue) * height;

          return (
            <View key={`bar-${item.date}`} style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(barHeight, 2), // Minimum bar height for visibility
                    width: barWidth,
                    backgroundColor: barColor
                  }
                ]}
              />
              <Text style={styles.barLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginTop: 10,
    marginBottom: 30,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  barLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 6,
  },
}); 