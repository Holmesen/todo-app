import { Redirect } from 'expo-router';

// 将根路径重定向到登录页面
export default function Index() {
  return <Redirect href="/screens/LoginScreen" />;
}
