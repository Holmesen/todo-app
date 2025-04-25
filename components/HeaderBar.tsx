import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface HeaderBarProps {
  title: string;
  onSave?: () => void;
  showSaveButton?: boolean;
}

export function HeaderBar({
  title,
  onSave,
  showSaveButton = true
}: HeaderBarProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <FontAwesome name="chevron-left" size={14} color="#007AFF" style={styles.backIcon} />
        <Text style={styles.backText}>Cancel</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      {showSaveButton ? (
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    marginRight: 4,
  },
  backText: {
    color: '#007AFF',
    fontSize: 17,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 8,
  },
  saveText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  placeholder: {
    width: 60, // Approximate width of the back button for balance
  },
}); 