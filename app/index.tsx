import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <TouchableOpacity
        onPress={() => {
          router.push('/screens/NativeLoginScreen');
        }}
        style={{ marginTop: 10 }}
      >
        <Text>跳转 Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          router.push('/screens/NativeRegisterScreen');
        }}
        style={{ marginTop: 10 }}
      >
        <Text>跳转 Register</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          router.push('/(tabs)');
        }}
        style={{ marginTop: 10 }}
      >
        <Text>跳转 Tabs</Text>
      </TouchableOpacity>
    </View>
  );
}
