import {
  beat,
  frame,
  poke,
  press,
  scene,
  sArrow,
  sBox,
  sCtr,
  sPod,
  sTag,
  show,
  tap,
} from '@/lib/learn/sceneDsl';

// ---------------------------------------------------------------------------------------------
export const volumes = scene(
  'k8s-5-1-s1',
  'Data that outlives a pod',
  [
    sPod('podL', { x: 14, y: 30, w: 150, h: 100, label: 'POD · emptyDir', tone: 'accent' }),
    sTag('dataL', { parent: 'podL', x: 10, y: 52, w: 130, h: 28, label: 'orders.log' }),
    sPod('podR', { x: 176, y: 30, w: 150, h: 100, label: 'POD · volume claim', tone: 'accent' }),
    sArrow('ar', { x: 245, y: 134, w: 10, h: 52, dir: 'down' }),
    sBox('disk', { x: 176, y: 190, w: 150, h: 80, label: 'PERSISTENT VOLUME' }),
    sTag('dataR', { parent: 'disk', x: 10, y: 36, w: 130, h: 28, label: 'orders.db', tone: 'ok' }),
    sTag('claim', { x: 10, y: 136, w: 148, h: 26, label: 'PersistentVolumeClaim', tone: 'accent' }),
    sArrow('k1', { x: 79, y: 164, w: 10, h: 12, dir: 'down' }),
    sTag('sc', { x: 10, y: 178, w: 148, h: 26, label: 'StorageClass: fast-ssd' }),
    sArrow('k2', { x: 79, y: 206, w: 10, h: 12, dir: 'down' }),
    sTag('prov', { x: 10, y: 220, w: 148, h: 26, label: 'provisioner builds it' }),
    sArrow('k3', { x: 160, y: 227, w: 14, h: 12, dir: 'right' }),
  ],
  [
    beat(
      'An **emptyDir** lives and dies with its pod. A **PersistentVolume** is a real disk that outlives pods.',
      show('podL', 'podR', 'ar', 'disk'),
      { title: 'Two kinds of storage' }
    ),
    beat('Delete both pods and see what survives.', undefined, {
      title: 'Delete the pods',
      poke: poke('Press the button', [
        press('Delete both pods', [
          frame(
            0,
            {
              podL: { tone: 'danger', opacity: 0.3 },
              dataL: { label: 'lost', tone: 'danger' },
              podR: { tone: 'danger', opacity: 0.3 },
              ar: { tone: 'danger' },
            },
            'Both pods die.'
          ),
          frame(
            1400,
            { podR: { tone: 'accent', opacity: 1 }, ar: { tone: 'normal' } },
            'A new pod **mounts the same volume**. **orders.db survived.** The emptyDir data is gone for good.'
          ),
        ]),
      ]),
    }),
    beat(
      'You do not create volumes by hand. A pod asks with a **PersistentVolumeClaim**, a **StorageClass** says how, and a provisioner builds the disk. Check the reclaim policy: **Delete** removes the data with the claim.',
      show('claim', 'k1', 'sc', 'k2', 'prov', 'k3'),
      { title: 'Claims and classes' }
    ),
  ],
  280
);

// ---------------------------------------------------------------------------------------------
const rp = (i: number) => [
  sPod(`r${i}`, { x: 8 + i * 106, y: 56, w: 100, h: 78, label: `redis-${i}`, tone: 'accent' }),
  sCtr(`r${i}c`, { parent: `r${i}`, x: 29, y: 30, w: 42, h: 26, label: 'redis', color: 'orange' }),
  sArrow(`ra${i}`, { x: 53 + i * 106, y: 138, w: 10, h: 48, dir: 'down' }),
  sBox(`d${i}`, { x: 8 + i * 106, y: 190, w: 100, h: 54, label: `data-redis-${i}` }),
];
export const stateful = scene(
  'k8s-5-2-s1',
  'A StatefulSet gives pods an identity',
  [
    sTag('hs', { x: 50, y: 10, w: 240, h: 26, label: 'headless Service · stable names' }),
    ...[0, 1, 2].flatMap(rp),
  ],
  [
    beat(
      'A Deployment treats pods as interchangeable. Databases cannot: each member needs a **stable name** and **its own disk**.',
      show('hs', 'r0', 'r1', 'r2', 'ra0', 'ra1', 'ra2', 'd0', 'd1', 'd2'),
      { title: 'Stable names, own disks' }
    ),
    beat('Delete a pod and watch what comes back.', undefined, {
      title: 'Delete a member',
      poke: poke(
        'Tap a pod to delete it',
        [0, 1, 2].map((i) =>
          tap(`r${i}`, [
            frame(0, { [`r${i}`]: { tone: 'danger', opacity: 0.3 } }, `redis-${i} is deleted.`),
            frame(
              1300,
              { [`r${i}`]: { tone: 'accent', opacity: 1 } },
              `It returns as **redis-${i}**, re-attached to **data-redis-${i}**. Name and data survive.`
            ),
          ])
        )
      ),
    }),
    beat(
      'Many teams run Postgres **outside** the cluster. If you run it in-cluster, use an **operator** that handles failover and backups.',
      undefined,
      { title: 'A word of honesty' }
    ),
  ],
  260
);
