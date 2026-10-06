import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { EASE_OUT } from '@/lib/motion';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
}

export default function ProgressBar({
  progress,
  color = Colors.primary,
  height = 6,
}: ProgressBarProps) {
  const pct = useSharedValue(Math.min(Math.max(progress, 0), 1));
  useEffect(() => {
    pct.value = withTiming(Math.min(Math.max(progress, 0), 1), { duration: 300, easing: EASE_OUT });
  }, [progress, pct]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${pct.value * 100}%` }));

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fill, { backgroundColor: color, height }, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Theme.radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Theme.radius.full,
  },
});
