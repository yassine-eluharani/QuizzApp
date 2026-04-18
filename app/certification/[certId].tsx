import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, Href } from 'expo-router';
import ThemedText from '@/components/ui/ThemedText';
import QuizListItem from '@/components/browse/QuizListItem';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import ProBadge from '@/components/paywall/ProBadge';
import { getCertification } from '@/assets/data/catalog';
import { useAppContext } from '@/context/AppContext';
import { usePurchase } from '@/context/PurchaseContext';
import { isQuizAccessible, isExamAccessible } from '@/lib/entitlements';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { ExamDomain } from '@/types/quiz';

export default function CertificationScreen() {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const router = useRouter();
  const { getBestScore, getAttemptsForCert } = useAppContext();
  const { isPro, showPaywall } = usePurchase();
  const result = getCertification(certId);

  if (!result) {
    return (
      <View style={styles.center}>
        <ThemedText variant="body">Certification not found</ThemedText>
      </View>
    );
  }

  const { certification: cert, platform } = result;
  const { examInfo, freeSample } = cert;
  const attempts = getAttemptsForCert(cert.id);
  const examLocked = !isExamAccessible(isPro);
  const sampleBestScore = getBestScore(freeSample.quizId);

  return (
    <>
      <Stack.Screen options={{ title: cert.code }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Badge text={cert.code} color={platform.color} />
          <ThemedText variant="title" style={styles.certName}>
            {cert.name}
          </ThemedText>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
              <ThemedText variant="caption"> {examInfo.duration} min</ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="checkmark-circle-outline" size={14} color={Colors.textMuted} />
              <ThemedText variant="caption"> Pass: {examInfo.passingScore}%</ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="help-circle-outline" size={14} color={Colors.textMuted} />
              <ThemedText variant="caption"> {examInfo.questionCount} questions</ThemedText>
            </View>
          </View>
        </View>

        {/* Exam Info */}
        <Card style={styles.infoCard}>
          <ThemedText variant="label" style={styles.infoTitle}>About the Exam</ThemedText>

          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={16} color={Colors.textMuted} />
            <ThemedText variant="caption" style={styles.infoText}>
              {examInfo.questionTypes.join(' · ')}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
            <ThemedText variant="caption" style={styles.infoText}>
              {examInfo.delivery.join(' & ')}
            </ThemedText>
          </View>

          {examInfo.note && (
            <View style={styles.noteRow}>
              <Ionicons name="information-circle-outline" size={15} color={Colors.warning} />
              <ThemedText variant="caption" style={[styles.infoText, { color: Colors.warning }]}>
                {examInfo.note}
              </ThemedText>
            </View>
          )}

          <ThemedText variant="label" style={styles.domainsLabel}>Exam Domains</ThemedText>
          {examInfo.domains.map((domain: ExamDomain) => (
            <View key={domain.name} style={styles.domainRow}>
              <View style={styles.domainLabelRow}>
                <ThemedText variant="caption" style={styles.domainName}>{domain.name}</ThemedText>
                <ThemedText variant="caption" style={{ color: platform.color }}>
                  {domain.percentage}%
                </ThemedText>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${domain.percentage}%` as any, backgroundColor: platform.color },
                  ]}
                />
              </View>
            </View>
          ))}
        </Card>

        {/* Free Sample */}
        <ThemedText variant="label" style={styles.sectionLabel}>Free Sample</ThemedText>
        <Card style={styles.sampleCard}>
          <View style={styles.sampleHeader}>
            <Ionicons name="gift-outline" size={22} color={Colors.success} />
            <View style={styles.sampleTitleBlock}>
              <ThemedText variant="bodyLarge">Try {freeSample.questionCount} Questions — Free</ThemedText>
              <ThemedText variant="caption">Get a feel for the style before going Pro</ThemedText>
            </View>
            {sampleBestScore !== null && sampleBestScore !== undefined && (
              <Badge
                text={`${Math.round(sampleBestScore)}%`}
                color={sampleBestScore >= examInfo.passingScore ? Colors.success : Colors.warning}
              />
            )}
          </View>
          <Button
            title="Start Free Sample"
            onPress={() => router.push(`/quiz/${freeSample.quizId}` as Href)}
            color={Colors.success}
            style={styles.sampleButton}
          />
        </Card>

        {/* Practice Exam (Pro) */}
        <Card style={styles.examCard}>
          <View style={styles.examHeader}>
            <Ionicons name="school" size={24} color={examLocked ? Colors.textMuted : platform.color} />
            <ThemedText variant="title" style={styles.examTitle}>
              Practice Exam
            </ThemedText>
            {examLocked && <ProBadge />}
          </View>
          <ThemedText variant="body" style={styles.examDesc}>
            Simulate real exam conditions with {examInfo.questionCount} random questions and a {examInfo.duration}-minute timer.
          </ThemedText>
          <Button
            title={examLocked ? 'Unlock with Pro' : 'Start Practice Exam'}
            onPress={() => {
              if (examLocked) {
                showPaywall();
              } else {
                router.push(`/exam/${cert.id}` as Href);
              }
            }}
            color={examLocked ? Colors.primary : platform.color}
            style={styles.examButton}
          />
        </Card>

        {/* Quiz List (Pro) */}
        <ThemedText variant="label" style={styles.sectionLabel}>
          Quizzes
        </ThemedText>
        {cert.quizzes.map(quiz => {
          const locked = !isQuizAccessible(quiz.id, isPro);
          return (
            <QuizListItem
              key={quiz.id}
              quiz={quiz}
              platformColor={platform.color}
              bestScore={locked ? null : getBestScore(quiz.id)}
              isLocked={locked}
              onPress={() => {
                if (locked) {
                  showPaywall();
                } else {
                  router.push(`/quiz/${quiz.id}` as Href);
                }
              }}
            />
          );
        })}

        {/* Recent Attempts */}
        {attempts.length > 0 && (
          <>
            <ThemedText variant="label" style={styles.sectionLabel}>
              Recent Attempts
            </ThemedText>
            {attempts.slice(0, 5).map(attempt => (
              <Card
                key={attempt.id}
                onPress={() => router.push(`/review/${attempt.id}` as Href)}
                style={styles.attemptCard}
              >
                <View style={styles.attemptRow}>
                  <View>
                    <ThemedText variant="bodyLarge">
                      {attempt.mode === 'exam'
                        ? 'Practice Exam'
                        : attempt.quizId.endsWith('-sample')
                          ? 'Free Sample'
                          : attempt.quizId.split('-').pop()?.replace('quiz', 'Quiz ')}
                    </ThemedText>
                    <ThemedText variant="caption">
                      {new Date(attempt.date).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <ThemedText
                    variant="title"
                    color={attempt.percentage >= examInfo.passingScore ? Colors.success : Colors.error}
                  >
                    {Math.round(attempt.percentage)}%
                  </ThemedText>
                </View>
              </Card>
            ))}
          </>
        )}
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
    marginBottom: Theme.spacing.lg,
  },
  certName: {
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Exam Info card
  infoCard: {
    marginBottom: Theme.spacing.xl,
  },
  infoTitle: {
    marginBottom: Theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
  },
  infoText: {
    flex: 1,
    color: Colors.textMuted,
  },
  domainsLabel: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  domainRow: {
    marginBottom: Theme.spacing.sm,
  },
  domainLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  domainName: {
    flex: 1,
    color: Colors.text,
    marginRight: Theme.spacing.sm,
  },
  barTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },

  // Free sample
  sectionLabel: {
    marginBottom: Theme.spacing.sm,
  },
  sampleCard: {
    marginBottom: Theme.spacing.md,
  },
  sampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  sampleTitleBlock: {
    flex: 1,
  },
  sampleButton: {
    marginTop: Theme.spacing.xs,
  },

  // Practice exam
  examCard: {
    marginBottom: Theme.spacing.xl,
  },
  examHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  examTitle: {
    flex: 1,
  },
  examDesc: {
    marginBottom: Theme.spacing.md,
  },
  examButton: {
    marginTop: Theme.spacing.xs,
  },

  // Attempts
  attemptCard: {
    marginBottom: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  attemptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
