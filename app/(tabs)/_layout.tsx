import { Tabs, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { theme } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.colors.text.accent,
        tabBarInactiveTintColor: theme.colors.text.muted,
      }}
      initialRouteName="calculator"
    >
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Finance Calculator',
          tabBarLabel: 'Retirement',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calculator" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="manager"
        options={{
          title: 'Expense Manager',
          tabBarLabel: 'Manager',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

