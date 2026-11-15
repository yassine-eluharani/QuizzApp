import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

// Web wraps Text unless told not to; native Text inside a horizontal ScrollView never wraps.
export const NO_WRAP = Platform.select({
  web: { whiteSpace: 'pre' } as unknown as TextStyle,
  default: {},
});

/** Monospace block that scrolls sideways instead of wrapping, so tables and manifests keep their columns. */
export default function Mono({ text, fontSize = 11.5 }: { text: string; fontSize?: number }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Text
        style={[styles.mono, NO_WRAP, { fontSize, lineHeight: Math.round(fontSize * 1.55) }]}
        selectable
      >
        {text}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingRight: 14 },
  mono: { color: Colors.textSecondary, fontFamily: 'SpaceMono', flexShrink: 0 },
});
