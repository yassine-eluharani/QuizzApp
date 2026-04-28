import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.primary, text: '#FFFFFF' },
  secondary: { bg: Colors.surfaceLight, text: Colors.textPrimary, border: Colors.border },
  ghost: { bg: 'transparent', text: Colors.primary },
  success: { bg: Colors.success, text: '#FFFFFF' },
  danger: { bg: Colors.error, text: '#FFFFFF' },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  color,
  style,
  textStyle,
  size = 'md',
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const vs = variantStyles[variant];
  const bg = color || vs.bg;
  const paddingV = size === 'sm' ? 8 : size === 'lg' ? 18 : 14;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 17 : 15;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? Colors.surfaceLight : bg,
          paddingVertical: paddingV,
          borderColor: vs.border || 'transparent',
          borderWidth: vs.border ? 1 : 0,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: disabled ? Colors.textMuted : vs.text,
              fontSize,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: Theme.fontWeight.semibold,
  },
});
