import {
  all,
  beat,
  frame,
  hide,
  poke,
  press,
  scene,
  sArrow,
  sBar,
  sBox,
  sCode,
  sCtr,
  sDot,
  sPod,
  sTag,
  sText,
  sUser,
  show,
  tap,
} from '@/lib/learn/sceneDsl';
import type { SceneActor } from '@/lib/learn/types';

/** A small pod with one container. */
const mini = (id: string, x: number, y: number, parent?: string): SceneActor[] => [
  sPod(id, { parent, x, y, w: 56, h: 54, tone: 'accent' }),
  sCtr(`${id}c`, { parent: id, x: 15, y: 20, w: 26, h: 26, label: 'app', color: 'orange' }),
];

// ---------------------------------------------------------------------------------------------
export const applyChain = scene(
  'k8s-1-1-s1',
  'What kubectl apply really does',
  [
    sUser('you', { x: 10, y: 10, w: 64, h: 28, label: 'kubectl', color: 'paper' }),
    sCode('yaml', {
      x: 10,
      y: 48,
      w: 128,
      h: 62,
      lines: ['kind: Deployment', 'replicas: 3', 'image: checkout'],
      fontSize: 8.5,
    }),
    sDot('pkt', { x: 80, y: 20, w: 10, h: 10, color: 'orange' }),
    sBox('api', { x: 156, y: 8, w: 88, h: 40, label: 'API SERVER' }),
    sBox('etcd', { x: 252, y: 8, w: 78, h: 40, label: 'ETCD' }),
    sTag('dep', { x: 14, y: 150, w: 104, h: 26, label: 'Deployment ctrl', tone: 'dim' }),
    sTag('rs', { x: 126, y: 150, w: 94, h: 26, label: 'ReplicaSet', tone: 'dim' }),
    sTag('sch', { x: 228, y: 150, w: 100, h: 26, label: 'Scheduler', tone: 'dim' }),
    sBox('nA', { x: 10, y: 196, w: 100, h: 126, label: 'NODE 1' }),
    sBox('nB', { x: 120, y: 196, w: 100, h: 126, label: 'NODE 2' }),
    sBox('nC', { x: 230, y: 196, w: 100, h: 126, label: 'NODE 3' }),
    ...mini('r1', 52, 86),
    ...mini('r2', 142, 86),
    ...mini('r3', 232, 86),
  ],
  [
    beat(
      'You describe what you want in a YAML file. Press the button and follow what happens.',
      show('you', 'yaml', 'api', 'etcd', 'dep', 'rs', 'sch', 'nA', 'nB', 'nC'),
      {
        title: 'You write what you want',
        poke: poke('Press the button', [
          press('kubectl apply -f checkout.yaml', [
            frame(
              0,
              { pkt: { opacity: 1, x: 168, y: 20 } },
              'kubectl sends your YAML to the **API server**.'
            ),
            frame(
              1000,
              { pkt: { opacity: 0 }, api: { tone: 'accent' } },
              'The API server checks it and stores it in **etcd**.'
            ),
            frame(1800, { etcd: { tone: 'accent' } }),
            frame(
              2600,
              { api: { tone: 'normal' }, etcd: { tone: 'normal' }, dep: { tone: 'accent' } },
              'The **Deployment controller** notices a new Deployment.'
            ),
            frame(
              3500,
              { dep: { tone: 'normal' }, rs: { tone: 'accent' } },
              'It creates a **ReplicaSet**, which owns the pods.'
            ),
            frame(
              4400,
              {
                rs: { tone: 'normal' },
                r1: { opacity: 1 },
                r2: { opacity: 1 },
                r3: { opacity: 1 },
              },
              'The ReplicaSet creates **three pods**. They have no node yet, so they are **Pending**.'
            ),
            frame(
              5400,
              { sch: { tone: 'accent' } },
              'The **scheduler** picks a node for each pod.'
            ),
            frame(
              6300,
              {
                sch: { tone: 'normal' },
                r1: { x: 32, y: 238 },
                r2: { x: 142, y: 238 },
                r3: { x: 252, y: 238 },
              },
              'Each pod is assigned to a node.'
            ),
            frame(
              7300,
              { r1: { tone: 'ok' }, r2: { tone: 'ok' }, r3: { tone: 'ok' } },
              'The **kubelet** on each node starts the containers. The pods are **Running**.'
            ),
          ]),
        ]),
      }
    ),
    beat(
      'Remember the chain: **API server → controller → ReplicaSet → pods → scheduler → kubelet**. You declared. Everything else was automatic.',
      undefined,
      { title: 'The chain, in order' }
    ),
  ],
  330
);

