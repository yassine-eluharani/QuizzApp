import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import InterviewQACard from '@/components/interview/InterviewQACard';
import { getCertification, interviewTopics } from '@/assets/data/catalog';
import { loadInterviewQA } from '@/lib/interviewQA';
import { useAppContext } from '@/context/AppContext';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type Tab = 'learn' | 'quiz';

export default function InterviewTopicScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const { getBestScore } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('learn');

  const meta = interviewTopics.find((t) => t.id === topicId);
  const result = getCertification(`interview-${topicId}`);

  if (!meta || !result) {
    return (
      <View style={styles.center}>
        <ThemedText variant="body">Topic not found</ThemedText>
      </View>
    );
  }

  const { certification: cert } = result;
  const quiz = cert.quizzes[0];
  const accentColor = Colors.interviewTopics[meta.id] || Colors.primary;
  const qaItems = loadInterviewQA(meta.id);
  const bestScore = getBestScore(quiz.id);

  return (
    <>
      <Stack.Screen options={{ title: meta.name }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
            <Ionicons name={meta.icon as IoniconName} size={30} color={accentColor} />
          </View>
          <ThemedText variant="heading" style={styles.name}>
            {meta.name}
          </ThemedText>
          <ThemedText variant="body" style={styles.desc}>
            Real interview questions, ordered from foundational to advanced. Read through them to
            learn the topic, then take the quiz to check what stuck.
          </ThemedText>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'learn' && { borderBottomColor: accentColor, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab('learn')}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.tabLabel,
                { color: activeTab === 'learn' ? Colors.textPrimary : Colors.textMuted },
              ]}
            >
              Learn
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'quiz' && { borderBottomColor: accentColor, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab('quiz')}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.tabLabel,
                { color: activeTab === 'quiz' ? Colors.textPrimary : Colors.textMuted },
              ]}
            >
              Quiz
            </ThemedText>
          </TouchableOpacity>
        </View>

        {activeTab === 'learn' ? (
          <View>
            {qaItems.length === 0 ? (
              <ThemedText variant="body">No content yet for this topic.</ThemedText>
            ) : (
              qaItems.map((qa) => <InterviewQACard key={qa.id} qa={qa} accentColor={accentColor} />)
            )}
          </View>
        ) : (
          <View style={styles.quizTab}>
            <View style={styles.quizIllustration}>
              <Ionicons name="school" size={44} color={accentColor} />
            </View>
            <ThemedText variant="title" style={styles.quizTitle}>
              {quiz.questionCount} Questions
            </ThemedText>
            <ThemedText variant="body" style={styles.quizDesc}>
              Same order as the Learn tab — easy concepts first, real interview-style questions
              later. Every answer comes with a full explanation.
            </ThemedText>

            {bestScore !== null && bestScore !== undefined && (
              <Badge
                text={`Best score: ${Math.round(bestScore)}%`}
                color={bestScore >= cert.examInfo.passingScore ? Colors.success : Colors.warning}
              />
            )}

            <Button
              title={bestScore !== null && bestScore !== undefined ? 'Retake Quiz' : 'Start Quiz'}
              onPress={() => router.push(`/quiz/${quiz.id}` as Href)}
              color={accentColor}
              style={styles.quizButton}
            />
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: Theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  name: {
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  desc: {
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 20,
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
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  quizTab: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  quizIllustration: {
    marginBottom: Theme.spacing.sm,
  },
  quizTitle: {
    textAlign: 'center',
  },
  quizDesc: {
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.sm,
  },
  quizButton: {
    marginTop: Theme.spacing.sm,
    minWidth: 200,
  },
});
