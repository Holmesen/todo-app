import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

interface UserData {
  username: string;
  email: string;
  full_name: string;
  profile_image: string;
  time_zone: string;
  theme: string;
}

// Time zone options
const timeZoneOptions = [
  { label: 'UTC-12:00', value: 'UTC-12' },
  { label: 'UTC-11:00', value: 'UTC-11' },
  { label: 'UTC-10:00', value: 'UTC-10' },
  { label: 'UTC-09:00', value: 'UTC-9' },
  { label: 'UTC-08:00', value: 'UTC-8' },
  { label: 'UTC-07:00', value: 'UTC-7' },
  { label: 'UTC-06:00', value: 'UTC-6' },
  { label: 'UTC-05:00', value: 'UTC-5' },
  { label: 'UTC-04:00', value: 'UTC-4' },
  { label: 'UTC-03:00', value: 'UTC-3' },
  { label: 'UTC-02:00', value: 'UTC-2' },
  { label: 'UTC-01:00', value: 'UTC-1' },
  { label: 'UTC+00:00', value: 'UTC+0' },
  { label: 'UTC+01:00', value: 'UTC+1' },
  { label: 'UTC+02:00', value: 'UTC+2' },
  { label: 'UTC+03:00', value: 'UTC+3' },
  { label: 'UTC+04:00', value: 'UTC+4' },
  { label: 'UTC+05:00', value: 'UTC+5' },
  { label: 'UTC+05:30', value: 'UTC+5:30' },
  { label: 'UTC+06:00', value: 'UTC+6' },
  { label: 'UTC+07:00', value: 'UTC+7' },
  { label: 'UTC+08:00', value: 'UTC+8' },
  { label: 'UTC+09:00', value: 'UTC+9' },
  { label: 'UTC+10:00', value: 'UTC+10' },
  { label: 'UTC+11:00', value: 'UTC+11' },
  { label: 'UTC+12:00', value: 'UTC+12' },
];

// Theme options
const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '系统默认', value: 'system' },
];

export default function EditProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState<UserData>({
    username: '',
    email: '',
    full_name: '',
    profile_image: 'https://ui-avatars.com/api/',
    time_zone: 'UTC+0',
    theme: 'light',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showTimeZonePicker, setShowTimeZonePicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    if (!user) {
      router.replace('/profile');
      return;
    }

    setFormData({
      username: user.username || '',
      email: user.email || '',
      full_name: user.full_name || '',
      profile_image: user.profile_image || `https://ui-avatars.com/api/?name=${user.full_name || 'User'}`,
      time_zone: user.time_zone || 'UTC+0',
      theme: user.theme || 'light',
    });
  }, [user, router]);

  // Form field change handler
  const handleChange = (field: keyof UserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Image picker handler
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('权限错误', '需要访问相册的权限才能选择图片。');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        setFormData((prev) => ({
          ...prev,
          profile_image: selectedAsset.uri,
        }));
        setImageChanged(true);
      }
    } catch (error) {
      console.error('选择图片时出错:', error);
      Alert.alert('错误', '选择图片时发生错误。');
    }
  };

  // Convert URI to base64 for Supabase storage
  const uriToBase64 = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('转换图片为base64时出错:', error);
      throw error;
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (uri: string): Promise<string> => {
    try {
      if (!user?.id) throw new Error('用户未登录');

      const fileName = `profile-${user.id}-${Date.now()}.jpg`;
      const base64Image = await uriToBase64(uri);
      const contentType = 'image/jpeg';

      const { error } = await supabase.storage.from('todo.images').upload(fileName, decode(base64Image), {
        contentType,
        upsert: true,
      });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from('todo.images').getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('上传图片时出错:', error);
      throw error;
    }
  };

  // Form submission handler
  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        Alert.alert('错误', '用户未登录，无法更新资料。');
        return;
      }

      // Simple validation
      if (!formData.username.trim()) {
        Alert.alert('错误', '用户名不能为空。');
        return;
      }

      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        Alert.alert('错误', '请输入有效的电子邮箱地址。');
        return;
      }

      setIsSaving(true);

      // Handle image upload if changed
      let profileImageUrl = formData.profile_image;
      if (imageChanged && !formData.profile_image.startsWith('http')) {
        profileImageUrl = await uploadImage(formData.profile_image);
      }

      // Update user data in Supabase
      const updateData = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        profile_image: profileImageUrl,
        time_zone: formData.time_zone,
        theme: formData.theme,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('todo_users').update(updateData).eq('id', user.id);

      if (error) throw error;

      // Update local user state
      updateUser({
        ...user,
        ...updateData,
      });

      Alert.alert('成功', '个人资料已更新。', [{ text: '确定', onPress: () => router.back() }]);
    } catch (error) {
      console.error('更新个人资料时出错:', error);
      Alert.alert('错误', '更新个人资料时发生错误，请稍后重试。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#007aff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>编辑个人资料</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>保存</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: formData.profile_image }} style={styles.profileImage} />
          <TouchableOpacity onPress={handlePickImage} style={styles.editImageButton}>
            <FontAwesome name="camera" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Username */}
          <View style={styles.formField}>
            <Text style={styles.label}>用户名*</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(value) => handleChange('username', value)}
              placeholder="输入用户名"
              autoCapitalize="none"
            />
          </View>

          {/* Email */}
          <View style={styles.formField}>
            <Text style={styles.label}>电子邮箱*</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholder="输入电子邮箱"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Full Name */}
          <View style={styles.formField}>
            <Text style={styles.label}>全名</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name}
              onChangeText={(value) => handleChange('full_name', value)}
              placeholder="输入全名"
            />
          </View>

          {/* Time Zone */}
          <View style={styles.formField}>
            <Text style={styles.label}>时区</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimeZonePicker(!showTimeZonePicker)}>
              <Text style={styles.pickerButtonText}>
                {timeZoneOptions.find((tz) => tz.value === formData.time_zone)?.label || formData.time_zone}
              </Text>
              <FontAwesome name={showTimeZonePicker ? 'chevron-up' : 'chevron-down'} size={14} color="#8e8e93" />
            </TouchableOpacity>

            {showTimeZonePicker && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.time_zone}
                  onValueChange={(value) => {
                    handleChange('time_zone', value);
                    setShowTimeZonePicker(false);
                  }}
                  style={styles.picker}
                >
                  {timeZoneOptions.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          {/* Theme */}
          <View style={styles.formField}>
            <Text style={styles.label}>主题</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowThemePicker(!showThemePicker)}>
              <Text style={styles.pickerButtonText}>
                {themeOptions.find((t) => t.value === formData.theme)?.label || '浅色'}
              </Text>
              <FontAwesome name={showThemePicker ? 'chevron-up' : 'chevron-down'} size={14} color="#8e8e93" />
            </TouchableOpacity>

            {showThemePicker && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.theme}
                  onValueChange={(value) => {
                    handleChange('theme', value);
                    setShowThemePicker(false);
                  }}
                  style={styles.picker}
                >
                  {themeOptions.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>
            )}
          </View>
        </View>

        {/* Note */}
        <Text style={styles.note}>* 标记为必填字段</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007aff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 30,
    right: '50%',
    marginRight: -60,
    backgroundColor: '#007aff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  formField: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  label: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#000000',
    paddingVertical: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  pickerContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    marginTop: 4,
  },
  picker: {
    width: '100%',
  },
  note: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#8e8e93',
    fontSize: 14,
    marginBottom: 20,
  },
});