// ---------------------------------------------------------------------------------------------
const labPod = (id: string, y: number): SceneActor[] => [
  sPod(id, { parent: 'res', x: 8, y, w: 84, h: 62, tone: 'accent' }),
  sCtr(`${id}c`, { parent: id, x: 8, y: 7, w: 68, h: 22, label: '1.4.2', color: 'orange' }),
  sTag(`${id}t`, { parent: id, x: 6, y: 38, w: 72, h: 18, label: 'app=checkout' }),
];

export const anatomy = scene(
  'k8s-1-1-s2',
  'Reading a Deployment',
  [
    sCode('code', {
      x: 8,
      y: 8,
      w: 216,
      h: 216,
      fontSize: 8.5,
      lines: [
        'kind: Deployment',
        'spec:',
        '  replicas: 3',
        '  selector:',
        '    matchLabels:',
        '      app: checkout',
        '  template:',
        '    metadata:',
        '      labels:',
        '        app: checkout',
        '    spec:',
        '      containers:',
        '        - name: checkout',
        '          image: shop/checkout:1.4.2',
      ],
    }),
    sBox('res', { x: 232, y: 8, w: 100, h: 230, label: 'CLUSTER' }),
    ...labPod('a1', 26),
    ...labPod('a2', 94),
    ...labPod('a3', 162),
  ],
  [
    beat(
      'A Deployment is a wish list: **what** to run and **how many**. Read it top to bottom.',
      all(show('code', 'res'), {
        a1: { opacity: 0 },
        a2: { opacity: 0 },
        a3: { opacity: 0 },
        code: { hl: [] },
      }),
      { title: 'A wish list in YAML' }
    ),
    beat(
      '**replicas: 3** means three pods. Change the number and the cluster follows.',
      all(show('a1', 'a2', 'a3'), {
        code: { hl: [2] },
        a1t: { opacity: 0 },
        a2t: { opacity: 0 },
        a3t: { opacity: 0 },
      }),
      { title: 'How many' }
    ),
    beat(
      'The **selector** and the pod **labels** must match. That is how the Deployment finds the pods that are its own.',
      all({ code: { hl: [3, 4, 5, 8, 9] } }, show('a1t', 'a2t', 'a3t')),
      { title: 'Which pods are mine' }
    ),
    beat(
      'The **image** is what runs in every pod. A pinned tag means every pod runs the same code.',
      { code: { hl: [13] } },
      { title: 'What to run' }
    ),
    beat(
      'Try changing the tag and see what the cluster would do.',
      { code: { hl: [13] } },
      {
        title: 'Pinned or latest?',
        poke: poke(
          'Try both buttons',
          [
            press('Use :latest', [
              frame(
                0,
                {
                  a1c: { label: 'latest', tone: 'warn' },
                  a2c: { label: 'latest', tone: 'warn' },
                  a3c: { label: 'latest', tone: 'danger' },
                },
                'Same tag, **different code**. Pods started on different days pull different builds.'
              ),
              frame(
                1200,
                {},
                'With **latest** you cannot tell which version a pod runs, and you cannot roll back to it.'
              ),
            ]),
            press('Pin :1.4.2', [
              frame(
                0,
                {
                  a1c: { label: '1.4.2', tone: 'normal' },
                  a2c: { label: '1.4.2', tone: 'normal' },
                  a3c: { label: '1.4.2', tone: 'normal' },
                },
                'Every pod runs **exactly** 1.4.2. Rollouts and rollbacks are precise.'
              ),
            ]),
          ],
          'all'
        ),
      }
    ),
  ],
  240
);

// ---------------------------------------------------------------------------------------------
const slot = (i: number) => ({ x: 20 + i * 110, y: 100 });
const lp = (id: string, i: number, hidden = false): SceneActor[] => [
  sPod(id, { ...slot(i), w: 80, h: 84, tone: 'accent' }),
  sCtr(`${id}c`, { parent: id, x: 27, y: 12, w: 26, h: 26, label: 'app', color: 'orange' }),
  sTag(`${id}t`, { parent: id, x: 4, y: 52, w: 72, h: 18, label: 'app=checkout' }),
];

