import React, { useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import PressableScale from '@/components/ui/PressableScale';
import LearnPathMap, { nodeY } from '@/components/learn/LearnPathMap';
import { BoltIcon, FlameIcon, MedalIcon, UnitIcon } from '@/components/learn/icons';
import { learnPaths } from '@/assets/learn/catalog';
import { useAppContext } from '@/context/AppContext';
import { useLearn } from '@/context/LearnContext';
import { isLessonDone, nextLesson, unitStars, unitStates } from '@/lib/learn/progress';
import { Colors } from '@/constants/Colors';

const path = learnPaths[0];

function Pill({ children }: { children: React.ReactNode }) {
  return <View style={styles.pill}>{children}</View>;
}

function Ring({ value, total }: { value: number; total: number }) {
  const R = 20;
  const C = 2 * Math.PI * R;
  return (
    <View style={styles.ring} accessibilityLabel={`${value} of ${total} units complete`}>
      <Svg width={52} height={52}>
        <Circle cx={26} cy={26} r={R} stroke="rgba(255,255,255,0.09)" strokeWidth={4} fill="none" />
        <Circle
          cx={26}
          cy={26}
          r={R}
          stroke={Colors.primary}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${C * (total ? value / total : 0)} ${C}`}
          transform="rotate(-90 26 26)"
        />
      </Svg>
      <Text style={styles.ringText}>
        {value}/{total}
      </Text>
    </View>
  );
}

export default function LearnScreen() {
  const router = useRouter();
  const { streaks } = useAppContext();
  const { progress } = useLearn();
  const scroller = useRef<ScrollView>(null);
  const { height } = useWindowDimensions();

  const states = useMemo(() => unitStates(progress, path), [progress]);
  const stars = useMemo(() => path.units.map((u) => unitStars(progress, u)), [progress]);
  const next = useMemo(() => nextLesson(progress, path), [progress]);
  const curIdx = states.indexOf('current');
  const doneUnits = states.filter((s) => s === 'done').length;
  const cur = curIdx >= 0 ? path.units[curIdx] : null;
  const fraction = cur
    ? cur.lessons.filter((l) => isLessonDone(progress, l.id)).length / cur.lessons.length
    : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        ref={scroller}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        onLayout={() => {
          if (curIdx > 1)
            scroller.current?.scrollTo({
              y: Math.max(0, nodeY(curIdx) - height * 0.38),
              animated: false,
            });
        }}
      >
        <View style={styles.header}>
          <View style={styles.pills}>
            <Pill>
              <FlameIcon size={16} color={Colors.primary} />
              <Text style={styles.pillText}>{streaks.currentStreak}</Text>
            </Pill>
            <Pill>
              <BoltIcon size={16} color="#FFB347" />
              <Text style={styles.pillText}>{progress.xp} XP</Text>
            </Pill>
            <View style={{ flex: 1 }} />
            <Pill>
              <MedalIcon size={16} color={Colors.textSecondary} />
              <Text style={styles.pillText}>{progress.badges.length}</Text>
            </Pill>
          </View>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{path.title}</Text>
              <Text style={styles.story}>{path.story}</Text>
            </View>
            <Ring value={doneUnits} total={path.units.length} />
          </View>
        </View>

        <LearnPathMap
          path={path}
          states={states}
          stars={stars}
          currentFraction={fraction}
          onPressUnit={(i) => router.push(`/learn/unit/${path.units[i].id}` as Href)}
        />
      </ScrollView>

      {next && (
        <View style={styles.cardWrap} pointerEvents="box-none">
          <PressableScale
            onPress={() => router.push(`/learn/${next.lesson.id}` as Href)}
            accessibilityRole="button"
            accessibilityLabel={`Continue: ${next.lesson.title}`}
            style={styles.card}
          >
            <View style={styles.cardIcon}>
              <UnitIcon name={next.unit.icon} size={20} color={Colors.primary} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardKicker}>{next.lesson.boss ? 'BOSS LESSON' : 'CONTINUE'}</Text>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {next.lesson.title}
              </Text>
            </View>
            <View style={styles.play}>
              <Svg width={16} height={16} viewBox="0 0 16 16">
                <Path d="M4.5 2.5v11l9-5.5z" fill={Colors.onPrimary} />
              </Svg>
            </View>
          </PressableScale>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 6 },
  pills: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  pillText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  title: { color: Colors.textPrimary, fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  story: { color: Colors.textMuted, fontSize: 13.5, marginTop: 2 },
  ring: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  ringText: { position: 'absolute', color: Colors.textPrimary, fontSize: 12.5, fontWeight: '800' },
  cardWrap: { position: 'absolute', left: 16, right: 16, bottom: 12, alignItems: 'center' },
  card: {
    width: '100%',
    maxWidth: 460,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: '#201A16',
    borderWidth: 1,
    borderColor: 'rgba(255,90,31,0.22)',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,90,31,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardKicker: { color: Colors.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },
  cardTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 2 },
  play: {
    width: 44,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
