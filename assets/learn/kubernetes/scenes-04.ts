import {
  all,
  beat,
  frame,
  poke,
  press,
  scene,
  sBar,
  sBox,
  sCtr,
  sPod,
  sTag,
  sText,
  show,
} from '@/lib/learn/sceneDsl';
import { mini } from './scenes-common';

// ---------------------------------------------------------------------------------------------
const qos = (id: string, x: number, name: string, sub: string) => [
  sPod(id, { parent: 'node', x, y: 76, w: 92, h: 118, tone: 'accent' }),
  sCtr(`${id}c`, { parent: id, x: 33, y: 12, w: 26, h: 26, label: 'app', color: 'orange' }),
  sTag(`${id}n`, { parent: id, x: 4, y: 48, w: 84, h: 22, label: name }),
  sTag(`${id}s`, { parent: id, x: 4, y: 76, w: 84, h: 22, label: sub, tone: 'dim' }),
];

export const qosEvict = scene(
  'k8s-4-1-s1',
  'Who gets evicted first?',
  [
    sBox('node', { x: 10, y: 10, w: 320, h: 214, label: 'NODE' }),
    sBar('mem', { parent: 'node', x: 16, y: 32, w: 288, h: 14 }),
    sText('memt', { parent: 'node', x: 16, y: 50, w: 288, label: 'memory in use', fontSize: 9 }),
    ...qos('qb', 16, 'BestEffort', 'no requests'),
    ...qos('qm', 118, 'Burstable', 'some requests'),
    ...qos('qg', 220, 'Guaranteed', 'requests = limits'),
  ],
  [
    beat(
      'Kubernetes ranks pods by how precisely they described their needs: **BestEffort** (nothing), **Burstable** (some), **Guaranteed** (requests equal limits).',
      all(show('node', 'mem', 'memt', 'qb', 'qm', 'qg'), { mem: { fill: 0.55 } }),
      { title: 'Three classes of pod' }
    ),
    beat('Fill the node and see who is asked to leave.', undefined, {
      title: 'The node runs out of memory',
      poke: poke('Press the button', [
        press('Run out of memory', [
          frame(0, { mem: { fill: 0.82, tone: 'warn' } }, 'Memory runs low on the node...'),
          frame(
            1200,
            { mem: { fill: 0.95, tone: 'danger' }, qb: { tone: 'danger', opacity: 0.25 } },
            'The kubelet evicts **BestEffort** pods first. They promised nothing.'
          ),
          frame(
            2600,
            { mem: { fill: 0.78, tone: 'warn' }, qm: { tone: 'danger', opacity: 0.25 } },
            '**Burstable** pods using more than they requested go next, then the rest of the Burstable pods.'
          ),
          frame(
            4000,
            { mem: { fill: 0.5, tone: 'ok' }, qg: { tone: 'ok' } },
            '**Guaranteed** pods survive. Set requests and limits on anything that matters.'
          ),
        ]),
      ]),
    }),
  ],
  240
);

