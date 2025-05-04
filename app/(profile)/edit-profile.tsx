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
  Modal,
  FlatList,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { z } from 'zod';

// 表单验证模式
const profileSchema = z.object({
  username: z.string().min(2, { message: '用户名至少需要2个字符' }).max(50),
  email: z.string().email({ message: '请输入有效的电子邮箱地址' }),
  full_name: z.string().optional(),
  time_zone: z.string(),
  theme: z.string(),
  profile_image: z.string(),
});

// 数据接口
interface UserData {
  username: string;
  email: string;
  full_name: string;
  profile_image: string;
  time_zone: string;
  theme: string;
}

// 时区选项
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

// 主题选项
const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '系统默认', value: 'system' },
];

export default function EditProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();

  // 表单数据
  const [formData, setFormData] = useState<UserData>({
    username: '',
    email: '',
    full_name: '',
    profile_image: 'https://ui-avatars.com/api/',
    time_zone: 'UTC+0',
    theme: 'light',
  });

  // 状态管理
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageChanged, setImageChanged] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 模态框状态
  const [isTimeZoneModalVisible, setTimeZoneModalVisible] = useState(false);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);

  // 加载用户数据
  useEffect(() => {
    if (!user) {
      router.replace('/profile');
      return;
    }

    setFormData({
      username: user.username || '',
      email: user.email || '',
      full_name: user.full_name || '',
      profile_image:
        user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}`,
      time_zone: user.time_zone || 'UTC+0',
      theme: user.theme || 'light',
    });

    setIsLoading(false);
  }, [user, router]);

  // 表单字段变更处理
  const handleChange = (field: keyof UserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 清除相关字段的验证错误
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 图片选择处理
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('权限错误', '需要访问相册的权限才能选择图片。');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  // URI 转 Base64
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

  // 上传图片到 Supabase Storage
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

  // 验证表单数据
  const validateForm = (): boolean => {
    try {
      profileSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  // 表单提交处理
  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        Alert.alert('错误', '用户未登录，无法更新资料。');
        return;
      }

      // 表单验证
      if (!validateForm()) {
        return;
      }

      setIsSaving(true);

      // 处理图片上传
      let profileImageUrl = formData.profile_image;
      if (imageChanged && !formData.profile_image.startsWith('http')) {
        profileImageUrl = await uploadImage(formData.profile_image);
      }

      // 更新用户数据
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

      // 更新本地用户状态
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

  // 选择时区
  const selectTimeZone = (value: string) => {
    handleChange('time_zone', value);
    setTimeZoneModalVisible(false);
  };

  // 选择主题
  const selectTheme = (value: string) => {
    handleChange('theme', value);
    setThemeModalVisible(false);
  };

  // 渲染加载状态
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container}>
        {/* 页头 */}
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

        {/* 个人头像 */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: formData.profile_image }} style={styles.profileImage} />
          <TouchableOpacity onPress={handlePickImage} style={styles.editImageButton}>
            <FontAwesome name="camera" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* 表单区域 */}
        <View style={styles.formContainer}>
          {/* 用户名 */}
          <View style={styles.formField}>
            <Text style={styles.label}>用户名*</Text>
            <TextInput
              style={[styles.input, validationErrors.username && styles.inputError]}
              value={formData.username}
              onChangeText={(value) => handleChange('username', value)}
              placeholder="输入用户名"
              autoCapitalize="none"
            />
            {validationErrors.username && <Text style={styles.errorText}>{validationErrors.username}</Text>}
          </View>

          {/* 电子邮箱 */}
          <View style={styles.formField}>
            <Text style={styles.label}>电子邮箱*</Text>
            <TextInput
              style={[styles.input, validationErrors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholder="输入电子邮箱"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {validationErrors.email && <Text style={styles.errorText}>{validationErrors.email}</Text>}
          </View>

          {/* 全名 */}
          <View style={styles.formField}>
            <Text style={styles.label}>全名</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name}
              onChangeText={(value) => handleChange('full_name', value)}
              placeholder="输入全名"
            />
          </View>

          {/* 时区 */}
          <View style={styles.formField}>
            <Text style={styles.label}>时区</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setTimeZoneModalVisible(true)}>
              <Text style={styles.pickerButtonText}>
                {timeZoneOptions.find((tz) => tz.value === formData.time_zone)?.label || formData.time_zone}
              </Text>
              <FontAwesome name="chevron-down" size={14} color="#8e8e93" />
            </TouchableOpacity>
          </View>

          {/* 主题 */}
          <View style={styles.formField}>
            <Text style={styles.label}>主题</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setThemeModalVisible(true)}>
              <Text style={styles.pickerButtonText}>
                {themeOptions.find((t) => t.value === formData.theme)?.label || '浅色'}
              </Text>
              <FontAwesome name="chevron-down" size={14} color="#8e8e93" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 备注 */}
        <Text style={styles.note}>* 标记为必填字段</Text>
      </ScrollView>

      {/* 时区选择模态框 */}
      <Modal
        visible={isTimeZoneModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTimeZoneModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setTimeZoneModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择时区</Text>
              <TouchableOpacity onPress={() => setTimeZoneModalVisible(false)}>
                <FontAwesome name="times" size={20} color="#007aff" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={timeZoneOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, formData.time_zone === item.value && styles.modalItemSelected]}
                  onPress={() => selectTimeZone(item.value)}
                >
                  <Text
                    style={[styles.modalItemText, formData.time_zone === item.value && styles.modalItemTextSelected]}
                  >
                    {item.label}
                  </Text>
                  {formData.time_zone === item.value && <FontAwesome name="check" size={16} color="#007aff" />}
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 主题选择模态框 */}
      <Modal
        visible={isThemeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setThemeModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择主题</Text>
              <TouchableOpacity onPress={() => setThemeModalVisible(false)}>
                <FontAwesome name="times" size={20} color="#007aff" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={themeOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, formData.theme === item.value && styles.modalItemSelected]}
                  onPress={() => selectTheme(item.value)}
                >
                  <Text style={[styles.modalItemText, formData.theme === item.value && styles.modalItemTextSelected]}>
                    {item.label}
                  </Text>
                  {formData.theme === item.value && <FontAwesome name="check" size={16} color="#007aff" />}
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
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
  inputError: {
    borderBottomWidth: 1,
    borderBottomColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
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
  note: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#8e8e93',
    fontSize: 14,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  modalItemSelected: {
    backgroundColor: '#f0f0f5',
  },
  modalItemText: {
    fontSize: 16,
    color: '#000000',
  },
  modalItemTextSelected: {
    color: '#007aff',
    fontWeight: '500',
  },
});
