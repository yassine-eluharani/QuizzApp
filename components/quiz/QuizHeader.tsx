import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';
import ProgressBar from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

interface QuizHeaderProps {
  certName: string;
  quizName: string;
  currentIndex: number;
  totalQuestions: number;
  accentColor: string;
  onClose: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  timer?: string;
  timerWarning?: boolean;
}

export default function QuizHeader({
  certName,
  quizName,
  currentIndex,
  totalQuestions,
  accentColor,
  onClose,
  onBookmark,
  isBookmarked,
  timer,
  timerWarning,
}: QuizHeaderProps) {
  const progress = (currentIndex + 1) / totalQuestions;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Exit quiz"
        >
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <ThemedText variant="caption" color={accentColor}>
            {certName}
          </ThemedText>
          <ThemedText variant="bodyLarge">{quizName}</ThemedText>
        </View>
        <View style={styles.rightActions}>
          {timer && (
            <ThemedText
              variant="bodyLarge"
              color={timerWarning ? Colors.error : Colors.textSecondary}
              style={styles.timer}
              accessibilityLabel={`Time remaining ${timer}`}
              accessibilityLiveRegion={timerWarning ? 'assertive' : 'polite'}
            >
              {timer}
            </ThemedText>
          )}
          {onBookmark && (
            <TouchableOpacity
              onPress={onBookmark}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              accessibilityState={{ selected: !!isBookmarked }}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isBookmarked ? Colors.warning : Colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.progressRow}>
        <ProgressBar progress={progress} color={accentColor} />
        <ThemedText variant="caption" style={styles.counter}>
          {currentIndex + 1} / {totalQuestions}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  timer: {
    fontVariant: ['tabular-nums'],
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  counter: {
    minWidth: 50,
    textAlign: 'right',
  },
});
