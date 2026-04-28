import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedText from '@/components/ui/ThemedText';
import PlatformCard from '@/components/browse/PlatformCard';
import { platforms } from '@/assets/data/catalog';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

export default function BrowseScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="heading">CloudPrep</ThemedText>
          <ThemedText variant="body" style={styles.subtitle}>
            Master your cloud certifications
          </ThemedText>
        </View>

        <ThemedText variant="label" style={styles.sectionLabel}>
          Platforms
        </ThemedText>

        {platforms.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            onPress={() => router.push(`/platform/${platform.id}` as Href)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    marginBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.sm,
  },
  subtitle: {
    marginTop: Theme.spacing.xs,
  },
  sectionLabel: {
    marginBottom: Theme.spacing.md,
  },
});
