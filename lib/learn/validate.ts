// Content validator. Run by the jest test over every lesson so a broken lesson fails CI, not a learner.
import { parseSlots, runTerminal } from './engine';
import type { LearnPath, Lesson, Step, TriageStep } from './types';

function checkTriage(s: TriageStep, at: string, errs: string[]) {
  if (!s.nodes[s.start]) errs.push(`${at}: start node "${s.start}" missing`);
  const ends = Object.entries(s.nodes)
    .filter(([, n]) => n.end)
    .map(([k]) => k);
  if (ends.length === 0) errs.push(`${at}: no end node`);
  for (const [k, n] of Object.entries(s.nodes)) {
    if (!n.end && (!n.choices || n.choices.length < 2))
      errs.push(`${at}: node "${k}" needs 2+ choices or an end`);
    for (const c of n.choices ?? []) {
      if (!s.nodes[c.next]) errs.push(`${at}: node "${k}" -> unknown "${c.next}"`);
    }
    if (n.choices && !n.choices.some((c) => c.good))
      errs.push(`${at}: node "${k}" has no good choice`);
  }
  // every node must be able to reach an end (no dead loops)
  const reach = new Set<string>(ends);
  let grew = true;
  while (grew) {
    grew = false;
    for (const [k, n] of Object.entries(s.nodes)) {
      if (!reach.has(k) && n.choices?.some((c) => reach.has(c.next))) {
        reach.add(k);
        grew = true;
      }
    }
  }
  for (const k of Object.keys(s.nodes))
    if (!reach.has(k)) errs.push(`${at}: node "${k}" cannot reach an end`);
  // best path (all good choices) must exist and cost <= par
  let node = s.start;
  let cost = 0;
  const seen = new Set<string>();
  while (s.nodes[node] && !s.nodes[node].end && !seen.has(node)) {
    seen.add(node);
    const g = s.nodes[node].choices?.find((c) => c.good);
    if (!g) break;
    cost += g.cost;
    node = g.next;
  }
  if (!s.nodes[node]?.end) errs.push(`${at}: following good choices never reaches an end`);
  else if (cost > s.par) errs.push(`${at}: best path costs ${cost} but par is ${s.par}`);
}

export function validateStep(step: Step, at: string): string[] {
  const errs: string[] = [];
  switch (step.type) {
    case 'read':
      if (!step.body.length) errs.push(`${at}: empty body`);
      break;
    case 'fill': {
      const used = parseSlots(step.code)
        .filter((x): x is { slot: string } => 'slot' in x)
        .map((x) => x.slot);
      for (const u of used) if (!step.slots[u]) errs.push(`${at}: slot "${u}" has no definition`);
      for (const k of Object.keys(step.slots))
        if (!used.includes(k)) errs.push(`${at}: slot "${k}" unused in code`);
      for (const [k, d] of Object.entries(step.slots)) {
        if (!step.chips.includes(d.answer)) errs.push(`${at}: answer for "${k}" is not a chip`);
        if (!d.why) errs.push(`${at}: slot "${k}" missing why`);
      }
      if (new Set(step.chips).size !== step.chips.length) errs.push(`${at}: duplicate chips`);
      if (step.chips.length <= Object.keys(step.slots).length)
        errs.push(`${at}: add a distractor chip`);
      break;
    }
    case 'order':
      if (step.items.length < 3) errs.push(`${at}: needs 3+ items`);
      if (
        new Set([...step.items, ...(step.distractors ?? [])]).size !==
        step.items.length + (step.distractors?.length ?? 0)
      )
        errs.push(`${at}: duplicate items`);
      break;
    case 'spot':
      if (step.bugs.length === 0) errs.push(`${at}: no bugs`);
      for (const b of step.bugs)
        if (b.line < 0 || b.line >= step.lines.length)
          errs.push(`${at}: bug line ${b.line} out of range`);
      if (step.bugs.length >= step.lines.length) errs.push(`${at}: every line is a bug`);
      break;
    case 'triage':
      checkTriage(step, at, errs);
      break;
    case 'diagram': {
      const slots = step.rows.flat().filter((n) => n.slot);
      if (slots.length === 0) errs.push(`${at}: no slots`);
      for (const n of slots)
        if (!step.chips.includes(n.slot!.answer))
          errs.push(`${at}: answer "${n.slot!.answer}" is not a chip`);
      if (new Set(step.chips).size !== step.chips.length) errs.push(`${at}: duplicate chips`);
      if (step.chips.length <= slots.length) errs.push(`${at}: add a distractor chip`);
      break;
    }
    case 'terminal': {
      if (!step.commands.some((c) => c.goal)) errs.push(`${at}: no goal command`);
      for (const t of step.try) {
        const hit = runTerminal(step.commands, t);
        if (!hit) errs.push(`${at}: suggested "${t}" matches nothing`);
      }
      if (!step.try.some((t) => runTerminal(step.commands, t)?.goal))
        errs.push(`${at}: no suggested command reaches the goal`);
      for (const c of step.commands) {
        try {
          new RegExp(c.match);
        } catch {
          errs.push(`${at}: bad regex ${c.match}`);
        }
      }
      break;
    }
  }
  return errs;
}

export function validateLesson(l: Lesson): string[] {
  const errs: string[] = [];
  if (l.steps.length < 3) errs.push(`${l.id}: fewer than 3 steps`);
  const ids = new Set<string>();
  l.steps.forEach((s, i) => {
    if (ids.has(s.id)) errs.push(`${l.id}: duplicate step id ${s.id}`);
    ids.add(s.id);
    errs.push(...validateStep(s, `${l.id}#${i + 1}(${s.type})`));
  });
  return errs;
}

export function validatePath(p: LearnPath): string[] {
  const errs: string[] = [];
  const lessonIds = new Set<string>();
  const unitIds = new Set<string>();
  const badges = new Set<string>();
  for (const u of p.units) {
    if (unitIds.has(u.id)) errs.push(`duplicate unit id ${u.id}`);
    unitIds.add(u.id);
    if (badges.has(u.badge.id)) errs.push(`duplicate badge ${u.badge.id}`);
    badges.add(u.badge.id);
    if (u.lessons.length === 0) errs.push(`${u.id}: no lessons`);
    if (!u.lessons[u.lessons.length - 1]?.boss)
      errs.push(`${u.id}: last lesson must be the boss lesson`);
    for (const l of u.lessons) {
      if (lessonIds.has(l.id)) errs.push(`duplicate lesson id ${l.id}`);
      lessonIds.add(l.id);
      errs.push(...validateLesson(l));
    }
  }
  return errs;
}
