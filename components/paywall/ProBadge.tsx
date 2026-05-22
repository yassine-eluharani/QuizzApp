import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

interface ProBadgeProps {
  size?: 'sm' | 'md';
  variant?: 'pro' | 'comingSoon';
}

export default function ProBadge({ size = 'sm', variant = 'pro' }: ProBadgeProps) {
  const isSmall = size === 'sm';
  const label = variant === 'comingSoon' ? 'SOON' : 'PRO';
  return (
    <View style={[styles.badge, isSmall && styles.badgeSmall]}>
      <Text style={[styles.text, isSmall && styles.textSmall]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.radius.sm,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    color: '#FFFFFF',
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.bold,
  },
  textSmall: {
    fontSize: 10,
  },
});
