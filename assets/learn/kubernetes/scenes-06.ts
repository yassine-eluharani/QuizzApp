import {
  all,
  beat,
  frame,
  hide,
  poke,
  press,
  scene,
  sBar,
  sBox,
  sTag,
  sText,
  show,
} from '@/lib/learn/sceneDsl';
import { mini } from './scenes-common';

const rows = (): ReturnType<typeof mini> => [
  ...mini('o0', 50, 60),
  ...mini('o1', 142, 60),
  ...mini('o2', 234, 60),
  ...mini('n0', 50, 156),
  ...mini('n1', 142, 156),
  ...mini('n2', 234, 156),
];

// ---------------------------------------------------------------------------------------------
export const rolling = scene(
  'k8s-6-1-s1',
  'A rolling update',
  [
    sTag('cap', { x: 90, y: 8, w: 160, h: 26, label: 'ready pods: 3', tone: 'ok' }),
    sText('l1', { x: 10, y: 42, w: 200, label: 'old ReplicaSet 1.4.2', fontSize: 9 }),
    sText('l2', { x: 10, y: 138, w: 200, label: 'new ReplicaSet 1.5.0', fontSize: 9 }),
    ...rows(),
  ],
  [
    beat(
      'A new ReplicaSet scales **up** while the old one scales **down**, one pod at a time. **maxSurge** adds an extra pod, **maxUnavailable** limits how many can be missing.',
      all(show('cap', 'l1', 'l2', 'o0', 'o1', 'o2'), hide('n0', 'n1', 'n2')),
      { title: 'Replace pods without a gap' }
    ),
    beat('Roll out the new version and watch the capacity.', undefined, {
      title: 'Roll out 1.5.0',
      poke: poke('Press the button', [
        press('Roll out 1.5.0', [
          frame(
            0,
            { n0: { opacity: 1, tone: 'warn' }, cap: { label: 'ready: 3 (+1 starting)' } },
            'A new pod starts **first**. Capacity never drops.'
          ),
          frame(1200, { n0: { tone: 'ok' } }, 'It passes its **readiness probe**.'),
          frame(
            2000,
            { o2: { opacity: 0 }, cap: { label: 'ready pods: 3' } },
            'Only now is one old pod removed.'
          ),
          frame(2900, { n1: { opacity: 1, tone: 'warn' } }),
          frame(3800, { n1: { tone: 'ok' } }),
          frame(4500, { o1: { opacity: 0 } }),
          frame(5300, { n2: { opacity: 1, tone: 'warn' } }),
          frame(6200, { n2: { tone: 'ok' } }),
          frame(
            6900,
            { o0: { opacity: 0 } },
            'Done. Every pod runs 1.5.0 and capacity **never fell below 3**. The old ReplicaSet stays at zero so a rollback is instant.'
          ),
        ]),
      ]),
    }),
  ],
  226
);

// ---------------------------------------------------------------------------------------------
export const badRollout = scene(
  'k8s-6-1-s2',
  'A bad version never gets traffic',
  [
    sTag('cap', { x: 90, y: 8, w: 160, h: 26, label: 'ready pods: 3', tone: 'ok' }),
    sText('l1', { x: 10, y: 42, w: 200, label: 'old ReplicaSet 1.4.2', fontSize: 9 }),
    sText('l2', { x: 10, y: 138, w: 200, label: 'new ReplicaSet 1.5.0', fontSize: 9 }),
    sTag('st', { x: 60, y: 222, w: 220, h: 26, label: 'rollout in progress', tone: 'dim' }),
    ...rows(),
  ],
  [
    beat(
      'Readiness probes are the safety catch: a new pod only counts once it is **Ready**. Try shipping a broken build.',
      all(show('cap', 'l1', 'l2', 'o0', 'o1', 'o2', 'st'), hide('n0', 'n1', 'n2')),
      { title: 'The safety catch' }
    ),
    beat('Roll out a version that crashes, then roll back.', undefined, {
      title: 'Ship a broken build',
      poke: poke(
        'Try both buttons',
        [
          press('Roll out a broken version', [
            frame(
              0,
              {
                n0: { opacity: 1, tone: 'warn' },
                st: { label: 'new pod starting...', tone: 'warn' },
              },
              'The new pod starts.'
            ),
            frame(
              1400,
              { n0: { tone: 'danger' }, st: { label: 'rollout stuck at 1 of 3', tone: 'danger' } },
              'It **never becomes Ready**. The rollout stalls.'
            ),
            frame(
              2600,
              { cap: { label: 'ready pods: 3 (old)', tone: 'ok' } },
              'The three **old pods keep serving**. Customers notice nothing.'
            ),
          ]),
          press('Roll back', [
            frame(
              0,
              { n0: { opacity: 0 }, st: { label: 'rolled back to 1.4.2', tone: 'ok' } },
              '**kubectl rollout undo** removes the broken ReplicaSet. Back to a known good state in seconds.'
            ),
          ]),
        ],
        'all'
      ),
    }),
  ],
  270
);

// ---------------------------------------------------------------------------------------------
export const canary = scene(
  'k8s-6-2-s1',
  'A canary release',
  [
    sTag('ing', { x: 110, y: 8, w: 120, h: 26, label: 'ingress', tone: 'accent' }),
    sText('lt', {
      x: 20,
      y: 44,
      w: 300,
      label: 'share of traffic sent to the canary',
      fontSize: 9,
    }),
    sBar('split', { x: 20, y: 58, w: 300, h: 14 }),
    sBox('stable', { x: 10, y: 96, w: 200, h: 100, label: 'STABLE 1.4.2' }),
    ...[0, 1, 2].flatMap((i) => mini(`s${i}`, 8 + i * 62, 30, 'stable')),
    sBox('can', { x: 220, y: 96, w: 110, h: 100, label: 'CANARY 1.5.0' }),
    ...mini('c0', 27, 30, 'can'),
    sTag('es', { x: 10, y: 212, w: 200, h: 26, label: 'errors 0.2%', tone: 'ok' }),
    sTag('ec', { x: 220, y: 212, w: 110, h: 26, label: 'errors 4.1%', tone: 'danger' }),
  ],
  [
    beat(
      'A canary sends a **small share** of traffic to the new version first. Here, 5%.',
      all(show('ing', 'lt', 'split', 'stable', 'can', 'es'), { split: { fill: 0.05 } }),
      { title: 'Try it on 5% first' }
    ),
    beat('Check the metrics, then decide.', show('ec'), {
      title: 'Watch the metrics',
      poke: poke(
        'Try both buttons',
        [
          press('Promote to 25%', [
            frame(
              0,
              { split: { fill: 0.25, tone: 'danger' }, can: { tone: 'danger' } },
              'You widen the canary. A quarter of users now hit the **higher error rate**.'
            ),
          ]),
          press('Abort the canary', [
            frame(
              0,
              { split: { fill: 0, tone: 'normal' }, can: { tone: 'dim' }, ec: { tone: 'dim' } },
              '**Abort.** All traffic returns to stable. Only 5% of users ever saw the problem. Decide the abort rule **before** you ship.'
            ),
          ]),
        ],
        'all'
      ),
    }),
  ],
  250
);
