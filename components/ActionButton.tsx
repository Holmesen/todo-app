import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ActionButtonProps {
  label: string;
  isActive?: boolean;
  onPress: () => void;
}

export function ActionButton({ label, isActive = false, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isActive ? styles.activeButton : styles.inactiveButton,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.buttonText,
          isActive ? styles.activeButtonText : styles.inactiveButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeButton: {
    backgroundColor: '#E3F2FD', // Light blue background
  },
  inactiveButton: {
    backgroundColor: '#F2F2F7', // Light gray background
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  activeButtonText: {
    color: '#007AFF', // Blue text
  },
  inactiveButtonText: {
    color: '#666666', // Gray text
  },
}); 