import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  progressColor?: string;
  backgroundColor?: string;
  label?: string;
}

export const ProgressCircle = ({
  percentage,
  size = 180,
  strokeWidth = 12,
  progressColor = '#007AFF',
  backgroundColor = '#E5E5EA',
  label = 'Completion Rate'
}: ProgressCircleProps) => {
  // Calculate properties for the circle
  const radius = (size - strokeWidth) / 2;
  const circleCircumference = 2 * Math.PI * radius;
  const strokeDashoffset = circleCircumference - (percentage / 100) * circleCircumference;

  // Center position
  const center = size / 2;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circleCircumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      <View style={[styles.textContainer, { width: '100%', height: size }]}>
        <Text style={styles.percentageText}>{`${Math.round(percentage)}%`}</Text>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 20,
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

  },
  percentageText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  labelText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
}); 