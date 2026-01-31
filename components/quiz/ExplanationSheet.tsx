import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

interface ExplanationSheetProps {
  explanation: string;
  onClose: () => void;
}

export default function ExplanationSheet({ explanation, onClose }: ExplanationSheetProps) {
  const { width } = useWindowDimensions();
  const source = {
    html: `<div style="padding: 8px; color: #A0A0B8; font-size: 15px; line-height: 1.6;">${explanation}</div>`,
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.header}>
        <ThemedText variant="title">Explanation</ThemedText>
        <TouchableOpacity onPress={onClose} hitSlop={8}>
          <Ionicons name="close-circle" size={28} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RenderHtml
          contentWidth={width - 48}
          source={source}
          ignoredDomTags={['button']}
          baseStyle={{ color: Colors.textSecondary }}
          tagsStyles={{
            p: { color: Colors.textSecondary, marginBottom: 8 },
            strong: { color: Colors.textPrimary },
            a: { color: Colors.primary },
            img: { maxWidth: width - 64, borderRadius: 8 },
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Theme.radius.xl,
    borderTopRightRadius: Theme.radius.xl,
    marginTop: 60,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
});
