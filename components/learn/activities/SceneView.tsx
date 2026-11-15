import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import PressableScale from '@/components/ui/PressableScale';
import { EASE_OUT } from '@/lib/motion';
import {
  resolveStates,
  richParts,
  TONES,
  type Applied,
  type ResolvedState,
} from '@/lib/learn/scene';
import { Colors } from '@/constants/Colors';
import type { SceneActor, SceneFrame, SceneStep, Tone } from '@/lib/learn/types';
import type { ActivityProps } from './types';

const STAGE_W = 340; // logical stage width the content is authored in
const MAX_STAGE = 520;

// Border / fill per tone, index-aligned with TONES.
const BORDER = ['#4A4239', '#FF5A1F', '#22C55E', '#FFB347', '#FF4D6A', '#2E2822'];
const FILL = [
  'rgba(255,255,255,0.03)',
  'rgba(255,90,31,0.10)',
  'rgba(34,197,94,0.12)',
  'rgba(255,179,71,0.12)',
  'rgba(255,77,106,0.15)',
  'rgba(255,255,255,0.01)',
];
const SOLID: Record<string, string> = {
  orange: '#FF5A1F',
  paper: '#F5F0E6',
  teal: '#3DDBB0',
  blue: '#5B9BFF',
};
const TONE_SOLID = ['', '#FF5A1F', '#22C55E', '#FFB347', '#FF4D6A', '#3A332D'];

const toneIndex = (t: Tone) => TONES.indexOf(t);

function useTween(target: number, ms: number, reduced: boolean) {
  const v = useSharedValue(target);
  useEffect(() => {
    v.value = withTiming(target, { duration: reduced ? 120 : ms, easing: EASE_OUT });
  }, [target, ms, reduced, v]);
  return v;
}

function Ring({ w, h, radius }: { w: number; h: number; radius: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    t.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    return () => cancelAnimation(t);
  }, [reduced, t]);
  const style = useAnimatedStyle(() => ({
    opacity: reduced ? 0.5 : 0.7 * (1 - t.value),
    transform: [{ scale: 1 + 0.22 * t.value }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: -3,
          top: -3,
          width: w + 6,
          height: h + 6,
          borderRadius: radius + 3,
          borderWidth: 2,
          borderColor: Colors.primary,
        },
        style,
      ]}
    />
  );
}

interface ActorProps {
  actor: SceneActor;
  st: ResolvedState;
  u: number;
  reduced: boolean;
  tappable: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
}

