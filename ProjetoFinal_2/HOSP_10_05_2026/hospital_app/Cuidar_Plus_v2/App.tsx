import React, { useEffect } from 'react';
import { Platform, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { AuthProvider } from './src/context/AuthContext';
import MainNavigator from './src/navigation/MainNavigator';

LogBox.ignoreLogs(['setBehaviorAsync is not supported']);

export default function App() {

  useEffect(() => {
    async function configureImmersiveMode() {
      if (Platform.OS === 'android') {
        try {

          const navBar = NavigationBar as any;
          if (navBar && typeof navBar.setVisibilityAsync === 'function') {
            await navBar.setVisibilityAsync('hidden');
          }
        } catch (error) {
          console.warn('Erro ao configurar expo-navigation-bar:', error);
        }
      }
    }
    configureImmersiveMode();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar hidden={true} />
          <MainNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
