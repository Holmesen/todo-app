import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import APP_INFO from '../../config/app-info';

export default function RateAppScreen() {
  const router = useRouter();
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // 打开应用商店
  const openAppStore = () => {
    const storeUrl = Platform.OS === 'ios' ? APP_INFO.APP_STORE_URL : APP_INFO.PLAY_STORE_URL;

    Linking.canOpenURL(storeUrl).then((supported) => {
      if (supported) {
        Linking.openURL(storeUrl);
      } else {
        Alert.alert('无法打开应用商店', '请手动在应用商店中搜索"TaskMaster"进行评价。', [
          { text: '确定', style: 'default' },
        ]);
      }
    });
  };

  // 分享应用
  const shareApp = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL(
        `sms:&body=我正在使用${APP_INFO.NAME}应用管理我的任务，非常好用！推荐你也试试：${APP_INFO.WEBSITE}`
      );
    } else {
      Linking.openURL(
        `sms:?body=我正在使用${APP_INFO.NAME}应用管理我的任务，非常好用！推荐你也试试：${APP_INFO.WEBSITE}`
      );
    }
  };

  // 提交反馈
  const submitFeedback = () => {
    setIsSubmittingFeedback(true);

    // 模拟提交过程
    setTimeout(() => {
      setIsSubmittingFeedback(false);
      Alert.alert('感谢您的反馈', '我们已收到您的星级评价，这将帮助我们不断改进应用。', [
        {
          text: '继续评价',
          onPress: openAppStore,
          style: 'default',
        },
        {
          text: '稍后再说',
          style: 'cancel',
        },
      ]);
    }, 1500);
  };

  return (
    <>
      <Stack.Screen options={{ title: '评价应用' }} />
      <ScrollView style={styles.container}>
        {/* 头部 */}
        <View style={styles.headerSection}>
          <Image
            style={styles.appIcon}
            source={require('../../assets/images/app-logo.png')}
            defaultSource={require('../../assets/images/app-logo.png')}
          />
          <Text style={styles.headerTitle}>喜欢 {APP_INFO.NAME} 吗？</Text>
          <Text style={styles.headerSubtitle}>您的评价将帮助我们不断改进，为您提供更好的体验。</Text>
        </View>

        {/* 评分选项 */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>请为应用评分</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={submitFeedback} disabled={isSubmittingFeedback}>
                <FontAwesome name="star" size={40} color="#FFD700" style={styles.starIcon} />
              </TouchableOpacity>
            ))}
          </View>
          {isSubmittingFeedback && <Text style={styles.submittingText}>提交中...</Text>}
        </View>

        {/* 应用商店评价 */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton} onPress={openAppStore}>
            <FontAwesome name="star" size={22} color="#FFFFFF" style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>在应用商店评价</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#34c759' }]} onPress={shareApp}>
            <FontAwesome name="share-alt" size={22} color="#FFFFFF" style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>推荐给朋友</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#5e5ce6' }]}
            onPress={() => router.push('/(profile)/feedback')}
          >
            <FontAwesome name="comment" size={22} color="#FFFFFF" style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>提供详细反馈</Text>
          </TouchableOpacity>
        </View>

        {/* 评价说明 */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <FontAwesome name="info-circle" size={20} color="#007aff" style={styles.infoIcon} />
            <Text style={styles.infoText}>您的评价可以帮助其他用户发现这款应用</Text>
          </View>

          <View style={styles.infoItem}>
            <FontAwesome name="check-circle" size={20} color="#34c759" style={styles.infoIcon} />
            <Text style={styles.infoText}>好评将鼓励我们持续改进和添加新功能</Text>
          </View>

          <View style={styles.infoItem}>
            <FontAwesome name="lightbulb-o" size={20} color="#ff9500" style={styles.infoIcon} />
            <Text style={styles.infoText}>如有具体建议，请使用"提供详细反馈"选项</Text>
          </View>
        </View>

        {/* 感谢信息 */}
        <View style={styles.thankyouSection}>
          <Text style={styles.thankyouText}>感谢您抽出宝贵时间评价我们的应用！</Text>
          <Text style={styles.thankyouSubtext}>—— {APP_INFO.NAME} 团队</Text>
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
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#3a3a3c',
    textAlign: 'center',
    lineHeight: 22,
  },
  ratingSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starIcon: {
    marginHorizontal: 8,
  },
  submittingText: {
    marginTop: 10,
    color: '#8e8e93',
    fontSize: 14,
  },
  actionSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#007aff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    marginRight: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    fontSize: 15,
    color: '#3a3a3c',
    flex: 1,
    lineHeight: 22,
  },
  thankyouSection: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  thankyouText: {
    fontSize: 16,
    color: '#3a3a3c',
    textAlign: 'center',
    marginBottom: 8,
  },
  thankyouSubtext: {
    fontSize: 14,
    color: '#8e8e93',
    fontStyle: 'italic',
  },
});
