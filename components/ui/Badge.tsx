import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

interface BadgeProps {
  text: string;
  color?: string;
  variant?: 'filled' | 'outline';
}

export default function Badge({ text, color = Colors.primary, variant = 'filled' }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        variant === 'filled'
          ? { backgroundColor: color + '20' }
          : { borderWidth: 1, borderColor: color + '40' },
      ]}
    >
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Theme.spacing.sm + 2,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.semibold,
  },
});
