import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface CategoryIconProps {
  name: string;
  color: string;
  size?: 'small' | 'medium' | 'large';
}

export function CategoryIcon({ name, color, size = 'medium' }: CategoryIconProps) {
  // Extract the icon name from the format 'fa-iconname'
  const iconName = name.startsWith('fa-') ? name.substring(3) : name;

  // Get the style based on size
  const containerStyle = [
    styles.container,
    size === 'small' ? styles.containerSmall :
      size === 'large' ? styles.containerLarge :
        styles.containerMedium,
    { backgroundColor: color }
  ];

  // Get the icon size based on size prop
  const iconSize = size === 'small' ? 18 : size === 'large' ? 24 : 20;

  // Convert icon name to a valid FontAwesome name
  // Use some common icons as fallbacks based on what might be in the database
  const getFontAwesomeIconName = (name: string): any => {
    const validIcons: { [key: string]: any } = {
      'briefcase': 'briefcase',
      'user': 'user',
      'shopping-cart': 'shopping-cart',
      'heartbeat': 'heartbeat',
      'dollar-sign': 'money',
      'book': 'book',
      // Add other mappings as needed
    };

    return validIcons[name] || 'tag'; // Default to 'tag' if not found
  };

  return (
    <View style={containerStyle}>
      <FontAwesome name={getFontAwesomeIconName(iconName)} size={iconSize} color="#ffffff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  containerMedium: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  containerLarge: {
    width: 50,
    height: 50,
    borderRadius: 15,
  },
}); 