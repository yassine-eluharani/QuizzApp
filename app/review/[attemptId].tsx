import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAppContext } from '@/context/AppContext';
import { loadQuestionById } from '@/lib/questionLoader';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { formatTime } from '@/lib/utils';

export default function ReviewScreen() {
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const { history } = useAppContext();

  const attempt = history.find(a => a.id === attemptId);

  if (!attempt) {
    return (
      <View style={styles.center}>
        <ThemedText variant="body">Attempt not found</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `Review - ${Math.round(attempt.percentage)}%` }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <ThemedText variant="caption">Score</ThemedText>
              <ThemedText
                variant="title"
                color={attempt.percentage >= 70 ? Colors.success : Colors.error}
              >
                {Math.round(attempt.percentage)}%
              </ThemedText>
            </View>
            <View>
              <ThemedText variant="caption">Correct</ThemedText>
              <ThemedText variant="title">{attempt.score}/{attempt.totalQuestions}</ThemedText>
            </View>
            <View>
              <ThemedText variant="caption">Time</ThemedText>
              <ThemedText variant="title">{formatTime(attempt.timeTaken)}</ThemedText>
            </View>
          </View>
        </Card>

        {/* Questions */}
        {attempt.answers.map((answer, index) => {
          const question = loadQuestionById(answer.questionId);
          const cleaned = question?.question.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ') || 'Question not found';

          return (
            <Card key={index} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Badge
                  text={`Q${index + 1}`}
                  color={answer.correct ? Colors.success : Colors.error}
                />
                <Ionicons
                  name={answer.correct ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={answer.correct ? Colors.success : Colors.error}
                />
              </View>
              <ThemedText variant="body" color={Colors.textPrimary} style={styles.questionText}>
                {cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned}
              </ThemedText>
              {question && (
                <View style={styles.answerInfo}>
                  <ThemedText variant="caption">
                    Your answer: {answer.selectedIndices.map(i => question.choices[i]?.substring(0, 50) || '?').join(', ')}
                  </ThemedText>
                  {!answer.correct && (
                    <ThemedText variant="caption" color={Colors.success}>
                      Correct: {question.correct_answer_indices.map(i => question.choices[i]?.substring(0, 50) || '?').join(', ')}
                    </ThemedText>
                  )}
                </View>
              )}
            </Card>
          );
        })}
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
  summaryCard: {
    marginBottom: Theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  questionCard: {
    marginBottom: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  questionText: {
    lineHeight: 22,
    marginBottom: Theme.spacing.sm,
  },
  answerInfo: {
    gap: Theme.spacing.xs,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
