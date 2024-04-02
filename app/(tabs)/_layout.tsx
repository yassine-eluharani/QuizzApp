import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{
        headerShown: false,
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
      }} />

      <Tabs.Screen name="passTests" options={{
        headerShown: false,
        tabBarLabel: 'History',
        tabBarIcon: ({ color, size }) => <Ionicons name="refresh-outline" size={size} color={color} />,
      }} />
    </Tabs>
  );
}