function ActorView({ actor, st, u, reduced, tappable, onPress, children }: ActorProps) {
  const kind = actor.kind;
  const slow = kind === 'dot' ? 750 : 560;
  const x = useTween(st.x * u, slow, reduced);
  const y = useTween(st.y * u, slow, reduced);
  const w = useTween((st.w ?? 0) * u, 450, reduced);
  const h = useTween((st.h ?? 0) * u, 450, reduced);
  const op = useTween(st.opacity, 450, reduced);
  const sc = useTween(st.scale, 450, reduced);
  const fill = useTween(st.fill, 700, reduced);
  const hasW = st.w !== undefined;
  const hasH = st.h !== undefined;

  // Tone: crossfade from the previous tone to the new one.
  const fromT = useSharedValue(toneIndex(st.tone));
  const toT = useSharedValue(toneIndex(st.tone));
  const prog = useSharedValue(1);
  const lastTone = useRef(st.tone);
  useEffect(() => {
    if (lastTone.current === st.tone) return;
    fromT.value = toT.value;
    toT.value = toneIndex(st.tone);
    prog.value = 0;
    prog.value = withTiming(1, { duration: reduced ? 120 : 420 });
    lastTone.current = st.tone;
  }, [st.tone, reduced, fromT, toT, prog]);

  const base = SOLID[actor.color ?? 'orange'];
  const isSolid = kind === 'ctr' || kind === 'dot' || kind === 'user';
  const solids = useMemo(() => TONE_SOLID.map((c, i) => (i === 0 ? base : c)), [base]);

  const frame = useAnimatedStyle(() => ({
    left: x.value,
    top: y.value,
    ...(hasW ? { width: w.value } : {}),
    ...(hasH ? { height: h.value } : {}),
    opacity: op.value,
    transform: [{ scale: sc.value }],
  }));
  const look = useAnimatedStyle(() => {
    if (isSolid) {
      return {
        backgroundColor: interpolateColor(
          prog.value,
          [0, 1],
          [solids[fromT.value], solids[toT.value]]
        ),
      };
    }
    return {
      borderColor: interpolateColor(prog.value, [0, 1], [BORDER[fromT.value], BORDER[toT.value]]),
      backgroundColor: interpolateColor(prog.value, [0, 1], [FILL[fromT.value], FILL[toT.value]]),
    };
  });
  const barFill = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, fill.value)) * 100}%`,
  }));

  const label = st.label ?? actor.label ?? '';
  const fs = (actor.fontSize ?? 10) * u;
  const wpx = (st.w ?? 0) * u;
  const hpx = (st.h ?? 0) * u;
  const rad = Math.min(14 * u, hpx / 2 || 14 * u);

  let body: React.ReactNode = null;
  let extra: object = {};
  switch (kind) {
    case 'box':
    case 'pod':
      extra = {
        borderWidth: 1.5,
        borderRadius: kind === 'pod' ? 12 * u : 16 * u,
        borderStyle: kind === 'pod' ? 'dashed' : 'solid',
      };
      body = label ? (
        <Text style={[styles.boxLabel, { fontSize: 9 * u, left: 10 * u, top: 6 * u }]}>
          {label}
        </Text>
      ) : null;
      break;
    case 'ctr':
      extra = { borderRadius: 8 * u, alignItems: 'center', justifyContent: 'center' };
      body = <Text style={[styles.ctrText, { fontSize: Math.min(fs, 9 * u) }]}>{label}</Text>;
      break;
    case 'dot':
      extra = { borderRadius: 999 };
      break;
    case 'user':
      extra = { borderRadius: 999, alignItems: 'center', justifyContent: 'center' };
      body = <Text style={[styles.ctrText, { fontSize: 8.5 * u }]}>{label}</Text>;
      break;
    case 'tag':
      extra = { borderWidth: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' };
      body = <Text style={[styles.tagText, { fontSize: 11 * u }]}>{label}</Text>;
      break;
    case 'text':
      body = (
        <Text
          style={[
            styles.plain,
            { fontSize: (actor.fontSize ?? 11) * u, lineHeight: (actor.fontSize ?? 11) * 1.35 * u },
          ]}
        >
          {label}
        </Text>
      );
      break;
    case 'code':
      extra = {
        borderWidth: 1,
        borderRadius: 10 * u,
        padding: 8 * u,
        backgroundColor: '#0E0C0A',
        borderColor: '#2C2622',
      };
      body = (
        <View>
          {(st.lines ?? actor.lines ?? []).map((line, i) => (
            <Text
              key={i}
              style={[
                styles.codeLine,
                {
                  fontSize: (actor.fontSize ?? 9.5) * u,
                  lineHeight: (actor.fontSize ?? 9.5) * 1.5 * u,
                },
                st.hl.includes(i) && styles.codeHl,
              ]}
            >
              {line || ' '}
            </Text>
          ))}
        </View>
      );
      break;
    case 'bar':
      extra = {
        borderWidth: 1,
        borderRadius: 999,
        borderColor: '#3A332D',
        backgroundColor: '#1A1511',
        overflow: 'visible',
      };
      body = (
        <>
          <View style={[StyleSheet.absoluteFill, { borderRadius: 999, overflow: 'hidden' }]}>
            <Animated.View
              style={[
                {
                  height: '100%',
                  borderRadius: 999,
                  backgroundColor:
                    st.tone === 'normal' ? '#C9C2B6' : TONE_SOLID[toneIndex(st.tone)],
                },
                barFill,
              ]}
            />
          </View>
          {actor.limit !== undefined && (
            <View
              style={[
                styles.limit,
                { left: `${actor.limit * 100}%`, top: -3 * u, height: hpx + 6 * u },
              ]}
            />
          )}
        </>
      );
      break;
    case 'arrow': {
      const head = 6 * u;
      const d =
        actor.dir === 'down'
          ? `M${wpx / 2} 0V${hpx} M${wpx / 2 - head} ${hpx - head}L${wpx / 2} ${hpx}L${wpx / 2 + head} ${hpx - head}`
          : actor.dir === 'up'
            ? `M${wpx / 2} ${hpx}V0 M${wpx / 2 - head} ${head}L${wpx / 2} 0L${wpx / 2 + head} ${head}`
            : actor.dir === 'left'
              ? `M${wpx} ${hpx / 2}H0 M${head} ${hpx / 2 - head}L0 ${hpx / 2}L${head} ${hpx / 2 + head}`
              : `M0 ${hpx / 2}H${wpx} M${wpx - head} ${hpx / 2 - head}L${wpx} ${hpx / 2}L${wpx - head} ${hpx / 2 + head}`;
      body = (
        <Svg width={wpx} height={hpx}>
          <Path
            d={d}
            stroke={st.tone === 'normal' ? '#8A8277' : BORDER[toneIndex(st.tone)]}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      );
      break;
    }
  }

  const needsLook = kind !== 'text' && kind !== 'arrow' && kind !== 'code' && kind !== 'bar';
  return (
    <Animated.View
      pointerEvents={tappable ? 'auto' : 'box-none'}
      style={[styles.actor, frame, needsLook ? look : null, extra as object]}
    >
      {body}
      {children}
      {tappable && <Ring w={wpx} h={hpx} radius={rad} />}
      {tappable && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Tap ${actor.label ?? actor.id}`}
        />
      )}
    </Animated.View>
  );
}

