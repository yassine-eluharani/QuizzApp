jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { learnPaths } from '@/assets/learn/catalog';
import {
  allTrue,
  checkSlots,
  normalizeCommand,
  parseSlots,
  runTerminal,
  seededShuffle,
} from '@/lib/learn/engine';
import {
  applyResult,
  EMPTY_PROGRESS,
  lessonUnlocked,
  nextLesson,
  starsFor,
  unitStates,
} from '@/lib/learn/progress';
import { validatePath } from '@/lib/learn/validate';

describe('engine', () => {
  it('parses slot markers', () => {
    expect(parseSlots('a [[x]] b [[y]]')).toEqual([
      { text: 'a ' },
      { slot: 'x' },
      { text: ' b ' },
      { slot: 'y' },
    ]);
  });

  it('shuffles stably and never returns the input order', () => {
    const items = ['a', 'b', 'c', 'd'];
    expect(seededShuffle(items, 's1')).toEqual(seededShuffle(items, 's1'));
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      expect(seededShuffle(items, seed)).not.toEqual(items);
    }
  });

  it('normalises kubectl commands', () => {
    expect(normalizeCommand('kubectl  get pods -n shop')).toBe('get pods');
    expect(normalizeCommand('k logs api --namespace=shop --previous')).toBe('logs api --previous');
    expect(normalizeCommand('kubectl -n shop get pods')).toBe('get pods');
  });

  it('matches terminal commands', () => {
    const cmds = [{ match: '^get pods$', output: 'ok' }];
    expect(runTerminal(cmds, 'kubectl get pods -n shop')?.output).toBe('ok');
    expect(runTerminal(cmds, 'kubectl delete pods')).toBeNull();
  });

  it('checks slots', () => {
    expect(allTrue(checkSlots({ a: '1', b: '2' }, { a: '1', b: '2' }))).toBe(true);
    expect(checkSlots({ a: '1' }, { a: '1', b: '2' })).toEqual({ a: true, b: false });
  });
});

const tiny = {
  id: 't',
  title: 'T',
  story: 's',
  units: [
    {
      id: 'u1',
      title: 'U1',
      blurb: '',
      icon: 'box',
      badge: { id: 'b1', title: 'B1' },
      lessons: [
        { id: 'l1', title: 'L1', steps: [] },
        { id: 'l2', title: 'Boss', boss: true, steps: [] },
      ],
    },
    {
      id: 'u2',
      title: 'U2',
      blurb: '',
      icon: 'gate',
      badge: { id: 'b2', title: 'B2' },
      lessons: [{ id: 'l3', title: 'Boss', boss: true, steps: [] }],
    },
  ],
};

describe('progress', () => {
  it('awards stars by mistakes', () => {
    expect([0, 1, 2, 3, 9].map(starsFor)).toEqual([3, 2, 2, 1, 1]);
  });

  it('unlocks units and lessons in order', () => {
    expect(unitStates(EMPTY_PROGRESS, tiny)).toEqual(['current', 'locked']);
    const u1 = tiny.units[0];
    expect(lessonUnlocked(EMPTY_PROGRESS, u1, 1)).toBe(false);
    const { progress } = applyResult(EMPTY_PROGRESS, u1, u1.lessons[0], {
      mistakes: 0,
      stepCount: 5,
    });
    expect(lessonUnlocked(progress, u1, 1)).toBe(true);
    expect(nextLesson(progress, tiny)?.lesson.id).toBe('l2');
  });

  it('completing the unit awards the badge once and unlocks the next unit', () => {
    const u1 = tiny.units[0];
    let r = applyResult(EMPTY_PROGRESS, u1, u1.lessons[0], { mistakes: 1, stepCount: 4 });
    r = applyResult(r.progress, u1, u1.lessons[1], { mistakes: 0, stepCount: 4 });
    expect(r.newBadge).toBe('B1');
    expect(unitStates(r.progress, tiny)).toEqual(['done', 'current']);
    const again = applyResult(r.progress, u1, u1.lessons[1], { mistakes: 0, stepCount: 4 });
    expect(again.newBadge).toBeNull();
    expect(again.xp).toBeLessThan(r.xp); // replay earns less
  });

  it('boss lesson with 2+ stars tests the unit out', () => {
    const u1 = tiny.units[0];
    const r = applyResult(EMPTY_PROGRESS, u1, u1.lessons[1], { mistakes: 1, stepCount: 4 });
    expect(r.progress.lessons.l1).toBeDefined();
    expect(unitStates(r.progress, tiny)[0]).toBe('done');
    const weak = applyResult(EMPTY_PROGRESS, u1, u1.lessons[1], { mistakes: 5, stepCount: 4 });
    expect(weak.progress.lessons.l1).toBeUndefined();
  });

  it('keeps the best stars on replay', () => {
    const u1 = tiny.units[0];
    const a = applyResult(EMPTY_PROGRESS, u1, u1.lessons[0], { mistakes: 0, stepCount: 4 });
    const b = applyResult(a.progress, u1, u1.lessons[0], { mistakes: 5, stepCount: 4 });
    expect(b.progress.lessons.l1.stars).toBe(3);
  });
});

describe('learn content', () => {
  it.each(learnPaths.map((p) => [p.id, p]))('%s has no content errors', (_id, path) => {
    expect(validatePath(path)).toEqual([]);
  });
});
