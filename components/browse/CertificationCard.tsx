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

  return (
    <Card onPress={onPress} accentColor={platformColor} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText variant="bodyLarge" style={styles.name}>
            {certification.name}
          </ThemedText>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </View>
        <Badge text={certification.code} color={platformColor} />
      </View>
      <View style={styles.footer}>
        <ThemedText variant="caption">
          {certification.quizzes.length} {certification.quizzes.length === 1 ? 'quiz' : 'quizzes'}
        </ThemedText>
        <ThemedText variant="caption">{totalQuestions} questions</ThemedText>
        {bestScore !== null && bestScore !== undefined && (
          <ThemedText variant="caption" color={bestScore >= certification.examInfo.passingScore ? Colors.success : Colors.warning}>
            Best: {Math.round(bestScore)}%
          </ThemedText>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Theme.spacing.sm + 4,
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
