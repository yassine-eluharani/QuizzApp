import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '@/components/ui/ProgressBar';
import PressableScale from '@/components/ui/PressableScale';
import { HeartIcon, MedalIcon, StarIcon, BoltIcon } from './icons';
import StepView from './activities/StepView';
import { useLessonSession } from '@/hooks/useLessonSession';
import { useLearn } from '@/context/LearnContext';
import { HEARTS, starsFor } from '@/lib/learn/progress';
import { Colors } from '@/constants/Colors';
import type { Lesson, Unit } from '@/lib/learn/types';

interface Props {
  unit: Unit;
  lesson: Lesson;
  onExit: () => void;
}

export default function LessonRunner({ unit, lesson, onExit }: Props) {
  const s = useLessonSession(lesson);
  const { completeLesson } = useLearn();
  const [reward, setReward] = useState<{
    xp: number;
    newBadge: string | null;
    stars: number;
  } | null>(null);
  const saved = useRef(false);

  // Save once when the lesson is finished (not when it failed).
  useEffect(() => {
    if (!s.finished || s.failed || saved.current) return;
    saved.current = true;
    completeLesson(unit, lesson, { mistakes: s.mistakes, stepCount: s.total }).then(setReward);
  }, [s.finished, s.failed, s.mistakes, s.total, completeLesson, unit, lesson]);

  const retry = () => {
    saved.current = false;
    setReward(null);
    s.restart();
  };

  if (s.failed) {
    return (
      <View style={styles.center}>
        <View style={styles.heartsRow}>
          {Array.from({ length: HEARTS }).map((_, i) => (
            <HeartIcon key={i} size={30} color={Colors.error} filled={false} />
          ))}
        </View>
        <Text style={styles.bigTitle}>Out of hearts</Text>
        <Text style={styles.sub}>
          Boss lessons are the real thing: mistakes cost hearts. Review the unit, then try again.
        </Text>
        <PressableScale onPress={retry} style={styles.primary} accessibilityRole="button">
          <Text style={styles.primaryText}>Try again</Text>
        </PressableScale>
        <TouchableOpacity onPress={onExit} style={styles.ghost}>
          <Text style={styles.ghostText}>Back to the unit</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (s.finished) {
    const stars = starsFor(s.mistakes);
    return (
      <View style={styles.center}>
        <View style={styles.starsRow}>
          {[0, 1, 2].map((k) => (
            <StarIcon key={k} size={44} color={Colors.primary} filled={k < stars} />
          ))}
        </View>
        <Text style={styles.bigTitle}>{lesson.boss ? 'Boss defeated' : 'Lesson complete'}</Text>
        <Text style={styles.sub}>
          {s.mistakes === 0
            ? 'Flawless.'
            : `${s.mistakes} slip${s.mistakes === 1 ? '' : 's'} along the way.`}{' '}
          {lesson.title}
        </Text>
        <View style={styles.rewardRow}>
          <View style={styles.reward}>
            <BoltIcon size={18} color="#FFB347" />
            <Text style={styles.rewardText}>+{reward?.xp ?? 0} XP</Text>
          </View>
          {reward?.newBadge && (
            <View style={styles.reward}>
              <MedalIcon size={18} color={Colors.primary} />
              <Text style={styles.rewardText}>{reward.newBadge}</Text>
            </View>
          )}
        </View>
        <PressableScale onPress={onExit} style={styles.primary} accessibilityRole="button">
          <Text style={styles.primaryText}>Continue</Text>
        </PressableScale>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.top}>
        <TouchableOpacity
          onPress={onExit}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Leave lesson"
        >
          <Ionicons name="close" size={26} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.flex}>
          <ProgressBar progress={s.index / s.total} height={8} />
        </View>
        {s.challenge ? (
          <View style={styles.heartsRow} accessibilityLabel={`${s.hearts} hearts left`}>
            {Array.from({ length: HEARTS }).map((_, i) => (
              <HeartIcon key={i} size={18} color={Colors.error} filled={i < s.hearts} />
            ))}
          </View>
        ) : (
          <View style={{ width: 4 }} />
        )}
      </View>
      <StepView
        key={s.step.id}
        step={s.step}
        challenge={s.challenge}
        onMistake={s.onMistake}
        onDone={s.next}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  heartsRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bigTitle: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  sub: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 360,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 4,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  rewardText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15 },
  primary: {
    marginTop: 12,
    height: 52,
    minWidth: 220,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  primaryText: { color: Colors.onPrimary, fontSize: 16, fontWeight: '800' },
  ghost: { padding: 10 },
  ghostText: { color: Colors.textMuted, fontSize: 14 },
});
