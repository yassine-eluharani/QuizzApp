import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { EASE_OUT } from '@/lib/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

// Press feedback: 3% squish on press-in, quick release. Replaces TouchableOpacity's opacity dip.
export default function PressableScale({
  style,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        scale.value = withTiming(scaleTo, { duration: 100, easing: EASE_OUT });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: 160, easing: EASE_OUT });
        onPressOut?.(e);
      }}
      style={[style, animated]}
    />
  );
}
