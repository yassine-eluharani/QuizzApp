import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

type TextVariant = 'heading' | 'title' | 'body' | 'bodyLarge' | 'caption' | 'label';

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

const variantStyles: Record<TextVariant, any> = {
  heading: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
  },
  title: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.normal,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.normal,
    color: Colors.textMuted,
  },
  label: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textPrimary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
};

export default function ThemedText({ variant = 'body', color, style, ...props }: ThemedTextProps) {
  return (
    <Text
      style={[variantStyles[variant], color ? { color } : undefined, style]}
      {...props}
    />
  );
}