export const labels = scene(
  'k8s-1-2-s1',
  'Labels and selectors',
  [
    sTag('dep', { x: 80, y: 10, w: 180, h: 28, label: 'selector: app=checkout', tone: 'accent' }),
    ...[0, 1, 2].map((i) =>
      sArrow(`ar${i}`, { x: 55 + i * 110, y: 42, w: 10, h: 50, dir: 'down' })
    ),
    ...lp('p0', 0),
    ...lp('p1', 1),
    ...lp('p2', 2),
    ...lp('n0', 0),
    ...lp('n1', 1),
    ...lp('n2', 2),
    sTag('count', { x: 100, y: 200, w: 140, h: 26, label: 'owned pods: 3 / 3', tone: 'ok' }),
    sText('orph', {
      x: 70,
      y: 292,
      w: 200,
      label: 'orphaned: still running, no longer managed',
      fontSize: 9,
    }),
  ],
  [
    beat(
      'A Deployment does not know pod names. It finds its pods with a **label selector**: “every pod labelled app=checkout is mine”.',
      all(
        show('dep', 'ar0', 'ar1', 'ar2', 'p0', 'p1', 'p2', 'count'),
        hide('n0', 'n1', 'n2', 'orph')
      ),
      { title: 'Finding my pods' }
    ),
    beat('Labels are just tags. Change one and see what happens.', undefined, {
      title: 'Break the match',
      poke: poke(
        'Tap a pod to change its label',
        [0, 1, 2].map((i) =>
          tap(`p${i}`, [
            frame(
              0,
              {
                [`p${i}t`]: { label: 'app=debug', tone: 'warn' },
                [`ar${i}`]: { tone: 'danger' },
                count: { label: 'owned pods: 2 / 3', tone: 'warn' },
              },
              'You changed the label. It no longer matches the selector, so the Deployment **stops owning** this pod.'
            ),
            frame(
              1300,
              {
                [`p${i}`]: { y: 240, tone: 'dim' },
                [`n${i}`]: { opacity: 1 },
                [`ar${i}`]: { tone: 'normal' },
                orph: { opacity: 1 },
                count: { label: 'owned pods: 3 / 3', tone: 'ok' },
              },
              'To keep **3**, it starts a replacement. The old pod keeps running, orphaned. Handy for debugging a live pod without it being replaced.'
            ),
          ])
        )
      ),
    }),
  ],
  352
);

// ---------------------------------------------------------------------------------------------
const stages = ['Pending', 'Scheduled', 'Image pulled', 'Running', 'Ready'];
export const lifecycle = scene(
  'k8s-1-2-s2',
  'The life of a pod',
  [
    ...stages.map((s, i) =>
      sTag(`st${i}`, { x: 190, y: 16 + i * 50, w: 130, h: 30, label: s, tone: 'dim' })
    ),
    ...[0, 1, 2, 3].map((i) =>
      sArrow(`sa${i}`, { x: 250, y: 46 + i * 50, w: 10, h: 20, dir: 'down' })
    ),
    sPod('tok', { x: 40, y: 10, w: 90, h: 42, tone: 'dim' }),
    sCtr('tokc', { parent: 'tok', x: 32, y: 8, w: 26, h: 26, label: 'app', color: 'orange' }),
  ],
  [
    beat(
      'Every pod walks the same path. Press the button and follow it.',
      all(
        show('tok'),
        ...stages.map((_, i) => show(`st${i}`)),
        ...[0, 1, 2, 3].map((i) => show(`sa${i}`))
      ),
      {
        title: 'Five stages',
        poke: poke('Press the button', [
          press('Start the pod', [
            frame(
              0,
              { tok: { tone: 'warn' }, st0: { tone: 'accent' } },
              '**Pending**: the pod exists, but no node has been chosen yet.'
            ),
            frame(
              1200,
              { tok: { y: 60 }, st0: { tone: 'normal' }, st1: { tone: 'accent' } },
              '**Scheduled**: the scheduler picked a node.'
            ),
            frame(
              2400,
              { tok: { y: 110 }, st1: { tone: 'normal' }, st2: { tone: 'accent' } },
              '**Image pulled**: the node downloaded the image and created the containers.'
            ),
            frame(
              3600,
              { tok: { y: 160 }, st2: { tone: 'normal' }, st3: { tone: 'accent' } },
              '**Running**: the main process has started. But it may not be ready yet.'
            ),
            frame(
              4800,
              { tok: { y: 210, tone: 'ok' }, st3: { tone: 'normal' }, st4: { tone: 'ok' } },
              '**Ready**: the readiness probe passes. Only now does the pod receive traffic.'
            ),
          ]),
        ]),
      }
    ),
    beat(
      '**Running is not Ready.** A pod can run for a while before it can take traffic. Probes decide, and you will meet them soon.',
      undefined,
      {
        title: 'Running is not Ready',
      }
    ),
  ],
  280
);

