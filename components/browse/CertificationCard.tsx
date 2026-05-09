import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import ThemedText from '@/components/ui/ThemedText';
import Badge from '@/components/ui/Badge';
import { Certification } from '@/types/quiz';
import { Theme } from '@/constants/Theme';
import { Colors } from '@/constants/Colors';

interface CertificationCardProps {
  certification: Certification;
  platformColor: string;
  bestScore?: number | null;
  onPress: () => void;
}

export default function CertificationCard({
  certification,
  platformColor,
  bestScore,
  onPress,
}: CertificationCardProps) {
  const totalQuestions = certification.quizzes.reduce((s, q) => s + q.questionCount, 0);
  const isComingSoon = certification.comingSoon === true;
  const accent = isComingSoon ? Colors.textMuted : platformColor;

  return (
    <Card
      onPress={onPress}
      accentColor={accent}
      style={[styles.card, isComingSoon && styles.cardComingSoon]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText variant="bodyLarge" style={[styles.name, isComingSoon && styles.nameMuted]}>
            {certification.name}
          </ThemedText>
          {isComingSoon ? (
            <Ionicons name="time-outline" size={18} color={Colors.textMuted} />
          ) : (
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          )}
        </View>
        <View style={styles.badgeRow}>
          <Badge text={certification.code} color={accent} />
          {isComingSoon && <Badge text="Coming Soon" color={Colors.textMuted} />}
        </View>
      </View>
      <View style={styles.footer}>
        {isComingSoon ? (
          <ThemedText variant="caption" color={Colors.textMuted}>
            Question bank in production — notify on launch
          </ThemedText>
        ) : (
          <>
            <ThemedText variant="caption">
              {certification.quizzes.length}{' '}
              {certification.quizzes.length === 1 ? 'quiz' : 'quizzes'}
            </ThemedText>
            <ThemedText variant="caption">{totalQuestions} questions</ThemedText>
            {bestScore !== null && bestScore !== undefined && (
              <ThemedText
                variant="caption"
                color={
                  bestScore >= certification.examInfo.passingScore ? Colors.success : Colors.warning
                }
              >
                Best: {Math.round(bestScore)}%
              </ThemedText>
            )}
          </>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Theme.spacing.sm + 4,
  },
  cardComingSoon: {
    opacity: 0.7,
  },
  header: {
    marginBottom: Theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  name: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  nameMuted: {
    color: Colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    flexWrap: 'wrap',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