function Rich({ text, style, bold }: { text: string; style: object; bold: object }) {
  return (
    <Text style={style}>
      {richParts(text).map((p, i) => (
        <Text key={i} style={p.bold ? bold : undefined}>
          {p.text}
        </Text>
      ))}
    </Text>
  );
}

export default function SceneView({ step, onDone }: ActivityProps<SceneStep>) {
  const reduced = useReducedMotion();
  const { width: winW } = useWindowDimensions();
  const stageW = Math.min(winW - 28, MAX_STAGE);
  const u = stageW / STAGE_W;
  const stageH = (step.stageHeight ?? 300) * u;

  const [beat, setBeat] = useState(0);
  const [applied, setApplied] = useState<Applied>({});
  const [fired, setFired] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const current = step.beats[beat];
  const poke = current.poke;
  const states = useMemo(() => resolveStates(step, beat, applied), [step, beat, applied]);
  const firedHere = poke ? poke.actions.map((_, i) => fired.has(`${beat}:${i}`)) : [];
  const pokeDone =
    !poke || (poke.need === 'all' ? firedHere.every(Boolean) : firedHere.some(Boolean));
  const last = beat === step.beats.length - 1;

  const children = useMemo(() => {
    const map: Record<string, SceneActor[]> = {};
    for (const a of step.actors) (map[a.parent ?? ''] ??= []).push(a);
    return map;
  }, [step]);

  const fire = (ai: number) => {
    if (!poke || running || fired.has(`${beat}:${ai}`)) return;
    const action = poke.actions[ai];
    const bi = beat;
    setRunning(true);
    clearTimers();
    action.frames.forEach((f: SceneFrame, k: number) => {
      timers.current.push(
        setTimeout(
          () => {
            setApplied((a) => ({ ...a, [bi]: [...(a[bi] ?? []), f] }));
            if (f.caption) setCaption(f.caption);
            if (k === action.frames.length - 1) {
              setFired((s) => new Set(s).add(`${bi}:${ai}`));
              setRunning(false);
            }
          },
          reduced ? Math.min(f.after, 400) : f.after
        )
      );
    });
  };

  const go = (to: number) => {
    clearTimers();
    setRunning(false);
    setCaption(null);
    if (to < beat) {
      // Going back replays from there: forget pokes at or after the beat we return to.
      setApplied((a) => Object.fromEntries(Object.entries(a).filter(([k]) => Number(k) < to)));
      setFired((s) => new Set([...s].filter((k) => Number(k.split(':')[0]) < to)));
    }
    setBeat(to);
  };

  const tapTargets = new Map<string, number>();
  if (poke)
    poke.actions.forEach(
      (a, i) => a.target && !firedHere[i] && !running && tapTargets.set(a.target, i)
    );

  const renderActor = (a: SceneActor): React.ReactNode => {
    const ai = tapTargets.get(a.id);
    return (
      <ActorView
        key={a.id}
        actor={a}
        st={states[a.id]}
        u={u}
        reduced={reduced}
        tappable={ai !== undefined}
        onPress={ai !== undefined ? () => fire(ai) : undefined}
      >
        {(children[a.id] ?? []).map(renderActor)}
      </ActorView>
    );
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>LEARN</Text>
        <Text style={styles.title}>{current.title ?? step.title}</Text>

        <View style={[styles.stage, { width: stageW, height: stageH }]}>
          <Svg width={stageW} height={stageH} style={StyleSheet.absoluteFill}>
            <Defs>
              <Pattern id="sg" width={16} height={16} patternUnits="userSpaceOnUse">
                <Circle cx={8} cy={8} r={0.9} fill={Colors.textPrimary} fillOpacity={0.09} />
              </Pattern>
            </Defs>
            <Rect width={stageW} height={stageH} fill="url(#sg)" />
          </Svg>
          {(children[''] ?? []).map(renderActor)}
        </View>

        <View accessibilityLiveRegion="polite" style={styles.capWrap}>
          <Rich text={caption ?? current.caption} style={styles.caption} bold={styles.bold} />
        </View>

        {poke && (
          <View style={styles.pokeBox}>
            <Text style={[styles.pokeHint, pokeDone && { color: Colors.success }]}>
              {pokeDone ? 'Nice. Carry on whenever you are ready.' : poke.hint}
            </Text>
            <View style={styles.btnRow}>
              {poke.actions.map((a, i) =>
                a.label ? (
                  <PressableScale
                    key={i}
                    onPress={() => fire(i)}
                    disabled={running || firedHere[i]}
                    accessibilityRole="button"
                    accessibilityLabel={a.label}
                    style={[styles.pokeBtn, (running || firedHere[i]) && { opacity: 0.4 }]}
                  >
                    <Text style={styles.pokeBtnText}>{a.label}</Text>
                  </PressableScale>
                ) : null
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {beat > 0 ? (
          <PressableScale
            onPress={() => go(beat - 1)}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.back}
          >
            <Text style={styles.backText}>Back</Text>
          </PressableScale>
        ) : (
          <View style={styles.back} />
        )}
        <View style={styles.dots}>
          {step.beats.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === beat && styles.dotOn, i < beat && styles.dotDone]}
            />
          ))}
        </View>
        <PressableScale
          onPress={() => (last ? onDone() : go(beat + 1))}
          disabled={!pokeDone || running}
          accessibilityRole="button"
          accessibilityLabel={last ? 'Continue' : 'Next'}
          style={[styles.next, (!pokeDone || running) && styles.nextOff]}
        >
          <Text style={[styles.nextText, (!pokeDone || running) && { color: Colors.textMuted }]}>
            {last ? 'Continue' : 'Next'}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 6, paddingBottom: 18, alignItems: 'center' },
  kicker: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  title: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 12,
  },
  stage: {
    borderRadius: 20,
    backgroundColor: '#120E0B',
    borderWidth: 1,
    borderColor: '#2C2622',
    overflow: 'hidden',
  },
  actor: { position: 'absolute' },
  boxLabel: { position: 'absolute', color: '#8A8277', fontWeight: '700', letterSpacing: 1 },
  ctrText: { color: Colors.onPrimary, fontWeight: '800' },
  tagText: { color: Colors.textSecondary, fontWeight: '700' },
  plain: { color: Colors.textSecondary },
  // Web collapses leading spaces unless told otherwise; code indentation matters.
  codeLine: {
    color: '#B5AD9F',
    fontFamily: 'SpaceMono',
    ...(Platform.OS === 'web' ? ({ whiteSpace: 'pre' } as object) : null),
  },
  codeHl: { color: Colors.textPrimary, backgroundColor: 'rgba(255,90,31,0.28)' },
  limit: { position: 'absolute', width: 2, backgroundColor: Colors.error },
  capWrap: { width: '100%', paddingHorizontal: 6, paddingTop: 14, minHeight: 90 },
  caption: { color: Colors.textSecondary, fontSize: 16, lineHeight: 24 },
  bold: { color: Colors.textPrimary, fontWeight: '800' },
  pokeBox: { width: '100%', paddingHorizontal: 6, paddingTop: 10, gap: 10 },
  pokeHint: { color: Colors.primary, fontSize: 13.5, fontWeight: '700' },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pokeBtn: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
  },
  pokeBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  back: { width: 64, height: 46, justifyContent: 'center' },
  backText: { color: Colors.textMuted, fontSize: 15, fontWeight: '600' },
  dots: { flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#3A332D' },
  dotDone: { backgroundColor: '#7A3A1F' },
  dotOn: { width: 18, backgroundColor: Colors.primary },
  next: {
    minWidth: 110,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  nextOff: { backgroundColor: Colors.surfaceLight },
  nextText: { color: Colors.onPrimary, fontSize: 16, fontWeight: '800' },
});
