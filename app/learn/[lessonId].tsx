import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LessonRunner from '@/components/learn/LessonRunner';
import { findLesson } from '@/assets/learn/catalog';
import { Colors } from '@/constants/Colors';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  // Read insets from the hook (root provider) instead of a native SafeAreaView: inside this
  // full-screen modal on iOS the native view reported a zero top inset, hiding the close button
  // under the status bar.
  const insets = useSafeAreaInsets();
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
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <LessonRunner unit={found.unit} lesson={found.lesson} onExit={() => router.back()} />
    </View>
  );
}
