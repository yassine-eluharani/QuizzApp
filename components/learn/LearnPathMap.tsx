import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';
import PressableScale from '@/components/ui/PressableScale';
import { unitNumber } from '@/lib/learn/engine';
import { Colors } from '@/constants/Colors';
import { CheckIcon, LockIcon, StarIcon, UnitIcon } from './icons';
import type { LearnPath } from '@/lib/learn/types';
import type { UnitState } from '@/lib/learn/progress';

const ROW = 96;
const TOP = 96;
const BOTTOM = 150; // room for the Continue card
const NODE_R = { done: 30, current: 38, locked: 28 } as const;
const MAX_W = 480;

interface Pt {
  x: number;
  y: number;
}

function bezier(a: Pt, b: Pt) {
  const dy = (b.y - a.y) * 0.6;
  return {
    p0: [a.x, a.y],
    p1: [a.x, a.y + dy],
    p2: [b.x, b.y - dy],
    p3: [b.x, b.y],
  };
}

/** Bubble dots along the S-curve between two nodes. `filled` is the share of the trail that is done. */
export function trailDots(a: Pt, b: Pt, skipA: number, skipB: number, filled: number) {
  const c = bezier(a, b);
  const at = (t: number): [number, number] => {
    const u = 1 - t;
    return [
      u * u * u * c.p0[0] + 3 * u * u * t * c.p1[0] + 3 * u * t * t * c.p2[0] + t * t * t * c.p3[0],
      u * u * u * c.p0[1] + 3 * u * u * t * c.p1[1] + 3 * u * t * t * c.p2[1] + t * t * t * c.p3[1],
    ];
  };
  const pts: { x: number; y: number; l: number }[] = [];
  let len = 0;
  let prev = at(0);
  pts.push({ x: prev[0], y: prev[1], l: 0 });
  for (let k = 1; k <= 80; k++) {
    const p = at(k / 80);
    len += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    pts.push({ x: p[0], y: p[1], l: len });
    prev = p;
  }
  const dots: { x: number; y: number; on: boolean }[] = [];
  for (let L = 13; L < len; L += 13) {
    const q = pts.find((p) => p.l >= L) ?? pts[pts.length - 1];
    if (Math.hypot(q.x - a.x, q.y - a.y) < skipA || Math.hypot(q.x - b.x, q.y - b.y) < skipB)
      continue;
    dots.push({ x: q.x, y: q.y, on: L / len <= filled });
  }
  return dots;
}

function ringPath(cx: number, cy: number, r: number, k: number, rot: number) {
  const pts: string[] = [];
  for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.12) {
    const w = 1 + 0.09 * Math.sin(a * 3 + k) + 0.05 * Math.sin(a * 5 + k * 2);
    pts.push(
      `${(cx + Math.cos(a + rot) * r * w * 1.25).toFixed(1)} ${(cy + Math.sin(a + rot) * r * w * 0.85).toFixed(1)}`
    );
  }
  return `M${pts.join('L')}Z`;
}

function Pulse({ size }: { size: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    t.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.bezier(0.23, 1, 0.32, 1) }),
      -1,
      false
    );
    return () => cancelAnimation(t);
  }, [reduced, t]);
  const style = useAnimatedStyle(() => ({
    opacity: reduced ? 0.25 : 0.55 * (1 - t.value),
    transform: [{ scale: 1 + 0.55 * t.value }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: Colors.primary,
        },
        style,
      ]}
    />
  );
}

interface Props {
  path: LearnPath;
  states: UnitState[];
  stars: number[]; // 0-3 per unit
  currentFraction: number; // lessons done in the current unit, 0-1
  onPressUnit: (index: number) => void;
}

export function mapHeight(unitCount: number) {
  return TOP + unitCount * ROW + BOTTOM;
}

export function nodeY(i: number) {
  return TOP + i * ROW + 40;
}

