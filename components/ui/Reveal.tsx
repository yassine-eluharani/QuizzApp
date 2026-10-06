import React from 'react';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { EASE_OUT } from '@/lib/motion';

// Staggered entrance for list items: fade + 12px rise, 50ms apart (capped so long lists don't crawl).
// Reduced motion: short fade only, no displacement.
export default function Reveal({
  index = 0,
  children,
}: {
  index?: number;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const entering = reduced
    ? FadeIn.duration(150)
    : FadeInDown.delay(Math.min(index, 8) * 50)
        .duration(280)
        .easing(EASE_OUT)
        .withInitialValues({ opacity: 0, transform: [{ translateY: 12 }] });
  return <Animated.View entering={entering}>{children}</Animated.View>;
}
