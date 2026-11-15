import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LessonRunner from '@/components/learn/LessonRunner';
import { findLesson } from '@/assets/learn/catalog';
import { Colors } from '@/constants/Colors';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const found = findLesson(lessonId);

  if (!found) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: Colors.textMuted }}>Lesson not found</Text>
      </View>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top', 'bottom']}>
      <LessonRunner unit={found.unit} lesson={found.lesson} onExit={() => router.back()} />
    </SafeAreaView>
  );
}
