import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSettingsStore } from '@store/settingsStore';
import HomeScreen from '@screens/HomeScreen';
import WeeklyScreen from '@screens/WeeklyScreen';
import InsightsScreen from '@screens/InsightsScreen';
import SettingsScreen from '@screens/SettingsScreen';
import PermissionScreen from '@screens/onboarding/PermissionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#4F46E5',
      }}>
      <Tab.Screen
        name="Today"
        component={HomeScreen}
        options={{ tabBarLabel: 'Today' }}
      />
      <Tab.Screen
        name="Week"
        component={WeeklyScreen}
        options={{ tabBarLabel: 'Week' }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ tabBarLabel: 'Insights' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { permissionGranted, permissionSkipped, loadSettings } =
    useSettingsStore();

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const showPermissionScreen = !permissionGranted && !permissionSkipped;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showPermissionScreen ? (
        <Stack.Screen name="Permission" component={PermissionScreen} />
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
