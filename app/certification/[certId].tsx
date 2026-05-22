import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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

type Tab = 'quizzes' | 'exam';

export default function CertificationScreen() {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const router = useRouter();
  const { getBestScore, getAttemptsForCert } = useAppContext();
  const { isPro } = usePurchase();
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('quizzes');

  const result = getCertification(certId);

  if (!result) {
    return (
      <View style={styles.center}>
        <ThemedText variant="body">Certification not found</ThemedText>
      </View>
    );
  }

  const { certification: cert, platform } = result;
  const { examInfo } = cert;
  const attempts = getAttemptsForCert(cert.id);
  const examLocked = !isExamAccessible(isPro);
  const isComingSoon = cert.comingSoon === true;
  const freeQuiz = cert.quizzes[0];
  const freeQuizBestScore = freeQuiz ? getBestScore(freeQuiz.id) : null;

  const showComingSoonAlert = () =>
    Alert.alert(
      'Coming Soon',
      'Additional quizzes and Practice Exam mode arrive with Pro in a future update. For now, enjoy the free quiz for each certification.'
    );

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

        {/* About the Exam — collapsible */}
        <Card style={styles.infoCard}>
          <TouchableOpacity
            style={styles.infoToggle}
            onPress={() => setAboutExpanded((v) => !v)}
            activeOpacity={0.7}
          >
            <ThemedText variant="caption" style={styles.aboutLabel}>
              About the Exam
            </ThemedText>
            <Ionicons
              name={aboutExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {aboutExpanded && (
            <View style={styles.infoBody}>
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
                  <ThemedText
                    variant="caption"
                    style={[styles.infoText, { color: Colors.warning }]}
                  >
                    {examInfo.note}
                  </ThemedText>
                </View>
              )}
              <ThemedText variant="label" style={styles.domainsLabel}>
                Exam Domains
              </ThemedText>
              {examInfo.domains.map((domain: ExamDomain) => (
                <View key={domain.name} style={styles.domainRow}>
                  <View style={styles.domainLabelRow}>
                    <ThemedText variant="caption" style={styles.domainName}>
                      {domain.name}
                    </ThemedText>
                    <ThemedText variant="caption" style={{ color: platform.color }}>
                      {domain.percentage}%
                    </ThemedText>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${domain.percentage}%`, backgroundColor: platform.color },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Coming soon — replaces tabs/quizzes/exam UI for unfinished certs */}
        {isComingSoon && (
          <View style={styles.comingSoonContainer}>
            <View style={[styles.comingSoonIcon, { backgroundColor: platform.color + '14' }]}>
              <Ionicons name="construct-outline" size={36} color={platform.color} />
            </View>
            <ThemedText variant="title" style={styles.comingSoonTitle}>
              Coming Soon
            </ThemedText>
            <ThemedText variant="body" style={styles.comingSoonDesc}>
              We're still curating the question bank for {cert.code}. The exam blueprint above shows
              what to expect — quizzes and practice exam mode for this certification will ship in a
              future update.
            </ThemedText>
            <View style={styles.comingSoonHint}>
              <Ionicons name="sparkles-outline" size={14} color={Colors.primary} />
              <ThemedText variant="caption" style={styles.comingSoonHintText}>
                In the meantime, AWS Solutions Architect Associate and Developer Associate are fully
                available.
              </ThemedText>
            </View>
          </View>
        )}

        {/* Tabs */}
        {!isComingSoon && (
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'quizzes' && {
                  borderBottomColor: platform.color,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setActiveTab('quizzes')}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.tabLabel,
                  activeTab === 'quizzes'
                    ? { color: Colors.textPrimary }
                    : { color: Colors.textMuted },
                ]}
              >
                Quizzes
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'exam' && { borderBottomColor: platform.color, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab('exam')}
              activeOpacity={0.7}
            >
              <View style={styles.tabLabelRow}>
                <ThemedText
                  style={[
                    styles.tabLabel,
                    activeTab === 'exam'
                      ? { color: Colors.textPrimary }
                      : { color: Colors.textMuted },
                  ]}
                >
                  Exam Mode
                </ThemedText>
                {examLocked && <ProBadge variant="comingSoon" />}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab: Quizzes */}
        {!isComingSoon && activeTab === 'quizzes' && (
          <View style={styles.tabContent}>
            {/* Free quiz — prominent */}
            {freeQuiz && (
              <TouchableOpacity
                style={[styles.freeQuizCard, { borderColor: platform.color }]}
                onPress={() => router.push(`/quiz/${freeQuiz.id}` as Href)}
                activeOpacity={0.85}
              >
                <View style={[styles.freeQuizBadge, { backgroundColor: platform.color }]}>
                  <ThemedText style={styles.freeQuizBadgeText}>FREE</ThemedText>
                </View>
                <View style={styles.freeQuizBody}>
                  <ThemedText variant="bodyLarge" style={styles.freeQuizTitle}>
                    Quiz 1 — No Purchase Needed
                  </ThemedText>
                  <ThemedText variant="caption" style={styles.freeQuizSub}>
                    {freeQuiz.questionCount} questions · Self-paced · Instant feedback
                  </ThemedText>
                </View>
                <View style={styles.freeQuizRight}>
                  {freeQuizBestScore !== null && freeQuizBestScore !== undefined ? (
                    <Badge
                      text={`${Math.round(freeQuizBestScore)}%`}
                      color={
                        freeQuizBestScore >= examInfo.passingScore ? Colors.success : Colors.warning
                      }
                    />
                  ) : (
                    <Ionicons name="arrow-forward-circle" size={28} color={platform.color} />
                  )}
                </View>
              </TouchableOpacity>
            )}

            {/* Coming-soon strip — only shown to free users when there are more quizzes */}
            {!isPro && cert.quizzes.length > 1 && (
              <View style={styles.proUpsell}>
                <Ionicons name="sparkles-outline" size={14} color={Colors.primary} />
                <ThemedText variant="caption" style={styles.proUpsellText}>
                  {cert.quizzes.length - 1} more{' '}
                  {cert.quizzes.length - 1 === 1 ? 'quiz' : 'quizzes'} + practice exam coming soon
                </ThemedText>
              </View>
            )}

            {/* Rest of quizzes */}
            {cert.quizzes.slice(1).map((quiz) => {
              const locked = !isQuizAccessible(quiz.id, isPro);
              return (
                <QuizListItem
                  key={quiz.id}
                  quiz={quiz}
                  platformColor={platform.color}
                  bestScore={locked ? null : getBestScore(quiz.id)}
                  isLocked={locked}
                  onPress={() => {
                    if (locked) showComingSoonAlert();
                    else router.push(`/quiz/${quiz.id}` as Href);
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
                {attempts.slice(0, 5).map((attempt) => (
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
                        color={
                          attempt.percentage >= examInfo.passingScore
                            ? Colors.success
                            : Colors.error
                        }
                      >
                        {Math.round(attempt.percentage)}%
                      </ThemedText>
                    </View>
                  </Card>
                ))}
              </>
            )}
          </View>
        )}

        {/* Tab: Exam Mode */}
        {!isComingSoon && activeTab === 'exam' && (
          <View style={styles.tabContent}>
            <View style={styles.examIllustration}>
              <Ionicons
                name="school"
                size={48}
                color={examLocked ? Colors.textMuted : platform.color}
              />
            </View>

            <ThemedText variant="title" style={styles.examModeTitle}>
              Practice Exam
            </ThemedText>
            <ThemedText variant="body" style={styles.examModeDesc}>
              Simulates the real certification exam: {examInfo.questionCount} questions drawn at
              random, a {examInfo.duration}-minute countdown, and no feedback until you submit —
              just like the actual test.
            </ThemedText>

            <View style={styles.examStatRow}>
              <View style={styles.examStat}>
                <Ionicons name="help-circle-outline" size={20} color={platform.color} />
                <ThemedText variant="bodyLarge" style={styles.examStatValue}>
                  {examInfo.questionCount}
                </ThemedText>
                <ThemedText variant="caption" style={styles.examStatLabel}>
                  Questions
                </ThemedText>
              </View>
              <View style={styles.examStatDivider} />
              <View style={styles.examStat}>
                <Ionicons name="timer-outline" size={20} color={platform.color} />
                <ThemedText variant="bodyLarge" style={styles.examStatValue}>
                  {examInfo.duration}
                </ThemedText>
                <ThemedText variant="caption" style={styles.examStatLabel}>
                  Minutes
                </ThemedText>
              </View>
              <View style={styles.examStatDivider} />
              <View style={styles.examStat}>
                <Ionicons name="ribbon-outline" size={20} color={platform.color} />
                <ThemedText variant="bodyLarge" style={styles.examStatValue}>
                  {examInfo.passingScore}%
                </ThemedText>
                <ThemedText variant="caption" style={styles.examStatLabel}>
                  To Pass
                </ThemedText>
              </View>
            </View>

            <Button
              title={examLocked ? 'Coming Soon' : 'Start Practice Exam'}
              onPress={() => {
                if (examLocked) showComingSoonAlert();
                else router.push(`/exam/${cert.id}` as Href);
              }}
              color={examLocked ? Colors.primary : platform.color}
              style={styles.examButton}
            />

            {examLocked && (
              <ThemedText variant="caption" style={styles.examLockNote}>
                Practice Exam mode arrives with Pro in a future update.
              </ThemedText>
            )}
          </View>
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

  // Header
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

  // About the exam
  infoCard: {
    marginBottom: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
  },
  aboutLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoBody: {
    marginTop: Theme.spacing.md,
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
    color: Colors.textSecondary,
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

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Theme.spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    marginBottom: -1,
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabContent: {},

  // Pro upsell strip
  proUpsell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  proUpsellText: {
    flex: 1,
    color: Colors.textSecondary,
  },

  // Free quiz card
  freeQuizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  freeQuizBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freeQuizBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  freeQuizBody: {
    flex: 1,
  },
  freeQuizTitle: {
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  freeQuizSub: {
    color: Colors.textMuted,
  },
  freeQuizRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Exam mode tab
  examIllustration: {
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.md,
  },
  examModeTitle: {
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  examModeDesc: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: Theme.spacing.xl,
    lineHeight: 22,
  },
  examStatRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  examStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  examStatValue: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  examStatLabel: {
    color: Colors.textMuted,
  },
  examStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  examButton: {
    marginBottom: Theme.spacing.md,
  },
  examLockNote: {
    textAlign: 'center',
    color: Colors.textMuted,
  },

  // Coming soon
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.md,
  },
  comingSoonIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
  },
  comingSoonTitle: {
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  comingSoonDesc: {
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Theme.spacing.lg,
  },
  comingSoonHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    borderRadius: 10,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
  },
  comingSoonHintText: {
    flex: 1,
    color: Colors.textSecondary,
  },

  // Attempts
  sectionLabel: {
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
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
});
