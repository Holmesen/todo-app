import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import APP_INFO from '../../config/app-info';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqQuestion} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.faqQuestionText}>{question}</Text>
        <FontAwesome name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color="#8e8e93" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

interface SupportOptionProps {
  icon: string;
  title: string;
  description: string;
  action: () => void;
}

const SupportOption = ({ icon, title, description, action }: SupportOptionProps) => (
  <TouchableOpacity style={styles.supportOption} onPress={action}>
    <View style={styles.supportIconContainer}>
      <FontAwesome name={icon as any} size={20} color="#007aff" />
    </View>
    <View style={styles.supportContent}>
      <Text style={styles.supportTitle}>{title}</Text>
      <Text style={styles.supportDescription}>{description}</Text>
    </View>
    <FontAwesome name="chevron-right" size={14} color="#c7c7cc" />
  </TouchableOpacity>
);

export default function HelpSupportScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleEmailSupport = () => {
    Linking.openURL(`mailto:${APP_INFO.SUPPORT_EMAIL}?subject=${APP_INFO.NAME}%20App%20Support`);
  };

  const handleOpenHelp = () => {
    Linking.openURL(APP_INFO.HELP_URL);
  };

  const handleOpenCommunity = () => {
    Linking.openURL(APP_INFO.COMMUNITY_URL);
  };

  const handleOpenTwitter = () => {
    const twitterUrl =
      Platform.OS === 'ios'
        ? `twitter://user?screen_name=${APP_INFO.TWITTER_HANDLE}`
        : `https://twitter.com/${APP_INFO.TWITTER_HANDLE}`;

    Linking.canOpenURL(twitterUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(twitterUrl);
        } else {
          return Linking.openURL(`https://twitter.com/${APP_INFO.TWITTER_HANDLE}`);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  return (
    <>
      <Stack.Screen options={{ title: '帮助与支持' }} />
      <ScrollView style={styles.container}>
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <FontAwesome name="search" size={16} color="#8e8e93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索常见问题"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8e8e93"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <FontAwesome name="times-circle" size={16} color="#8e8e93" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Support Options */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>联系我们</Text>

          <SupportOption
            icon="envelope"
            title="电子邮件支持"
            description="发送邮件至支持团队"
            action={handleEmailSupport}
          />

          <SupportOption icon="globe" title="帮助中心" description="浏览我们的在线帮助资源" action={handleOpenHelp} />

          <SupportOption icon="users" title="社区论坛" description="向其他用户寻求帮助" action={handleOpenCommunity} />

          <SupportOption
            icon="twitter"
            title="Twitter 支持"
            description="通过 Twitter 联系我们"
            action={handleOpenTwitter}
          />
        </View>

        {/* FAQ Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>常见问题</Text>

          <FAQItem
            question="如何创建新任务？"
            answer="点击主屏幕底部的加号按钮，填写任务详情，然后点击保存按钮即可创建新任务。您可以设置任务的截止日期、优先级和提醒时间。"
          />

          <FAQItem
            question="如何编辑或删除任务？"
            answer="点击任务列表中的任务，在任务详情页面，您可以点击编辑按钮进行修改，或点击删除按钮移除任务。您也可以在任务列表中左滑任务来快速删除。"
          />

          <FAQItem
            question="如何设置任务提醒？"
            answer='创建或编辑任务时，选择"提醒"选项，然后设置您希望收到提醒的时间。确保您已在设置中启用通知功能。'
          />

          <FAQItem
            question="如何在多个设备上同步任务？"
            answer='确保您已登录账户，并在设置中启用了"数据同步"选项。这样您的任务将自动在所有已登录的设备上同步。'
          />

          <FAQItem
            question="忘记密码怎么办？"
            answer='在登录页面点击"忘记密码"链接，输入您的注册邮箱，然后按照邮件中的指示重置密码。'
          />

          <FAQItem
            question="专业版有哪些额外功能？"
            answer='专业版提供更多高级功能，包括无限任务创建、高级统计分析、自定义主题、任务附件、优先支持等。您可以在"个人资料"页面的"高级计划"中了解更多详情。'
          />
        </View>

        {/* Troubleshooting Tips */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>故障排除</Text>

          <Text style={styles.tipHeader}>应用无法启动</Text>
          <Text style={styles.tipText}>
            尝试重启设备，确保您的系统版本符合应用要求。如果问题仍然存在，请尝试卸载并重新安装应用。
          </Text>

          <Text style={styles.tipHeader}>任务无法同步</Text>
          <Text style={styles.tipText}>
            检查您的网络连接，确保在设置中启用了"数据同步"选项，并验证您已登录账户。如果问题仍然存在，可以尝试登出后重新登录。
          </Text>

          <Text style={styles.tipHeader}>没有收到通知</Text>
          <Text style={styles.tipText}>
            请检查您的设备通知设置，确保应用有通知权限。同时，在应用设置中验证"通知"选项已开启。
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>如果您需要进一步的帮助，请通过 {APP_INFO.SUPPORT_EMAIL} 联系我们。</Text>
          <Text style={styles.footerText}>我们的客服团队会在 24 小时内回复您的咨询。</Text>
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
  searchContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 4,
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
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  supportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 14,
    color: '#8e8e93',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
    marginBottom: 8,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    paddingRight: 16,
  },
  faqAnswer: {
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 15,
    color: '#3a3a3c',
    lineHeight: 22,
  },
  tipHeader: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 15,
    color: '#3a3a3c',
    lineHeight: 22,
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 4,
  },
});
