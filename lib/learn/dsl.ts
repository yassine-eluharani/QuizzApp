// Authoring helpers: keep lesson files short and readable.
import type {
  DiagramNode,
  DiagramStep,
  FillStep,
  Lesson,
  OrderStep,
  ReadStep,
  SpotStep,
  Step,
  TerminalCommand,
  TerminalStep,
  TriageChoice,
  TriageNode,
  TriageStep,
  Unit,
} from './types';

export const read = (
  id: string,
  title: string,
  body: string | string[],
  extra: { code?: string; callout?: string } = {}
): ReadStep => ({ type: 'read', id, title, body: Array.isArray(body) ? body : [body], ...extra });

/** slots: { name: [answer, why] }. Chips are every answer plus the distractors. */
export const fill = (
  id: string,
  title: string,
  prompt: string,
  code: string,
  slots: Record<string, [string, string]>,
  distractors: string[]
): FillStep => {
  const defs = Object.fromEntries(
    Object.entries(slots).map(([k, [answer, why]]) => [k, { answer, why }])
  );
  return {
    type: 'fill',
    id,
    title,
    prompt,
    code,
    slots: defs,
    chips: [...Object.values(defs).map((s) => s.answer), ...distractors],
  };
};

export const order = (
  id: string,
  title: string,
  prompt: string,
  items: string[],
  why: string,
  distractors: string[] = []
): OrderStep => ({ type: 'order', id, title, prompt, items, why, distractors });

export const spot = (
  id: string,
  title: string,
  prompt: string,
  code: string,
  bugs: Record<number, string>
): SpotStep => ({
  type: 'spot',
  id,
  title,
  prompt,
  lines: code.replace(/^\n/, '').replace(/\n$/, '').split('\n'),
  bugs: Object.entries(bugs).map(([line, why]) => ({ line: Number(line), why })),
});

export const choice = (
  cmd: string,
  hint: string,
  next: string,
  good: boolean,
  cost: number
): TriageChoice => ({ cmd, hint, next, good, cost });

export const triage = (
  id: string,
  title: string,
  alert: string,
  par: number,
  nodes: Record<string, TriageNode>,
  start = 'start'
): TriageStep => ({ type: 'triage', id, title, alert, start, par, nodes });

export const diagram = (
  id: string,
  title: string,
  prompt: string,
  rows: DiagramNode[][],
  distractors: string[]
): DiagramStep => ({
  type: 'diagram',
  id,
  title,
  prompt,
  rows,
  chips: [
    ...rows
      .flat()
      .filter((n) => n.slot)
      .map((n) => n.slot!.answer),
    ...distractors,
  ],
});
/** Fixed box in a diagram. */
export const box = (id: string, label: string, note?: string): DiagramNode => ({ id, label, note });
/** Empty box to fill. */
export const gap = (id: string, answer: string, why: string, note?: string): DiagramNode => ({
  id,
  slot: { answer, why },
  note,
});

export const cmd = (
  match: string,
  output: string,
  opts: { goal?: boolean; mistake?: string } = {}
): TerminalCommand => ({ match, output, ...opts });

export const terminal = (
  id: string,
  title: string,
  prompt: string,
  goal: string,
  tryCmds: string[],
  commands: TerminalCommand[]
): TerminalStep => ({ type: 'terminal', id, title, prompt, goal, try: tryCmds, commands });

export const lesson = (id: string, title: string, steps: Step[], boss = false): Lesson => ({
  id,
  title,
  steps,
  ...(boss ? { boss: true } : {}),
});

export const unit = (u: Unit): Unit => u;
