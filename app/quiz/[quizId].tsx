import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import QuizHeader from '@/components/quiz/QuizHeader';
import QuestionCard from '@/components/quiz/QuestionCard';
import ExplanationSheet from '@/components/quiz/ExplanationSheet';
import ScoreSummary from '@/components/quiz/ScoreSummary';
import Button from '@/components/ui/Button';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useAppContext } from '@/context/AppContext';
import { usePurchase } from '@/context/PurchaseContext';
import { isQuizAccessible } from '@/lib/entitlements';
import { getQuizMeta } from '@/assets/data/catalog';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { QuizAttempt } from '@/types/quiz';

export default function QuizScreen() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const router = useRouter();
  const { isBookmarked, toggleBookmark } = useAppContext();
  const { isPro, showPaywall } = usePurchase();
  const meta = getQuizMeta(quizId);

  useEffect(() => {
    if (!isQuizAccessible(quizId, isPro)) {
      showPaywall();
      router.back();
    }
  }, [quizId, isPro]);

  const session = useQuizSession(quizId, isPro);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttempt | null>(null);

  if (completedAttempt) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScoreSummary
          attempt={completedAttempt}
          passingScore={meta?.certification.passingScore || 70}
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
        quizName={session.quizName}
        currentIndex={session.currentIndex}
        totalQuestions={session.totalQuestions}
        accentColor={session.platformColor}
        onClose={() => router.back()}
        onBookmark={() =>
          toggleBookmark(questionId, {
            certId: meta?.certification.id || '',
            quizId,
            dateAdded: new Date().toISOString(),
          }, isPro, showPaywall)
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
