import React, { useEffect } from 'react';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { EASE_OUT } from '@/lib/motion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// The logo: an answer sheet whose filled bubbles spell "?". Same grid as the app icon's small cut.
const PITCH = 34;
const X0 = 60;
const R = 15;
const Y0 = 26;
// [row, col] in the order you'd draw a question mark; the orange answer dot lands last.
const DOTS: [number, number][] = [
  [1, 0],
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 4],
  [2, 4],
  [3, 3],
  [4, 2],
];
const ANSWER: [number, number] = [6, 2];
const STEP = 90; // ms between dots
const DOT_MS = 260;

const pos = ([r, c]: [number, number]) => ({ cx: X0 + c * PITCH, cy: Y0 + r * PITCH });

function Dot({
  at,
  delay,
  color,
  reduced,
}: {
  at: [number, number];
  delay: number;
  color: string;
  reduced: boolean;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withTiming(1, { duration: reduced ? 200 : DOT_MS, easing: EASE_OUT })
    );
  }, [delay, reduced, p]);
  const animatedProps = useAnimatedProps(() => ({
    r: R * (reduced ? 1 : 0.45 + 0.55 * p.value),
    opacity: p.value,
  }));
  const { cx, cy } = pos(at);
  return <AnimatedCircle cx={cx} cy={cy} fill={color} animatedProps={animatedProps} />;
}

// One-shot ripple that rings out from the answer dot when it lands.
function Ripple({ delay }: { delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: 600, easing: EASE_OUT }));
  }, [delay, p]);
  const animatedProps = useAnimatedProps(() => ({
    r: R * (1 + 1.4 * p.value),
    opacity: p.value === 0 ? 0 : 0.55 * (1 - p.value),
  }));
  const { cx, cy } = pos(ANSWER);
  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      fill="none"
      stroke={Colors.primary}
      strokeWidth={3}
      animatedProps={animatedProps}
    />
  );
}

/** Total time until the logo is fully formed (ms). */
export const LOGO_LOADER_MS = DOTS.length * STEP + 160 + DOT_MS;

export default function LogoLoader({ size = 120 }: { size?: number }) {
  const reduced = useReducedMotion();
  const answerDelay = reduced ? 0 : DOTS.length * STEP + 160;
  return (
    <Svg width={size} height={(size * 244) / 176} viewBox="40 6 176 244">
      {DOTS.map((d, i) => (
        <Dot
          key={i}
          at={d}
          delay={reduced ? 0 : i * STEP}
          color={Colors.textPrimary}
          reduced={reduced}
        />
      ))}
      <Dot at={ANSWER} delay={answerDelay} color={Colors.primary} reduced={reduced} />
      {!reduced && <Ripple delay={answerDelay + 120} />}
    </Svg>
  );
}
