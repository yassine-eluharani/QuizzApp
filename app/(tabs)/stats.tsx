import React, { useMemo } from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAppContext } from '@/context/AppContext';
import { getCertification } from '@/assets/data/catalog';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { formatTime } from '@/lib/utils';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const { history, streaks } = useAppContext();
  const router = useRouter();

  const totalAttempts = history.length;
  const avgScore = totalAttempts > 0
    ? Math.round(history.reduce((s, a) => s + a.percentage, 0) / totalAttempts)
    : 0;
  const totalTime = history.reduce((s, a) => s + a.timeTaken, 0);

  // Recent scores for chart
  const recentScores = useMemo(() => {
    const recent = history.slice(0, 10).reverse();
    if (recent.length < 2) return null;
    return {
      labels: recent.map((_, i) => `${i + 1}`),
      datasets: [{ data: recent.map(a => Math.round(a.percentage)) }],
    };
  }, [history]);

  // Accuracy by certification
  const certStats = useMemo(() => {
    const map: Record<string, { total: number; correct: number; name: string; color: string }> = {};
    for (const attempt of history) {
      if (!map[attempt.certificationId]) {
        const result = getCertification(attempt.certificationId);
        map[attempt.certificationId] = {
          total: 0,
          correct: 0,
          name: result?.certification.code || attempt.certificationId,
          color: result?.platform.color || Colors.primary,
        };
      }
      map[attempt.certificationId].total += attempt.totalQuestions;
      map[attempt.certificationId].correct += attempt.score;
    }
    return Object.entries(map).map(([id, stats]) => ({
      id,
      ...stats,
      percentage: Math.round((stats.correct / stats.total) * 100),
    }));
  }, [history]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="heading">Stats</ThemedText>
        </View>

        {/* Streak */}
        <Card style={styles.streakCard}>
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={32} color={Colors.warning} />
            <View style={styles.streakInfo}>
              <ThemedText variant="heading" color={Colors.warning}>
                {streaks.currentStreak}
              </ThemedText>
              <ThemedText variant="caption">Day Streak</ThemedText>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakInfo}>
              <ThemedText variant="title">{streaks.longestStreak}</ThemedText>
              <ThemedText variant="caption">Best Streak</ThemedText>
            </View>
          </View>
        </Card>

        {/* Overview */}
        <View style={styles.overviewRow}>
          <Card style={styles.overviewCard}>
            <Ionicons name="document-text" size={22} color={Colors.primary} />
            <ThemedText variant="title" style={styles.overviewValue}>{totalAttempts}</ThemedText>
            <ThemedText variant="caption">Quizzes</ThemedText>
          </Card>
          <Card style={styles.overviewCard}>
            <Ionicons name="trending-up" size={22} color={Colors.success} />
            <ThemedText variant="title" style={styles.overviewValue}>{avgScore}%</ThemedText>
            <ThemedText variant="caption">Avg Score</ThemedText>
          </Card>
          <Card style={styles.overviewCard}>
            <Ionicons name="time" size={22} color={Colors.primaryLight} />
            <ThemedText variant="title" style={styles.overviewValue}>
              {formatTime(totalTime)}
            </ThemedText>
            <ThemedText variant="caption">Total Time</ThemedText>
          </Card>
        </View>

        {/* Score Trend Chart */}
        {recentScores && (
          <>
            <ThemedText variant="label" style={styles.sectionLabel}>
              Score Trend
            </ThemedText>
            <Card style={styles.chartCard}>
              <LineChart
                data={recentScores}
                width={screenWidth - 80}
                height={180}
                yAxisSuffix="%"
                chartConfig={{
                  backgroundColor: Colors.surface,
                  backgroundGradientFrom: Colors.surface,
                  backgroundGradientTo: Colors.surface,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
                  labelColor: () => Colors.textMuted,
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: Colors.primary,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </Card>
          </>
        )}

        {/* Accuracy by Certification */}
        {certStats.length > 0 && (
          <>
            <ThemedText variant="label" style={styles.sectionLabel}>
              Accuracy by Certification
            </ThemedText>
            {certStats.map(stat => (
              <Card key={stat.id} style={styles.certStatCard}>
                <View style={styles.certStatRow}>
                  <Badge text={stat.name} color={stat.color} />
                  <ThemedText
                    variant="title"
                    color={stat.percentage >= 70 ? Colors.success : Colors.warning}
                  >
                    {stat.percentage}%
                  </ThemedText>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${stat.percentage}%`,
                        backgroundColor: stat.color,
                      },
                    ]}
                  />
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Recent Attempts */}
        {history.length > 0 && (
          <>
            <ThemedText variant="label" style={styles.sectionLabel}>
              Recent Activity
            </ThemedText>
            {history.slice(0, 10).map(attempt => {
              const result = getCertification(attempt.certificationId);
              return (
                <Card
                  key={attempt.id}
                  onPress={() => router.push(`/review/${attempt.id}` as Href)}
                  style={styles.attemptCard}
                >
                  <View style={styles.attemptRow}>
                    <View>
                      <ThemedText variant="bodyLarge">
                        {result?.certification.code || attempt.certificationId}
                      </ThemedText>
                      <ThemedText variant="caption">
                        {attempt.mode === 'exam' ? 'Practice Exam' : 'Quiz'} - {new Date(attempt.date).toLocaleDateString()}
                      </ThemedText>
                    </View>
                    <ThemedText
                      variant="title"
                      color={attempt.percentage >= 70 ? Colors.success : Colors.error}
                    >
                      {Math.round(attempt.percentage)}%
                    </ThemedText>
                  </View>
                </Card>
              );
            })}
          </>
        )}

        {totalAttempts === 0 && (
          <View style={styles.empty}>
            <Ionicons name="stats-chart-outline" size={48} color={Colors.textMuted} />
            <ThemedText variant="body" style={styles.emptyText}>
              Complete quizzes to see your stats here
            </ThemedText>
          </View>
        )}
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
    marginBottom: Theme.spacing.lg,
    marginTop: Theme.spacing.sm,
  },
  streakCard: {
    marginBottom: Theme.spacing.md,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  streakInfo: {
    alignItems: 'center',
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  overviewCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  overviewValue: {
    marginVertical: Theme.spacing.xs,
  },
  sectionLabel: {
    marginBottom: Theme.spacing.md,
  },
  chartCard: {
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
  },
  chart: {
    borderRadius: Theme.radius.md,
  },
  certStatCard: {
    marginBottom: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  certStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  barTrack: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  attemptCard: {
    marginBottom: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  attemptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xxl * 2,
  },
  emptyText: {
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
});
