import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import APP_INFO from '../../config/app-info';

interface PlanFeatureProps {
  title: string;
  included: boolean;
}

interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  features: { title: string; included: boolean }[];
  popular?: boolean;
  onSelect: () => void;
}

const PlanFeature = ({ title, included }: PlanFeatureProps) => (
  <View style={styles.featureItem}>
    <FontAwesome
      name={included ? 'check-circle' : 'times-circle'}
      size={18}
      color={included ? '#34c759' : '#d1d1d6'}
      style={styles.featureIcon}
    />
    <Text style={[styles.featureText, !included && styles.featureDisabled]}>{title}</Text>
  </View>
);

const PlanCard = ({ title, price, period, features, popular, onSelect }: PlanCardProps) => (
  <View style={[styles.planCard, popular && styles.popularCard]}>
    {popular && (
      <View style={styles.popularBadge}>
        <Text style={styles.popularText}>最受欢迎</Text>
      </View>
    )}

    <Text style={styles.planTitle}>{title}</Text>

    <View style={styles.priceContainer}>
      <Text style={styles.currency}>¥</Text>
      <Text style={styles.price}>{price}</Text>
      <Text style={styles.period}>/{period}</Text>
    </View>

    <View style={styles.featuresContainer}>
      {features.map((feature, index) => (
        <PlanFeature key={index} title={feature.title} included={feature.included} />
      ))}
    </View>

    <TouchableOpacity style={[styles.selectButton, popular && styles.popularButton]} onPress={onSelect}>
      <Text style={[styles.selectButtonText, popular && styles.popularButtonText]}>选择此方案</Text>
    </TouchableOpacity>
  </View>
);

