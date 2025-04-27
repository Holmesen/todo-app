import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface UserSettings {
  notifications_enabled: boolean;
  app_lock_enabled: boolean;
  data_sync_enabled: boolean;
}

interface SettingItemProps {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  badge?: string;
  rightElement?: React.ReactNode;
}

const SettingItem = ({ icon, iconColor, title, description, badge, rightElement }: SettingItemProps) => (
  <View style={styles.settingRow}>
    <View style={[styles.settingIcon, { backgroundColor: iconColor }]}>
      <FontAwesome name={icon as any} size={16} color="#FFF" />
    </View>
    <View style={styles.settingDetail}>
      <View style={styles.titleContainer}>
        <Text style={styles.settingName}>{title}</Text>
        {badge && <View style={styles.badgeContainer}><Text style={styles.badgeText}>{badge}</Text></View>}
      </View>
      <Text style={styles.settingDescription}>{description}</Text>
    </View>
    {rightElement}
  </View>
);

const ToggleItem = ({ isEnabled, onChange }: { isEnabled: boolean; onChange: () => void }) => (
  <Switch
    trackColor={{ false: '#e5e5ea', true: '#34c759' }}
    thumbColor="#FFFFFF"
    onValueChange={onChange}
    value={isEnabled}
  />
);

const ChevronItem = ({ value }: { value?: string }) => (
  <View style={styles.chevronContainer}>
    {value && <Text style={styles.settingValue}>{value}</Text>}
    <FontAwesome name="chevron-right" size={14} color="#c7c7cc" />
  </View>
);

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 获取用户设置
    const fetchUserSettings = async () => {
      try {
        setIsLoading(true);

        if (!user?.id) {
          setIsLoading(false);
          return;
        }

        // 从 Supabase 获取用户设置
        const { data, error } = await supabase
          .from('todo_user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('获取用户设置时出错:', error);
          // 如果没有找到记录，使用默认设置
          setUserSettings({
            notifications_enabled: true,
            app_lock_enabled: false,
            data_sync_enabled: true
          });
        } else {
          setUserSettings(data);
        }
      } catch (err) {
        console.error('获取用户设置时发生异常:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSettings();
  }, [user]);

  // 更新用户设置
  const updateUserSetting = async (setting: keyof UserSettings, value: boolean) => {
    if (!userSettings) return;

    // 更新本地状态
    setUserSettings(prev => prev ? { ...prev, [setting]: value } : null);

    if (!user?.id) return;

    // 更新数据库
    try {
      const { error } = await supabase
        .from('todo_user_settings')
        .upsert({
          user_id: user.id,
          [setting]: value,
          // 如果是新记录，添加所有需要的字段
          ...(userSettings ? {} : {
            notifications_enabled: setting === 'notifications_enabled' ? value : true,
            app_lock_enabled: setting === 'app_lock_enabled' ? value : false,
            data_sync_enabled: setting === 'data_sync_enabled' ? value : true,
          })
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('更新用户设置时出错:', error);
        // 回滚本地状态
        setUserSettings(prev => prev ? { ...prev, [setting]: !value } : null);
      }
    } catch (err) {
      console.error('更新用户设置时发生异常:', err);
      // 回滚本地状态
      setUserSettings(prev => prev ? { ...prev, [setting]: !value } : null);
    }
  };

  // 处理登出
  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  // 如果没有用户，显示未登录信息
  if (!user) {
    return (
      <View style={styles.notLoggedInContainer}>
        <Text style={styles.notLoggedInText}>您尚未登录</Text>
      </View>
    );
  }

  // 获取用户信息
  const username = user.username;

  const email = user.email;

  const profileImage = user.profile_image || `https://ui-avatars.com/api/?name=${user.full_name}`;

  const userTimeZone = user.time_zone || 'UTC+0';

  const userTheme = user.theme || 'Light';

  const isPremium = user.is_premium || false;

  return (
    <ScrollView style={styles.container}>
      {/* Header with Profile Info */}
      <View style={styles.headerSection}>
        <Image
          style={styles.profileImage}
          source={{
            uri: profileImage,
          }}
        />
        <Text style={styles.userName}>{username}</Text>
        <Text style={styles.userEmail}>{email}</Text>
        <TouchableOpacity style={styles.editProfileBtn}>
          <FontAwesome name="edit" size={14} color="#007aff" style={styles.editIcon} />
          <Text style={styles.editProfileText}>编辑个人资料</Text>
        </TouchableOpacity>
      </View>

      {/* Account Settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>账户设置</Text>

        <SettingItem
          icon="bell"
          iconColor="#ff9500"
          title="通知"
          description="任务提醒和通知"
          rightElement={
            <ToggleItem
              isEnabled={userSettings?.notifications_enabled ?? true}
              onChange={() => updateUserSetting('notifications_enabled', !(userSettings?.notifications_enabled ?? true))}
            />
          }
        />

        <SettingItem
          icon="clock-o"
          iconColor="#ff2d55"
          title="时区"
          description="设置您的本地时区"
          rightElement={<ChevronItem value={userTimeZone} />}
        />

        <SettingItem
          icon="paint-brush"
          iconColor="#5e5ce6"
          title="主题"
          description="更改应用外观"
          rightElement={<ChevronItem value={userTheme} />}
        />
      </View>

      {/* Security Settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>安全</Text>

        <SettingItem
          icon="lock"
          iconColor="#007aff"
          title="应用锁"
          description="使用Face ID或PIN锁定应用"
          rightElement={
            <ToggleItem
              isEnabled={userSettings?.app_lock_enabled ?? false}
              onChange={() => updateUserSetting('app_lock_enabled', !(userSettings?.app_lock_enabled ?? false))}
            />
          }
        />

        <SettingItem
          icon="cloud-upload"
          iconColor="#30c48d"
          title="数据同步"
          description="在设备间同步任务"
          rightElement={
            <ToggleItem
              isEnabled={userSettings?.data_sync_enabled ?? true}
              onChange={() => updateUserSetting('data_sync_enabled', !(userSettings?.data_sync_enabled ?? true))}
            />
          }
        />
      </View>

      {/* Premium */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>高级会员</Text>

        <SettingItem
          icon="trophy"
          iconColor="#5e5ce6"
          title="高级计划"
          badge={isPremium ? "专业版" : undefined}
          description={isPremium ? "有效期至2024年3月15日" : "解锁所有功能"}
          rightElement={<ChevronItem />}
        />
      </View>

      {/* About & Support */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>关于与支持</Text>

        <SettingItem
          icon="info"
          iconColor="#64d2ff"
          title="关于"
          description="应用版本与信息"
          rightElement={<ChevronItem value="v2.1.0" />}
        />

        <SettingItem
          icon="question-circle"
          iconColor="#64d2ff"
          title="帮助与支持"
          description="获取应用使用帮助"
          rightElement={<ChevronItem />}
        />

        <SettingItem
          icon="star"
          iconColor="#64d2ff"
          title="评价应用"
          description="分享您的反馈"
          rightElement={<ChevronItem />}
        />
      </View>

      {/* Logout Button */}
      <View style={styles.sectionCard}>
        <TouchableOpacity style={styles.logoutRow} onPress={handleSignOut}>
          <Text style={styles.logoutBtn}>退出登录</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>TodoList App v2.1.0</Text>
        <Text style={styles.footerText}>© 2023 TaskMaster Inc. 保留所有权利</Text>
      </View>
    </ScrollView>
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
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
  },
  notLoggedInText: {
    fontSize: 18,
    color: '#8e8e93',
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 12,
  },
  userName: {
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 4,
  },
  userEmail: {
    color: '#8e8e93',
    fontSize: 15,
    marginBottom: 12,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    marginRight: 6,
  },
  editProfileText: {
    color: '#007aff',
    fontSize: 15,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingVertical: 16,
    fontWeight: '600',
    fontSize: 16,
    color: '#3a3a3c',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingDetail: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingName: {
    fontWeight: '500',
    fontSize: 17,
    marginBottom: 2,
  },
  settingDescription: {
    color: '#8e8e93',
    fontSize: 14,
  },
  settingValue: {
    color: '#8e8e93',
    fontSize: 16,
    marginRight: 8,
  },
  chevronContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: '#ff9500',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutRow: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoutBtn: {
    color: '#ff3b30',
    fontWeight: '500',
    fontSize: 17,
  },
  footer: {
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8e8e93',
  },
});