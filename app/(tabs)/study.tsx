import React, { useMemo } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';
import Card from '@/components/ui/Card';
import { useAppContext } from '@/context/AppContext';
import { loadQuestionById } from '@/lib/questionLoader';
import { getCertification } from '@/assets/data/catalog';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

export default function StudyScreen() {
  const { bookmarks, bookmarksMeta, toggleBookmark } = useAppContext();

  const bookmarkedQuestions = useMemo(() => {
    return bookmarks
      .map((id) => {
        const question = loadQuestionById(id);
        const meta = bookmarksMeta[id];
        const certResult = meta ? getCertification(meta.certId) : undefined;
        return { id, question, meta, certResult };
      })
      .filter((b) => b.question);
  }, [bookmarks, bookmarksMeta]);

  // Group by certification
  const grouped = useMemo(() => {
    const groups: Record<string, typeof bookmarkedQuestions> = {};
    for (const item of bookmarkedQuestions) {
      const key = item.meta?.certId || 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [bookmarkedQuestions]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="heading">Study</ThemedText>
          <ThemedText variant="body" style={styles.subtitle}>
            {bookmarks.length} bookmarked questions
          </ThemedText>
        </View>

        {bookmarks.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={48} color={Colors.textMuted} />
            <ThemedText variant="body" style={styles.emptyText}>
              Bookmark questions during quizzes to review them here
            </ThemedText>
          </View>
        ) : (
          Object.entries(grouped).map(([certId, items]) => {
            const certName = items[0]?.certResult?.certification.name || certId;
            const platformColor = items[0]?.certResult?.platform.color || Colors.primary;

            return (
              <View key={certId} style={styles.section}>
                <ThemedText variant="label" color={platformColor} style={styles.sectionLabel}>
                  {certName}
                </ThemedText>
                {items.map((item) => {
                  const cleaned = item
                    .question!.question.trim()
                    .replace(/\s+/g, ' ')
                    .substring(0, 150);
                  return (
                    <Card key={item.id} style={styles.questionCard}>
                      <ThemedText
                        variant="body"
                        color={Colors.textPrimary}
                        style={styles.questionText}
                      >
                        {cleaned}...
                      </ThemedText>
                      <View style={styles.cardFooter}>
                        <ThemedText variant="caption">
                          {item.question!.choices.length} choices
                        </ThemedText>
                        <TouchableOpacity
                          onPress={() => toggleBookmark(item.id)}
                          hitSlop={12}
                          accessibilityRole="button"
                          accessibilityLabel="Remove bookmark"
                        >
                          <Ionicons name="bookmark" size={18} color={Colors.warning} />
                        </TouchableOpacity>
                      </View>
                    </Card>
                  );
                })}
              </View>
            );
          })
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
    marginBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.sm,
  },
  subtitle: {
    marginTop: Theme.spacing.xs,
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
  section: {
    marginBottom: Theme.spacing.lg,
  },
  sectionLabel: {
    marginBottom: Theme.spacing.sm,
  },
  questionCard: {
    marginBottom: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  questionText: {
    lineHeight: 22,
    marginBottom: Theme.spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
