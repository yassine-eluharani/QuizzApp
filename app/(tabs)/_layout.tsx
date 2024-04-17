import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { QuizProvider } from '@/context/QuizContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QuizProvider>
        <Tabs screenOptions={{ tabBarActiveTintColor: '#3768b8' }}>
          <Tabs.Screen name="index" options={{
            headerShown: false,
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }} />
          <Tabs.Screen name="quizzes" options={{
            headerShown: false,
            tabBarLabel: 'Quizzes',
            tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />, // Assuming you have an appropriate icon for quizzes
          }} />

          <Tabs.Screen name="passTests" options={{
            headerShown: false,
            tabBarLabel: 'History',
            tabBarIcon: ({ color, size }) => <Ionicons name="refresh-outline" size={size} color={color} />,
          }} />
        </Tabs>
      </QuizProvider>
    </SafeAreaView>
  );
}

