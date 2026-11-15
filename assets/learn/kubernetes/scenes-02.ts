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
  sDot,
  sTag,
  sUser,
  show,
  tap,
} from '@/lib/learn/sceneDsl';
import { mini, tagged } from './scenes-common';

// ---------------------------------------------------------------------------------------------
const ips = ['10.244.1.7', '10.244.2.4', '10.244.3.9'];
export const serviceStable = scene(
  'k8s-2-1-s1',
  'A Service gives pods a stable address',
  [
    sUser('cart', { x: 125, y: 8, w: 90, h: 28, label: 'cart calls', color: 'paper' }),
    sArrow('a0', { x: 165, y: 38, w: 10, h: 22, dir: 'down' }),
    sBox('svc', { x: 20, y: 62, w: 300, h: 56, label: 'SERVICE checkout', tone: 'normal' }),
    sTag('svcip', {
      parent: 'svc',
      x: 70,
      y: 24,
      w: 160,
      h: 24,
      label: '10.96.41.12 · stable',
      tone: 'ok',
    }),
    ...[0, 1, 2].map((i) =>
      sArrow(`f${i}`, { x: 51 + i * 114, y: 122, w: 10, h: 60, dir: 'down' })
    ),
    ...[0, 1, 2].flatMap((i) => tagged(`p${i}`, 18 + i * 114, 190, ips[i])),
  ],
  [
    beat(
      'Every pod has its own IP, and it changes whenever a pod is replaced. Nothing should call a pod IP directly.',
      all(show('cart', 'a0', 'p0', 'p1', 'p2'), hide('svc', 'svcip', 'f0', 'f1', 'f2')),
      { title: 'Pod IPs come and go' }
    ),
    beat(
      'A **Service** is a stable name and IP in front of a set of pods. Callers use it, and it spreads requests across the pods behind it.',
      all(show('svc', 'f0', 'f1', 'f2'), { svc: { tone: 'accent' } }),
      { title: 'A stable front' }
    ),
    beat('Replace a pod and watch what the caller sees.', undefined, {
      title: 'Replace a pod',
      poke: poke(
        'Tap a pod to replace it',
        [0, 1, 2].map((i) =>
          tap(`p${i}`, [
            frame(
              0,
              {
                [`p${i}`]: { tone: 'danger', opacity: 0.3 },
                [`p${i}t`]: { label: 'gone', tone: 'danger' },
                [`f${i}`]: { tone: 'dim' },
              },
              'The pod dies. The Service stops sending it traffic.'
            ),
            frame(
              1200,
              {
                [`p${i}`]: { tone: 'accent', opacity: 1 },
                [`p${i}t`]: { label: `10.244.${i + 4}.31`, tone: 'ok' },
                [`f${i}`]: { tone: 'normal' },
              },
              'The new pod has a **new IP**. The Service IP never changed, so **cart keeps working**.'
            ),
          ])
        )
      ),
    }),
  ],
  290
);

