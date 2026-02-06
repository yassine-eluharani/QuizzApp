import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';
import Badge from '@/components/ui/Badge';
import ProBadge from '@/components/paywall/ProBadge';
import LockedOverlay from '@/components/paywall/LockedOverlay';
import { QuizMeta } from '@/types/quiz';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

interface QuizListItemProps {
  quiz: QuizMeta;
  platformColor: string;
  bestScore?: number | null;
  onPress: () => void;
  isLocked?: boolean;
}

export default function QuizListItem({ quiz, platformColor, bestScore, onPress, isLocked }: QuizListItemProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      <View style={[styles.dot, { backgroundColor: isLocked ? Colors.textMuted : platformColor }]} />
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <ThemedText variant="bodyLarge">{quiz.name}</ThemedText>
          {isLocked && <ProBadge />}
        </View>
        <ThemedText variant="caption">{quiz.questionCount} questions</ThemedText>
      </View>
      {isLocked ? (
        <LockedOverlay />
      ) : bestScore !== null && bestScore !== undefined ? (
        <Badge
          text={`${Math.round(bestScore)}%`}
          color={bestScore >= 70 ? Colors.success : Colors.warning}
        />
      ) : (
        <Ionicons name="play-circle" size={28} color={platformColor} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
});
