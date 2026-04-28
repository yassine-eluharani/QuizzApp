import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

type ChoiceStatus = 'default' | 'selected' | 'correct' | 'incorrect';

interface ChoiceButtonProps {
  text: string;
  index: number;
  status: ChoiceStatus;
  disabled: boolean;
  onPress: () => void;
}

const statusStyles: Record<
  ChoiceStatus,
  { border: string; bg: string; icon?: string; iconColor?: string }
> = {
  default: { border: Colors.border, bg: Colors.surface },
  selected: { border: Colors.primary, bg: Colors.primary + '15' },
  correct: {
    border: Colors.success,
    bg: Colors.success + '15',
    icon: 'checkmark-circle',
    iconColor: Colors.success,
  },
  incorrect: {
    border: Colors.error,
    bg: Colors.error + '15',
    icon: 'close-circle',
    iconColor: Colors.error,
  },
};

const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function ChoiceButton({
  text,
  index,
  status,
  disabled,
  onPress,
}: ChoiceButtonProps) {
  const s = statusStyles[status];

  const labelLetter = labels[index] || String(index + 1);
  const stateHint =
    status === 'selected'
      ? 'selected'
      : status === 'correct'
        ? 'correct answer'
        : status === 'incorrect'
          ? 'incorrect answer'
          : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Option ${labelLetter}: ${text}`}
      accessibilityHint={stateHint}
      accessibilityState={{ disabled, selected: status === 'selected' }}
      style={[styles.container, { borderColor: s.border, backgroundColor: s.bg }]}
    >
      <View style={[styles.label, { borderColor: s.border }]}>
        <ThemedText
          variant="caption"
          color={s.border === Colors.border ? Colors.textMuted : s.border}
        >
          {labels[index] || String(index + 1)}
        </ThemedText>
      </View>
      <ThemedText variant="body" color={Colors.textPrimary} style={styles.text}>
        {text}
      </ThemedText>
      {s.icon && (
        <Ionicons name={s.icon as any} size={22} color={s.iconColor} style={styles.icon} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
  },
  label: {
    width: 28,
    height: 28,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  text: {
    flex: 1,
    lineHeight: 22,
  },
  icon: {
    marginLeft: Theme.spacing.sm,
  },
});
