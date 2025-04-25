import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

const NativeRegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  // 从认证存储中获取状态和方法
  const { nativeSignUp, isLoading, error } = useAuthStore();

  // 处理注册错误
  useEffect(() => {
    if (error) {
      Alert.alert('注册失败', error);
    }
  }, [error]);

  const isRegisterEnabled =
    username.length > 0 &&
    fullName.length > 0 &&
    email.length > 0 &&
    password.length >= 8 &&
    password === confirmPassword &&
    !isLoading;

  const handleRegister = async () => {
    if (!isRegisterEnabled) return;

    // 检查密码是否包含字母和数字
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLetter || !hasNumber) {
      Alert.alert('密码格式错误', '密码必须同时包含字母和数字');
      return;
    }

    // 调用原生注册方法
    await nativeSignUp(username, email, password, fullName);
  };

  const navigateToLogin = () => {
    router.back();
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
          style={styles.contentArea}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 顶部导航 */}
          <View style={styles.navHeader}>
            <TouchableOpacity style={styles.backButton} onPress={navigateToLogin} disabled={isLoading}>
              <Ionicons name="chevron-back" size={20} color="#FF9500" />
              <Text style={styles.backButtonText}>返回</Text>
            </TouchableOpacity>
            <Text style={styles.pageTitle}>原生用户注册</Text>
            <TouchableOpacity style={styles.switchButton} onPress={navigateToSupabaseAuth}>
              <Text style={styles.switchButtonText}>Supabase 认证</Text>
            </TouchableOpacity>
          </View>

          {/* Logo and App Name */}
          <View style={styles.logoArea}>
            <View style={styles.appLogo}>
              <Ionicons name="person-add" size={48} color="white" />
            </View>
            <Text style={styles.appName}>TodoList</Text>
            <Text style={styles.appSlogan}>创建原生用户账号</Text>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            <Text style={styles.formLabel}>用户名</Text>
            <TextInput
              style={styles.formInput}
              placeholder="请输入用户名"
              placeholderTextColor="#a0a0a0"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isLoading}
            />

            <Text style={styles.formLabel}>全名</Text>
            <TextInput
              style={styles.formInput}
              placeholder="请输入您的全名"
              placeholderTextColor="#a0a0a0"
              value={fullName}
              onChangeText={setFullName}
              editable={!isLoading}
            />

            <Text style={styles.formLabel}>邮箱地址</Text>
            <TextInput
              style={styles.formInput}
              placeholder="请输入您的邮箱地址"
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
              placeholder="至少8位字符，包含字母和数字"
              placeholderTextColor="#a0a0a0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />

            <Text style={styles.formLabel}>确认密码</Text>
            <TextInput
              style={styles.formInput}
              placeholder="再次输入密码"
              placeholderTextColor="#a0a0a0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!isLoading}
            />

            <Text style={styles.termsPrivacy}>
              点击"注册"按钮，表示您同意我们的
              <Text style={styles.termsLink}> 服务条款 </Text>
              和
              <Text style={styles.termsLink}> 隐私政策 </Text>
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, !isRegisterEnabled && styles.disabledBtn]}
              onPress={handleRegister}
              disabled={!isRegisterEnabled}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryBtnText}>注册</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Prompt */}
          <TouchableOpacity
            style={styles.loginPrompt}
            onPress={navigateToLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginPromptText}>
              已有账号? <Text style={styles.loginLink}>立即登录</Text>
            </Text>
          </TouchableOpacity>
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
  contentArea: {
    flex: 1,
    padding: 16,
  },
  navHeader: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FF9500',
    fontSize: 17,
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  switchButton: {
    padding: 8,
  },
  switchButtonText: {
    color: '#007AFF',
    fontSize: 15,
  },
  logoArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
  termsPrivacy: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: '#FF9500',
  },
  primaryBtn: {
    width: '100%',
    padding: 16,
    backgroundColor: '#FF9500',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 17,
  },
  disabledBtn: {
    backgroundColor: '#B0B0B0',
  },
  loginPrompt: {
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  loginPromptText: {
    fontSize: 15,
  },
  loginLink: {
    color: '#FF9500',
    fontWeight: '600',
  },
});

export default NativeRegisterScreen; 