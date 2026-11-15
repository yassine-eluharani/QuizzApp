import {
  beat,
  frame,
  poke,
  press,
  scene,
  sArrow,
  sBox,
  sCode,
  sTag,
  sUser,
  show,
} from '@/lib/learn/sceneDsl';
import { tapToLearn } from './scenes-common';

// ---------------------------------------------------------------------------------------------
const tryIt = (label: string, ok: boolean, hl: number[], note: string, caption: string) =>
  press(label, [
    frame(
      0,
      {
        res: { opacity: 1, tone: ok ? 'ok' : 'danger', label: note },
        api: { tone: ok ? 'ok' : 'danger' },
        rc: { hl },
      },
      caption
    ),
  ]);

export const rbac = scene(
  'k8s-7-1-s1',
  'RBAC: what may this pod do?',
  [
    sUser('sa', { x: 10, y: 110, w: 86, h: 28, label: 'checkout SA', color: 'paper' }),
    sArrow('a1', { x: 100, y: 118, w: 22, h: 12, dir: 'right' }),
    sBox('role', { x: 126, y: 40, w: 130, h: 150, label: 'ROLE config-reader' }),
    sCode('rc', {
      parent: 'role',
      x: 8,
      y: 36,
      w: 114,
      h: 54,
      lines: ['get configmaps', 'list configmaps'],
      fontSize: 9,
    }),
    sTag('api', { x: 266, y: 112, w: 64, h: 26, label: 'API' }),
    sTag('res', { x: 30, y: 218, w: 280, h: 30, label: '', tone: 'ok' }),
    sTag('adm', {
      x: 60,
      y: 258,
      w: 220,
      h: 28,
      label: 'cluster-admin: never on a pod',
      tone: 'danger',
    }),
  ],
  [
    beat(
      'A **ServiceAccount** is bound to a **Role**. The Role lists **verbs on resources**. Anything not listed is **forbidden**.',
      show('sa', 'a1', 'role', 'rc', 'api'),
      { title: 'Least privilege' }
    ),
    beat('Ask the API server for three things and see what it says.', undefined, {
      title: 'Try some requests',
      poke: poke(
        'Try all three',
        [
          tryIt(
            'Read a ConfigMap',
            true,
            [0],
            'allowed: get configmaps',
            'The Role has a rule for it. **Allowed.**'
          ),
          tryIt(
            'Delete a pod',
            false,
            [],
            'forbidden: no rule allows delete pods',
            'No rule mentions pods. **Forbidden.** Nothing is allowed unless a rule says so.'
          ),
          tryIt(
            'Read a Secret',
            false,
            [],
            'forbidden: no rule allows get secrets',
            'Secrets are not listed either. **Forbidden.** A compromised pod cannot read other secrets.'
          ),
        ],
        'all'
      ),
    }),
    beat(
      'Bind pods to **small, specific roles**. Never bind cluster-admin to a ServiceAccount a pod uses.',
      show('adm'),
      {
        title: 'Keep roles small',
      }
    ),
  ],
  296
);

// ---------------------------------------------------------------------------------------------
export const hardening = tapToLearn(
  'k8s-7-1-s2',
  'Harden the container',
  'A container is the last line of defence. These five settings take away what an attacker would need.',
  'Tap all five settings',
  [
    {
      label: 'runAsNonRoot: true',
      info: 'A process that is root inside the container is far more dangerous if it escapes. Run as a normal user.',
    },
    {
      label: 'readOnlyRootFilesystem: true',
      info: 'The app cannot write to its own filesystem, so an attacker cannot drop tools or change the code.',
    },
    {
      label: 'allowPrivilegeEscalation: false',
      info: 'Stops a process gaining more privileges than its parent, for example through setuid binaries.',
    },
    {
      label: 'capabilities: drop ALL',
      info: 'Linux splits root power into capabilities. Drop them all and add back only what the app needs.',
    },
    {
      label: 'seccompProfile: RuntimeDefault',
      info: 'Filters risky system calls, so a compromised container has far less to work with.',
    },
  ]
);

// ---------------------------------------------------------------------------------------------
export const netpol = scene(
  'k8s-7-2-s1',
  'NetworkPolicies close the doors',
  [
    sTag('ing', { x: 130, y: 8, w: 80, h: 26, label: 'ingress' }),
    sArrow('a1', { x: 165, y: 38, w: 10, h: 58, dir: 'down' }),
    sTag('cart', { x: 10, y: 100, w: 80, h: 28, label: 'cart' }),
    sTag('co', { x: 130, y: 100, w: 80, h: 28, label: 'checkout', tone: 'accent' }),
    sTag('pay', { x: 250, y: 100, w: 80, h: 28, label: 'payments' }),
    sArrow('a2', { x: 94, y: 108, w: 32, h: 12, dir: 'right' }),
    sArrow('a3', { x: 214, y: 108, w: 32, h: 12, dir: 'right' }),
    sTag('pol', {
      x: 30,
      y: 170,
      w: 280,
      h: 28,
      label: 'NetworkPolicy: none · everything allowed',
      tone: 'warn',
    }),
  ],
  [
    beat(
      'By default **every pod can talk to every pod**. A NetworkPolicy changes that, if your network plugin enforces it.',
      show('ing', 'a1', 'cart', 'co', 'pay', 'a2', 'a3', 'pol'),
      { title: 'Default: open' }
    ),
    beat(
      'Apply the standard approach: deny everything, then allow only what is needed.',
      undefined,
      {
        title: 'Deny, then allow',
        poke: poke(
          'Press all three, in order',
          [
            press('1 · Default deny', [
              frame(
                0,
                {
                  a1: { tone: 'danger' },
                  a2: { tone: 'danger' },
                  a3: { tone: 'danger' },
                  pol: { label: 'default deny · everything blocked', tone: 'ok' },
                },
                '**Default deny**: every connection is blocked, including the legitimate ones.'
              ),
            ]),
            press('2 · Allow ingress to checkout', [
              frame(
                0,
                { a1: { tone: 'ok' }, pol: { label: 'allow: ingress → checkout' } },
                'Now the ingress controller **may** reach checkout, and nothing else may.'
              ),
            ]),
            press('3 · Allow checkout to payments', [
              frame(
                0,
                { a3: { tone: 'ok' }, pol: { label: 'allow: checkout → payments' } },
                'Checkout may call payments. **cart cannot reach checkout directly**, because nobody allowed it. Remember DNS if you restrict egress.'
              ),
            ]),
          ],
          'all'
        ),
      }
    ),
  ],
  216
);
