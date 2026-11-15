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
  sCtr,
  sPod,
  sTag,
  show,
} from '@/lib/learn/sceneDsl';
import { mini } from './scenes-common';

// ---------------------------------------------------------------------------------------------
const node = (i: number, fill: number) => [
  sBox(`n${i}`, { x: 12 + i * 110, y: 96, w: 100, h: 138, label: `NODE ${i + 1}` }),
  sBar(`nb${i}`, { parent: `n${i}`, x: 10, y: 28, w: 80, h: 10 }),
  sTag(`nr${i}`, { parent: `n${i}`, x: 10, y: 46, w: 80, h: 22, label: '' }),
];
export const scheduling = scene(
  'k8s-9-1-s1',
  'How the scheduler chooses',
  [
    ...mini('np', 142, 8, undefined, 'new'),
    sTag('phase', { x: 205, y: 22, w: 125, h: 26, label: 'filtering', tone: 'accent' }),
    ...node(0, 0.95),
    ...node(1, 0.3),
    ...node(2, 0.5),
  ],
  [
    beat(
      'A new pod needs a node. The scheduler works in two steps: **filter** out nodes that cannot run it, then **score** the rest.',
      all(
        show('np', 'n0', 'n1', 'n2', 'nb0', 'nb1', 'nb2'),
        {
          nb0: { fill: 0.95, tone: 'danger' },
          nb1: { fill: 0.3, tone: 'ok' },
          nb2: { fill: 0.5, tone: 'ok' },
          nr0: { opacity: 0 },
          nr1: { opacity: 0 },
          nr2: { opacity: 0 },
        },
        hide('phase')
      ),
      { title: 'Filter, then score' }
    ),
    beat('Watch it decide where the pod goes.', undefined, {
      title: 'Schedule a pod',
      poke: poke('Press the button', [
        press('Schedule the pod', [
          frame(
            0,
            {
              phase: { opacity: 1, label: 'filtering' },
              nr0: { opacity: 1, label: 'full', tone: 'danger' },
              n0: { tone: 'dim' },
            },
            'NODE 1 has **not enough free CPU or memory**. Filtered out.'
          ),
          frame(
            1200,
            { nr1: { opacity: 1, label: 'taint', tone: 'danger' }, n1: { tone: 'dim' } },
            'NODE 2 has a **taint** this pod does not tolerate. Filtered out.'
          ),
          frame(
            2400,
            { nr2: { opacity: 1, label: 'fits', tone: 'ok' }, n2: { tone: 'accent' } },
            'NODE 3 passes every filter.'
          ),
          frame(
            3400,
            { phase: { label: 'scoring → NODE 3' } },
            'The scheduler **scores** what is left and picks the best.'
          ),
          frame(
            4400,
            { np: { x: 254, y: 176 }, nb2: { fill: 0.7 } },
            'The pod is bound to NODE 3. If **nothing** survives filtering, the pod stays **Pending** and the event says why.'
          ),
        ]),
      ]),
    }),
  ],
  248
);

// ---------------------------------------------------------------------------------------------
export const zones = scene(
  'k8s-9-2-s1',
  'Replicas must fail independently',
  [
    sTag('cap', { x: 90, y: 8, w: 160, h: 26, label: 'capacity: 3 of 3', tone: 'ok' }),
    sBox('zA', { x: 10, y: 40, w: 100, h: 196, label: 'ZONE A' }),
    sBox('zB', { x: 120, y: 40, w: 100, h: 196, label: 'ZONE B' }),
    sBox('zC', { x: 230, y: 40, w: 100, h: 196, label: 'ZONE C' }),
    ...mini('g0', 32, 64),
    ...mini('g1', 32, 118),
    ...mini('g2', 32, 172),
  ],
  [
    beat(
      'Three replicas help only if they **fail independently**. Here all three happen to run in the same zone.',
      show('cap', 'zA', 'zB', 'zC', 'g0', 'g1', 'g2'),
      {
        title: 'Three pods, one zone',
        poke: poke('Press the button', [
          press('Zone A fails', [
            frame(
              0,
              {
                zA: { tone: 'danger' },
                g0: { tone: 'danger', opacity: 0.3 },
                g1: { tone: 'danger', opacity: 0.3 },
                g2: { tone: 'danger', opacity: 0.3 },
              },
              'The zone goes down.'
            ),
            frame(
              1200,
              { cap: { label: 'capacity: 0 of 3', tone: 'danger' } },
              '**Total outage.** Three replicas, but only one failure domain.'
            ),
          ]),
        ]),
      }
    ),
    beat(
      'Now spread them with a **topology spread constraint**, one pod per zone, and fail the same zone again.',
      {
        zA: { tone: 'normal' },
        g0: { x: 32, y: 90, tone: 'accent', opacity: 1 },
        g1: { x: 142, y: 90, tone: 'accent', opacity: 1 },
        g2: { x: 252, y: 90, tone: 'accent', opacity: 1 },
        cap: { label: 'capacity: 3 of 3', tone: 'ok' },
      },
      {
        title: 'One pod per zone',
        poke: poke('Press the button', [
          press('Zone A fails', [
            frame(
              0,
              { zA: { tone: 'danger' }, g0: { tone: 'danger', opacity: 0.3 } },
              'The same zone goes down.'
            ),
            frame(
              1200,
              { cap: { label: 'capacity: 2 of 3', tone: 'warn' } },
              'Two thirds of the capacity **keeps serving**. Size for losing a zone, and test it.'
            ),
          ]),
        ]),
      }
    ),
  ],
  246
);

