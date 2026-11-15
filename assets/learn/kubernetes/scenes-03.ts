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
} from '@/lib/learn/sceneDsl';
import { mini } from './scenes-common';

// ---------------------------------------------------------------------------------------------
export const configEnv = scene(
  'k8s-3-1-s1',
  'One image, many environments',
  [
    sCtr('img', { x: 105, y: 8, w: 130, h: 28, label: 'checkout:1.4.2', color: 'orange' }),
    sArrow('f1', { x: 80, y: 38, w: 10, h: 22, dir: 'down' }),
    sArrow('f2', { x: 250, y: 38, w: 10, h: 22, dir: 'down' }),
    sBox('stg', { x: 10, y: 62, w: 150, h: 170, label: 'STAGING' }),
    sTag('stgcm', { parent: 'stg', x: 10, y: 30, w: 130, h: 22, label: 'LOG_LEVEL=debug' }),
    ...mini('sp', 47, 62, 'stg'),
    sTag('stgp', {
      parent: 'stg',
      x: 10,
      y: 128,
      w: 130,
      h: 22,
      label: 'pod sees: debug',
      tone: 'ok',
    }),
    sBox('prd', { x: 180, y: 62, w: 150, h: 170, label: 'PRODUCTION' }),
    sTag('prdcm', { parent: 'prd', x: 10, y: 30, w: 130, h: 22, label: 'LOG_LEVEL=info' }),
    ...mini('pp', 47, 62, 'prd'),
    sTag('prdp', {
      parent: 'prd',
      x: 10,
      y: 128,
      w: 130,
      h: 22,
      label: 'pod sees: info',
      tone: 'ok',
    }),
  ],
  [
    beat(
      'The **same image** runs everywhere. What differs (log level, URLs, flags) lives in a **ConfigMap**, outside the image.',
      show('img', 'f1', 'f2', 'stg', 'prd'),
      { title: 'Config lives outside the image' }
    ),
    beat('Change the production ConfigMap and watch the running pod.', undefined, {
      title: 'Change the config',
      poke: poke('Press the button', [
        press('Set production to debug', [
          frame(
            0,
            { prdcm: { label: 'LOG_LEVEL=debug', tone: 'warn' } },
            'You change the ConfigMap in production.'
          ),
          frame(
            1400,
            {},
            'But the running pod **still says info**. Environment variables are read **once, at start**.'
          ),
          frame(
            3200,
            {
              pp: { tone: 'danger', opacity: 0.3 },
              prdp: { label: 'restarting...', tone: 'warn' },
            },
            'A rollout restart replaces the pod...'
          ),
          frame(
            4400,
            {
              pp: { tone: 'accent', opacity: 1 },
              prdp: { label: 'pod sees: debug', tone: 'ok' },
              prdcm: { tone: 'normal' },
            },
            'The new pod reads the new value. **Treat a config change like a release**: roll the pods.'
          ),
        ]),
      ]),
    }),
  ],
  250
);

// ---------------------------------------------------------------------------------------------
export const secretEncoded = scene(
  'k8s-3-1-s2',
  'Encoded is not encrypted',
  [
    sBox('sec', { x: 20, y: 20, w: 300, h: 86, label: 'SECRET stripe-key' }),
    sTag('val', { parent: 'sec', x: 14, y: 40, w: 272, h: 30, label: 'c2tfdGVzdF81MU1leGFtcGxl' }),
    sArrow('ar', { x: 165, y: 110, w: 10, h: 26, dir: 'down' }),
    sTag('dec', { x: 20, y: 140, w: 300, h: 30, label: 'sk_test_51Mexample', tone: 'danger' }),
    sTag('g1', { x: 20, y: 190, w: 92, h: 28, label: 'RBAC', tone: 'ok' }),
    sTag('g2', { x: 124, y: 190, w: 92, h: 28, label: 'encrypt etcd', tone: 'ok' }),
    sTag('g3', { x: 228, y: 190, w: 92, h: 28, label: 'not in git', tone: 'ok' }),
  ],
  [
    beat('A Secret looks safe, but its values are only **base64 encoded**.', show('sec', 'val'), {
      title: 'A Secret',
    }),
    beat('Anyone who can read the object can reverse it. Try it.', undefined, {
      title: 'Decode it',
      poke: poke('Press the button', [
        press('Decode it', [
          frame(
            0,
            { val: { tone: 'warn' }, ar: { opacity: 1, tone: 'accent' } },
            'One command: **base64 -d**.'
          ),
          frame(
            900,
            { dec: { opacity: 1 } },
            'The key is in plain text. **base64 is an encoding, not encryption.**'
          ),
        ]),
      ]),
    }),
    beat(
      'So protect Secrets with **RBAC** (who may read them), **encryption at rest** for etcd, and never commit them to git.',
      show('g1', 'g2', 'g3'),
      { title: 'What actually protects it' }
    ),
  ],
  240
);

