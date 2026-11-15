import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { checkSlots, allTrue, seededShuffle, type SlotCheck } from '@/lib/learn/engine';
import StepFooter from '../StepFooter';
import { DragChip, type Target } from './dnd';
import { Colors } from '@/constants/Colors';

export type SlotVariant = 'inline' | 'block';

interface Props {
  seed: string;
  title: string;
  prompt: string;
  answers: Record<string, string>; // slot id -> correct chip
  chips: string[];
  explain: { label: string; text: string }[]; // shown once solved
  /** Render the board body. Call `slot(id, variant)` wherever a drop target goes. */
  body: (slot: (id: string, variant?: SlotVariant) => React.ReactNode) => React.ReactNode;
  onMistake: () => void;
  onDone: () => void;
}

/**
 * Shared engine behind order, fill and diagram: chips go into slots (drag or tap), Check compares
 * with the answers, wrong slots turn red, and after two misses the answer can be revealed.
 */
export default function SlotBoard({
  seed,
  title,
  prompt,
  answers,
  chips,
  explain,
  body,
  onMistake,
  onDone,
}: Props) {
  const slotIds = Object.keys(answers);
  const [placed, setPlaced] = useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<SlotCheck | null>(null);
  const [solved, setSolved] = useState(false);
  const [misses, setMisses] = useState(0);
  const [scrollOn, setScrollOn] = useState(true);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const refs = useRef<Record<string, View | null>>({});
  const pool = useMemo(() => seededShuffle(chips, seed), [chips, seed]);
  const usedChips = new Set(Object.values(placed).filter(Boolean) as string[]);
  const allFilled = slotIds.every((id) => placed[id]);

  const place = useCallback((chip: string, slotId: string) => {
    setPlaced((p) => {
      const next = { ...p };
      for (const k of Object.keys(next)) if (next[k] === chip) next[k] = undefined;
      next[slotId] = chip;
      return next;
    });
    setResult(null);
    setSelected(null);
  }, []);

  const tapSlot = (id: string) => {
    if (solved) return;
    if (selected) place(selected, id);
    else if (placed[id]) {
      setPlaced((p) => ({ ...p, [id]: undefined }));
      setResult(null);
    }
  };

  const measureTargets = () =>
    Promise.all(
      slotIds.map(
        (id) =>
          new Promise<Target | null>((res) => {
            const v = refs.current[id];
            if (!v) return res(null);
            v.measureInWindow((x, y, w, h) => res({ id, x, y, w, h }));
          })
      )
    ).then((list) => list.filter((t): t is Target => !!t));

  const dropOn = (chip: string, slotId: string) => {
    if (!solved) place(chip, slotId);
  };

  const check = () => {
    const res = checkSlots(placed, answers);
    setResult(res);
    if (allTrue(res)) {
      setSolved(true);
    } else {
      setMisses((m) => m + 1);
      onMistake();
    }
  };

  const reveal = () => {
    setPlaced({ ...answers });
    setResult(null);
    setSolved(true);
  };

  const slot = (id: string, variant: SlotVariant = 'inline') => {
    const text = placed[id];
    const status = result ? (result[id] ? 'right' : 'wrong') : solved ? 'right' : 'idle';
    return (
      <TouchableOpacity
        key={id}
        activeOpacity={0.8}
        onPress={() => tapSlot(id)}
        accessibilityRole="button"
        accessibilityLabel={text ? `Slot ${id}: ${text}. Tap to clear` : `Empty slot ${id}`}
        style={variant === 'block' ? styles.blockWrap : undefined}
      >
        <View
          ref={(r) => {
            refs.current[id] = r;
          }}
          collapsable={false}
          style={[
            styles.slot,
            variant === 'block' && styles.slotBlock,
            !text && selected && styles.slotTarget,
            hoverId === id && styles.slotHover,
            text && styles.slotFilled,
            status === 'right' && text && styles.slotRight,
            status === 'wrong' && styles.slotWrong,
          ]}
        >
          <Text style={[styles.slotText, !text && { color: Colors.primary }]} numberOfLines={2}>
            {text ?? (variant === 'block' ? 'drop here' : '   ')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const wrongCount = result ? Object.values(result).filter((v) => !v).length : 0;
  const footerState = solved ? 'right' : result ? 'wrong' : 'idle';
  const message = solved
    ? 'Correct'
    : result
      ? `${wrongCount} of ${slotIds.length} ${wrongCount === 1 ? 'slot is' : 'slots are'} off. Tap a red slot to clear it, or drop a new chip on it.`
      : undefined;

  return (
    <View style={styles.flex}>
      <ScrollView
        scrollEnabled={scrollOn}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.prompt}>{prompt}</Text>
        <View style={styles.board}>{body(slot)}</View>

        {solved && (
          <View style={styles.explain}>
            <Text style={styles.explainHead}>WHY</Text>
            {explain.map((e, i) => (
              <Text key={i} style={styles.explainText}>
                {e.label ? <Text style={styles.explainLabel}>{e.label} </Text> : null}
                {e.text}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
      {!solved && (
        <View style={styles.trayWrap}>
          <Text style={styles.trayLabel}>DRAG A CHIP IN, OR TAP IT THEN TAP A SLOT</Text>
          <View style={styles.tray}>
            {pool.map((c) => (
              <DragChip
                key={c}
                label={c}
                state={usedChips.has(c) ? 'used' : selected === c ? 'selected' : 'free'}
                onTap={() => setSelected((s) => (s === c ? null : c))}
                measureTargets={measureTargets}
                onHover={setHoverId}
                onDrop={(id) => dropOn(c, id)}
                onDragState={(d) => setScrollOn(!d)}
              />
            ))}
          </View>
        </View>
      )}
      <StepFooter
        state={footerState}
        canCheck={allFilled && !result}
        message={message}
        onCheck={check}
        onContinue={onDone}
        onReveal={misses >= 2 ? reveal : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 18, paddingBottom: 28, maxWidth: 620, width: '100%', alignSelf: 'center' },
  title: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800', lineHeight: 28 },
  prompt: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 6 },
  board: { marginTop: 16 },
  trayWrap: {
    zIndex: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  trayLabel: {
    color: Colors.textMuted,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  tray: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  blockWrap: { flex: 1 },
  slot: {
    minWidth: 64,
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  slotBlock: {
    minHeight: 46,
    borderRadius: 12,
    marginHorizontal: 0,
    alignItems: 'flex-start',
    paddingHorizontal: 14,
  },
  slotTarget: { backgroundColor: 'rgba(255,90,31,0.1)' },
  slotHover: {
    borderStyle: 'solid',
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255,90,31,0.18)',
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceLight,
  },
  slotRight: { borderColor: Colors.success, backgroundColor: 'rgba(34,197,94,0.12)' },
  slotWrong: { borderColor: Colors.error, backgroundColor: 'rgba(255,77,106,0.12)' },
  slotText: {
    color: Colors.textPrimary,
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  explain: {
    marginTop: 22,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
    gap: 8,
  },
  explainHead: { color: Colors.success, fontSize: 10.5, fontWeight: '800', letterSpacing: 1.3 },
  explainText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21 },
  explainLabel: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
    fontSize: 12.5,
  },
});
