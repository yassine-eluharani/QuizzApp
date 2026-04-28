import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProBadge from '@/components/paywall/ProBadge';
import { useAppContext } from '@/context/AppContext';
import { usePurchase } from '@/context/PurchaseContext';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

export default function ProfileScreen() {
  const { streaks, history, bookmarks } = useAppContext();
  const { isPro, showPaywall, restorePurchases } = usePurchase();

  const totalQuestions = history.reduce((s, a) => s + a.totalQuestions, 0);
  const totalCorrect = history.reduce((s, a) => s + a.score, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={Colors.primary} />
          </View>
          <View style={styles.nameRow}>
            <ThemedText variant="heading" style={styles.title}>
              CloudPrep
            </ThemedText>
            {isPro && <ProBadge size="md" />}
          </View>
          <ThemedText variant="body">Your learning journey</ThemedText>
        </View>

        {/* Pro Status Card */}
        {!isPro && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="rocket" size={24} color={Colors.primary} />
              <ThemedText variant="title" style={styles.cardTitle}>
                Upgrade to Pro
              </ThemedText>
            </View>
            <ThemedText variant="body" style={styles.proDesc}>
              Unlock all quizzes, practice exams, and unlimited bookmarks.
            </ThemedText>
            <Button title="Unlock CloudPrep Pro" onPress={showPaywall} style={styles.proButton} />
          </Card>
        )}

        {/* Streak Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame" size={24} color={Colors.warning} />
            <ThemedText variant="title" style={styles.cardTitle}>
              Study Streak
            </ThemedText>
          </View>
          <View style={styles.streakGrid}>
            <View style={styles.streakItem}>
              <ThemedText variant="heading" color={Colors.warning}>
                {streaks.currentStreak}
              </ThemedText>
              <ThemedText variant="caption">Current</ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.streakItem}>
              <ThemedText variant="heading">{streaks.longestStreak}</ThemedText>
              <ThemedText variant="caption">Longest</ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.streakItem}>
              <ThemedText variant="heading">{streaks.studyDates.length}</ThemedText>
              <ThemedText variant="caption">Total Days</ThemedText>
            </View>
          </View>
        </Card>

        {/* Lifetime Stats */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bar-chart" size={24} color={Colors.primary} />
            <ThemedText variant="title" style={styles.cardTitle}>
              Lifetime Stats
            </ThemedText>
          </View>
          <View style={styles.statsList}>
            <View style={styles.statRow}>
              <ThemedText variant="body">Quizzes Completed</ThemedText>
              <ThemedText variant="bodyLarge">{history.length}</ThemedText>
            </View>
            <View style={styles.statRow}>
              <ThemedText variant="body">Questions Answered</ThemedText>
              <ThemedText variant="bodyLarge">{totalQuestions}</ThemedText>
            </View>
            <View style={styles.statRow}>
              <ThemedText variant="body">Correct Answers</ThemedText>
              <ThemedText variant="bodyLarge" color={Colors.success}>
                {totalCorrect}
              </ThemedText>
            </View>
            <View style={styles.statRow}>
              <ThemedText variant="body">Accuracy</ThemedText>
              <ThemedText
                variant="bodyLarge"
                color={
                  totalQuestions > 0 && totalCorrect / totalQuestions >= 0.7
                    ? Colors.success
                    : Colors.warning
                }
              >
                {totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0}%
              </ThemedText>
            </View>
            <View style={styles.statRow}>
              <ThemedText variant="body">Bookmarks</ThemedText>
              <ThemedText variant="bodyLarge">{bookmarks.length}</ThemedText>
            </View>
          </View>
        </Card>

        {/* Restore Purchases */}
        <Button
          title="Restore Purchases"
          onPress={() => {
            restorePurchases();
          }}
          variant="secondary"
          style={styles.restoreButton}
        />

        <ThemedText variant="caption" style={styles.version}>
          CloudPrep v1.0.0
        </ThemedText>
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
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  title: {
    marginBottom: Theme.spacing.xs,
  },
  card: {
    marginBottom: Theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  cardTitle: {
    marginLeft: Theme.spacing.sm,
  },
  proDesc: {
    marginBottom: Theme.spacing.md,
    color: Colors.textSecondary,
  },
  proButton: {
    marginTop: Theme.spacing.xs,
  },
  streakGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  streakItem: {
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  statsList: {
    gap: Theme.spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  restoreButton: {
    marginTop: Theme.spacing.md,
  },
  version: {
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
  },
});
