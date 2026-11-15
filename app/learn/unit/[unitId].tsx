import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import PressableScale from '@/components/ui/PressableScale';
import Reveal from '@/components/ui/Reveal';
import { CheckIcon, LockIcon, MedalIcon, StarIcon, UnitIcon } from '@/components/learn/icons';
import { findUnit } from '@/assets/learn/catalog';
import { useLearn } from '@/context/LearnContext';
import { isLessonDone, isUnitDone, lessonUnlocked, unitStates } from '@/lib/learn/progress';
import { Colors } from '@/constants/Colors';

export default function UnitScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const router = useRouter();
  const { progress } = useLearn();
  const found = findUnit(unitId);

  if (!found) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Unit not found</Text>
      </View>
    );
  }
  const { path, unit } = found;
  const idx = path.units.findIndex((u) => u.id === unit.id);
  const state = unitStates(progress, path)[idx];
  const done = isUnitDone(progress, unit);

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={[styles.heroIcon, state === 'locked' && styles.heroIconLocked]}>
            <UnitIcon
              name={unit.icon}
              size={30}
              color={state === 'locked' ? '#6A6157' : Colors.primary}
              strokeWidth={1.9}
            />
          </View>
          <Text style={styles.kicker}>UNIT {idx + 1}</Text>
          <Text style={styles.title}>{unit.title}</Text>
          <Text style={styles.blurb}>{unit.blurb}</Text>
          <View style={styles.badgeRow}>
            <MedalIcon
              size={16}
              color={progress.badges.includes(unit.badge.id) ? Colors.primary : Colors.textMuted}
            />
            <Text
              style={[
                styles.badgeText,
                progress.badges.includes(unit.badge.id) && { color: Colors.primary },
              ]}
            >
              {unit.badge.title}
            </Text>
          </View>
          {state === 'locked' && (
            <Text style={styles.lockedNote}>
              Finish the earlier units to unlock this one, or already know it? Pass the boss lesson
              with two stars to test out.
            </Text>
          )}
        </View>

        {unit.lessons.map((l, i) => {
          const finished = isLessonDone(progress, l.id);
          // The boss lesson is the test-out, so it is open even when the unit is not.
          const open = !!l.boss || (state !== 'locked' && lessonUnlocked(progress, unit, i));
          const stars = progress.lessons[l.id]?.stars ?? 0;
          return (
            <Reveal key={l.id} index={i}>
              <PressableScale
                disabled={!open}
                onPress={() => router.push(`/learn/${l.id}` as Href)}
                accessibilityRole="button"
                accessibilityLabel={`${l.boss ? 'Boss lesson' : `Lesson ${i + 1}`}: ${l.title}${open ? '' : ', locked'}`}
                style={[styles.row, l.boss && styles.rowBoss, !open && { opacity: 0.45 }]}
              >
                <View style={[styles.num, finished && { backgroundColor: Colors.primary }]}>
                  {finished ? (
                    <CheckIcon size={16} color={Colors.onPrimary} />
                  ) : open ? (
                    <Text style={styles.numText}>{l.boss ? '!' : i + 1}</Text>
                  ) : (
                    <LockIcon size={13} color={Colors.textMuted} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  {l.boss && <Text style={styles.bossTag}>BOSS LESSON · TEST OUT</Text>}
                  <Text style={styles.rowTitle}>{l.title}</Text>
                  <Text style={styles.rowMeta}>
                    {l.steps.length} steps{l.boss ? ' · hearts on' : ''}
                  </Text>
                </View>
                {finished && (
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[0, 1, 2].map((k) => (
                      <StarIcon key={k} size={13} color={Colors.primary} filled={k < stars} />
                    ))}
                  </View>
                )}
              </PressableScale>
            </Reveal>
          );
        })}
        {done && (
          <Text style={styles.doneNote}>
            Unit complete. Replay any lesson to improve your stars.
          </Text>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 18, paddingBottom: 48, maxWidth: 560, width: '100%', alignSelf: 'center' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  muted: { color: Colors.textMuted },
  hero: { alignItems: 'center', paddingVertical: 12, marginBottom: 12 },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,90,31,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,90,31,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconLocked: { backgroundColor: '#1A1511', borderColor: '#3A332D' },
  kicker: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 14,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'center',
  },
  blurb: {
    color: Colors.textSecondary,
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  badgeText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  lockedNote: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  rowBoss: { borderColor: 'rgba(255,90,31,0.35)', backgroundColor: '#201A16' },
  num: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { color: Colors.textPrimary, fontWeight: '800', fontSize: 14 },
  bossTag: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  rowTitle: { color: Colors.textPrimary, fontSize: 15.5, fontWeight: '700' },
  rowMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  doneNote: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 8 },
});
