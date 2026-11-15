// Pure helpers shared by the activity components and the content validator.
import type { TerminalCommand } from './types';

export type Segment = { text: string } | { slot: string };

/** Split "replicas: [[r]]" into text and slot segments. */
export function parseSlots(code: string): Segment[] {
  const out: Segment[] = [];
  const re = /\[\[(\w+)\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push({ text: code.slice(last, m.index) });
    out.push({ slot: m[1] });
    last = m.index + m[0].length;
  }
  if (last < code.length) out.push({ text: code.slice(last) });
  return out;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable shuffle (same seed, same order) that never returns the input order for length > 1. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  const a = items.slice();
  let s = hash(seed) || 1;
  const rnd = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.length > 1 && a.every((x, i) => x === items[i])) a.push(a.shift()!);
  return a;
}

/** "kubectl get pods -n shop" -> "get pods": drop the binary, alias and namespace flag. */
export function normalizeCommand(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(kubectl|k)\s+/, '')
    .replace(/\s(-n|--namespace)(=|\s)\S+/g, '')
    .replace(/^(-n|--namespace)(=|\s)\S+\s*/, '')
    .trim();
}

export function runTerminal(commands: TerminalCommand[], raw: string): TerminalCommand | null {
  const norm = normalizeCommand(raw);
  for (const c of commands) {
    if (new RegExp(c.match, 'i').test(norm)) return c;
  }
  return null;
}

export type SlotCheck = Record<string, boolean>;

/** Compare placements {slotId: chipText} with the expected answers. */
export function checkSlots(
  placed: Record<string, string | undefined>,
  answers: Record<string, string>
): SlotCheck {
  const res: SlotCheck = {};
  for (const id of Object.keys(answers)) res[id] = placed[id] === answers[id];
  return res;
}

export function allTrue(c: Record<string, boolean>): boolean {
  return Object.values(c).every(Boolean);
}

/** Display number of a unit: taken from its id (k8s-u0 is "0"), so an introductory Unit 0 can exist. */
export function unitNumber(unit: { id: string }, index: number): number {
  const m = unit.id.match(/-u(\d+)$/);
  return m ? Number(m[1]) : index + 1;
}
