import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, Href } from 'expo-router';
import ThemedText from '@/components/ui/ThemedText';
import CertificationCard from '@/components/browse/CertificationCard';
import { getPlatform } from '@/assets/data/catalog';
import { useAppContext } from '@/context/AppContext';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function PlatformScreen() {
  const { platformId } = useLocalSearchParams<{ platformId: string }>();
  const router = useRouter();
  const { getBestScore } = useAppContext();
  const platform = getPlatform(platformId);

  if (!platform) {
    return (
      <View style={styles.center}>
        <ThemedText variant="body">Platform not found</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: platform.shortName }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: platform.color + '20' }]}>
            <Ionicons name={platform.icon as any} size={36} color={platform.color} />
          </View>
          <ThemedText variant="heading" style={styles.title}>
            {platform.name}
          </ThemedText>
          <ThemedText variant="body">
            {platform.certifications.length} certifications available
          </ThemedText>
        </View>

        <ThemedText variant="label" style={styles.sectionLabel}>
          Certifications
        </ThemedText>

        {platform.certifications.map(cert => {
          const certBestScores = cert.quizzes.map(q => getBestScore(q.id)).filter(s => s !== null);
          const overallBest = certBestScores.length > 0 ? Math.max(...certBestScores as number[]) : null;

          return (
            <CertificationCard
              key={cert.id}
              certification={cert}
              platformColor={platform.color}
              bestScore={overallBest}
              onPress={() => router.push(`/certification/${cert.id}` as Href)}
            />
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
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: Theme.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },
  sectionLabel: {
    marginBottom: Theme.spacing.md,
  },
});
