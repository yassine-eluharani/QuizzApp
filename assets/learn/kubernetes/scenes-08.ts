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
import { mini, tapToLearn } from './scenes-common';

// ---------------------------------------------------------------------------------------------
export const metrics = scene(
  'k8s-8-1-s1',
  'Metrics, dashboards and alerts',
  [
    ...mini('m1', 10, 20),
    ...mini('m2', 10, 100),
    sTag('mt1', { x: 70, y: 38, w: 70, h: 20, label: '/metrics' }),
    sTag('mt2', { x: 70, y: 118, w: 70, h: 20, label: '/metrics' }),
    sBox('prom', { x: 150, y: 20, w: 90, h: 120, label: 'PROMETHEUS' }),
    sBar('err', { parent: 'prom', x: 10, y: 56, w: 70, h: 12 }),
    sText('errt', { parent: 'prom', x: 10, y: 74, w: 70, label: 'error rate', fontSize: 8.5 }),
    sArrow('ar1', { x: 142, y: 40, w: 8, h: 12, dir: 'right' }),
    sTag('graf', { x: 256, y: 20, w: 78, h: 26, label: 'Grafana' }),
    sTag('am', { x: 256, y: 96, w: 78, h: 26, label: 'Alertmanager' }),
    sArrow('ar2', { x: 244, y: 28, w: 10, h: 12, dir: 'right' }),
    sArrow('ar3', { x: 244, y: 104, w: 10, h: 12, dir: 'right' }),
    sArrow('ar4', { x: 290, y: 124, w: 10, h: 44, dir: 'down' }),
    sTag('page', { x: 226, y: 172, w: 108, h: 28, label: 'on-call phone', tone: 'dim' }),
  ],
  [
    beat(
      'Pods expose numbers at **/metrics**. **Prometheus** scrapes them on an interval and stores them. **Grafana** draws them, **Alertmanager** tells people.',
      all(
        show('m1', 'm2', 'mt1', 'mt2', 'prom', 'ar1', 'graf', 'am', 'ar2', 'ar3', 'ar4', 'page'),
        { err: { fill: 0.05 } }
      ),
      { title: 'The pipeline' }
    ),
    beat('Make the service fail and follow the signal to a human.', undefined, {
      title: 'Follow the alert',
      poke: poke('Press the button', [
        press('Make errors spike', [
          frame(0, { err: { fill: 0.35, tone: 'warn' } }, 'The error rate starts to climb.'),
          frame(
            1300,
            { err: { fill: 0.9, tone: 'danger' }, prom: { tone: 'danger' } },
            'A Prometheus **alert rule** sees it stay high for a few minutes.'
          ),
          frame(
            2600,
            { am: { tone: 'accent', label: 'alert firing' } },
            '**Alertmanager** groups it with related alerts and routes it.'
          ),
          frame(
            3800,
            { page: { tone: 'danger', label: 'PAGED' } },
            'Someone is **paged**. Alert on what users feel (errors, latency), not on every cause.'
          ),
        ]),
      ]),
    }),
  ],
  214
);

// ---------------------------------------------------------------------------------------------
export const slo = scene(
  'k8s-8-2-s1',
  'The error budget',
  [
    sText('t1', {
      x: 20,
      y: 8,
      w: 300,
      label: 'error budget left (99.9% over 30 days = 43 minutes)',
      fontSize: 9,
    }),
    sBar('bud', { x: 20, y: 26, w: 300, h: 16 }),
    sTag('burn', { x: 20, y: 64, w: 300, h: 26, label: 'burn rate: normal', tone: 'ok' }),
    sTag('pg', { x: 20, y: 104, w: 300, h: 26, label: 'no page', tone: 'dim' }),
  ],
  [
    beat(
      'An **SLO** is a promise in numbers. 99.9% leaves a small **error budget** of failures you may spend. You page on **how fast it burns**.',
      all(show('t1', 'bud', 'burn', 'pg'), { bud: { fill: 1, tone: 'ok' } }),
      { title: 'A promise with a budget' }
    ),
    beat('Cause two different failures and see which one pages someone.', undefined, {
      title: 'Spend the budget',
      poke: poke(
        'Try both',
        [
          press('A short blip', [
            frame(
              0,
              {
                bud: { fill: 0.94, tone: 'ok' },
                burn: { label: 'burn rate: 2x', tone: 'warn' },
                pg: { label: 'no page: budget is fine', tone: 'ok' },
              },
              'A brief blip barely touches the budget. **No page.** Waking someone for this would be noise.'
            ),
          ]),
          press('A real outage', [
            frame(
              0,
              {
                bud: { fill: 0.4, tone: 'danger' },
                burn: { label: 'burn rate: 14x', tone: 'danger' },
                pg: { label: 'PAGE: budget gone in about 2 hours', tone: 'danger' },
              },
              'At this speed the month’s budget is gone in hours. **Page.** That is the alert users care about.'
            ),
          ]),
        ],
        'all'
      ),
    }),
  ],
  146
);

// ---------------------------------------------------------------------------------------------
const spans = [
  ['checkout', 100, 230],
  ['cart', 102, 10],
  ['catalog', 114, 22],
  ['payments', 138, 190],
  ['fraud-service', 142, 184],
] as const;
export const trace = scene(
  'k8s-8-2-s2',
  'A trace shows where the time goes',
  [
    ...spans.map(([name], i) =>
      sText(`tl${i}`, { x: 10, y: 22 + i * 30, w: 90, label: name, fontSize: 10 })
    ),
    ...spans.map(([, x, w], i) =>
      sBox(`t${i}`, {
        x,
        y: 18 + i * 30,
        w,
        h: 22,
        tone: i === 4 ? 'danger' : i === 3 ? 'warn' : 'normal',
      })
    ),
  ],
  [
    beat(
      'A **trace** follows one request across services. Each bar is a **span**: the longer the bar, the slower the step.',
      show('tl0', 'tl1', 'tl2', 'tl3', 'tl4', 't0'),
      { title: 'One request, many services' }
    ),
    beat('Latency is high. Open a slow trace.', undefined, {
      title: 'Find the slow step',
      poke: poke('Press the button', [
        press('Open the slow trace', [
          frame(0, { t1: { opacity: 1 } }, '**cart** answers in 12 ms.'),
          frame(900, { t2: { opacity: 1 } }, '**catalog** takes 40 ms.'),
          frame(
            1800,
            { t3: { opacity: 1 } },
            '**payments** takes 4.0 seconds. That is the slow part.'
          ),
          frame(
            2800,
            { t4: { opacity: 1 } },
            'And almost all of it is **fraud-service** (3.9 s). Found in seconds, without guessing or restarting anything.'
          ),
        ]),
      ]),
    }),
  ],
  176
);

// ---------------------------------------------------------------------------------------------
export const evidence = tapToLearn(
  'k8s-8-1-s0',
  'Four kinds of evidence',
  'When something is wrong you look at four kinds of evidence. Each answers a different question.',
  'Tap all four',
  [
    {
      label: 'Logs',
      info: 'What happened inside one container. kubectl logs reads the latest; add --previous after a crash. Log structured JSON with a request id, and never log secrets.',
    },
    {
      label: 'Events',
      info: 'The cluster\u2019s own diary: scheduling, probes, evictions. kubectl get events. They expire after about an hour.',
    },
    {
      label: 'Metrics',
      info: 'Numbers over time: request rate, errors, latency, CPU, memory. Prometheus scrapes them, Grafana draws them.',
    },
    {
      label: 'Traces',
      info: 'The story of one request across services, showing which step was slow.',
    },
  ]
);