// ---------------------------------------------------------------------------------------------
export const rotation = scene(
  'k8s-3-2-s1',
  'Rotating a secret without downtime',
  [
    sBox('vault', { x: 10, y: 10, w: 100, h: 76, label: 'VAULT' }),
    sTag('vk', { parent: 'vault', x: 8, y: 36, w: 84, h: 26, label: 'key v1', tone: 'ok' }),
    sArrow('a1', { x: 114, y: 38, w: 28, h: 12, dir: 'right' }),
    sTag('op', { x: 146, y: 32, w: 90, h: 26, label: 'sync operator', tone: 'dim' }),
    sArrow('a2', { x: 240, y: 38, w: 12, h: 12, dir: 'right' }),
    sBox('ks', { x: 256, y: 10, w: 76, h: 76, label: 'SECRET' }),
    sTag('kk', { parent: 'ks', x: 6, y: 36, w: 64, h: 26, label: 'v1', tone: 'ok' }),
    ...[0, 1].flatMap((i) => [
      sPod(`rp${i}`, { x: 76 + i * 110, y: 130, w: 80, h: 72, tone: 'accent' }),
      sCtr(`rp${i}c`, {
        parent: `rp${i}`,
        x: 27,
        y: 8,
        w: 26,
        h: 26,
        label: 'app',
        color: 'orange',
      }),
      sTag(`rp${i}t`, {
        parent: `rp${i}`,
        x: 4,
        y: 44,
        w: 72,
        h: 20,
        label: 'uses v1',
        tone: 'ok',
      }),
    ]),
    sTag('st', { x: 60, y: 224, w: 220, h: 26, label: 'valid keys: v1', tone: 'ok' }),
  ],
  [
    beat(
      'Secrets live in a **vault**. An **operator** copies them into the cluster, and pods read them from there.',
      show('vault', 'a1', 'op', 'a2', 'ks', 'rp0', 'rp1', 'st'),
      { title: 'The source of truth is outside the cluster' }
    ),
    beat('Rotate the key and watch for any moment with no valid key.', undefined, {
      title: 'Rotate it',
      poke: poke('Press the button', [
        press('Rotate the key', [
          frame(
            0,
            {
              vk: { label: 'v1 + v2', tone: 'accent' },
              st: { label: 'valid keys: v1, v2', tone: 'ok' },
            },
            '**Create v2** and keep v1 valid. Both work for now.'
          ),
          frame(
            1400,
            { op: { tone: 'accent' }, kk: { label: 'v2', tone: 'accent' } },
            'The operator **syncs v2** into the cluster Secret.'
          ),
          frame(
            2800,
            {
              rp0t: { label: 'uses v2', tone: 'accent' },
              rp1t: { label: 'uses v2', tone: 'accent' },
              op: { tone: 'dim' },
            },
            'The pods **reload** (a file re-read or a rollout restart) and use v2.'
          ),
          frame(
            4200,
            {
              vk: { label: 'v2 only', tone: 'ok' },
              st: { label: 'valid keys: v2', tone: 'ok' },
              rp0t: { tone: 'ok' },
              rp1t: { tone: 'ok' },
              kk: { tone: 'ok' },
            },
            'Only **now** revoke v1. There was never a moment with no valid key.'
          ),
        ]),
      ]),
    }),
  ],
  270
);