// ---------------------------------------------------------------------------------------------
export const requests = scene(
  'k8s-1-3-s1',
  'Requests: what the pod reserves',
  [
    sBox('node', { x: 10, y: 10, w: 320, h: 150, label: 'NODE · 8 GiB MEMORY' }),
    sBar('cap', { parent: 'node', x: 16, y: 34, w: 288, h: 14 }),
    sText('capl', {
      parent: 'node',
      x: 16,
      y: 54,
      w: 288,
      label: 'memory reserved by requests',
      fontSize: 9,
    }),
    ...[0, 1, 2].flatMap((i) => [
      sPod(`q${i}`, { parent: 'node', x: 16 + i * 98, y: 80, w: 86, h: 56, tone: 'accent' }),
      sCtr(`q${i}c`, {
        parent: `q${i}`,
        x: 6,
        y: 16,
        w: 74,
        h: 24,
        label: 'request 2 GiB',
        color: 'orange',
      }),
    ]),
    sPod('big', { x: 20, y: 190, w: 140, h: 62, tone: 'dim' }),
    sCtr('bigc', {
      parent: 'big',
      x: 10,
      y: 18,
      w: 120,
      h: 26,
      label: 'request 3 GiB',
      color: 'paper',
    }),
    sTag('pend', { x: 180, y: 206, w: 140, h: 28, label: 'Pending', tone: 'dim' }),
  ],
  [
    beat(
      'Every node has limited memory and CPU. A **request** is what a pod reserves on it.',
      all(show('node', 'cap', 'capl'), {
        q0: { opacity: 0 },
        q1: { opacity: 0 },
        q2: { opacity: 0 },
      }),
      {
        title: 'A node has a budget',
      }
    ),
    beat(
      'Three pods, 2 GiB each. The scheduler only places a pod where its **request fits**.',
      {
        q0: { opacity: 1 },
        q1: { opacity: 1 },
        q2: { opacity: 1 },
        cap: { fill: 0.75, tone: 'accent' },
      },
      { title: 'Reserved, not used' }
    ),
    beat('A new pod asks for 3 GiB. Will it fit?', undefined, {
      title: 'No room',
      poke: poke('Add the fourth pod', [
        press('Add a pod (3 GiB)', [
          frame(
            0,
            { big: { opacity: 1 } },
            'The scheduler looks for a node with **3 GiB unreserved**.'
          ),
          frame(
            1100,
            {
              cap: { tone: 'danger' },
              big: { tone: 'danger' },
              pend: { opacity: 1, tone: 'danger', label: 'Pending: no room' },
            },
            'Only **2 GiB** are left. The pod stays **Pending**. Requests are promises the scheduler keeps.'
          ),
        ]),
      ]),
    }),
  ],
  280
);

// ---------------------------------------------------------------------------------------------
export const limits = scene(
  'k8s-1-3-s2',
  'Limits: the ceiling',
  [
    sPod('pd', {
      x: 40,
      y: 30,
      w: 260,
      h: 150,
      label: 'POD · memory limit 512 MiB',
      tone: 'accent',
    }),
    sText('mt', { parent: 'pd', x: 20, y: 44, w: 220, label: 'memory in use', fontSize: 9 }),
    sBar('mem', { parent: 'pd', x: 20, y: 62, w: 220, h: 18, limit: 0.8 }),
    sText('ml', { parent: 'pd', x: 160, y: 86, w: 90, label: 'limit', fontSize: 9 }),
    sTag('stat', { parent: 'pd', x: 20, y: 108, w: 220, h: 26, label: 'Running' }),
    sText('cpu', {
      x: 40,
      y: 206,
      w: 260,
      label:
        'CPU works differently: over its limit a container is slowed down (throttled), never killed.',
      fontSize: 11,
    }),
  ],
  [
    beat(
      'Inside the pod, the app uses memory. The **limit** is a hard ceiling, marked in red.',
      all(show('pd'), { mem: { fill: 0.35, tone: 'normal' }, stat: { opacity: 1 } }),
      {
        title: 'A ceiling',
      }
    ),
    beat('Memory has a hard limit. Simulate a leak and watch what happens.', undefined, {
      title: 'Leak some memory',
      poke: poke('Press the button', [
        press('Leak memory', [
          frame(0, { mem: { fill: 0.6, tone: 'accent' } }, 'The app leaks memory...'),
          frame(900, { mem: { fill: 0.78, tone: 'warn' } }),
          frame(
            1700,
            {
              mem: { fill: 1, tone: 'danger' },
              stat: { tone: 'danger', label: 'OOMKilled · exit code 137' },
              pd: { tone: 'danger' },
            },
            'It crossed the limit. The kernel kills the container: **OOMKilled**.'
          ),
          frame(
            3000,
            {
              mem: { fill: 0.2, tone: 'normal' },
              stat: { tone: 'ok', label: 'Running · restarts: 1' },
              pd: { tone: 'accent' },
            },
            'Kubernetes restarts it. A leak hurts **one pod**, not the whole node.'
          ),
        ]),
      ]),
    }),
    beat(
      'So: **memory** over the limit means killed. **CPU** over the limit means slowed.',
      all({ cpu: { opacity: 1 } }),
      { title: 'Memory kills, CPU slows' }
    ),
  ],
  290
);

