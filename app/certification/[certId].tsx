import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, Href } from 'expo-router';
import ThemedText from '@/components/ui/ThemedText';
import QuizListItem from '@/components/browse/QuizListItem';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { getCertification } from '@/assets/data/catalog';
import { useAppContext } from '@/context/AppContext';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { formatTime } from '@/lib/utils';

export default function CertificationScreen() {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const router = useRouter();
  const { getBestScore, getAttemptsForCert } = useAppContext();
  const result = getCertification(certId);

  if (!result) {
    return (
      <View style={styles.center}>
        <ThemedText variant="body">Certification not found</ThemedText>
      </View>
    );
  }

  const { certification: cert, platform } = result;
  const attempts = getAttemptsForCert(cert.id);

  return (
    <>
      <Stack.Screen options={{ title: cert.code }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Badge text={cert.code} color={platform.color} />
          <ThemedText variant="title" style={styles.certName}>
            {cert.name}
          </ThemedText>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
              <ThemedText variant="caption"> {cert.examDuration} min</ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="checkmark-circle-outline" size={14} color={Colors.textMuted} />
              <ThemedText variant="caption"> Pass: {cert.passingScore}%</ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="help-circle-outline" size={14} color={Colors.textMuted} />
              <ThemedText variant="caption"> {cert.totalExamQuestions} questions</ThemedText>
            </View>
          </View>
        </View>

        {/* Practice Exam */}
        <Card style={styles.examCard}>
          <View style={styles.examHeader}>
            <Ionicons name="school" size={24} color={platform.color} />
            <ThemedText variant="title" style={styles.examTitle}>
              Practice Exam
            </ThemedText>
          </View>
          <ThemedText variant="body" style={styles.examDesc}>
            Simulate real exam conditions with {cert.totalExamQuestions} random questions and a {cert.examDuration}-minute timer.
          </ThemedText>
          <Button
            title="Start Practice Exam"
            onPress={() => router.push(`/exam/${cert.id}` as Href)}
            color={platform.color}
            style={styles.examButton}
          />
        </Card>

        {/* Quiz List */}
        <ThemedText variant="label" style={styles.sectionLabel}>
          Quizzes
        </ThemedText>

        {cert.quizzes.map(quiz => (
          <QuizListItem
            key={quiz.id}
            quiz={quiz}
            platformColor={platform.color}
            bestScore={getBestScore(quiz.id)}
            onPress={() => router.push(`/quiz/${quiz.id}` as Href)}
          />
        ))}

        {/* Recent Attempts */}
        {attempts.length > 0 && (
          <>
            <ThemedText variant="label" style={styles.sectionLabel}>
              Recent Attempts
            </ThemedText>
            {attempts.slice(0, 5).map(attempt => (
              <Card
                key={attempt.id}
                onPress={() => router.push(`/review/${attempt.id}` as Href)}
                style={styles.attemptCard}
              >
                <View style={styles.attemptRow}>
                  <View>
                    <ThemedText variant="bodyLarge">
                      {attempt.mode === 'exam' ? 'Practice Exam' : attempt.quizId.split('-').pop()?.replace('quiz', 'Quiz ')}
                    </ThemedText>
                    <ThemedText variant="caption">
                      {new Date(attempt.date).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <ThemedText
                    variant="title"
                    color={attempt.percentage >= cert.passingScore ? Colors.success : Colors.error}
                  >
                    {Math.round(attempt.percentage)}%
                  </ThemedText>
                </View>
              </Card>
            ))}
          </>
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
    marginBottom: Theme.spacing.lg,
  },
  certName: {
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  examCard: {
    marginBottom: Theme.spacing.xl,
  },
  examHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  examTitle: {
    marginLeft: Theme.spacing.sm,
  },
  examDesc: {
    marginBottom: Theme.spacing.md,
  },
  examButton: {
    marginTop: Theme.spacing.xs,
  },
  sectionLabel: {
    marginBottom: Theme.spacing.md,
  },
  attemptCard: {
    marginBottom: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  attemptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