// ---------------------------------------------------------------------------------------------
const steps = ['Terminating', 'preStop: sleep 10s', 'SIGTERM sent', 'Finish requests, exit'];
export const shutdown = scene(
  'k8s-9-2-s2',
  'Graceful shutdown',
  [
    ...steps.map((s, i) =>
      sTag(`g${i}`, { x: 170, y: 12 + i * 50, w: 160, h: 30, label: s, tone: 'dim' })
    ),
    ...[0, 1, 2].map((i) =>
      sTag(`ga${i}`, { x: 245, y: 44 + i * 50, w: 10, h: 18, label: '', tone: 'dim' })
    ),
    sPod('sp', { x: 20, y: 12, w: 110, h: 76, label: 'POD', tone: 'accent' }),
    sCtr('spc', { parent: 'sp', x: 42, y: 30, w: 26, h: 26, label: 'app', color: 'orange' }),
    sTag('inf', { x: 14, y: 110, w: 144, h: 28, label: 'in-flight requests: 3', tone: 'accent' }),
    sTag('out', { x: 14, y: 218, w: 316, h: 30, label: '', tone: 'dim' }),
  ],
  [
    beat(
      'Deleting a pod is not instant. Kubernetes gives it a **grace period** to finish its work. Try both a clean stop and an abrupt kill.',
      all(show('sp', 'inf'), show(...steps.map((_, i) => `g${i}`))),
      {
        title: 'Stop a pod two ways',
        poke: poke(
          'Try both buttons',
          [
            press('Stop gracefully', [
              frame(
                0,
                {
                  g0: { tone: 'accent' },
                  g3: { tone: 'dim' },
                  sp: { tone: 'accent', opacity: 1 },
                  inf: { label: 'in-flight requests: 3', tone: 'accent' },
                  out: { opacity: 0 },
                },
                '**Terminating**: the pod is removed from the Service so no new requests arrive.'
              ),
              frame(
                1100,
                { g0: { tone: 'normal' }, g1: { tone: 'accent' } },
                '**preStop** sleeps a few seconds so load balancers catch up.'
              ),
              frame(
                2200,
                { g1: { tone: 'normal' }, g2: { tone: 'accent' } },
                '**SIGTERM** tells the app to finish and exit.'
              ),
              frame(
                3300,
                {
                  g2: { tone: 'normal' },
                  g3: { tone: 'ok' },
                  inf: { label: 'in-flight requests: 0', tone: 'ok' },
                  out: { opacity: 1, label: 'all 3 requests finished', tone: 'ok' },
                },
                'The app finishes its requests and exits **before** the grace period ends. Nobody noticed.'
              ),
            ]),
            press('Kill with no grace', [
              frame(
                0,
                {
                  sp: { tone: 'danger', opacity: 0.3 },
                  g0: { tone: 'dim' },
                  g1: { tone: 'dim' },
                  g2: { tone: 'dim' },
                  g3: { tone: 'dim' },
                  inf: { label: '3 requests dropped', tone: 'danger' },
                  out: { opacity: 1, label: 'users saw errors', tone: 'danger' },
                },
                'No grace period: the process is **killed on the spot** and the requests in flight are lost.'
              ),
            ]),
          ],
          'all'
        ),
      }
    ),
    beat(
      'The rule: make the **grace period** longer than the preStop delay **plus** the time the app needs to finish, and make the app handle **SIGTERM**.',
      undefined,
      { title: 'The rule of thumb' }
    ),
  ],
  262
);
