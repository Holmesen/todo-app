import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import APP_INFO from '../../config/app-info';

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem = ({ icon, title, description }: FeatureItemProps) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <FontAwesome name={icon as any} size={20} color="#007aff" />
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

export default function AboutScreen() {
  const handleOpenWebsite = () => {
    Linking.openURL(APP_INFO.WEBSITE);
  };

  const handleOpenPrivacyPolicy = () => {
    Linking.openURL(APP_INFO.PRIVACY_POLICY_URL);
  };

  const handleOpenTerms = () => {
    Linking.openURL(APP_INFO.TERMS_URL);
  };

  return (
    <>
      <Stack.Screen options={{ title: '关于' }} />
      <ScrollView style={styles.container}>
        {/* App Logo and Info */}
        <View style={styles.headerSection}>
          <Image
            style={styles.logo}
            source={require('../../assets/images/app-logo.png')}
            defaultSource={require('../../assets/images/app-logo.png')}
          />
          <Text style={styles.appName}>{APP_INFO.NAME}</Text>
          <Text style={styles.appVersion}>
            版本 {APP_INFO.VERSION} ({APP_INFO.BUILD_NUMBER})
          </Text>
          <Text style={styles.releaseDate}>发布日期: {APP_INFO.RELEASE_DATE}</Text>
        </View>

        {/* App Description */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionText}>
            {APP_INFO.NAME}{' '}
            是一款功能强大的任务管理应用，帮助您组织日常工作、学习和生活中的各项任务。无论是个人使用还是团队协作，
            {APP_INFO.NAME} 都能提供直观且高效的任务管理体验。
          </Text>
        </View>

        {/* Key Features */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>主要功能</Text>

          <FeatureItem icon="list-ul" title="任务管理" description="创建、编辑和组织您的任务，设置优先级和截止日期" />

          <FeatureItem icon="bell" title="提醒通知" description="及时收到任务截止日期和重要事项的提醒" />

          <FeatureItem icon="users" title="团队协作" description="与团队成员共享任务列表，分配任务和跟踪进度" />

          <FeatureItem icon="cloud" title="云同步" description="在多个设备间无缝同步您的任务和设置" />

          <FeatureItem icon="bar-chart" title="统计分析" description="查看任务完成情况和效率分析报告" />
        </View>

        {/* Developer Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>开发信息</Text>
          <Text style={styles.developerText}>开发者: {APP_INFO.COMPANY}</Text>
          <Text style={styles.developerText}>邮箱: {APP_INFO.SUPPORT_EMAIL}</Text>

          <TouchableOpacity style={styles.linkButton} onPress={handleOpenWebsite}>
            <Text style={styles.linkButtonText}>访问官方网站</Text>
            <FontAwesome name="external-link" size={14} color="#007aff" style={styles.linkIcon} />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>法律信息</Text>

          <TouchableOpacity style={styles.linkButton} onPress={handleOpenPrivacyPolicy}>
            <Text style={styles.linkButtonText}>隐私政策</Text>
            <FontAwesome name="chevron-right" size={14} color="#8e8e93" style={styles.linkIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={handleOpenTerms}>
            <Text style={styles.linkButtonText}>使用条款</Text>
            <FontAwesome name="chevron-right" size={14} color="#8e8e93" style={styles.linkIcon} />
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>
            © {APP_INFO.COPYRIGHT_YEAR} {APP_INFO.COMPANY} 保留所有权利
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  headerSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 16,
    color: '#3a3a3c',
    marginBottom: 4,
  },
  releaseDate: {
    fontSize: 14,
    color: '#8e8e93',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    padding: 16,
  },
  sectionHeader: {
    fontWeight: '600',
    fontSize: 18,
    color: '#3a3a3c',
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 16,
    color: '#3a3a3c',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
  },
  developerText: {
    fontSize: 16,
    color: '#3a3a3c',
    marginBottom: 8,
  },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  linkButtonText: {
    fontSize: 16,
    color: '#007aff',
  },
  linkIcon: {
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  copyright: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
  },
});
