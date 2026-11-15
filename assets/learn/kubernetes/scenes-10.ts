import {
  all,
  beat,
  frame,
  poke,
  press,
  scene,
  sArrow,
  sBar,
  sBox,
  sTag,
  sText,
  show,
} from '@/lib/learn/sceneDsl';
import { tapToLearn } from './scenes-common';

// ---------------------------------------------------------------------------------------------
export const statuses = tapToLearn(
  'k8s-10-1-s1',
  'Read the status like a doctor',
  'The STATUS column of kubectl get pods tells you where to look first. Five statuses cover most incidents.',
  'Tap all five statuses',
  [
    {
      label: 'Pending',
      info: 'No node has been chosen yet. Run kubectl describe pod and read the FailedScheduling event (CPU, memory, taints, volumes).',
    },
    {
      label: 'ImagePullBackOff',
      info: 'The node cannot pull the image: wrong tag, missing credentials, or an unreachable registry. kubectl describe pod shows the error.',
    },
    {
      label: 'CrashLoopBackOff',
      info: 'The container starts and dies, again and again. Run kubectl logs --previous to read the last crash.',
    },
    {
      label: 'CreateContainerConfigError',
      info: 'A ConfigMap or Secret the pod references is missing. kubectl describe pod names the missing object.',
    },
    {
      label: 'OOMKilled',
      info: 'The memory limit was hit (exit code 137). Raise the limit or fix the leak. Check kubectl top first.',
    },
  ]
);

// ---------------------------------------------------------------------------------------------
const waits = [
  ['10s', 14],
  ['20s', 28],
  ['40s', 52],
  ['80s', 96],
  ['5m', 150],
] as const;
export const backoff = scene(
  'k8s-10-1-s2',
  'Why it is called a back-off',
  [
    sTag('ps', { x: 90, y: 8, w: 160, h: 26, label: 'Running', tone: 'ok' }),
    sText('bt', { x: 20, y: 42, w: 300, label: 'wait before the next restart', fontSize: 9 }),
    ...waits.map(([, h], i) =>
      sBox(`w${i}`, { x: 24 + i * 60, y: 208 - h, w: 44, h, tone: i === 4 ? 'danger' : 'warn' })
    ),
    ...waits.map(([t], i) =>
      sText(`wl${i}`, { x: 36 + i * 60, y: 214, w: 44, label: t, fontSize: 10 })
    ),
  ],
  [
    beat(
      'When a container keeps crashing, Kubernetes restarts it but **waits longer each time**, up to five minutes. That wait is the **BackOff**.',
      show('ps', 'bt'),
      { title: 'Crash, wait, crash again' }
    ),
    beat('Make the app crash on start and watch the waits grow.', undefined, {
      title: 'Crash the app',
      poke: poke('Press the button', [
        press('Crash the app on start', [
          frame(
            0,
            { ps: { label: 'Error', tone: 'danger' }, w0: { opacity: 1 }, wl0: { opacity: 1 } },
            'It crashes. Kubernetes waits **10 s** and restarts it.'
          ),
          frame(
            1300,
            { w1: { opacity: 1 }, wl1: { opacity: 1 } },
            'It crashes again. Now it waits **20 s**.'
          ),
          frame(2600, { w2: { opacity: 1 }, wl2: { opacity: 1 } }, 'Then **40 s**.'),
          frame(3900, { w3: { opacity: 1 }, wl3: { opacity: 1 } }, 'Then **80 s**.'),
          frame(
            5200,
            { w4: { opacity: 1 }, wl4: { opacity: 1 }, ps: { label: 'CrashLoopBackOff' } },
            'Capped at **5 minutes**. The status says **CrashLoopBackOff**. The cause is in the logs of the last crash: **kubectl logs --previous**.'
          ),
        ]),
      ]),
    }),
  ],
  240
);

// ---------------------------------------------------------------------------------------------
const svc = (id: string, x: number, name: string) =>
  sTag(id, { x, y: 16, w: 90, h: 28, label: name });
export const dnsDown = scene(
  'k8s-10-2-s1',
  'One shared dependency, many failures',
  [
    svc('s0', 15, 'checkout'),
    svc('s1', 125, 'cart'),
    svc('s2', 235, 'payments'),
    ...[0, 1, 2].map((i) => sArrow(`d${i}`, { x: 55 + i * 110, y: 48, w: 10, h: 50, dir: 'down' })),
    sBox('dns', { x: 30, y: 102, w: 280, h: 80, label: 'CoreDNS · 2 pods' }),
    sBar('db', { parent: 'dns', x: 90, y: 40, w: 100, h: 12 }),
    sTag('res', { x: 30, y: 200, w: 280, h: 28, label: 'all lookups succeed', tone: 'ok' }),
  ],
  [
    beat(
      'Every call starts with a **DNS lookup**, and CoreDNS runs as just a few pods. Many services depend on the same few pods.',
      all(show('s0', 's1', 's2', 'd0', 'd1', 'd2', 'dns', 'db', 'res'), {
        db: { fill: 0.3, tone: 'ok' },
      }),
      { title: 'DNS is shared' }
    ),
    beat('Overload DNS and see how many services notice.', undefined, {
      title: 'Overload it',
      poke: poke(
        'Try both buttons',
        [
          press('Overload DNS', [
            frame(
              0,
              { db: { fill: 0.98, tone: 'danger' }, dns: { tone: 'danger' } },
              'CoreDNS hits its CPU limit.'
            ),
            frame(
              1200,
              {
                s0: { label: 'timeout', tone: 'danger' },
                s1: { label: 'timeout', tone: 'danger' },
                s2: { label: 'timeout', tone: 'danger' },
                d0: { tone: 'danger' },
                d1: { tone: 'danger' },
                d2: { tone: 'danger' },
                res: { label: 'lookups time out', tone: 'danger' },
              },
              'Services that look **unrelated** all fail **at the same time**. When that happens, look for the **shared dependency**.'
            ),
          ]),
          press('Scale CoreDNS', [
            frame(
              0,
              {
                db: { fill: 0.3, tone: 'ok' },
                dns: { tone: 'normal', label: 'CoreDNS · 6 pods' },
                s0: { label: 'checkout', tone: 'normal' },
                s1: { label: 'cart', tone: 'normal' },
                s2: { label: 'payments', tone: 'normal' },
                d0: { tone: 'normal' },
                d1: { tone: 'normal' },
                d2: { tone: 'normal' },
                res: { label: 'all lookups succeed', tone: 'ok' },
              },
              'More CoreDNS replicas (and a node-local cache) and everything recovers at once.'
            ),
          ]),
        ],
        'all'
      ),
    }),
  ],
  240
);
