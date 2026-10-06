import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';
import Badge from '@/components/ui/Badge';
import { InterviewQA } from '@/types/quiz';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

const LEVEL_LABEL: Record<InterviewQA['level'], string> = {
  foundational: 'Foundational',
  core: 'Core',
  advanced: 'Advanced',
};

const LEVEL_COLOR: Record<InterviewQA['level'], string> = {
  foundational: Colors.success,
  core: Colors.primary,
  advanced: Colors.warning,
};

interface InterviewQACardProps {
  qa: InterviewQA;
  accentColor: string;
}

export default function InterviewQACard({ qa, accentColor }: InterviewQACardProps) {
  const [expanded, setExpanded] = useState(false);
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.card, expanded && { borderColor: accentColor }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={styles.headerText}>
          <Badge text={LEVEL_LABEL[qa.level]} color={LEVEL_COLOR[qa.level]} />
          <ThemedText variant="bodyLarge" style={styles.question}>
            {qa.question}
          </ThemedText>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.answer}>
          <RenderHtml
            contentWidth={width - 80}
            source={{ html: `<div>${qa.answer_html}</div>` }}
            baseStyle={{ color: Colors.textSecondary, fontSize: 14, lineHeight: 21 }}
            tagsStyles={{
              p: { color: Colors.textSecondary, marginBottom: 8 },
              strong: { color: Colors.textPrimary },
              code: {
                color: accentColor,
                backgroundColor: Colors.surfaceLight,
              },
              li: { color: Colors.textSecondary, marginBottom: 4 },
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Theme.spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: Theme.spacing.xs,
  },
  question: {
    marginTop: Theme.spacing.xs,
  },
  answer: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Theme.spacing.md,
  },
});
