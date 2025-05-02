import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Image,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';

interface FeedbackFormProps {
  onSubmit: (feedback: {
    feedbackType: string;
    title: string;
    description: string;
    screenshotUrl?: string;
    imageFilePath?: string;
  }) => void;
  isSubmitting: boolean;
  userId: string;
}

const feedbackTypes = [
  { id: 'bug_report', label: '报告问题', icon: 'bug-report' },
  { id: 'feature_request', label: '功能建议', icon: 'lightbulb' },
  { id: 'general_feedback', label: '一般反馈', icon: 'feedback' },
  { id: 'usability_issue', label: '易用性问题', icon: 'touch-app' },
  { id: 'performance_issue', label: '性能问题', icon: 'speed' },
];

export default function FeedbackForm({ onSubmit, isSubmitting, userId }: FeedbackFormProps) {
  const [selectedType, setSelectedType] = useState('general_feedback');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 将URI转换为base64
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

  // 上传图片到Supabase Storage
  const uploadImage = async (uri: string): Promise<string> => {
    try {
      setIsUploading(true);

      if (!userId) throw new Error('用户未登录');

      const fileName = `feedback-${userId}-${Date.now()}.jpg`;
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
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('权限错误', '需要相册访问权限才能上传截图');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setScreenshot(result.assets[0].uri);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', '无法选择图片，请重试');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('错误', '请输入反馈标题');
      return;
    }

    if (!description.trim()) {
      Alert.alert('错误', '请输入反馈详情');
      return;
    }

    try {
      let screenshotUrl = undefined;

      // 如果有截图，上传到Supabase
      if (screenshot) {
        try {
          screenshotUrl = await uploadImage(screenshot);
        } catch (error) {
          console.error('上传截图失败:', error);
          Alert.alert('警告', '截图上传失败，是否仍要继续提交反馈？', [
            {
              text: '取消',
              style: 'cancel',
            },
            {
              text: '继续提交',
              onPress: () => {
                // 没有截图的情况下提交
                onSubmit({
                  feedbackType: selectedType,
                  title: title.trim(),
                  description: description.trim(),
                });
              },
            },
          ]);
          return; // 等待用户选择是否继续
        }
      }

      // 提交反馈（包含截图URL）
      onSubmit({
        feedbackType: selectedType,
        title: title.trim(),
        description: description.trim(),
        screenshotUrl,
      });
    } catch (error) {
      console.error('提交反馈时出错:', error);
      Alert.alert('错误', '提交过程中发生错误，请重试');
    }
  };

  const getDeviceInfo = () => {
    const deviceName = Device.deviceName || '未知设备';
    const osName = Platform.OS === 'ios' ? 'iOS' : 'Android';
    const osVersion = Platform.Version.toString();
    const appVersion = Constants.expoConfig?.version || '1.0.0';

    return `${deviceName}, ${osName} ${osVersion}, App v${appVersion}`;
  };

  // 提交按钮是否禁用
  const isSubmitDisabled = isSubmitting || isUploading || !title.trim() || !description.trim();

  // 提交按钮文字
  const getSubmitButtonText = () => {
    if (isSubmitting) return '提交中...';
    if (isUploading) return '正在上传图片...';
    return '提交反馈';
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>用户反馈</Text>
        <Text style={styles.subtitle}>我们非常重视您的意见和建议！</Text>

        <Text style={styles.sectionTitle}>反馈类型</Text>
        <View style={styles.typeContainer}>
          {feedbackTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.typeButton, selectedType === type.id && styles.selectedTypeButton]}
              onPress={() => setSelectedType(type.id)}
            >
              <MaterialIcons
                name={type.icon as any}
                size={20}
                color={selectedType === type.id ? '#fff' : '#007AFF'}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.typeButtonText, selectedType === type.id && styles.selectedTypeButtonText]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>反馈标题</Text>
        <TextInput
          style={styles.input}
          placeholder="请简短描述您的反馈（必填）"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={styles.sectionTitle}>详细描述</Text>
        <TextInput
          style={styles.textArea}
          placeholder="请详细描述您的反馈内容，包括您遇到的问题或建议（必填）"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />

        <Text style={styles.sectionTitle}>屏幕截图（可选）</Text>
        {screenshot ? (
          <View style={styles.screenshotContainer}>
            <Image source={{ uri: screenshot }} style={styles.screenshot} />
            <TouchableOpacity style={styles.removeButton} onPress={() => setScreenshot(null)}>
              <MaterialIcons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <MaterialIcons name="add-a-photo" size={20} color="#fff" style={{ marginRight: 5 }} />
            <Text style={styles.uploadButtonText}>添加截图</Text>
          </TouchableOpacity>
        )}

        <View style={styles.deviceInfoContainer}>
          <MaterialIcons name="info" size={16} color="#888" />
          <Text style={styles.deviceInfoText}>设备信息: {getDeviceInfo()}</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitDisabled && styles.disabledButton]}
          disabled={isSubmitDisabled}
          onPress={handleSubmit}
        >
          {isSubmitting || isUploading ? (
            <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
          ) : null}
          <Text style={styles.submitButtonText}>{getSubmitButtonText()}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#444',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  selectedTypeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  selectedTypeButtonText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#f9f9f9',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  screenshotContainer: {
    marginTop: 8,
    position: 'relative',
    alignItems: 'center',
  },
  screenshot: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  deviceInfoText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#c1c1c1',
  },
});