// ---------------------------------------------------------------------------------------------
export const probes = scene(
  'k8s-1-3-s3',
  'Probes decide who gets traffic',
  [
    sTag('svc', { x: 120, y: 10, w: 100, h: 28, label: 'Service', tone: 'accent' }),
    sArrow('a1', { x: 78, y: 44, w: 12, h: 80, dir: 'down' }),
    sArrow('a2', { x: 252, y: 44, w: 12, h: 80, dir: 'down' }),
    sPod('b1', { x: 30, y: 130, w: 110, h: 100, label: 'POD 1', tone: 'accent' }),
    sCtr('b1c', { parent: 'b1', x: 42, y: 36, w: 26, h: 26, label: 'app', color: 'orange' }),
    sTag('b1t', { parent: 'b1', x: 8, y: 72, w: 94, h: 20, label: 'ready', tone: 'ok' }),
    sPod('b2', { x: 200, y: 130, w: 110, h: 100, label: 'POD 2', tone: 'accent' }),
    sCtr('b2c', { parent: 'b2', x: 42, y: 36, w: 26, h: 26, label: 'app', color: 'orange' }),
    sTag('b2t', { parent: 'b2', x: 8, y: 72, w: 94, h: 20, label: 'ready', tone: 'ok' }),
    sDot('t1', { x: 79, y: 56, w: 10, h: 10, color: 'teal' }),
    sDot('t2', { x: 253, y: 56, w: 10, h: 10, color: 'teal' }),
    sDot('t3', { x: 79, y: 90, w: 10, h: 10, color: 'teal' }),
  ],
  [
    beat(
      'Probes are health checks. **Readiness** asks: \u201ccan this pod take traffic?\u201d **Liveness** asks: \u201cis this process stuck?\u201d',
      show('svc', 'b1', 'b2'),
      { title: 'Two questions' }
    ),
    beat(
      'While both pods are **Ready**, the Service sends them traffic.',
      all(show('a1', 'a2'), { t1: { opacity: 1, y: 80 }, t2: { opacity: 1, y: 80 } }),
      { title: 'Traffic follows readiness' }
    ),
    beat('Break each probe on pod 2 and watch what the cluster does.', undefined, {
      title: 'Break the probes',
      poke: poke(
        'Try both buttons',
        [
          press('Fail the readiness probe', [
            frame(
              0,
              { b2: { tone: 'warn' }, b2t: { tone: 'warn', label: 'not ready' } },
              '**Readiness fails**: pod 2 says it cannot take traffic.'
            ),
            frame(
              1000,
              { a2: { tone: 'dim' }, t2: { opacity: 0 }, t3: { opacity: 1 } },
              'The Service stops sending traffic to pod 2. **It is not restarted.** All traffic goes to pod 1.'
            ),
          ]),
          press('Fail the liveness probe', [
            frame(
              0,
              {
                b2: { tone: 'danger' },
                b2t: { tone: 'danger', label: 'stuck' },
                a2: { tone: 'danger' },
                t2: { opacity: 0 },
              },
              '**Liveness fails**: the kubelet decides pod 2 is stuck.'
            ),
            frame(
              1400,
              {
                b2: { tone: 'accent' },
                b2t: { tone: 'ok', label: 'ready' },
                a2: { tone: 'normal' },
                t2: { opacity: 1 },
                t3: { opacity: 0 },
              },
              'It **restarts the container**. When it is Ready again, traffic returns.'
            ),
          ]),
        ],
        'all'
      ),
    }),
  ],
  250
);
