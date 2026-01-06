import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '@screens/HomeScreen';
import WeeklyScreen from '@screens/WeeklyScreen';
import InsightsScreen from '@screens/InsightsScreen';
import SettingsScreen from '@screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#4F46E5',
      }}>
      <Tab.Screen
        name="Today"
        component={HomeScreen}
        options={{tabBarLabel: 'Today'}}
      />
      <Tab.Screen
        name="Week"
        component={WeeklyScreen}
        options={{tabBarLabel: 'Week'}}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{tabBarLabel: 'Insights'}}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{tabBarLabel: 'Settings'}}
      />
    </Tab.Navigator>
  );
}