// ---------------------------------------------------------------------------------------------
export const ingressFlow = scene(
  'k8s-2-2-s1',
  'One front door',
  [
    sUser('user', { x: 10, y: 12, w: 76, h: 28, label: 'customer', color: 'paper' }),
    sArrow('a0', { x: 90, y: 20, w: 28, h: 12, dir: 'right' }),
    sTag('lb', { x: 122, y: 12, w: 150, h: 28, label: 'cloud load balancer' }),
    sArrow('a1', { x: 190, y: 44, w: 10, h: 26, dir: 'down' }),
    sBox('ing', { x: 20, y: 74, w: 300, h: 72, label: 'INGRESS CONTROLLER' }),
    sTag('r1', { parent: 'ing', x: 10, y: 34, w: 136, h: 26, label: '/checkout → checkout' }),
    sTag('r2', { parent: 'ing', x: 154, y: 34, w: 136, h: 26, label: '/cart → cart' }),
    sArrow('a2', { x: 90, y: 150, w: 10, h: 34, dir: 'down' }),
    sArrow('a3', { x: 240, y: 150, w: 10, h: 34, dir: 'down' }),
    sTag('s1', { x: 40, y: 188, w: 120, h: 28, label: 'Service checkout' }),
    sTag('s2', { x: 180, y: 188, w: 120, h: 28, label: 'Service cart' }),
    sArrow('a4', { x: 90, y: 220, w: 10, h: 26, dir: 'down' }),
    sArrow('a5', { x: 240, y: 220, w: 10, h: 26, dir: 'down' }),
    ...mini('c1', 67, 250),
    ...mini('c2', 217, 250),
    sDot('pk', { x: 94, y: 22, w: 10, h: 10, color: 'teal' }),
  ],
  [
    beat(
      'One public entry point for many services. The **ingress controller** reads routing rules and forwards by host and path.',
      show(
        'user',
        'a0',
        'lb',
        'a1',
        'ing',
        'r1',
        'r2',
        'a2',
        'a3',
        's1',
        's2',
        'a4',
        'a5',
        'c1',
        'c2'
      ),
      { title: 'One public IP, many services' }
    ),
    beat('Send a request to each path and follow it.', undefined, {
      title: 'Follow a request',
      poke: poke(
        'Try both buttons',
        [
          press('Request /checkout', [
            frame(
              0,
              { pk: { opacity: 1, x: 190, y: 22 } },
              'The request reaches the **load balancer**.'
            ),
            frame(
              900,
              { pk: { x: 186, y: 94 }, r1: { tone: 'accent' } },
              'The ingress matches the **/checkout** rule.'
            ),
            frame(
              1800,
              { pk: { x: 94, y: 196 }, r1: { tone: 'normal' }, s1: { tone: 'accent' } },
              'It goes to **Service checkout**.'
            ),
            frame(
              2700,
              { pk: { x: 94, y: 268 }, s1: { tone: 'normal' }, c1: { tone: 'ok' } },
              'And lands on a ready checkout pod.'
            ),
            frame(3700, { pk: { opacity: 0 }, c1: { tone: 'accent' } }),
          ]),
          press('Request /cart', [
            frame(
              0,
              { pk: { opacity: 1, x: 190, y: 22 } },
              'The request reaches the **load balancer**.'
            ),
            frame(
              900,
              { pk: { x: 186, y: 94 }, r2: { tone: 'accent' } },
              'The ingress matches the **/cart** rule.'
            ),
            frame(
              1800,
              { pk: { x: 244, y: 196 }, r2: { tone: 'normal' }, s2: { tone: 'accent' } },
              'It goes to **Service cart**.'
            ),
            frame(
              2700,
              { pk: { x: 244, y: 268 }, s2: { tone: 'normal' }, c2: { tone: 'ok' } },
              'And lands on a ready cart pod.'
            ),
            frame(3700, { pk: { opacity: 0 }, c2: { tone: 'accent' } }),
          ]),
        ],
        'all'
      ),
    }),
    beat(
      'TLS is terminated here too: **cert-manager** can request and renew the certificate for you. Without a controller installed, an Ingress object does nothing.',
      undefined,
      { title: 'Certificates live at the door' }
    ),
  ],
  316
);

// ---------------------------------------------------------------------------------------------
export const badGateway = scene(
  'k8s-2-2-s2',
  'Why a 502?',
  [
    sTag('ing', { x: 110, y: 10, w: 120, h: 28, label: 'ingress', tone: 'accent' }),
    sTag('res', { x: 230, y: 10, w: 100, h: 28, label: '200 OK', tone: 'ok' }),
    sArrow('a1', { x: 165, y: 40, w: 10, h: 24, dir: 'down' }),
    sTag('svc', { x: 50, y: 68, w: 240, h: 28, label: 'Service · selector app=checkout' }),
    sTag('ep', { x: 90, y: 112, w: 160, h: 24, label: 'endpoints: 2 pods', tone: 'ok' }),
    sArrow('a2', { x: 165, y: 140, w: 10, h: 26, dir: 'down' }),
    ...tagged('b1', 60, 174, 'app=checkout'),
    ...tagged('b2', 200, 174, 'app=checkout'),
  ],
  [
    beat(
      'The ingress sends requests to the Service, and the Service sends them to pods that match its **selector** and are **Ready**.',
      show('ing', 'res', 'a1', 'svc', 'ep', 'a2', 'b1', 'b2'),
      { title: 'The path of a request' }
    ),
    beat('Break the match and see what the ingress returns.', undefined, {
      title: 'Break the selector',
      poke: poke(
        'Try both buttons',
        [
          press('Typo in the selector', [
            frame(
              0,
              { svc: { label: 'Service · selector app=checkout-api', tone: 'warn' } },
              'Someone mistypes the Service selector.'
            ),
            frame(
              1000,
              {
                ep: { label: 'endpoints: none', tone: 'danger' },
                b1: { tone: 'dim' },
                b2: { tone: 'dim' },
                a2: { tone: 'danger' },
              },
              'No pod matches, so the Service has **no endpoints**.'
            ),
            frame(
              2000,
              { res: { label: '502 Bad Gateway', tone: 'danger' }, ing: { tone: 'danger' } },
              'The ingress has nowhere to send the request: **502**. The pods themselves are perfectly healthy.'
            ),
          ]),
          press('Fix the selector', [
            frame(
              0,
              { svc: { label: 'Service · selector app=checkout', tone: 'normal' } },
              'You correct the selector.'
            ),
            frame(
              900,
              {
                ep: { label: 'endpoints: 2 pods', tone: 'ok' },
                b1: { tone: 'accent' },
                b2: { tone: 'accent' },
                a2: { tone: 'normal' },
                res: { label: '200 OK', tone: 'ok' },
                ing: { tone: 'accent' },
              },
              'Endpoints return and requests flow again. A 502 usually means: look **downstream** of the ingress.'
            ),
          ]),
        ],
        'all'
      ),
    }),
  ],
  270
);
