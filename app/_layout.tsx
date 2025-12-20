import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { categoryService } from '../src/services/firebaseService';
import { Category, useCategoriesStore } from '../src/store/atoms';

// Default categories
const defaultCategories: Category[] = [
  { id: 'insurance', name: 'Insurance', isDefault: true },
  { id: 'credit-cards', name: 'Credit Cards bills', isDefault: true },
  { id: 'medical', name: 'Family Health - Medical', isDefault: true },
  { id: 'home-expense', name: 'Home Expense', isDefault: true },
  { id: 'home-rent', name: 'Home Rent', isDefault: true },
  { id: 'personal', name: 'Personal', isDefault: true },
  { id: 'daily-travel', name: 'Daily Travel', isDefault: true },
  { id: 'vacation', name: 'Vacation', isDefault: true },
  { id: 'food-restaurant', name: 'Food Restaurant', isDefault: true },
  { id: 'petrol', name: 'Petrol - Car & Bike', isDefault: true },
  { id: 'child-education', name: 'Child Education', isDefault: true },
];

// Component to initialize app data
function AppInitializer({ children }: { children: React.ReactNode }) {
  const setCategories = useCategoriesStore((state) => state.setCategories);
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('AppInitializer: Rendering');

  useEffect(() => {
    console.log('AppInitializer: useEffect triggered');
    try {
      // Set default categories immediately
      console.log('AppInitializer: Setting default categories');
      setCategories(defaultCategories);
      console.log('AppInitializer: Setting isInitialized to true');
      setIsInitialized(true);
    } catch (e) {
      console.error('AppInitializer: Error in synchronous init', e);
    }

    // Try to load from Firebase in background (non-blocking)
    if (auth) {
      console.log('AppInitializer: Firebase is configured, initializing...');
      const initializeFirebase = async () => {
        try {
          const unsubscribe = onAuthStateChanged(auth!, async (user) => {
            console.log('AppInitializer: Auth state changed', user ? 'User logged in' : 'No user');
            if (user) {
              try {
                const firestoreCategories = await categoryService.getCategories();
                const allCategories = [...defaultCategories, ...firestoreCategories];
                setCategories(allCategories);
              } catch (error) {
                console.error('Error loading categories:', error);
                // Keep default categories on error
              }
            } else {
              try {
                await signInAnonymously(auth!);
              } catch (error) {
                console.error('Error signing in:', error);
              }
            }
          });
          return () => unsubscribe();
        } catch (error) {
          console.error('Firebase initialization error:', error);
        }
      };
      initializeFirebase();
    } else {
      console.log('AppInitializer: Firebase NOT configured');
    }
  }, [setCategories]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={{ marginTop: 16, color: '#757575' }}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AppInitializer>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
            initialRouteName="index"
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
            <Stack.Screen name="wizard/step1" options={{ headerShown: false }} />
            <Stack.Screen name="wizard/step2" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="settings/index"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Settings',
                headerBackTitle: 'Back',
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </AppInitializer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