export default function LearnPathMap({ path, states, stars, currentFraction, onPressUnit }: Props) {
  const { width: winW } = useWindowDimensions();
  const W = Math.min(winW, MAX_W);
  const H = mapHeight(path.units.length);
  const xs = [W * 0.655, W * 0.345];
  const nodes: Pt[] = path.units.map((_, i) => ({ x: xs[i % 2], y: nodeY(i) }));
  const curIdx = states.indexOf('current');

  const rings = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < 9; i++) out.push(ringPath(W * 0.88, 420, 38 + i * 24, i * 0.7, 0.2));
    for (let i = 0; i < 7; i++) out.push(ringPath(W * 0.02, 180, 30 + i * 24, i * 0.9 + 2, -0.3));
    for (let i = 0; i < 8; i++) out.push(ringPath(W * 0.9, H - 330, 30 + i * 22, i * 0.6 + 4, 0.5));
    for (let i = 0; i < 7; i++)
      out.push(ringPath(W * 0.05, H - 120, 26 + i * 22, i * 0.8 + 1, -0.2));
    return out;
  }, [W, H]);

  const dots = useMemo(() => {
    const out: { x: number; y: number; on: boolean }[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const sa = states[i] === 'current' ? 46 : states[i] === 'done' ? 38 : 34;
      const sb = states[i + 1] === 'current' ? 46 : states[i + 1] === 'done' ? 38 : 34;
      const filled = states[i] === 'done' ? 1 : states[i] === 'current' ? currentFraction * 0.5 : 0;
      out.push(...trailDots(nodes[i], nodes[i + 1], sa, sb, filled));
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [W, states.join(','), currentFraction]);

  return (
    <View style={{ width: W, height: H, alignSelf: 'center' }}>
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="dots" width={18} height={18} patternUnits="userSpaceOnUse">
            <Circle cx={9} cy={9} r={0.95} fill={Colors.textPrimary} fillOpacity={0.1} />
          </Pattern>
          <RadialGradient id="glow">
            <Stop offset="0" stopColor={Colors.primary} stopOpacity={0.3} />
            <Stop offset="1" stopColor={Colors.primary} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={W} height={H} fill="url(#dots)" />
        {rings.map((d, i) => (
          <Path
            key={i}
            d={d}
            fill="none"
            stroke={Colors.textPrimary}
            strokeOpacity={0.05}
            strokeWidth={1}
          />
        ))}
        {curIdx >= 0 && (
          <Circle cx={nodes[curIdx].x} cy={nodes[curIdx].y} r={120} fill="url(#glow)" />
        )}
        <G>
          {dots.map((d, i) =>
            d.on ? (
              <Circle key={i} cx={d.x} cy={d.y} r={3.4} fill={Colors.primary} />
            ) : (
              <Circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={2.5}
                fill="none"
                stroke="#5A5148"
                strokeWidth={1.3}
              />
            )
          )}
        </G>
      </Svg>

      {path.units.map((u, i) => {
        const st = states[i];
        const r = NODE_R[st];
        const n = nodes[i];
        const labelOnLeft = n.x > W / 2;
        const labelStyle = labelOnLeft
          ? { right: W - n.x + r + 14, alignItems: 'flex-end' as const }
          : { left: n.x + r + 14, alignItems: 'flex-start' as const };
        const dim = st === 'locked';
        const align = { textAlign: labelOnLeft ? ('right' as const) : ('left' as const) };
        return (
          <React.Fragment key={u.id}>
            <View pointerEvents="none" style={[styles.label, { top: n.y - 24 }, labelStyle]}>
              <Text
                style={[
                  styles.kicker,
                  align,
                  { color: dim ? '#6A6157' : st === 'current' ? Colors.primary : Colors.textMuted },
                ]}
              >
                UNIT {unitNumber(u, i)}
              </Text>
              <Text
                style={[styles.title, align, { color: dim ? '#6A6157' : Colors.textPrimary }]}
                numberOfLines={2}
              >
                {u.title}
              </Text>
              {st === 'done' && (
                <View style={styles.starRow}>
                  {[0, 1, 2].map((k) => (
                    <StarIcon key={k} size={12} color={Colors.primary} filled={k < stars[i]} />
                  ))}
                </View>
              )}
              {st === 'current' && (
                <Text style={[styles.sub, align]}>{u.lessons.length} lessons</Text>
              )}
            </View>
            <PressableScale
              onPress={() => onPressUnit(i)}
              accessibilityRole="button"
              accessibilityLabel={`Unit ${unitNumber(u, i)}, ${u.title}, ${st === 'done' ? 'completed' : st === 'current' ? 'current' : 'locked'}`}
              style={[
                styles.nodeWrap,
                { left: n.x - r - 6, top: n.y - r - 6, width: 2 * r + 12, height: 2 * r + 12 },
              ]}
            >
              {st === 'current' && <Pulse size={2 * r} />}
              <View
                style={[
                  styles.node,
                  { width: 2 * r, height: 2 * r, borderRadius: r },
                  st === 'done' && { backgroundColor: Colors.primary },
                  st === 'current' && {
                    backgroundColor: '#1D1713',
                    borderColor: Colors.primary,
                    borderWidth: 2.4,
                  },
                  st === 'locked' && {
                    backgroundColor: '#1A1511',
                    borderColor: '#3A332D',
                    borderWidth: 1.5,
                  },
                ]}
              >
                <UnitIcon
                  name={u.icon}
                  size={st === 'current' ? 30 : st === 'done' ? 26 : 22}
                  color={
                    st === 'done' ? Colors.onPrimary : st === 'current' ? Colors.primary : '#5F574D'
                  }
                  strokeWidth={st === 'locked' ? 1.7 : 1.9}
                />
              </View>
              {st === 'done' && (
                <View style={[styles.badge, { right: 2, top: 2, borderColor: Colors.primary }]}>
                  <CheckIcon size={12} color={Colors.primary} />
                </View>
              )}
              {st === 'locked' && (
                <View
                  style={[
                    styles.badge,
                    { right: 4, bottom: 4, borderColor: '#3A332D', width: 18, height: 18 },
                  ]}
                >
                  <LockIcon size={10} color={Colors.textMuted} />
                </View>
              )}
            </PressableScale>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nodeWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  node: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { position: 'absolute', maxWidth: 170 },
  kicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  title: { fontSize: 16, fontWeight: '700', marginTop: 1 },
  sub: { fontSize: 11.5, color: Colors.textSecondary, marginTop: 3 },
  starRow: { flexDirection: 'row', gap: 2, marginTop: 4 },
});
