import {
  all,
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
} from '@/lib/learn/sceneDsl';
import { mini } from './scenes-common';

// ---------------------------------------------------------------------------------------------
export const gitops = scene(
  'k8s-11-1-s1',
  'Git is the source of truth',
  [
    sBox('git', { x: 10, y: 10, w: 150, h: 66, label: 'GIT · main' }),
    sTag('gv', { parent: 'git', x: 8, y: 32, w: 134, h: 24, label: 'replicas: 3', tone: 'ok' }),
    sArrow('a1', { x: 164, y: 36, w: 30, h: 12, dir: 'right' }),
    sTag('argo', { x: 198, y: 30, w: 132, h: 28, label: 'Argo CD · Synced', tone: 'ok' }),
    sArrow('a2', { x: 255, y: 62, w: 10, h: 28, dir: 'down' }),
    sBox('cl', { x: 10, y: 94, w: 320, h: 100, label: 'CLUSTER' }),
    ...[0, 1, 2, 3, 4].flatMap((i) => mini(`k${i}`, 10 + i * 60, 36, 'cl')),
  ],
  [
    beat(
      'In **GitOps** every change is a commit. A controller (Argo CD, Flux) makes the cluster **match git**.',
      all(show('git', 'gv', 'a1', 'argo', 'a2', 'cl', 'k0', 'k1', 'k2'), {
        k3: { opacity: 0 },
        k4: { opacity: 0 },
      }),
      { title: 'Git decides' }
    ),
    beat('Change git, not the cluster.', undefined, {
      title: 'Merge a pull request',
      poke: poke('Press the button', [
        press('Merge a PR: replicas 5', [
          frame(
            0,
            { gv: { label: 'replicas: 5', tone: 'accent' } },
            'A reviewed pull request is merged: **replicas: 5**.'
          ),
          frame(
            1200,
            { argo: { label: 'Argo CD · Syncing', tone: 'accent' } },
            'Argo CD notices the new commit.'
          ),
          frame(
            2400,
            {
              k3: { opacity: 1 },
              k4: { opacity: 1 },
              argo: { label: 'Argo CD · Synced', tone: 'ok' },
              gv: { tone: 'ok' },
            },
            'It applies the difference. Every change is **reviewed, versioned and reversible** with git revert.'
          ),
        ]),
      ]),
    }),
    beat('Now someone edits the cluster by hand.', undefined, {
      title: 'Drift gets undone',
      poke: poke('Press the button', [
        press('Edit the cluster by hand', [
          frame(
            0,
            { k2: { opacity: 0 }, k3: { opacity: 0 }, k4: { opacity: 0 } },
            'Someone runs **kubectl scale** and drops the live replicas to 2.'
          ),
          frame(
            1200,
            { argo: { label: 'Argo CD · OutOfSync', tone: 'warn' } },
            'Argo CD sees the **drift**: the cluster no longer matches git.'
          ),
          frame(
            2600,
            {
              k2: { opacity: 1 },
              k3: { opacity: 1 },
              k4: { opacity: 1 },
              argo: { label: 'Argo CD · Synced', tone: 'ok' },
            },
            'With **self-heal** on, it puts the cluster back. Live edits do not stick. **Fix the problem in git.**'
          ),
        ]),
      ]),
    }),
  ],
  210
);

// ---------------------------------------------------------------------------------------------
const nodeBox = (i: number) => [
  sBox(`u${i}`, { x: 12 + i * 110, y: 80, w: 100, h: 130, label: `NODE ${i + 1}` }),
  sTag(`uv${i}`, { parent: `u${i}`, x: 10, y: 30, w: 80, h: 22, label: 'v1.31' }),
  sPod(`up${i}`, { parent: `u${i}`, x: 22, y: 64, w: 56, h: 54, tone: 'accent' }),
  sCtr(`up${i}c`, { parent: `up${i}`, x: 15, y: 20, w: 26, h: 26, label: 'app', color: 'orange' }),
];
export const upgrade = scene(
  'k8s-11-2-s1',
  'Upgrade the cluster safely',
  [
    sBox('cp', { x: 10, y: 8, w: 320, h: 54, label: 'CONTROL PLANE' }),
    sTag('cpv', { parent: 'cp', x: 120, y: 24, w: 80, h: 22, label: 'v1.31' }),
    ...[0, 1, 2].flatMap(nodeBox),
    sTag('st', { x: 40, y: 222, w: 260, h: 26, label: 'cluster on 1.31', tone: 'ok' }),
  ],
  [
    beat(
      'Kubernetes ships a new minor version about every four months. You upgrade **one minor version at a time**: the **control plane first**, then the nodes.',
      show('cp', 'cpv', 'u0', 'u1', 'u2', 'st'),
      { title: 'Control plane first' }
    ),
    beat('Run the upgrade and watch what moves.', undefined, {
      title: 'Upgrade to 1.32',
      poke: poke('Press the button', [
        press('Upgrade to 1.32', [
          frame(
            0,
            {
              cp: { tone: 'accent' },
              cpv: { label: 'v1.32', tone: 'ok' },
              st: { label: 'control plane first', tone: 'accent' },
            },
            'The **control plane** upgrades first. Nodes may not be newer than it.'
          ),
          frame(
            1600,
            {
              u0: { tone: 'warn' },
              up0: { opacity: 0.3 },
              st: { label: 'node 1: cordon and drain' },
            },
            'Node 1 is **cordoned and drained**. A **PodDisruptionBudget** keeps enough pods up while they move.'
          ),
          frame(2800, {
            u0: { tone: 'ok' },
            uv0: { label: 'v1.32', tone: 'ok' },
            up0: { opacity: 1 },
          }),
          frame(3800, {
            u1: { tone: 'warn' },
            up1: { opacity: 0.3 },
            st: { label: 'node 2: cordon and drain' },
          }),
          frame(5000, {
            u1: { tone: 'ok' },
            uv1: { label: 'v1.32', tone: 'ok' },
            up1: { opacity: 1 },
          }),
          frame(6000, {
            u2: { tone: 'warn' },
            up2: { opacity: 0.3 },
            st: { label: 'node 3: cordon and drain' },
          }),
          frame(
            7200,
            {
              u2: { tone: 'ok' },
              uv2: { label: 'v1.32', tone: 'ok' },
              up2: { opacity: 1 },
              cp: { tone: 'ok' },
              st: { label: 'cluster on 1.32', tone: 'ok' },
            },
            'One node at a time, so the service never lost capacity. Always check for **removed APIs** and try it in **staging** first.'
          ),
        ]),
      ]),
    }),
  ],
  256
);
