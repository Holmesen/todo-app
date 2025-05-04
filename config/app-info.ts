/**
 * 应用信息与配置
 * 所有的应用信息都集中在这里，方便统一管理和更新
 */

export const APP_INFO = {
  // 应用基本信息
  NAME: 'TaskMaster',
  VERSION: '2.1.0',
  BUILD_NUMBER: '210',
  RELEASE_DATE: '2025年12月15日',
  COPYRIGHT_YEAR: '2025',

  // 公司信息
  COMPANY: 'TaskMaster Inc.',

  // 联系信息
  SUPPORT_EMAIL: 'support@taskmaster-app.com',
  WEBSITE: 'https://taskmaster-app.com',
  COMMUNITY_URL: 'https://community.taskmaster-app.com',
  TWITTER_HANDLE: 'taskmasterapp',

  // 法律链接
  PRIVACY_POLICY_URL: 'https://taskmaster-app.com/privacy-policy',
  TERMS_URL: 'https://taskmaster-app.com/terms',
  HELP_URL: 'https://taskmaster-app.com/help',

  // 订阅计划
  SUBSCRIPTION: {
    MONTHLY: {
      PRICE: '18',
      PERIOD: '月',
    },
    YEARLY: {
      PRICE: '158',
      PERIOD: '年',
    },
    LIFETIME: {
      PRICE: '298',
      PERIOD: '一次性',
    },
    TRIAL_DAYS: 7,
  },

  // 应用商店评分URL
  APP_STORE_URL: 'https://apps.apple.com/app/id1234567890',
  PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=com.yourcompany.taskmaster',
};

export default APP_INFO;
