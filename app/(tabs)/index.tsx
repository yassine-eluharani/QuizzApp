import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedText from '@/components/ui/ThemedText';
import PlatformCard from '@/components/browse/PlatformCard';
import InterviewTopicCard from '@/components/browse/InterviewTopicCard';
import { platforms, interviewTopics } from '@/assets/data/catalog';
import { loadInterviewQA } from '@/lib/interviewQA';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

type Mode = 'platforms' | 'interview';

export default function BrowseScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('platforms');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="heading">CloudPrep</ThemedText>
          <ThemedText variant="body" style={styles.subtitle}>
            Master your cloud certifications
          </ThemedText>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, mode === 'platforms' && styles.tabActive]}
            onPress={() => setMode('platforms')}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.tabLabel,
                { color: mode === 'platforms' ? Colors.textPrimary : Colors.textMuted },
              ]}
            >
              Platforms
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'interview' && styles.tabActive]}
            onPress={() => setMode('interview')}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.tabLabel,
                { color: mode === 'interview' ? Colors.textPrimary : Colors.textMuted },
              ]}
            >
              Interview
            </ThemedText>
          </TouchableOpacity>
        </View>

        {mode === 'platforms' ? (
          <>
            <ThemedText variant="label" style={styles.sectionLabel}>
              Platforms
            </ThemedText>
            {platforms.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                onPress={() => router.push(`/platform/${platform.id}` as Href)}
              />
            ))}
          </>
        ) : (
          <>
            <ThemedText variant="label" style={styles.sectionLabel}>
              Interview Prep
            </ThemedText>
            <ThemedText variant="caption" style={styles.interviewIntro}>
              Real interview questions per tool, ordered from foundational to advanced — plus a
              matching quiz with explanations.
            </ThemedText>
            {interviewTopics.map((topic) => (
              <InterviewTopicCard
                key={topic.id}
                name={topic.name}
                icon={topic.icon as React.ComponentProps<typeof InterviewTopicCard>['icon']}
                color={Colors.interviewTopics[topic.id] || Colors.primary}
                qaCount={loadInterviewQA(topic.id).length}
                quizQuestionCount={15}
                onPress={() => router.push(`/interview/${topic.id}` as Href)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    marginBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.sm,
  },
  subtitle: {
    marginTop: Theme.spacing.xs,
  },
  sectionLabel: {
    marginBottom: Theme.spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Theme.spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: Colors.primary,
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  interviewIntro: {
    marginBottom: Theme.spacing.lg,
    lineHeight: 18,
  },
});
