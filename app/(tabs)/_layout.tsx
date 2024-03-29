import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{
        tabBarLabel: 'tabs.explore',
        tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
      }} />

      <Tabs.Screen name="passTests" options={{
        tabBarLabel: 'tabs.whishlist',
        tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />,
      }} />
    </Tabs>
  );
}

