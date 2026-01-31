import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import ThemedText from '@/components/ui/ThemedText';
import Badge from '@/components/ui/Badge';
import { Platform } from '@/types/quiz';
import { Theme } from '@/constants/Theme';
import { Colors } from '@/constants/Colors';

interface PlatformCardProps {
  platform: Platform;
  onPress: () => void;
}

export default function PlatformCard({ platform, onPress }: PlatformCardProps) {
  const totalQuestions = platform.certifications.reduce(
    (sum, cert) => sum + cert.quizzes.reduce((s, q) => s + q.questionCount, 0),
    0
  );

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: platform.color + '20' }]}>
          <Ionicons name={platform.icon as any} size={28} color={platform.color} />
        </View>
        <View style={styles.content}>
          <ThemedText variant="title">{platform.shortName}</ThemedText>
          <ThemedText variant="body" style={styles.name}>{platform.name}</ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      </View>
      <View style={styles.footer}>
        <Badge text={`${platform.certifications.length} Certs`} color={platform.color} />
        <ThemedText variant="caption">{totalQuestions} questions</ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
