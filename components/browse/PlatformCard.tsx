import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import ThemedText from '@/components/ui/ThemedText';
import Badge from '@/components/ui/Badge';
import { Platform } from '@/types/quiz';
import { Theme } from '@/constants/Theme';
import { Colors } from '@/constants/Colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface PlatformCardProps {
  platform: Platform;
  onPress: () => void;
}

export default function PlatformCard({ platform, onPress }: PlatformCardProps) {
  const availableCerts = platform.certifications.filter((c) => !c.comingSoon);
  const comingSoonCount = platform.certifications.length - availableCerts.length;
  const totalQuestions = availableCerts.reduce(
    (sum, cert) => sum + cert.quizzes.reduce((s, q) => s + q.questionCount, 0),
    0
  );
  const certBadgeText =
    availableCerts.length > 0
      ? `${availableCerts.length} Cert${availableCerts.length === 1 ? '' : 's'}`
      : 'Coming Soon';
  const certBadgeColor = availableCerts.length > 0 ? platform.color : Colors.textMuted;

  return (
    <Card
      onPress={onPress}
      style={styles.card}
      accessibilityLabel={`${platform.name}, ${platform.certifications.length} certifications`}
    >
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: platform.color + '20' }]}>
          <Ionicons name={platform.icon as IoniconName} size={28} color={platform.color} />
        </View>
        <View style={styles.content}>
          <ThemedText variant="title">{platform.shortName}</ThemedText>
          <ThemedText variant="body" style={styles.name}>
            {platform.name}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      </View>
      <View style={styles.footer}>
        <Badge text={certBadgeText} color={certBadgeColor} />
        {totalQuestions > 0 ? (
          <ThemedText variant="caption">{totalQuestions} questions</ThemedText>
        ) : null}
        {comingSoonCount > 0 && availableCerts.length > 0 ? (
          <ThemedText variant="caption" color={Colors.textMuted}>
            +{comingSoonCount} coming soon
          </ThemedText>
        ) : null}
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
