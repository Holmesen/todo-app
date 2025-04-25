import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import LoginScreen from './app/screens/LoginScreen';
import RegisterScreen from './app/screens/RegisterScreen';
import NativeLoginScreen from './app/screens/NativeLoginScreen';
import NativeRegisterScreen from './app/screens/NativeRegisterScreen';

// Create a placeholder Home screen
const HomeScreen = () => <></>;

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'white' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NativeLogin" component={NativeLoginScreen} />
        <Stack.Screen name="NativeRegister" component={NativeRegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 