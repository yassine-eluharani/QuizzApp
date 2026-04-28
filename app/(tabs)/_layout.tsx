import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.tabBarActive,
          tabBarInactiveTintColor: Colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: Colors.tabBar,
            borderTopColor: Colors.tabBarBorder,
            borderTopWidth: 1,
            paddingBottom: 4,
            height: 88,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: 'Browse',
            tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="study"
          options={{
            tabBarLabel: 'Study',
            tabBarIcon: ({ color, size }) => <Ionicons name="bookmark" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            tabBarLabel: 'Stats',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
