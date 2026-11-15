import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SlotBoard from './SlotBoard';
import { parseSlots } from '@/lib/learn/engine';
import { Colors } from '@/constants/Colors';
import type { DiagramStep, FillStep, OrderStep } from '@/lib/learn/types';
import type { ActivityProps } from './types';

export function FillView({ step, onMistake, onDone }: ActivityProps<FillStep>) {
  const answers = Object.fromEntries(Object.entries(step.slots).map(([k, v]) => [k, v.answer]));
  const lines = step.code.split('\n');
  return (
    <SlotBoard
      seed={step.id}
      title={step.title}
      prompt={step.prompt}
      answers={answers}
      chips={step.chips}
      explain={Object.values(step.slots).map((s) => ({ label: s.answer, text: s.why }))}
      onMistake={onMistake}
      onDone={onDone}
      body={(slot) => (
        <View style={styles.code}>
          {lines.map((line, li) => (
            <View key={li} style={styles.line}>
              {parseSlots(line).map((seg, si) =>
                'slot' in seg ? (
                  <React.Fragment key={si}>{slot(seg.slot)}</React.Fragment>
                ) : (
                  <Text key={si} style={styles.mono}>
                    {seg.text}
                  </Text>
                )
              )}
              {line === '' && <Text style={styles.mono}> </Text>}
            </View>
          ))}
        </View>
      )}
    />
  );
}

export function OrderView({ step, onMistake, onDone }: ActivityProps<OrderStep>) {
  const answers = Object.fromEntries(step.items.map((it, i) => [String(i + 1), it]));
  return (
    <SlotBoard
      seed={step.id}
      title={step.title}
      prompt={step.prompt}
      answers={answers}
      chips={[...step.items, ...(step.distractors ?? [])]}
      explain={[{ label: '', text: step.why }]}
      onMistake={onMistake}
      onDone={onDone}
      body={(slot) => (
        <View style={{ gap: 10 }}>
          {step.items.map((_, i) => (
            <View key={i} style={styles.orderRow}>
              <View style={styles.orderNum}>
                <Text style={styles.orderNumText}>{i + 1}</Text>
              </View>
              {slot(String(i + 1), 'block')}
            </View>
          ))}
        </View>
      )}
    />
  );
}

export function DiagramView({ step, onMistake, onDone }: ActivityProps<DiagramStep>) {
  const slotNodes = step.rows.flat().filter((n) => n.slot);
  const answers = Object.fromEntries(slotNodes.map((n) => [n.id, n.slot!.answer]));
  return (
    <SlotBoard
      seed={step.id}
      title={step.title}
      prompt={step.prompt}
      answers={answers}
      chips={step.chips}
      explain={slotNodes.map((n) => ({ label: n.slot!.answer, text: n.slot!.why }))}
      onMistake={onMistake}
      onDone={onDone}
      body={(slot) => (
        <View style={styles.diagram}>
          {step.rows.map((row, ri) => (
            <React.Fragment key={ri}>
              {ri > 0 && (
                <View style={styles.down}>
                  <Ionicons name="arrow-down" size={18} color={Colors.textMuted} />
                </View>
              )}
              <View style={styles.dRow}>
                {row.map((n, ni) => (
                  <React.Fragment key={n.id}>
                    {ni > 0 && <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />}
                    <View style={styles.dNode}>
                      {n.slot ? (
                        slot(n.id, 'block')
                      ) : (
                        <View style={styles.fixed}>
                          <Text style={styles.fixedText}>{n.label}</Text>
                        </View>
                      )}
                      {!!n.note && <Text style={styles.note}>{n.note}</Text>}
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </React.Fragment>
          ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  code: {
    backgroundColor: '#0E0C0A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  line: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', minHeight: 22 },
  mono: { color: Colors.textSecondary, fontSize: 12.5, fontFamily: 'SpaceMono', lineHeight: 20 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderNumText: { color: Colors.textSecondary, fontWeight: '800', fontSize: 13 },
  diagram: { alignItems: 'stretch' },
  dRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dNode: { flex: 1, alignItems: 'stretch' },
  down: { alignItems: 'center', paddingVertical: 6 },
  fixed: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  fixedText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  note: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4 },
});
