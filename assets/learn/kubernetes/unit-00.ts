import { box, cmd, diagram, gap, lesson, order, spot, terminal, unit } from '@/lib/learn/dsl';
import {
  all,
  beat,
  frame,
  hide,
  poke,
  press,
  scene,
  sArrow,
  sBox,
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

/** A pod with an app container and a log container. Children are sCtr actors named <id>a / <id>b. */
const pod = (id: string, parent: string | undefined, x: number, y: number): SceneActor[] => [
  sPod(id, { parent, x, y, w: 78, h: 60, tone: 'accent' }),
  sCtr(`${id}a`, { parent: id, x: 8, y: 24, w: 26, h: 26, label: 'app', color: 'orange' }),
  sCtr(`${id}b`, { parent: id, x: 44, y: 24, w: 26, h: 26, label: 'log', color: 'paper' }),
];

const dockerToCluster = scene(
  'k8s-0-1-a',
  'From Docker to a cluster',
  [
    sBox('machine', { x: 60, y: 70, w: 220, h: 150, label: 'YOUR SERVER' }),
    sCtr('m1', { parent: 'machine', x: 22, y: 60, w: 34, h: 34, label: 'web', color: 'orange' }),
    sCtr('m2', { parent: 'machine', x: 93, y: 60, w: 34, h: 34, label: 'api', color: 'paper' }),
    sCtr('m3', { parent: 'machine', x: 164, y: 60, w: 34, h: 34, label: 'db', color: 'teal' }),
    sBox('nA', { x: 12, y: 40, w: 100, h: 230, label: 'NODE 1' }),
    sBox('nB', { x: 122, y: 40, w: 100, h: 230, label: 'NODE 2' }),
    sBox('nC', { x: 232, y: 40, w: 100, h: 230, label: 'NODE 3' }),
    ...pod('p1', 'nA', 11, 36),
    ...pod('p2', 'nB', 11, 36),
    ...pod('p3', 'nC', 11, 36),
    ...pod('pn', undefined, 0, 0),
    sTag('tag', {
      x: 60,
      y: 8,
      w: 220,
      h: 26,
      label: 'checkout · replicas 3 · running 3',
      tone: 'normal',
    }),
  ],
  [
    beat(
      'With Docker you run **containers** on one machine. You already know this part.',
      show('machine'),
      {
        title: 'From Docker to a cluster',
      }
    ),
    beat(
      'If that machine dies, **everything on it dies**, and someone restarts it all by hand.',
      {
        machine: { tone: 'danger' },
        m1: { tone: 'dim' },
        m2: { tone: 'dim' },
        m3: { tone: 'dim' },
      },
      { title: 'One machine is a single point of failure' }
    ),
    beat(
      'Kubernetes joins many machines into one **cluster**. Each machine is a **node**.',
      all(hide('machine'), show('nA', 'nB', 'nC')),
      { title: 'One cluster, many machines' }
    ),
    beat(
      'A **Pod** wraps containers that must run together. It is the smallest thing Kubernetes runs.',
      all(show('p1'), { p1: { label: 'POD' } }),
      { title: 'The Pod' }
    ),
    beat(
      'You declare **“three copies of checkout”**. A Deployment keeps that true, spread over different nodes.',
      all(show('p2', 'p3', 'tag'), { p1: { label: '' } }),
      { title: 'Say what you want' }
    ),
    beat('Tap any pod to kill it, like a crashed process or a dead node.', undefined, {
      title: 'Now break it',
      poke: poke(
        'Tap a pod to break it',
        [
          ['p1', 243, 160],
          ['p2', 23, 160],
          ['p3', 133, 160],
        ].map(([id, x, y]) =>
          tap(id as string, [
            frame(
              0,
              {
                [id as string]: { tone: 'danger', opacity: 0.3 },
                tag: { tone: 'warn', label: 'checkout · replicas 3 · running 2' },
              },
              'Kubernetes sees **2 of 3** running. That does not match what you declared.'
            ),
            frame(
              1000,
              { pn: { x: x as number, y: y as number, opacity: 1 } },
              'It **starts a replacement** on another node.'
            ),
            frame(
              2000,
              { tag: { tone: 'ok', label: 'checkout · replicas 3 · running 3' } },
              'Back to **3 of 3**. Nobody was paged. That is what a Deployment is for.'
            ),
          ])
        )
      ),
    }),
  ]
);

const insideAPod = scene(
  'k8s-0-1-b',
  'Inside a Pod',
  [
    sBox('node', { x: 30, y: 24, w: 280, h: 256, label: 'NODE 1' }),
    sPod('pd', { x: 50, y: 56, w: 240, h: 150, label: 'POD', tone: 'accent' }),
    sCtr('app', { parent: 'pd', x: 28, y: 50, w: 76, h: 56, label: 'app', color: 'orange' }),
    sCtr('side', {
      parent: 'pd',
      x: 136,
      y: 50,
      w: 76,
      h: 56,
      label: 'log shipper',
      color: 'paper',
    }),
    sText('lo', { parent: 'pd', x: 84, y: 114, w: 80, label: 'localhost', fontSize: 9 }),
    sDot('d1', { parent: 'pd', x: 108, y: 74, w: 10, h: 10, color: 'teal' }),
    sTag('ip', { x: 80, y: 222, w: 180, h: 26, label: 'pod IP 10.244.1.7' }),
  ],
  [
    beat(
      'A Pod can hold **more than one container**. Here: your app, and a log shipper running right beside it.',
      all(show('node', 'pd', 'app', 'side'), hide('lo', 'd1')),
      { title: 'Containers that travel together' }
    ),
    beat(
      'They share **one network**, so they talk to each other over **localhost**.',
      { lo: { opacity: 1 }, d1: { opacity: 1, x: 124 } },
      { title: 'One shared network' }
    ),
    beat('The whole pod gets **one IP address**. Not one per container.', show('ip'), {
      title: 'One IP for the pod',
    }),
    beat('Pods are disposable. Tap the pod to replace it.', undefined, {
      title: 'Pods come and go',
      poke: poke('Tap the pod to replace it', [
        tap('pd', [
          frame(
            0,
            {
              pd: { tone: 'danger', opacity: 0.25, scale: 0.94 },
              ip: { tone: 'warn', label: 'pod IP gone' },
            },
            'The pod dies.'
          ),
          frame(
            1100,
            {
              pd: { tone: 'accent', opacity: 1, scale: 1 },
              ip: { tone: 'ok', label: 'new pod IP 10.244.2.9' },
            },
            'It came back with a **new IP**. Never rely on a pod’s IP. That is why Services exist, later in this course.'
          ),
        ]),
      ]),
    }),
  ]
);

const controlPlane = scene(
  'k8s-0-2-a',
  'Inside the cluster',
  [
    sUser('you', { x: 140, y: 6, w: 60, h: 28, label: 'kubectl', color: 'paper' }),
    sArrow('yArrow', { x: 165, y: 34, w: 10, h: 22, dir: 'down' }),
    sBox('cp', { x: 10, y: 58, w: 320, h: 118, label: 'CONTROL PLANE' }),
    sBox('api', { parent: 'cp', x: 8, y: 30, w: 68, h: 76, label: 'API SERVER' }),
    sBox('etcd', { parent: 'cp', x: 82, y: 30, w: 52, h: 76, label: 'ETCD' }),
    sBox('sch', { parent: 'cp', x: 140, y: 30, w: 80, h: 76, label: 'SCHEDULER' }),
    sBox('ctl', { parent: 'cp', x: 226, y: 30, w: 88, h: 76, label: 'CONTROLLERS' }),
    sBox('nA', { x: 10, y: 196, w: 155, h: 134, label: 'NODE 1' }),
    sBox('klA', { parent: 'nA', x: 10, y: 28, w: 135, h: 28, label: 'KUBELET' }),
    sBox('rtA', { parent: 'nA', x: 10, y: 60, w: 135, h: 28, label: 'CONTAINER RUNTIME' }),
    sPod('poA', { parent: 'nA', x: 10, y: 94, w: 70, h: 32, label: 'POD', tone: 'accent' }),
    sBox('nB', { x: 175, y: 196, w: 155, h: 134, label: 'NODE 2' }),
    sBox('klB', { parent: 'nB', x: 10, y: 28, w: 135, h: 28, label: 'KUBELET' }),
    sBox('rtB', { parent: 'nB', x: 10, y: 60, w: 135, h: 28, label: 'CONTAINER RUNTIME' }),
    sPod('poB', { parent: 'nB', x: 10, y: 94, w: 70, h: 32, label: 'POD', tone: 'accent' }),
  ],
  [
    beat(
      'A cluster has two halves: the **control plane** decides, and **worker nodes** run your containers.',
      show('cp', 'nA', 'nB'),
      { title: 'Two halves' }
    ),
    beat(
      'You only ever talk to the **API server**. Tap each part to see what it does.',
      show('you', 'yArrow', 'api', 'etcd', 'sch', 'ctl', 'klA', 'rtA', 'poA', 'klB', 'rtB', 'poB'),
      {
        title: 'Meet the parts',
        poke: poke(
          'Tap every highlighted part',
          [
            tap('api', [
              frame(
                0,
                { api: { tone: 'ok' } },
                '**API server**: the front door. Every command, controller and kubelet talks to it.'
              ),
            ]),
            tap('etcd', [
              frame(
                0,
                { etcd: { tone: 'ok' } },
                '**etcd**: the database. It stores what you declared and what is really running.'
              ),
            ]),
            tap('sch', [
              frame(0, { sch: { tone: 'ok' } }, '**Scheduler**: picks a node for every new pod.'),
            ]),
            tap('ctl', [
              frame(
                0,
                { ctl: { tone: 'ok' } },
                '**Controllers**: watch the state and fix differences. One of them keeps your replica count true.'
              ),
            ]),
            tap('klA', [
              frame(
                0,
                { klA: { tone: 'ok' }, klB: { tone: 'ok' } },
                '**kubelet**: the agent on every node. It starts the containers it is told to run.'
              ),
            ]),
          ],
          'all'
        ),
      }
    ),
    beat(
      'That is the whole model: **you declare**, the control plane **decides**, and the kubelets **do**.',
      { you: { tone: 'accent' }, yArrow: { tone: 'accent' } },
      { title: 'Declare, decide, do' }
    ),
  ],
  340
);

const reconcile = scene(
  'k8s-0-2-b',
  'You declare, Kubernetes reconciles',
  [
    sTag('desired', { x: 20, y: 12, w: 150, h: 28, label: 'you declared: 3 pods', tone: 'accent' }),
    sTag('actual', { x: 180, y: 12, w: 140, h: 28, label: 'running: 3 pods', tone: 'ok' }),
    sTag('lw', { x: 20, y: 58, w: 90, h: 26, label: 'watch', tone: 'dim' }),
    sTag('lc', { x: 125, y: 58, w: 90, h: 26, label: 'compare', tone: 'dim' }),
    sTag('la', { x: 230, y: 58, w: 90, h: 26, label: 'act', tone: 'dim' }),
    sArrow('a1', { x: 112, y: 64, w: 12, h: 14, dir: 'right' }),
    sArrow('a2', { x: 217, y: 64, w: 12, h: 14, dir: 'right' }),
    sBox('cl', { x: 20, y: 102, w: 300, h: 170, label: 'CLUSTER' }),
    ...[0, 1, 2, 3, 4].flatMap((i) => [
      sPod(`q${i}`, { x: 32 + i * 56, y: 150, w: 48, h: 70, tone: 'accent' }),
      sCtr(`q${i}c`, {
        parent: `q${i}`,
        x: 11,
        y: 22,
        w: 26,
        h: 26,
        label: 'app',
        color: 'orange',
      }),
    ]),
  ],
  [
    beat(
      'You **declare** how many pods you want. Kubernetes makes the real world match.',
      show('desired', 'actual', 'cl', 'q0', 'q1', 'q2'),
      { title: 'Declared versus real' }
    ),
    beat(
      'A controller runs a loop forever: **watch** the state, **compare** it with what you declared, **act** on the difference.',
      show('lw', 'lc', 'la', 'a1', 'a2'),
      { title: 'The control loop' }
    ),
    beat('Change the number and watch the loop work.', undefined, {
      title: 'Change the declaration',
      poke: poke(
        'Try both buttons',
        [
          press('Set replicas: 5', [
            frame(
              0,
              { desired: { label: 'you declared: 5 pods', tone: 'warn' }, lw: { tone: 'accent' } },
              'You changed the declaration to **5**. The loop **watches**.'
            ),
            frame(
              800,
              { lw: { tone: 'normal' }, lc: { tone: 'accent' } },
              'It **compares**: fewer pods are running than you declared.'
            ),
            frame(
              1600,
              {
                lc: { tone: 'normal' },
                la: { tone: 'accent' },
                q3: { opacity: 1 },
                actual: { label: 'running: 4 pods', tone: 'warn' },
              },
              'It **acts**: starts the missing pods.'
            ),
            frame(
              2400,
              {
                q4: { opacity: 1 },
                actual: { label: 'running: 5 pods', tone: 'ok' },
                desired: { tone: 'ok' },
                la: { tone: 'normal' },
              },
              'Real matches declared. The loop keeps watching.'
            ),
          ]),
          press('Set replicas: 2', [
            frame(
              0,
              { desired: { label: 'you declared: 2 pods', tone: 'warn' }, lw: { tone: 'accent' } },
              'You changed the declaration to **2**. The loop **watches**.'
            ),
            frame(
              800,
              { lw: { tone: 'normal' }, lc: { tone: 'accent' } },
              'It **compares**: more pods are running than you declared.'
            ),
            frame(
              1600,
              {
                lc: { tone: 'normal' },
                la: { tone: 'accent' },
                q2: { opacity: 0 },
                q3: { opacity: 0 },
                q4: { opacity: 0 },
                actual: { label: 'running: 2 pods', tone: 'warn' },
              },
              'It **acts**: removes the extra pods.'
            ),
            frame(
              2400,
              { actual: { tone: 'ok' }, desired: { tone: 'ok' }, la: { tone: 'normal' } },
              'Real matches declared. You never said “stop pod 3”. You just said what you want.'
            ),
          ]),
        ],
        'all'
      ),
    }),
  ],
  290
);

export const unit0 = unit({
  id: 'k8s-u0',
  title: 'From Docker to Kubernetes',
  blurb:
    'You know containers. Here is the problem they hit at scale, and the model Kubernetes uses to solve it, shown rather than told.',
  icon: 'cluster',
  badge: { id: 'badge-cluster-ready', title: 'Cluster ready' },
  lessons: [
    lesson('k8s-0-1', 'One machine is not enough', [
      dockerToCluster,
      insideAPod,
      order(
        'k8s-0-1-c',
        'When a node dies',
        'You just watched it. Now put it in order.',
        [
          'A node stops responding',
          'Kubernetes marks its pods as lost',
          'The Deployment sees fewer pods than you declared',
          'New pods are started on healthy nodes',
          'The count matches what you declared again',
        ],
        'Nobody restarts anything by hand. A controller compares what is running with what you declared and closes the gap.'
      ),
      diagram(
        'k8s-0-1-d',
        'Name the pieces',
        'Place each Kubernetes word where it belongs.',
        [
          [gap('cl', 'Cluster', 'A set of machines managed as one.')],
          [box('nodes', 'Nodes', 'the machines')],
          [gap('pod', 'Pod', 'Wraps containers that run together and share one IP.')],
          [gap('ctr', 'Container', 'Your image, running. You know this one.')],
        ],
        ['Image', 'Volume']
      ),
    ]),

    lesson('k8s-0-2', 'Inside the cluster', [
      controlPlane,
      reconcile,
      diagram(
        'k8s-0-2-c',
        'Label the control plane',
        'Place each part where it belongs.',
        [
          [gap('api', 'API server', 'The front door. Everything goes through it.')],
          [
            gap('etcd', 'etcd', 'Stores the declared and the real state.', 'the database'),
            gap('sch', 'Scheduler', 'Chooses a node for each new pod.', 'picks nodes'),
          ],
          [gap('ctl', 'Controllers', 'Watch the state and fix differences.')],
        ],
        ['kubelet', 'Container runtime']
      ),
      order(
        'k8s-0-2-d',
        'The reconcile loop',
        'Put one turn of the control loop in order.',
        [
          'Watch the current state',
          'Compare it with the declared state',
          'Act to close the difference',
          'Repeat, forever',
        ],
        'Kubernetes does not run commands once. It runs this loop continuously, which is why it can heal itself.'
      ),
    ]),

    lesson(
      'k8s-0-3',
      'Boss: explain the cluster',
      [
        spot(
          'k8s-0-3-a',
          'Which statements are wrong?',
          'A colleague explains Kubernetes to a new hire. Tap every statement that is wrong.',
          `
Kubernetes replaces containers, so you no longer need images
A Pod is always exactly one container
You declare the state you want and Kubernetes keeps it true
If a node dies, replacement pods are started on other nodes
Pod IPs are stable, so apps can hard-code them`,
          {
            0: 'Kubernetes runs your container images. It orchestrates containers, it does not replace them.',
            1: 'A pod holds one or more containers that run together and share a network.',
            4: 'A replaced pod gets a new IP. Apps should reach pods through a Service, never by pod IP.',
          }
        ),
        order(
          'k8s-0-3-b',
          'From declaration to running',
          'Order how your declaration becomes running containers.',
          [
            'You declare the state you want through the API server',
            'The state is stored in etcd',
            'Controllers notice the difference and create pods',
            'The scheduler picks a node for each pod',
            'The kubelet on that node starts the containers',
          ],
          'You declare, the control plane records and decides, and the kubelet does the work on the node.'
        ),
        terminal(
          'k8s-0-3-c',
          'Your first kubectl',
          'You have access to a small cluster. Take a look around.',
          'List the nodes of the cluster.',
          ['kubectl get nodes', 'kubectl get pods -A'],
          [
            cmd(
              '^get nodes$',
              `NAME            STATUS   ROLES           AGE   VERSION
cp-1            Ready    control-plane   42d   v1.31.2
worker-1        Ready    <none>          42d   v1.31.2
worker-2        Ready    <none>          42d   v1.31.2

One control-plane node and two worker nodes.`,
              { goal: true }
            ),
            cmd(
              '^get pods( -A| --all-namespaces)?$',
              `NAMESPACE     NAME                          READY   STATUS
kube-system   kube-apiserver-cp-1           1/1     Running
kube-system   etcd-cp-1                     1/1     Running
kube-system   kube-scheduler-cp-1           1/1     Running
kube-system   coredns-5d78c9869d-4rkzp      1/1     Running`
            ),
          ]
        ),
      ],
      true
    ),
  ],
});
