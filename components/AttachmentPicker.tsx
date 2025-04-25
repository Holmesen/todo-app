import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface AttachmentPickerProps {
  onPress: () => void;
}

export function AttachmentPicker({ onPress }: AttachmentPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Attachments</Text>
      <TouchableOpacity style={styles.attachmentArea} onPress={onPress}>
        <FontAwesome5 name="file-upload" size={28} color="#8E8E93" style={styles.attachmentIcon} />
        <Text style={styles.attachmentText}>Tap to add files</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3A3A3C',
    marginBottom: 8,
  },
  attachmentArea: {
    marginTop: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D1D6',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentIcon: {
    marginBottom: 12,
  },
  attachmentText: {
    color: '#8E8E93',
  },
}); 