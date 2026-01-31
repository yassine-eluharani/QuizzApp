import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import QuizHeader from '@/components/quiz/QuizHeader';
import QuestionCard from '@/components/quiz/QuestionCard';
import ExplanationSheet from '@/components/quiz/ExplanationSheet';
import ScoreSummary from '@/components/quiz/ScoreSummary';
import Button from '@/components/ui/Button';
import { useExamSession } from '@/hooks/useExamSession';
import { useAppContext } from '@/context/AppContext';
import { getCertification } from '@/assets/data/catalog';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { formatTime } from '@/lib/utils';
import { QuizAttempt } from '@/types/quiz';

export default function ExamScreen() {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const router = useRouter();
  const { isBookmarked, toggleBookmark } = useAppContext();
  const certResult = getCertification(certId);

  const session = useExamSession(certId);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttempt | null>(null);

  // Auto-submit when timer expires
  useEffect(() => {
    if (session.timer.isExpired && !session.isComplete && !completedAttempt) {
      (async () => {
        const attempt = await session.finish();
        setCompletedAttempt(attempt);
      })();
    }
  }, [session.timer.isExpired]);

  if (completedAttempt) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScoreSummary
          attempt={completedAttempt}
          passingScore={certResult?.certification.passingScore || 70}
          accentColor={session.platformColor}
          onReview={() => {
            router.replace(`/review/${completedAttempt.id}` as Href);
          }}
          onExit={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  if (!session.currentQuestion) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Button title="No questions available" onPress={() => router.back()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const questionId = session.currentQuestion.id || `q-${session.currentIndex}`;
  const timerWarning = session.timer.timeRemaining < 300;

  const handleFinishOrNext = async () => {
    if (session.currentIndex >= session.totalQuestions - 1) {
      const attempt = await session.finish();
      setCompletedAttempt(attempt);
    } else {
      session.next();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <QuizHeader
        certName={session.certName}
        quizName="Practice Exam"
        currentIndex={session.currentIndex}
        totalQuestions={session.totalQuestions}
        accentColor={session.platformColor}
        onClose={() => {
          Alert.alert(
            'End Exam?',
            'Your progress will be lost.',
            [
              { text: 'Continue', style: 'cancel' },
              { text: 'End Exam', style: 'destructive', onPress: () => router.back() },
            ]
          );
        }}
        timer={formatTime(session.timer.timeRemaining)}
        timerWarning={timerWarning}
        onBookmark={() =>
          toggleBookmark(questionId, {
            certId,
            quizId: `${certId}-exam`,
            dateAdded: new Date().toISOString(),
          })
        }
        isBookmarked={isBookmarked(questionId)}
      />

      <QuestionCard
        question={session.currentQuestion.question}
        choices={session.currentQuestion.choices}
        selectedAnswers={session.selectedAnswers}
        isRevealed={session.isRevealed}
        correctIndices={session.currentQuestion.correct_answer_indices}
        onSelectAnswer={session.selectAnswer}
        maxSelections={session.currentQuestion.correct_answer_indices.length}
      />

      <View style={styles.footer}>
        {session.isRevealed ? (
          <View style={styles.footerRow}>
            <Button
              title="Explanation"
              onPress={() => setShowExplanation(true)}
              variant="secondary"
              style={styles.footerButton}
            />
            <Button
              title={session.currentIndex >= session.totalQuestions - 1 ? 'Finish' : 'Next'}
              onPress={handleFinishOrNext}
              color={session.platformColor}
              style={styles.footerButton}
            />
          </View>
        ) : (
          <Button
            title="Confirm"
            onPress={session.confirm}
            disabled={session.selectedAnswers.length === 0}
            color={session.platformColor}
            size="lg"
          />
        )}
      </View>

      <Modal visible={showExplanation} animationType="slide" transparent>
        <ExplanationSheet
          explanation={session.currentQuestion.explanation_html}
          onClose={() => setShowExplanation(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
});
