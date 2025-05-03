import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';

interface ProgressCircleProps {
  percentage: number; // 0 到 1 之间的值
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
  bgColor?: string;
}

/**
 * 进度圆环组件
 * 显示圆形进度指示器，常用于展示完成率或百分比
 */
export function ProgressCircle({
  percentage = 0,
  size = 160,
  strokeWidth = 10,
  label = '完成率',
  color = '#007AFF',
  bgColor = '#E5E5EA',
}: ProgressCircleProps) {
  // 确保百分比值在 0 和 1 之间
  const validPercentage = Math.min(Math.max(percentage, 0), 1);

  // 圆的半径
  const radius = (size - strokeWidth) / 2;
  // 圆的周长
  const circumference = radius * 2 * Math.PI;
  // 基于百分比计算描边的长度
  const strokeDashoffset = circumference * (1 - validPercentage);

  // 显示的百分比文本
  const percentageText = `${Math.round(validPercentage * 100)}%`;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* 背景圆环 */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* 进度圆环 */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={[styles.labelContainer, { width: size, height: size }]}>
        <Text style={styles.percentageText}>{percentageText}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
});
