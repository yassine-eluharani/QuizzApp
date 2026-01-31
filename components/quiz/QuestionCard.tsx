import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import ThemedText from '@/components/ui/ThemedText';
import ChoiceButton from './ChoiceButton';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

interface QuestionCardProps {
  question: string;
  choices: string[];
  selectedAnswers: number[];
  isRevealed: boolean;
  correctIndices: number[];
  onSelectAnswer: (index: number) => void;
  maxSelections: number;
}

export default function QuestionCard({
  question,
  choices,
  selectedAnswers,
  isRevealed,
  correctIndices,
  onSelectAnswer,
  maxSelections,
}: QuestionCardProps) {
  const cleanedQuestion = question.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ');

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.questionContainer}>
        {maxSelections > 1 && (
          <ThemedText variant="caption" style={styles.multiHint}>
            Select {maxSelections} answers
          </ThemedText>
        )}
        <ThemedText variant="bodyLarge" style={styles.question}>
          {cleanedQuestion}
        </ThemedText>
      </View>

      <View style={styles.choicesContainer}>
        {choices.map((choice, index) => {
          const cleaned = choice.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ');
          const isSelected = selectedAnswers.includes(index);
          const isCorrect = correctIndices.includes(index);

          let status: 'default' | 'selected' | 'correct' | 'incorrect' = 'default';
          if (isRevealed) {
            if (isCorrect) status = 'correct';
            else if (isSelected) status = 'incorrect';
          } else if (isSelected) {
            status = 'selected';
          }

          return (
            <ChoiceButton
              key={index}
              text={cleaned}
              index={index}
              status={status}
              disabled={isRevealed}
              onPress={() => onSelectAnswer(index)}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  questionContainer: {
    marginBottom: Theme.spacing.lg,
  },
  multiHint: {
    marginBottom: Theme.spacing.sm,
    color: Colors.warning,
  },
  question: {
    lineHeight: 26,
  },
  choicesContainer: {
    gap: Theme.spacing.sm + 2,
  },
});
