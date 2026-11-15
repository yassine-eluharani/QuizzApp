import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

export type ChipState = 'free' | 'selected' | 'used';

interface Props {
  label: string;
  state: ChipState;
  disabled?: boolean;
  onTap: () => void;
  /** Absolute (window) coordinates where the finger lifted. */
  onDrop: (x: number, y: number) => void;
  onDragState?: (dragging: boolean) => void;
}

/**
 * A chip you can drag onto a slot or just tap (tap the chip, then tap a slot).
 * Both paths are always on, so small screens and assistive tech never need a drag.
 */
export function DragChip({ label, state, disabled, onTap, onDrop, onDragState }: Props) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const lift = useSharedValue(0);
  const off = !!disabled || state === 'used';

  const pan = Gesture.Pan()
    .enabled(!off)
    .minDistance(8)
    .onStart(() => {
      lift.value = withTiming(1, { duration: 100 });
      if (onDragState) runOnJS(onDragState)(true);
    })
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY;
    })
    .onEnd((e) => {
      runOnJS(onDrop)(e.absoluteX, e.absoluteY);
    })
    .onFinalize(() => {
      tx.value = withSpring(0, { damping: 18, stiffness: 240 });
      ty.value = withSpring(0, { damping: 18, stiffness: 240 });
      lift.value = withTiming(0, { duration: 140 });
      if (onDragState) runOnJS(onDragState)(false);
    });

  const tap = Gesture.Tap()
    .enabled(!off)
    .onEnd((_e, ok) => {
      if (ok) runOnJS(onTap)();
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: 1 + lift.value * 0.06 },
    ],
    zIndex: lift.value > 0 ? 50 : 0,
    elevation: lift.value > 0 ? 8 : 0,
  }));

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: state === 'selected', disabled: off }}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={() => onTap()}
        style={[
          styles.chip,
          state === 'selected' && styles.chipSelected,
          state === 'used' && styles.chipUsed,
          style,
        ]}
      >
        <Text style={[styles.chipText, state === 'selected' && { color: Colors.onPrimary }]}>
          {label}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 38,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 19,
    paddingVertical: 6,
    maxWidth: '100%',
    backgroundColor: Colors.textPrimary,
  },
  chipSelected: { backgroundColor: Colors.primary },
  chipUsed: { backgroundColor: Colors.surfaceLight, opacity: 0.35 },
  chipText: { color: Colors.onPrimary, fontSize: 13.5, fontWeight: '700', fontFamily: 'SpaceMono' },
});
