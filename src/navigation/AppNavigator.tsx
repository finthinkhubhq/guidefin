import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useRetirementStore } from '../store/useRetirementStore';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RetirementInputScreen from '../screens/RetirementInputScreen';
import RetirementBaselineScreen from '../screens/RetirementBaselineScreen';
import RetirementStressTestScreen from '../screens/RetirementStressTestScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const phase = useRetirementStore((state) => state.phase);
  console.log('🔥 AppNavigator rendered, phase =', phase);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* ENTRY */}
        {phase === 'INPUT' && (
          <Stack.Screen
            name="RetirementInput"
            component={RetirementInputScreen}
          />
        )}

        {/* BASELINE */}
        {phase === 'BASELINE' && (
          <Stack.Screen
            name="RetirementBaseline"
            component={RetirementBaselineScreen}
          />
        )}

        {/* STRESS TEST */}
        {phase === 'STRESS_TEST' && (
          <Stack.Screen
            name="RetirementStressTest"
            component={RetirementStressTestScreen}
          />
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}
