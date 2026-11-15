import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PressableScale from '@/components/ui/PressableScale';
import StepFooter from '../StepFooter';
import { Colors } from '@/constants/Colors';
import Mono from './Mono';
import type { TriageStep } from '@/lib/learn/types';
import type { ActivityProps } from './types';

interface Entry {
  cmd: string;
  output: string;
  good?: boolean;
}

export default function TriageView({ step, onMistake, onDone }: ActivityProps<TriageStep>) {
  const [nodeId, setNodeId] = useState(step.start);
  const [cost, setCost] = useState(0);
  const [log, setLog] = useState<Entry[]>([{ cmd: '', output: step.nodes[step.start].output }]);
  const scroller = useRef<ScrollView>(null);
  const node = step.nodes[nodeId];
  const over = cost > step.par;

  useEffect(() => {
    scroller.current?.scrollToEnd({ animated: true });
  }, [log.length]);

  const pick = (c: NonNullable<typeof node.choices>[number]) => {
    if (!c.good) onMistake();
    setCost((x) => x + c.cost);
    setNodeId(c.next);
    setLog((l) => [...l, { cmd: c.cmd, output: step.nodes[c.next].output, good: c.good }]);
  };

  const rating =
    cost <= step.par ? 'Clean response' : cost <= step.par * 2 ? 'Landed, but slow' : 'Long outage';

  return (
    <View style={styles.flex}>
      <ScrollView ref={scroller} contentContainerStyle={styles.content}>
        <View style={styles.alert} accessibilityRole="alert">
          <Text style={styles.alertKicker}>INCIDENT</Text>
          <Text style={styles.alertText}>{step.alert}</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{step.title}</Text>
          <View style={[styles.timer, over && { borderColor: Colors.error }]}>
            <Text style={[styles.timerText, over && { color: Colors.error }]}>
              {cost} min impact
            </Text>
          </View>
        </View>

        <View style={styles.term}>
          {log.map((e, i) => (
            <View key={i} style={[styles.entry, e.good === false && styles.entryBad]}>
              {!!e.cmd && (
                <Text style={styles.cmd}>
                  <Text style={styles.prompt}>$ </Text>
                  {e.cmd}
                </Text>
              )}
              <Mono text={e.output} />
              {e.good === false && (
                <Text style={styles.badNote}>That cost you time. Back to the evidence.</Text>
              )}
            </View>
          ))}
        </View>

        {node.end ? (
          <View style={styles.post}>
            <Text style={styles.postKicker}>POST-MORTEM · {rating.toUpperCase()}</Text>
            <Text style={styles.postLine}>
              <Text style={styles.postLabel}>Root cause </Text>
              {node.end.rootCause}
            </Text>
            <Text style={styles.postLine}>
              <Text style={styles.postLabel}>Fix </Text>
              {node.end.fix}
            </Text>
            <Text style={styles.postLine}>
              <Text style={styles.postLabel}>Lesson </Text>
              {node.end.lesson}
            </Text>
            <Text style={styles.postMeta}>
              {cost} min of impact (best path: {step.par})
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10, marginTop: 16 }}>
            {!!node.question && <Text style={styles.question}>{node.question}</Text>}
            {node.choices!.map((c) => (
              <PressableScale
                key={c.cmd}
                onPress={() => pick(c)}
                accessibilityRole="button"
                accessibilityLabel={`${c.cmd}. ${c.hint}`}
                style={styles.choice}
              >
                <Text style={styles.choiceCmd}>{c.cmd}</Text>
                <Text style={styles.choiceHint}>{c.hint}</Text>
              </PressableScale>
            ))}
          </View>
        )}
      </ScrollView>
      {node.end && <StepFooter state="right" message="Incident resolved" onContinue={onDone} />}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 18, paddingBottom: 28, maxWidth: 620, width: '100%', alignSelf: 'center' },
  alert: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,77,106,0.12)',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  alertKicker: { color: Colors.error, fontSize: 10.5, fontWeight: '800', letterSpacing: 1.4 },
  alertText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 3,
    lineHeight: 21,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
  },
  title: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800', flex: 1 },
  timer: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
  },
  timerText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  term: {
    marginTop: 14,
    backgroundColor: '#0B0908',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  entry: { gap: 4 },
  entryBad: { borderLeftWidth: 2, borderLeftColor: Colors.error, paddingLeft: 8 },
  cmd: { color: Colors.textPrimary, fontFamily: 'SpaceMono', fontSize: 12, lineHeight: 18 },
  prompt: { color: Colors.textMuted },
  badNote: { color: Colors.error, fontSize: 12, fontWeight: '600' },
  question: { color: Colors.textPrimary, fontSize: 15.5, fontWeight: '700' },
  choice: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 3,
  },
  choiceCmd: { color: Colors.textPrimary, fontFamily: 'SpaceMono', fontSize: 12.5, lineHeight: 18 },
  choiceHint: { color: Colors.textMuted, fontSize: 12.5 },
  post: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
    gap: 8,
  },
  postKicker: { color: Colors.success, fontSize: 10.5, fontWeight: '800', letterSpacing: 1.3 },
  postLine: { color: Colors.textSecondary, fontSize: 14.5, lineHeight: 21 },
  postLabel: { color: Colors.textPrimary, fontWeight: '700' },
  postMeta: { color: Colors.textMuted, fontSize: 12.5 },
});
