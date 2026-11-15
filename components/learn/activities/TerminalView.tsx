import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import PressableScale from '@/components/ui/PressableScale';
import StepFooter from '../StepFooter';
import { runTerminal } from '@/lib/learn/engine';
import { Colors } from '@/constants/Colors';
import Mono from './Mono';
import type { TerminalStep } from '@/lib/learn/types';
import type { ActivityProps } from './types';

type Line = { kind: 'cmd' | 'out' | 'err'; text: string };

export default function TerminalView({ step, onMistake, onDone }: ActivityProps<TerminalStep>) {
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [done, setDone] = useState(false);
  const scroller = useRef<ScrollView>(null);

  useEffect(() => {
    scroller.current?.scrollToEnd({ animated: true });
  }, [lines.length]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd || done) return;
    const hit = runTerminal(step.commands, cmd);
    const add: Line[] = [{ kind: 'cmd', text: cmd }];
    if (!hit) {
      add.push({
        kind: 'err',
        text: "That command isn't available in this sandbox. Tap one of the suggestions below.",
      });
    } else {
      if (hit.output) add.push({ kind: 'out', text: hit.output });
      if (hit.mistake) {
        add.push({ kind: 'err', text: hit.mistake });
        onMistake();
      }
      if (hit.goal) setDone(true);
    }
    setLines((l) => [...l, ...add]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scroller}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.kicker}>SANDBOX</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.prompt}>{step.prompt}</Text>
        <View style={styles.goal}>
          <Text style={styles.goalHead}>GOAL</Text>
          <Text style={styles.goalText}>{step.goal}</Text>
        </View>

        <View style={styles.term}>
          {lines.length === 0 && (
            <Text style={styles.hint}>Type a kubectl command, or tap a suggestion.</Text>
          )}
          {lines.map((l, i) =>
            l.kind === 'out' ? (
              <Mono key={i} text={l.text} />
            ) : (
              <Text
                key={i}
                style={[
                  styles.mono,
                  l.kind === 'cmd' && { color: Colors.textPrimary },
                  l.kind === 'err' && { color: Colors.error },
                ]}
              >
                {l.kind === 'cmd' ? <Text style={{ color: Colors.primary }}>$ </Text> : null}
                {l.text}
              </Text>
            )
          )}
        </View>

        {!done && (
          <>
            <View style={styles.inputRow}>
              <Text style={styles.dollar}>$</Text>
              <TextInput
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => run(input)}
                placeholder="kubectl ..."
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                returnKeyType="go"
                style={styles.input}
                accessibilityLabel="Terminal input"
              />
            </View>
            <View style={styles.chips}>
              {step.try.map((t) => (
                <PressableScale
                  key={t}
                  onPress={() => setInput(t)}
                  accessibilityRole="button"
                  accessibilityLabel={`Use command ${t}`}
                  style={styles.chip}
                >
                  <Text style={styles.chipText}>{t}</Text>
                </PressableScale>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <StepFooter
        state={done ? 'right' : 'idle'}
        canCheck={input.trim().length > 0}
        checkLabel="Run"
        message={done ? 'Goal reached' : undefined}
        onCheck={() => run(input)}
        onContinue={onDone}
      />
    </KeyboardAvoidingView>
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
  prompt: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 8 },
  goal: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,90,31,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    gap: 3,
  },
  goalHead: { color: Colors.primary, fontSize: 10.5, fontWeight: '800', letterSpacing: 1.3 },
  goalText: { color: Colors.textPrimary, fontSize: 14.5, lineHeight: 21 },
  term: {
    marginTop: 14,
    minHeight: 150,
    backgroundColor: '#0B0908',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  hint: { color: Colors.textMuted, fontSize: 12.5 },
  mono: { color: Colors.textSecondary, fontFamily: 'SpaceMono', fontSize: 11.5, lineHeight: 18 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dollar: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 14 },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
    fontSize: 13,
    paddingVertical: 12,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: { color: Colors.textSecondary, fontFamily: 'SpaceMono', fontSize: 11.5 },
});
