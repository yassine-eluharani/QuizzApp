import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StepFooter from '../StepFooter';
import { Colors } from '@/constants/Colors';
import Mono from './Mono';
import type { ReadStep, SpotStep } from '@/lib/learn/types';
import type { ActivityProps } from './types';

export function CodeBlock({ code }: { code: string }) {
  return (
    <View style={styles.code}>
      <Mono text={code} fontSize={12.5} />
    </View>
  );
}

export function ReadView({ step, onDone }: ActivityProps<ReadStep>) {
  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>LEARN</Text>
        <Text style={styles.title}>{step.title}</Text>
        {step.body.map((p, i) => (
          <Text key={i} style={styles.body}>
            {p}
          </Text>
        ))}
        {!!step.code && <CodeBlock code={step.code} />}
        {!!step.callout && (
          <View style={styles.callout}>
            <Text style={styles.calloutHead}>IN PRODUCTION</Text>
            <Text style={styles.calloutText}>{step.callout}</Text>
          </View>
        )}
      </ScrollView>
      <StepFooter state="idle" plain onContinue={onDone} />
    </View>
  );
}

export function SpotView({ step, onMistake, onDone }: ActivityProps<SpotStep>) {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [state, setState] = useState<'idle' | 'wrong' | 'right'>('idle');
  const [misses, setMisses] = useState(0);
  const bugSet = new Set(step.bugs.map((b) => b.line));

  const toggle = (i: number) => {
    if (state === 'right') return;
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
    setState('idle');
  };

  const check = () => {
    const ok = picked.size === bugSet.size && [...picked].every((i) => bugSet.has(i));
    if (ok) setState('right');
    else {
      setState('wrong');
      setMisses((m) => m + 1);
      onMistake();
    }
  };

  const found = [...picked].filter((i) => bugSet.has(i)).length;
  const falseFlags = picked.size - found;
  const message =
    state === 'right'
      ? `Correct. ${step.bugs.length} risk${step.bugs.length === 1 ? '' : 's'} found.`
      : state === 'wrong'
        ? `${found} of ${step.bugs.length} real risks flagged${falseFlags ? `, ${falseFlags} line${falseFlags === 1 ? '' : 's'} are fine` : ''}. Adjust and try again.`
        : undefined;

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>CODE REVIEW</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.body}>{step.prompt}</Text>
        <View style={styles.code}>
          {step.lines.map((l, i) => {
            const on = picked.has(i);
            const revealed = state === 'right';
            const isBug = bugSet.has(i);
            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => toggle(i)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`Line ${i + 1}: ${l}`}
                style={[
                  styles.spotLine,
                  on && styles.spotOn,
                  revealed && isBug && styles.spotBug,
                  state === 'wrong' && on && !isBug && styles.spotFalse,
                ]}
              >
                <Text style={styles.lineNo}>{i + 1}</Text>
                <Text style={[styles.mono, { flex: 1 }]}>{l === '' ? ' ' : l}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {state === 'right' && (
          <View style={styles.callout}>
            <Text style={styles.calloutHead}>WHAT WOULD BREAK</Text>
            {step.bugs.map((b) => (
              <Text key={b.line} style={styles.calloutText}>
                <Text style={styles.lineRef}>line {b.line + 1} </Text>
                {b.why}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
      <StepFooter
        state={state}
        canCheck={picked.size > 0 && state !== 'wrong'}
        checkLabel="Check my review"
        message={message}
        onCheck={check}
        onContinue={onDone}
        onReveal={
          misses >= 2
            ? () => {
                setPicked(new Set(bugSet));
                setState('right');
              }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 18, paddingBottom: 28, maxWidth: 620, width: '100%', alignSelf: 'center' },
  kicker: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  title: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800', lineHeight: 28 },
  body: { color: Colors.textSecondary, fontSize: 15.5, lineHeight: 23, marginTop: 12 },
  code: {
    backgroundColor: '#0E0C0A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 16,
  },
  mono: { color: Colors.textSecondary, fontSize: 12.5, fontFamily: 'SpaceMono', lineHeight: 20 },
  callout: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,90,31,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    gap: 6,
  },
  calloutHead: { color: Colors.primary, fontSize: 10.5, fontWeight: '800', letterSpacing: 1.3 },
  calloutText: { color: Colors.textSecondary, fontSize: 14.5, lineHeight: 21 },
  lineRef: { color: Colors.textPrimary, fontFamily: 'SpaceMono', fontSize: 12, fontWeight: '700' },
  spotLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  spotOn: { backgroundColor: 'rgba(255,90,31,0.14)', borderColor: Colors.primary },
  spotBug: { backgroundColor: 'rgba(34,197,94,0.12)', borderColor: Colors.success },
  spotFalse: { backgroundColor: 'rgba(255,77,106,0.12)', borderColor: Colors.error },
  lineNo: {
    color: Colors.textMuted,
    fontFamily: 'SpaceMono',
    fontSize: 11,
    width: 18,
    textAlign: 'right',
    lineHeight: 20,
  },
});
