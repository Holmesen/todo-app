import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Define common colors for categories
const CATEGORY_COLORS = [
  '#5e5ce6', // Work - Purple-blue
  '#30c48d', // Personal - Green
  '#ff9500', // Shopping - Orange
  '#ff2d55', // Health - Pink
  '#007aff', // Finance - Blue
  '#af52de', // Education - Purple
  '#ff3b30', // Urgent - Red
  '#ffcc00', // Entertainment - Yellow
  '#5856d6', // Travel - Purple
  '#34c759', // Projects - Green
];

// Define common icons for categories with valid FontAwesome name values
// These are all confirmed valid FontAwesome icon names
type IconOption = {
  name:
    | 'briefcase'
    | 'user'
    | 'shopping-cart'
    | 'heartbeat'
    | 'money'
    | 'book'
    | 'bell'
    | 'plane'
    | 'film'
    | 'clipboard'
    | 'home'
    | 'tag';
  label: string;
};

const CATEGORY_ICONS: IconOption[] = [
  { name: 'briefcase', label: 'Work' },
  { name: 'user', label: 'Personal' },
  { name: 'shopping-cart', label: 'Shopping' },
  { name: 'heartbeat', label: 'Health' },
  { name: 'money', label: 'Finance' },
  { name: 'book', label: 'Education' },
  { name: 'bell', label: 'Reminders' },
  { name: 'plane', label: 'Travel' },
  { name: 'film', label: 'Entertainment' },
  { name: 'clipboard', label: 'Projects' },
  { name: 'home', label: 'Home' },
  { name: 'tag', label: 'Other' },
];

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (category: { name: string; color: string; icon: string; is_featured: boolean }) => void;
  isSaving?: boolean;
}

export function AddCategoryModal({ visible, onClose, onSave, isSaving = false }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<IconOption['name']>(CATEGORY_ICONS[0].name);
  const [isFeatured, setIsFeatured] = useState(false);

  const handleSave = () => {
    if (name.trim() && !isSaving) {
      onSave({
        name: name.trim(),
        color: selectedColor,
        icon: `fa-${selectedIcon}`,
        is_featured: isFeatured,
      });
      // 保存后表单重置将在成功保存和关闭模态框后在父组件调用 onClose 时执行
    }
  };

  const resetForm = () => {
    setName('');
    setSelectedColor(CATEGORY_COLORS[0]);
    setSelectedIcon(CATEGORY_ICONS[0].name);
    setIsFeatured(false);
  };

  const handleClose = () => {
    // 只有在未保存状态时才允许关闭
    if (!isSaving) {
      resetForm();
      onClose();
    }
  };

  const handleColorSelect = (color: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedColor(color);
  };

  const handleIconSelect = (icon: IconOption['name']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIcon(icon);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>新增分类</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton} disabled={isSaving}>
                  <FontAwesome name="times" size={20} color={isSaving ? '#c7c7cc' : '#8e8e93'} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formContainer}>
                <Text style={styles.label}>名称</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="请输入分类名称"
                  autoCapitalize="words"
                  editable={!isSaving}
                />

                <Text style={styles.label}>颜色</Text>
                <View style={styles.colorGrid}>
                  {CATEGORY_COLORS.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.colorItem,
                        { backgroundColor: color },
                        selectedColor === color && styles.selectedItem,
                      ]}
                      onPress={() => handleColorSelect(color)}
                      disabled={isSaving}
                    />
                  ))}
                </View>

                <Text style={styles.label}>图标</Text>
                <View style={styles.iconGrid}>
                  {CATEGORY_ICONS.map((icon, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.iconItem,
                        selectedIcon === icon.name && styles.selectedIconItem,
                        { borderColor: selectedColor },
                      ]}
                      onPress={() => handleIconSelect(icon.name)}
                      disabled={isSaving}
                    >
                      <FontAwesome
                        name={icon.name}
                        size={20}
                        color={selectedIcon === icon.name ? selectedColor : '#666'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>精选分类</Text>
                  <Switch
                    value={isFeatured}
                    onValueChange={setIsFeatured}
                    trackColor={{ false: '#e5e5ea', true: selectedColor }}
                    thumbColor="#ffffff"
                    disabled={isSaving}
                  />
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: selectedColor },
                    (!name.trim() || isSaving) && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={!name.trim() || isSaving}
                >
                  {isSaving ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text style={styles.saveButtonText}>保存中...</Text>
                    </View>
                  ) : (
                    <Text style={styles.saveButtonText}>保存分类</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 5,
  },
  formContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f2f2f7',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  iconItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f7',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedItem: {
    transform: [{ scale: 1.1 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedIconItem: {
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
