// Pure scene logic: resolve what every actor looks like at a given beat.
import type { SceneActor, SceneFrame, SceneState, SceneStep, Tone } from './types';

export const TONES: Tone[] = ['normal', 'accent', 'ok', 'warn', 'danger', 'dim'];

export interface ResolvedState {
  x: number;
  y: number;
  w?: number;
  h?: number;
  opacity: number;
  scale: number;
  tone: Tone;
  label?: string;
  hl: number[];
  lines?: string[];
  fill: number;
}

export type Applied = Record<number, SceneFrame[]>;

function baseState(a: SceneActor): ResolvedState {
  return {
    x: a.x,
    y: a.y,
    w: a.w,
    h: a.h,
    // Children follow their parent's visibility; top-level actors start hidden.
    opacity: a.parent ? 1 : 0,
    scale: 1,
    tone: a.tone ?? 'normal',
    label: a.label,
    hl: [],
    lines: a.lines,
    fill: 0,
  };
}

function merge(into: Record<string, ResolvedState>, set: Record<string, SceneState> | undefined) {
  if (!set) return;
  for (const [id, patch] of Object.entries(set)) {
    const cur = into[id];
    if (!cur) continue;
    into[id] = {
      ...cur,
      ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)),
    };
  }
}

/**
 * State of every actor at `beat`: beats 0..beat applied in order, plus any poke frames that have
 * already played (`applied[i]` holds the frames fired during beat i).
 */
export function resolveStates(step: SceneStep, beat: number, applied: Applied = {}) {
  const out: Record<string, ResolvedState> = {};
  for (const a of step.actors) out[a.id] = baseState(a);
  for (let i = 0; i <= beat && i < step.beats.length; i++) {
    merge(out, step.beats[i].set);
    for (const f of applied[i] ?? []) merge(out, f.set);
  }
  return out;
}

/** Split "a **b** c" into plain and bold parts. */
export function richParts(text: string): { text: string; bold: boolean }[] {
  return text
    .split('**')
    .map((t, i) => ({ text: t, bold: i % 2 === 1 }))
    .filter((p) => p.text.length > 0);
}
