import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppStore } from './src/store/useAppStore';

export default function App() {
  const loadUserFromStorage = useAppStore((state) => state.loadUserFromStorage);

  useEffect(() => {
    // Load fonts
    Font.loadAsync({
      // You can add custom fonts here if needed
    });

    // Load user data from storage
    loadUserFromStorage();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
