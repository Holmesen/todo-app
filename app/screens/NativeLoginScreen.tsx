import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

const NativeLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // 从认证存储中获取状态和方法
  const { nativeSignIn, isLoading, error } = useAuthStore();

  // 处理登录错误
  useEffect(() => {
    if (error) {
      Alert.alert('登录失败', error);
    }
  }, [error]);

  const isLoginEnabled = email.length > 0 && password.length > 0 && !isLoading;

  const handleLogin = async () => {
    if (!isLoginEnabled) return;

    // 调用原生登录方法
    await nativeSignIn(email, password);
  };

  const navigateToNativeRegister = () => {
    router.push('/screens/NativeRegisterScreen');
  };

  const navigateToSupabaseAuth = () => {
    router.push('/screens/LoginScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentArea}>
            {/* 返回按钮 */}
            <TouchableOpacity style={styles.backButton} onPress={navigateToSupabaseAuth}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
              <Text style={styles.backButtonText}>返回 Supabase 认证</Text>
            </TouchableOpacity>

            {/* 标题 */}
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>原生用户登录</Text>
              <Text style={styles.headerSubtitle}>使用直接存储在数据库中的用户凭据登录</Text>
            </View>

            {/* Logo and App Name */}
            <View style={styles.logoArea}>
              <View style={styles.appLogo}>
                <Ionicons name="person" size={48} color="white" />
              </View>
              <Text style={styles.appName}>TodoList</Text>
              <Text style={styles.appSlogan}>使用原生用户认证</Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              <Text style={styles.formLabel}>邮箱地址</Text>
              <TextInput
                style={styles.formInput}
                placeholder="请输入您的邮箱"
                placeholderTextColor="#a0a0a0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />

              <Text style={styles.formLabel}>密码</Text>
              <TextInput
                style={styles.formInput}
                placeholder="请输入密码"
                placeholderTextColor="#a0a0a0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, !isLoginEnabled && styles.disabledBtn]}
                onPress={handleLogin}
                disabled={!isLoginEnabled}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.primaryBtnText}>登录</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* 分割线 */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>或</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Prompt */}
            <TouchableOpacity
              style={styles.signupPrompt}
              onPress={navigateToNativeRegister}
              disabled={isLoading}
            >
              <Text style={styles.signupPromptText}>
                还没有账号? <Text style={styles.signupLink}>立即注册</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 8,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  logoArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontWeight: '700',
    fontSize: 28,
    color: '#FF9500',
  },
  appSlogan: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3A3A3C',
    marginBottom: 8,
  },
  formInput: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    fontSize: 16,
    backgroundColor: '#F2F2F7',
    marginBottom: 16,
  },
  primaryBtn: {
    width: '100%',
    padding: 16,
    backgroundColor: '#FF9500',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 17,
  },
  disabledBtn: {
    backgroundColor: '#B0B0B0',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#8E8E93',
    fontSize: 14,
  },
  signupPrompt: {
    alignItems: 'center',
    padding: 20,
  },
  signupPromptText: {
    fontSize: 15,
  },
  signupLink: {
    color: '#FF9500',
    fontWeight: '600',
  },
});

export default NativeLoginScreen; 