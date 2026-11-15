import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

/** A drop target in window coordinates. */
export interface Target {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Props {
  label: string;
  state: ChipState;
  disabled?: boolean;
  onTap: () => void;
  /** Resolve every drop target's rectangle. Called once when a drag starts. */
  measureTargets: () => Promise<Target[]>;
  /** The slot under the finger changed (null = none). */
  onHover: (id: string | null) => void;
  /** The finger lifted over a slot. */
  onDrop: (id: string) => void;
  onDragState?: (dragging: boolean) => void;
}

const SLOP = 14; // forgiving hit area around a slot, in px
const SNAP = { damping: 22, stiffness: 340, mass: 0.7 };
const BACK = { damping: 18, stiffness: 240 };

/**
 * A chip you can drag onto a slot or just tap (tap the chip, then tap a slot).
 * While held it snaps onto the slot under the finger, so you see where it will land. Dropped on a
 * slot it leaves the tray at once; dropped anywhere else it springs back.
 */
export function DragChip({
  label,
  state,
  disabled,
  onTap,
  measureTargets,
  onHover,
  onDrop,
  onDragState,
}: Props) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const lift = useSharedValue(0);
  const gone = useSharedValue(0); // 1 right after a drop, until the tray state catches up
  const hover = useSharedValue('');
  const targets = useSharedValue<Target[]>([]);
  const origin = useSharedValue({ x: 0, y: 0 }); // chip centre at rest, window coordinates
  const leftSnapAt = useSharedValue(0);
  const [lifted, setLifted] = useState(false);
  const wrap = useRef<View>(null);
  const off = !!disabled || state === 'used';

  useEffect(() => {
    gone.value = 0;
  }, [state, gone]);

  const begin = async () => {
    setLifted(true);
    onDragState?.(true);
    const self = await new Promise<{ x: number; y: number; w: number; h: number } | null>((res) => {
      if (!wrap.current) return res(null);
      wrap.current.measureInWindow((x, y, w, h) => res({ x, y, w, h }));
    });
    const list = await measureTargets();
    if (self) origin.value = { x: self.x + self.w / 2, y: self.y + self.h / 2 };
    targets.value = list;
  };

  const end = () => {
    setLifted(false);
    onDragState?.(false);
    onHover(null);
  };

  const pan = Gesture.Pan()
    .enabled(!off)
    .minDistance(8)
    .onStart(() => {
      lift.value = withTiming(1, { duration: 100 });
      runOnJS(begin)();
    })
    .onUpdate((e) => {
      const list = targets.value;
      let best = '';
      let bestD = 1e9;
      let bx = 0;
      let by = 0;
      for (let i = 0; i < list.length; i++) {
        const t = list[i];
        if (
          e.absoluteX >= t.x - SLOP &&
          e.absoluteX <= t.x + t.w + SLOP &&
          e.absoluteY >= t.y - SLOP &&
          e.absoluteY <= t.y + t.h + SLOP
        ) {
          const cx = t.x + t.w / 2;
          const cy = t.y + t.h / 2;
          const d = Math.hypot(e.absoluteX - cx, e.absoluteY - cy);
          if (d < bestD) {
            bestD = d;
            best = t.id;
            bx = cx;
            by = cy;
          }
        }
      }
      if (best !== hover.value) {
        const wasOver = hover.value !== '';
        hover.value = best;
        runOnJS(onHover)(best || null);
        if (best) {
          // Snap onto the slot so the learner sees where it will land.
          tx.value = withSpring(bx - origin.value.x, SNAP);
          ty.value = withSpring(by - origin.value.y, SNAP);
        } else if (wasOver) {
          leftSnapAt.value = Date.now();
        }
        return;
      }
      if (best) return; // still over the same slot: stay snapped
      if (Date.now() - leftSnapAt.value < 150) {
        // just left a slot: ease back to the finger instead of jumping
        tx.value = withTiming(e.translationX, { duration: 90 });
        ty.value = withTiming(e.translationY, { duration: 90 });
      } else {
        tx.value = e.translationX;
        ty.value = e.translationY;
      }
    })
    .onFinalize((_e, success) => {
      const target = hover.value;
      targets.value = [];
      hover.value = '';
      if (success && target) {
        // Landed in a slot: vanish from the tray, no spring-back.
        gone.value = 1;
        tx.value = 0;
        ty.value = 0;
        lift.value = 0;
        runOnJS(onDrop)(target);
      } else {
        tx.value = withSpring(0, BACK);
        ty.value = withSpring(0, BACK);
        lift.value = withTiming(0, { duration: 140 });
      }
      runOnJS(end)();
    });

  const tap = Gesture.Tap()
    .enabled(!off)
    .onEnd((_e, ok) => {
      if (ok) runOnJS(onTap)();
    });

  const style = useAnimatedStyle(() => ({
    opacity: gone.value ? 0 : 1,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: 1 + lift.value * 0.06 },
    ],
  }));

  return (
    <View
      ref={wrap}
      collapsable={false}
      pointerEvents={state === 'used' ? 'none' : 'auto'}
      style={[
        styles.wrap,
        state === 'used' && styles.wrapUsed,
        lifted && { zIndex: 50, elevation: 8 },
      ]}
    >
      <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
        <Animated.View
          accessible
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ selected: state === 'selected', disabled: off }}
          accessibilityActions={[{ name: 'activate' }]}
          onAccessibilityAction={() => onTap()}
          style={[styles.chip, state === 'selected' && styles.chipSelected, style]}
        >
          <Text style={[styles.chipText, state === 'selected' && { color: Colors.onPrimary }]}>
            {label}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: '100%' },
  // Placed chips keep their space (so the tray does not reflow) but leave no shadow behind.
  wrapUsed: { opacity: 0 },
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
  chipText: { color: Colors.onPrimary, fontSize: 13.5, fontWeight: '700', fontFamily: 'SpaceMono' },
});
