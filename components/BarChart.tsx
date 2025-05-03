import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

// 图表数据类型
interface BarData {
  label: string;
  value: number;
  date?: string; // 可选的日期属性
}

interface BarChartProps {
  data: BarData[];
  barColor?: string;
  barWidth?: number;
  height?: number;
  maxValue?: number;
  showLabels?: boolean;
}

/**
 * 柱状图组件
 * 用于显示与时间相关的数据统计
 */
export function BarChart({
  data,
  barColor = '#007AFF',
  barWidth = 28,
  height = 180,
  maxValue,
  showLabels = true,
}: BarChartProps) {
  // 确定Y轴最大值
  const max = maxValue || Math.max(...data.map((item) => item.value), 1);

  // 计算一个合理的最大值，使图表更美观
  const chartMax = Math.ceil(max * 1.2);

  return (
    <View style={[styles.container, { height }]}>
      {/* Y轴标记 */}
      <View style={styles.yAxis}>
        <Text style={styles.yAxisLabel}>{chartMax}</Text>
        <Text style={styles.yAxisLabel}>{Math.round(chartMax / 2)}</Text>
        <Text style={styles.yAxisLabel}>0</Text>
      </View>

      {/* 柱状图部分 */}
      <View style={styles.chartArea}>
        {data.map((item, index) => {
          // 计算柱子高度
          const barHeight = (item.value / chartMax) * (height - 40);

          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 1), // 确保柱子至少有1点高
                      backgroundColor: barColor,
                      width: barWidth,
                    },
                  ]}
                />
              </View>
              {showLabels && <Text style={styles.barLabel}>{item.label}</Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  yAxis: {
    width: 24,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 4,
    paddingVertical: 4,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#8E8E93',
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
  },
  barContainer: {
    alignItems: 'center',
  },
  barWrapper: {
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 4,
  },
});
