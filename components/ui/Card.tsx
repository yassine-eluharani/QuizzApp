import React from 'react';
import { View, TouchableOpacity, ViewProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

interface CardProps extends ViewProps {
  onPress?: () => void;
  accentColor?: string;
  variant?: 'default' | 'outlined';
}

export default function Card({
  onPress,
  accentColor,
  variant = 'default',
  style,
  children,
  ...props
}: CardProps) {
  const cardStyle: any[] = [
    styles.card,
    variant === 'outlined' ? styles.outlined : null,
    accentColor ? { borderLeftWidth: 3, borderLeftColor: accentColor } : null,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={cardStyle}
        accessibilityRole="button"
        {...(props as object)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: Colors.borderLight,
  },
});
