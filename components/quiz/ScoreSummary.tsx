import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { formatTime } from '@/lib/utils';
import { QuizAttempt } from '@/types/quiz';

interface ScoreSummaryProps {
  attempt: QuizAttempt;
  passingScore: number;
  accentColor: string;
  onReview: () => void;
  onExit: () => void;
}

export default function ScoreSummary({
  attempt,
  passingScore,
  accentColor,
  onReview,
  onExit,
}: ScoreSummaryProps) {
  const passed = attempt.percentage >= passingScore;
  const correctCount = attempt.answers.filter((a) => a.correct).length;
  const incorrectCount = attempt.answers.filter((a) => !a.correct).length;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={passed ? 'trophy' : 'refresh-circle'}
          size={64}
          color={passed ? Colors.warning : accentColor}
        />
      </View>

      <ThemedText variant="heading" style={styles.title}>
        {passed ? 'Congratulations!' : 'Keep Practicing!'}
      </ThemedText>

      <ThemedText variant="body" style={styles.subtitle}>
        {passed ? 'You passed the quiz!' : `You need ${passingScore}% to pass. Try again!`}
      </ThemedText>

      {/* Score Circle */}
      <View style={[styles.scoreCircle, { borderColor: passed ? Colors.success : Colors.error }]}>
        <ThemedText
          variant="heading"
          color={passed ? Colors.success : Colors.error}
          style={styles.scoreText}
        >
          {Math.round(attempt.percentage)}%
        </ThemedText>
        <ThemedText variant="caption">
          {attempt.score} / {attempt.totalQuestions}
        </ThemedText>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          <ThemedText variant="title" style={styles.statValue}>
            {correctCount}
          </ThemedText>
          <ThemedText variant="caption">Correct</ThemedText>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="close-circle" size={24} color={Colors.error} />
          <ThemedText variant="title" style={styles.statValue}>
            {incorrectCount}
          </ThemedText>
          <ThemedText variant="caption">Incorrect</ThemedText>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="time" size={24} color={Colors.primary} />
          <ThemedText variant="title" style={styles.statValue}>
            {formatTime(attempt.timeTaken)}
          </ThemedText>
          <ThemedText variant="caption">Time</ThemedText>
        </Card>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Review Answers"
          onPress={onReview}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button title="Done" onPress={onExit} color={accentColor} style={styles.actionButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: Theme.spacing.lg,
  },
  title: {
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  scoreText: {
    fontSize: Theme.fontSize.xxxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  statValue: {
    marginVertical: Theme.spacing.xs,
  },
  actions: {
    width: '100%',
    gap: Theme.spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
});