// ---------------------------------------------------------------------------------------------
const hp = (i: number) => [
  sPod(`h${i}`, { x: 14 + i * 54, y: 140, w: 46, h: 50, tone: 'accent' }),
  sCtr(`h${i}c`, { parent: `h${i}`, x: 12, y: 18, w: 22, h: 22, label: 'app', color: 'orange' }),
];
export const hpa = scene(
  'k8s-4-2-s1',
  'The HPA adds and removes pods',
  [
    sText('lt', { x: 20, y: 6, w: 200, label: 'traffic', fontSize: 9 }),
    sBar('load', { x: 20, y: 20, w: 300, h: 12 }),
    sText('ct', { x: 20, y: 42, w: 300, label: 'CPU per pod (target 70%)', fontSize: 9 }),
    sBar('cpu', { x: 20, y: 56, w: 300, h: 12, limit: 0.7 }),
    sTag('rep', { x: 110, y: 90, w: 120, h: 28, label: 'replicas: 3', tone: 'accent' }),
    ...[0, 1, 2, 3, 4, 5].flatMap(hp),
  ],
  [
    beat(
      'The HPA watches **CPU per pod** against a target and changes the **replica count** between a minimum and a maximum.',
      all(show('lt', 'load', 'ct', 'cpu', 'rep', 'h0', 'h1', 'h2'), {
        load: { fill: 0.3 },
        cpu: { fill: 0.5, tone: 'ok' },
        h3: { opacity: 0 },
        h4: { opacity: 0 },
        h5: { opacity: 0 },
      }),
      { title: 'Autoscaling on load' }
    ),
    beat('Change the traffic and watch the replica count.', undefined, {
      title: 'Traffic changes',
      poke: poke(
        'Try both buttons',
        [
          press('Traffic spike', [
            frame(
              0,
              { load: { fill: 0.92, tone: 'warn' }, cpu: { fill: 0.96, tone: 'danger' } },
              'Traffic spikes. CPU per pod jumps **past the target**.'
            ),
            frame(
              1200,
              {
                rep: { label: 'replicas: 4' },
                h3: { opacity: 1 },
                cpu: { fill: 0.8, tone: 'warn' },
              },
              'The HPA raises the replica count.'
            ),
            frame(2100, {
              rep: { label: 'replicas: 5' },
              h4: { opacity: 1 },
              cpu: { fill: 0.65, tone: 'ok' },
            }),
            frame(
              3000,
              {
                rep: { label: 'replicas: 6' },
                h5: { opacity: 1 },
                cpu: { fill: 0.5, tone: 'ok' },
                load: { tone: 'normal' },
              },
              'CPU per pod is back under the target. The load is shared by **more pods**.'
            ),
          ]),
          press('Traffic drops', [
            frame(
              0,
              { load: { fill: 0.25, tone: 'normal' }, cpu: { fill: 0.2, tone: 'ok' } },
              'Traffic drops. CPU per pod falls.'
            ),
            frame(
              1600,
              {},
              'Scale-down is **deliberately slow** (about five minutes) so a short lull does not cause flapping.'
            ),
            frame(3200, { h5: { opacity: 0 }, rep: { label: 'replicas: 5' } }),
            frame(4000, { h4: { opacity: 0 }, rep: { label: 'replicas: 4' } }),
            frame(
              4800,
              { h3: { opacity: 0 }, rep: { label: 'replicas: 3' }, cpu: { fill: 0.5 } },
              'Back to the minimum.'
            ),
          ]),
        ],
        'all'
      ),
    }),
  ],
  210
);

// ---------------------------------------------------------------------------------------------
export const twoScalers = scene(
  'k8s-4-2-s2',
  'Two autoscalers, two limits',
  [
    sTag('hpaT', { x: 10, y: 8, w: 150, h: 26, label: 'HPA: wants 4 pods', tone: 'accent' }),
    sTag('caT', { x: 180, y: 8, w: 150, h: 26, label: 'node autoscaler', tone: 'dim' }),
    sBox('nodeA', { x: 10, y: 48, w: 150, h: 150, label: 'NODE 1 · full' }),
    ...mini('a1', 12, 30, 'nodeA'),
    ...mini('a2', 82, 30, 'nodeA'),
    ...mini('a3', 12, 90, 'nodeA'),
    ...mini('a4', 82, 90, 'nodeA'),
    sBox('nodeB', { x: 180, y: 48, w: 150, h: 150, label: 'NEW NODE', tone: 'accent' }),
    ...mini('x1', 40, 220),
    ...mini('x2', 108, 220),
    sTag('pend', { x: 176, y: 232, w: 150, h: 28, label: 'Pending: node full', tone: 'danger' }),
  ],
  [
    beat(
      'The HPA adds **pods**. Pods need room on a **node**. When the nodes are full, a second autoscaler adds nodes.',
      show('hpaT', 'caT', 'nodeA', 'a1', 'a2', 'a3', 'a4'),
      { title: 'Pods need somewhere to live' }
    ),
    beat('Spike the traffic and follow both autoscalers.', undefined, {
      title: 'Spike',
      poke: poke('Press the button', [
        press('Traffic spike', [
          frame(
            0,
            { hpaT: { label: 'HPA: wants 6 pods', tone: 'warn' } },
            'Traffic spikes. The HPA asks for **6 pods**.'
          ),
          frame(
            1200,
            {
              x1: { opacity: 1, tone: 'danger' },
              x2: { opacity: 1, tone: 'danger' },
              pend: { opacity: 1 },
            },
            'Two pods are created, but **no node has room**: they stay **Pending**.'
          ),
          frame(
            2600,
            { caT: { tone: 'accent', label: 'adding a node...' } },
            'The **cluster autoscaler** sees unschedulable pods and adds a node. This takes minutes.'
          ),
          frame(4000, { nodeB: { opacity: 1 }, caT: { tone: 'ok', label: 'node added' } }),
          frame(
            5000,
            {
              x1: { x: 192, y: 78, tone: 'ok' },
              x2: { x: 262, y: 78, tone: 'ok' },
              pend: { opacity: 0 },
              hpaT: { label: 'HPA: 6 of 6 running', tone: 'ok' },
            },
            'The pods land on the new node. **Two limits to check**: the replica maximum and the node maximum.'
          ),
        ]),
      ]),
    }),
  ],
  280
);
