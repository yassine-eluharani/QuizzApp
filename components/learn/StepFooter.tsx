import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PressableScale from '@/components/ui/PressableScale';
import { Colors } from '@/constants/Colors';

export type FooterState = 'idle' | 'wrong' | 'right';

interface Props {
  state: FooterState;
  canCheck?: boolean;
  checkLabel?: string;
  message?: string; // feedback line above the button
  onCheck?: () => void;
  onContinue: () => void;
  onReveal?: () => void; // offered after repeated misses
  plain?: boolean; // just a Continue button (read steps): brand colour, no verdict tint
}

/** Bottom action bar shared by every activity: Check -> feedback -> Continue. */
export default function StepFooter({
  state,
  canCheck = true,
  checkLabel = 'Check',
  message,
  onCheck,
  onContinue,
  onReveal,
  plain,
}: Props) {
  const right = state === 'right' && !plain;
  const wrong = state === 'wrong';
  return (
    <View style={[styles.wrap, right && styles.wrapRight, wrong && styles.wrapWrong]}>
      {!!message && (
        <Text
          style={[styles.msg, right && { color: Colors.success }, wrong && { color: Colors.error }]}
          accessibilityLiveRegion="polite"
        >
          {message}
        </Text>
      )}
      {wrong && onReveal && (
        <PressableScale onPress={onReveal} accessibilityRole="button" style={styles.reveal}>
          <Text style={styles.revealText}>Show me the answer</Text>
        </PressableScale>
      )}
      <PressableScale
        onPress={right || plain ? onContinue : onCheck}
        disabled={!right && !plain && !canCheck}
        accessibilityRole="button"
        accessibilityLabel={right || plain ? 'Continue' : checkLabel}
        style={[
          styles.btn,
          !right && !plain && !canCheck && styles.btnOff,
          right && { backgroundColor: Colors.success },
        ]}
      >
        <Text
          style={[styles.btnText, !right && !plain && !canCheck && { color: Colors.textMuted }]}
        >
          {right || plain ? 'Continue' : wrong ? 'Try again' : checkLabel}
        </Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 10,
  },
  wrapRight: { backgroundColor: 'rgba(34,197,94,0.08)' },
  wrapWrong: { backgroundColor: 'rgba(255,77,106,0.08)' },
  msg: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  btn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  btnOff: { backgroundColor: Colors.surfaceLight },
  btnText: { color: Colors.onPrimary, fontSize: 16, fontWeight: '800' },
  reveal: { alignSelf: 'center', paddingVertical: 4 },
  revealText: { color: Colors.textMuted, fontSize: 13, textDecorationLine: 'underline' },
});