export default function PremiumPlanScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  const isPremium = user?.is_premium || false;
  // const premiumExpiry = user?.premium_expiry ? new Date(user.premium_expiry) : null;
  const premiumExpiry = new Date();

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  };

  const handleSelectPlan = (planName: string, price: string) => {
    setIsLoading(true);

    // 模拟处理付款流程
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        '订阅确认',
        `您已选择 ${planName} 方案，价格为 ${price}。这是一个模拟流程，实际情况下将跳转到支付页面。`,
        [
          {
            text: '确定',
            onPress: () => console.log('Subscription confirmed'),
          },
        ]
      );
    }, 1500);
  };

  const handleManageSubscription = () => {
    // 在实际应用中，这里应该跳转到订阅管理页面
    Alert.alert('管理订阅', '这里将展示您的订阅详情和管理选项。', [
      {
        text: '确定',
        onPress: () => console.log('Navigate to subscription management'),
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: '高级计划' }} />
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Image
            style={styles.headerImage}
            source={require('../../assets/images/premium-banner.png')}
            defaultSource={require('../../assets/images/premium-banner.png')}
          />
          <Text style={styles.headerTitle}>解锁 {APP_INFO.NAME} 全部功能</Text>
          <Text style={styles.headerDescription}>升级到高级计划，享受更多强大功能，提升您的工作效率</Text>

          {isPremium && (
            <View style={styles.currentPlanBanner}>
              <FontAwesome name="trophy" size={18} color="#FFF" style={styles.trophyIcon} />
              <Text style={styles.currentPlanText}>
                您当前的高级计划有效期至 {premiumExpiry ? formatDate(premiumExpiry) : '未知日期'}
              </Text>
            </View>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007aff" />
            <Text style={styles.loadingText}>处理中...</Text>
          </View>
        ) : (
          <>
            {/* Subscription Plans */}
            <View style={styles.plansSection}>
              <Text style={styles.sectionHeader}>选择适合您的方案</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansScrollView}>
                <PlanCard
                  title="月度计划"
                  price={APP_INFO.SUBSCRIPTION.MONTHLY.PRICE}
                  period={APP_INFO.SUBSCRIPTION.MONTHLY.PERIOD}
                  features={[
                    { title: '无限任务创建', included: true },
                    { title: '高级任务分类', included: true },
                    { title: '自定义提醒', included: true },
                    { title: '任务数据导出', included: false },
                    { title: '优先客户支持', included: false },
                  ]}
                  onSelect={() =>
                    handleSelectPlan(
                      '月度',
                      `¥${APP_INFO.SUBSCRIPTION.MONTHLY.PRICE}/${APP_INFO.SUBSCRIPTION.MONTHLY.PERIOD}`
                    )
                  }
                />

                <PlanCard
                  title="年度计划"
                  price={APP_INFO.SUBSCRIPTION.YEARLY.PRICE}
                  period={APP_INFO.SUBSCRIPTION.YEARLY.PERIOD}
                  features={[
                    { title: '无限任务创建', included: true },
                    { title: '高级任务分类', included: true },
                    { title: '自定义提醒', included: true },
                    { title: '任务数据导出', included: true },
                    { title: '优先客户支持', included: true },
                  ]}
                  popular={true}
                  onSelect={() =>
                    handleSelectPlan(
                      '年度',
                      `¥${APP_INFO.SUBSCRIPTION.YEARLY.PRICE}/${APP_INFO.SUBSCRIPTION.YEARLY.PERIOD}`
                    )
                  }
                />

                <PlanCard
                  title="永久授权"
                  price={APP_INFO.SUBSCRIPTION.LIFETIME.PRICE}
                  period={APP_INFO.SUBSCRIPTION.LIFETIME.PERIOD}
                  features={[
                    { title: '无限任务创建', included: true },
                    { title: '高级任务分类', included: true },
                    { title: '自定义提醒', included: true },
                    { title: '任务数据导出', included: true },
                    { title: '优先客户支持', included: true },
                  ]}
                  onSelect={() =>
                    handleSelectPlan(
                      '永久',
                      `¥${APP_INFO.SUBSCRIPTION.LIFETIME.PRICE}/${APP_INFO.SUBSCRIPTION.LIFETIME.PERIOD}`
                    )
                  }
                />
              </ScrollView>
            </View>

            {/* Premium Features */}
            <View style={styles.featuresSection}>
              <Text style={styles.sectionHeader}>高级功能</Text>

              <View style={styles.premiumFeatureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: '#ff9500' }]}>
                  <FontAwesome name="tasks" size={20} color="#FFF" />
                </View>
                <View style={styles.premiumFeatureContent}>
                  <Text style={styles.premiumFeatureTitle}>无限任务创建</Text>
                  <Text style={styles.premiumFeatureDescription}>无限制创建任务和子任务，轻松管理复杂项目</Text>
                </View>
              </View>

              <View style={styles.premiumFeatureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: '#ff2d55' }]}>
                  <FontAwesome name="tags" size={20} color="#FFF" />
                </View>
                <View style={styles.premiumFeatureContent}>
                  <Text style={styles.premiumFeatureTitle}>高级任务分类</Text>
                  <Text style={styles.premiumFeatureDescription}>创建自定义标签和分类，打造个性化工作流程</Text>
                </View>
              </View>

              <View style={styles.premiumFeatureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: '#5e5ce6' }]}>
                  <FontAwesome name="bell" size={20} color="#FFF" />
                </View>
                <View style={styles.premiumFeatureContent}>
                  <Text style={styles.premiumFeatureTitle}>高级提醒与重复任务</Text>
                  <Text style={styles.premiumFeatureDescription}>设置自定义重复规则和精确的提醒时间</Text>
                </View>
              </View>

              <View style={styles.premiumFeatureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: '#30c48d' }]}>
                  <FontAwesome name="file-text" size={20} color="#FFF" />
                </View>
                <View style={styles.premiumFeatureContent}>
                  <Text style={styles.premiumFeatureTitle}>数据导出与备份</Text>
                  <Text style={styles.premiumFeatureDescription}>导出任务数据，创建自动备份，确保数据安全</Text>
                </View>
              </View>

              <View style={styles.premiumFeatureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: '#007aff' }]}>
                  <FontAwesome name="paint-brush" size={20} color="#FFF" />
                </View>
                <View style={styles.premiumFeatureContent}>
                  <Text style={styles.premiumFeatureTitle}>自定义主题</Text>
                  <Text style={styles.premiumFeatureDescription}>个性化应用外观，选择多种颜色主题和暗黑模式</Text>
                </View>
              </View>
            </View>

            {/* FAQ */}
            <View style={styles.faqSection}>
              <Text style={styles.sectionHeader}>常见问题</Text>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>如何取消订阅？</Text>
                <Text style={styles.faqAnswer}>
                  您可以随时在账户设置中取消订阅。取消后，您仍可使用高级功能直到当前订阅期结束。
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>订阅会自动续费吗？</Text>
                <Text style={styles.faqAnswer}>
                  是的，月度和年度订阅会自动续费。我们会在续费前通过邮件提醒您。永久授权是一次性付款，不会自动续费。
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>能否更换订阅计划？</Text>
                <Text style={styles.faqAnswer}>
                  可以。您可以随时在账户设置中升级或降级您的订阅计划。升级时将立即生效，降级将在当前订阅期结束后生效。
                </Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>付款方式有哪些？</Text>
                <Text style={styles.faqAnswer}>
                  我们支持支付宝、微信支付、信用卡和PayPal等多种支付方式，确保您可以方便地进行订阅。
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsSection}>
              {isPremium ? (
                <TouchableOpacity style={styles.manageButton} onPress={handleManageSubscription}>
                  <Text style={styles.manageButtonText}>管理我的订阅</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.freeTrialButton} onPress={() => handleSelectPlan('试用', '免费')}>
                  <Text style={styles.freeTrialButtonText}>免费试用 {APP_INFO.SUBSCRIPTION.TRIAL_DAYS} 天</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.contactButton} onPress={() => router.push('/(profile)/help-support')}>
                <Text style={styles.contactButtonText}>有任何问题？联系我们</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>订阅条款：订阅会自动续订，除非在当前订阅期结束前至少24小时取消。</Text>
          <Text style={styles.footerText}>
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
    padding: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 16,
    color: '#3a3a3c',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  currentPlanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5e5ce6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
  },
  trophyIcon: {
    marginRight: 8,
  },
  currentPlanText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#3a3a3c',
  },
  plansSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    fontWeight: '600',
    fontSize: 18,
    color: '#3a3a3c',
    marginBottom: 16,
  },
  plansScrollView: {
    paddingBottom: 8,
  },
  planCard: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  popularCard: {
    borderColor: '#5e5ce6',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#5e5ce6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currency: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3a3a3c',
    marginRight: 2,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3a3a3c',
  },
  period: {
    fontSize: 14,
    color: '#8e8e93',
    marginLeft: 2,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
    width: 20,
  },
  featureText: {
    fontSize: 14,
    color: '#3a3a3c',
    flex: 1,
  },
  featureDisabled: {
    color: '#8e8e93',
  },
  selectButton: {
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  popularButton: {
    backgroundColor: '#5e5ce6',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3a3a3c',
  },
  popularButtonText: {
    color: '#FFFFFF',
  },
  featuresSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 20,
  },
  premiumFeatureItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  premiumFeatureContent: {
    flex: 1,
  },
  premiumFeatureTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  premiumFeatureDescription: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
  },
  faqSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#3a3a3c',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
  },
  actionsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  freeTrialButton: {
    backgroundColor: '#5e5ce6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  freeTrialButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  manageButton: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    paddingVertical: 12,
  },
  contactButtonText: {
    color: '#007aff',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
});
