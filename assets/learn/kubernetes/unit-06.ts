import {
  box,
  choice,
  cmd,
  diagram,
  fill,
  gap,
  lesson,
  order,
  spot,
  terminal,
  triage,
  unit,
} from '@/lib/learn/dsl';
import { badRollout, canary, rolling } from './scenes-06';

export const unit6 = unit({
  id: 'k8s-u6',
  title: 'Zero-downtime releases',
  blurb:
    'Ship new versions of checkout in the middle of the day without anyone noticing. Rolling updates, rollbacks and canaries.',
  icon: 'rocket',
  badge: { id: 'badge-smooth-release', title: 'Smooth release' },
  lessons: [
    lesson('k8s-6-1', 'Rolling updates and rollbacks', [
      rolling,
      fill(
        'k8s-6-1-b',
        'Tune the rollout',
        'Roll out checkout so capacity never drops below three pods.',
        `strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: [[surge]]
    maxUnavailable: [[unavail]]
minReadySeconds: [[min]]`,
        {
          surge: [
            '1',
            'One extra pod at a time keeps the cluster cost and the blast radius small.',
          ],
          unavail: [
            '0',
            'Never remove a working pod before its replacement is Ready, so capacity does not drop.',
          ],
          min: [
            '10',
            'A pod must stay Ready for 10 seconds before it counts, which catches pods that crash right after starting.',
          ],
        },
        ['3', '50%', '5']
      ),
      order(
        'k8s-6-1-c',
        'Inside a rolling update',
        'Order what the Deployment controller does.',
        [
          'A new ReplicaSet is created and scales up by maxSurge',
          'The new pod passes its readiness probe',
          'The old ReplicaSet scales down by one',
          'Repeat until the new ReplicaSet has every replica',
          'The old ReplicaSet stays at zero so a rollback is instant',
        ],
        'The cycle is surge, wait for Ready, retire one old pod. Keeping the old ReplicaSet around is what makes kubectl rollout undo fast.'
      ),
      badRollout,
      spot(
        'k8s-6-1-d',
        'Which settings cause downtime?',
        'Tap what would drop traffic during a release.',
        `
strategy:
  type: Recreate
containers:
  - name: checkout
    image: shop/checkout:1.5.0
    # no readinessProbe`,
        {
          1: 'Recreate stops every old pod before starting new ones, so there is a gap with zero pods.',
          5: 'Without a readiness probe a pod counts as available the moment it starts, so traffic reaches cold or broken pods.',
        }
      ),
      terminal(
        'k8s-6-1-e',
        'Roll out 1.5.0',
        'Deploy checkout 1.5.0 and wait for the rollout to finish.',
        'Update the image, then watch the rollout complete.',
        [
          'kubectl set image deployment/checkout checkout=shop/checkout:1.5.0 -n shop',
          'kubectl rollout status deployment/checkout -n shop',
        ],
        [
          cmd(
            '^set image deploy(ment)?[ /]checkout checkout=shop/checkout:1\\.5\\.0$',
            'deployment.apps/checkout image updated'
          ),
          cmd(
            '^rollout status deploy(ment)?[ /]checkout$',
            `Waiting for deployment "checkout" rollout to finish: 1 out of 3 new replicas have been updated...
Waiting for deployment "checkout" rollout to finish: 2 out of 3 new replicas have been updated...
Waiting for deployment "checkout" rollout to finish: 1 old replicas are pending termination...
deployment "checkout" successfully rolled out`,
            { goal: true }
          ),
        ]
      ),
      terminal(
        'k8s-6-1-f',
        'Roll it back',
        '1.5.0 is returning 500 errors on checkout. Get back to the last good version now.',
        'Roll the Deployment back to the previous revision.',
        [
          'kubectl rollout history deployment/checkout -n shop',
          'kubectl rollout undo deployment/checkout -n shop',
        ],
        [
          cmd(
            '^rollout history deploy(ment)?[ /]checkout$',
            `REVISION  CHANGE-CAUSE
6         checkout 1.4.1
7         checkout 1.4.2
8         checkout 1.5.0`
          ),
          cmd(
            '^rollout undo deploy(ment)?[ /]checkout$',
            'deployment.apps/checkout rolled back\nNew pods start from revision 7 (1.4.2). Errors stop within a minute.',
            { goal: true }
          ),
          cmd('^delete deploy', '', {
            mistake:
              'Deleting the Deployment is an outage. Use rollout undo to restore the previous ReplicaSet.',
          }),
        ]
      ),
      spot(
        'k8s-6-1-g',
        'What a rollback does not undo',
        'Plan the rollback of 1.5.0. Tap what undo will not fix.',
        `
1.5.0 changes:
  - new column orders.discount_code (migration ran at deploy)
  - checkout now writes discount_code
  - ConfigMap: PAYMENTS_TIMEOUT 3s -> 10s
undo plan: kubectl rollout undo deployment/checkout`,
        {
          1: 'A database migration is not reverted by undo. The old code must tolerate the new column (expand, then contract).',
          3: 'rollout undo restores the pod template only. The ConfigMap change stays unless you revert it too.',
        }
      ),
    ]),

    lesson('k8s-6-2', 'Canary releases', [
      canary,
      diagram(
        'k8s-6-2-b',
        'Split the traffic',
        'Send most traffic to stable and a little to the canary.',
        [
          [box('i', 'Ingress or service mesh')],
          [
            gap('s1', '95%', 'Most users stay on the proven version.', 'to stable'),
            gap('s2', '5%', 'A small blast radius while you watch the metrics.', 'to canary'),
          ],
          [box('a', 'checkout 1.4.2 (stable)'), box('b', 'checkout 1.5.0 (canary)')],
        ],
        ['50%', '100%']
      ),
      fill(
        'k8s-6-2-c',
        'Script the canary',
        'Argo Rollouts: 5%, wait, 25%, wait, then continue.',
        `strategy:
  canary:
    steps:
      - setWeight: [[w1]]
      - pause: { duration: [[p1]] }
      - setWeight: [[w2]]
      - pause: { duration: 10m }`,
        {
          w1: ['5', 'Start small so a bad version hurts few customers.'],
          p1: ['5m', 'Long enough for the error rate and latency to show up in the metrics.'],
          w2: ['25', 'Widen gradually. Jumping straight to 100 defeats the canary.'],
        },
        ['50', '30s', '100']
      ),
      spot(
        'k8s-6-2-d',
        'A weak canary',
        'Tap the settings that make this canary unsafe.',
        `
canary:
  steps:
    - setWeight: 50
    - pause: {}
    - setWeight: 100
analysis: none`,
        {
          2: 'Half of all traffic as the first step is not a canary. A bad version hurts half your customers at once.',
          5: 'No automated analysis means nobody checks the metrics unless a human remembers to.',
        }
      ),
      triage(
        'k8s-6-2-e',
        'The canary looks bad',
        'The 5% canary of checkout 1.5.0 has been live for four minutes.',
        1,
        {
          start: {
            output: `error rate   stable 0.2%   canary 4.1%
p99 latency  stable 380ms  canary 1.9s`,
            question: 'What do you do?',
            choices: [
              choice(
                'kubectl argo rollouts abort checkout -n shop',
                'Send all traffic back to stable',
                'fixed',
                true,
                1
              ),
              choice(
                'kubectl argo rollouts promote checkout --full -n shop',
                'Ship it anyway',
                'promoted',
                false,
                15
              ),
              choice(
                'Wait another ten minutes for more data',
                'Collect more evidence',
                'waited',
                false,
                5
              ),
            ],
          },
          promoted: {
            output:
              'The bad version now serves 100% of traffic. Error rate 4.1% for every customer.',
            question: 'Undo the damage.',
            choices: [
              choice(
                'kubectl argo rollouts undo checkout -n shop',
                'Roll back to the previous revision',
                'fixed',
                true,
                3
              ),
              choice('Wait for it to settle', 'Hope', 'promoted', false, 5),
            ],
          },
          waited: {
            output:
              'Ten more minutes of 5% of customers seeing errors. The numbers are the same, just older.',
            question: 'The data was already clear.',
            choices: [
              choice('kubectl argo rollouts abort checkout -n shop', 'Abort now', 'fixed', true, 1),
              choice('Wait another ten minutes', 'Still waiting', 'waited', false, 5),
            ],
          },
          fixed: {
            output: 'Rollout aborted. 100% of traffic is back on 1.4.2. Error rate 0.2%.',
            end: {
              rootCause:
                'Checkout 1.5.0 has a regression that raises errors and latency. The canary exposed it to 5% of traffic.',
              fix: 'Abort the rollout so traffic returns to stable, then fix the bug and release a new version.',
              lesson:
                'A canary is only useful if you act on it. Define the abort criteria in advance and abort quickly when they are met.',
            },
          },
        }
      ),
    ]),

    lesson(
      'k8s-6-3',
      'Boss: release at peak hours',
      [
        fill(
          'k8s-6-3-a',
          'Make a rollout observable',
          'Set the knobs that make a bad rollout fail loudly.',
          `spec:
  progressDeadlineSeconds: [[pd]]
  revisionHistoryLimit: [[rh]]
  minReadySeconds: [[mr]]`,
          {
            pd: [
              '300',
              'If a rollout makes no progress for 5 minutes it is marked failed, so CI and alerts can react.',
            ],
            rh: [
              '10',
              'Keeps old ReplicaSets so there is something to roll back to. 0 would disable rollbacks.',
            ],
            mr: [
              '15',
              'A new pod must stay Ready for 15 seconds before it counts, catching instant crashes.',
            ],
          },
          ['0', '5', '1']
        ),
        triage(
          'k8s-6-3-b',
          'Stuck rollout',
          'The 1.5.0 rollout has been stuck at 1 of 3 new replicas for eight minutes. It is peak hour.',
          2,
          {
            start: {
              output: `Waiting for deployment "checkout" rollout to finish: 1 out of 3 new replicas have been updated...`,
              question: 'Customers are fine so far. First move?',
              choices: [
                choice(
                  'kubectl get pods -n shop',
                  'See which pods are old and which are new',
                  'pods',
                  true,
                  1
                ),
                choice(
                  'kubectl delete pod -l app=checkout -n shop',
                  'Force a fresh start',
                  'killall',
                  false,
                  6
                ),
                choice(
                  'kubectl rollout restart deployment/checkout -n shop',
                  'Restart the rollout',
                  'restart',
                  false,
                  3
                ),
              ],
            },
            killall: {
              output:
                'All checkout pods deleted. The ReplicaSet recreates them from the new template, and every one crashes. Full outage.',
              question: 'You turned a stuck rollout into an outage. Recover.',
              choices: [
                choice(
                  'kubectl rollout undo deployment/checkout -n shop',
                  'Return to the last good revision',
                  'fixed',
                  true,
                  2
                ),
                choice('kubectl get pods -n shop', 'Look at the pods', 'killall', false, 3),
              ],
            },
            restart: {
              output: 'A new rollout of the same broken template. Still stuck at 1 of 3.',
              question: 'Nothing changed. Look at the pods.',
              choices: [
                choice('kubectl get pods -n shop', 'See which pods are new', 'pods', true, 1),
                choice(
                  'kubectl rollout restart deployment/checkout -n shop',
                  'Restart again',
                  'restart',
                  false,
                  3
                ),
              ],
            },
            pods: {
              output: `checkout-5f7b8c9d4-hq2lw   1/1   Running            0   2d
checkout-5f7b8c9d4-m8rtn   1/1   Running            0   2d
checkout-5f7b8c9d4-zk6vp   1/1   Running            0   2d
checkout-8c6d4f7b9-xk2pq   0/1   CrashLoopBackOff   5   8m`,
              question: 'The old pods serve traffic. The new one crashes. What now?',
              choices: [
                choice(
                  'kubectl rollout undo deployment/checkout -n shop',
                  'Return to a clean state, debug the new build in staging',
                  'fixed',
                  true,
                  1
                ),
                choice(
                  'kubectl scale deployment checkout --replicas=10 -n shop',
                  'Add more pods',
                  'pods',
                  false,
                  3
                ),
              ],
            },
            fixed: {
              output: 'deployment.apps/checkout rolled back. checkout: 3/3 Ready on 1.4.2.',
              end: {
                rootCause:
                  'The 1.5.0 pods crash on start. With maxUnavailable 0 and readiness gating, they never took traffic.',
                fix: 'Roll back to the stable revision, then reproduce and fix the crash in staging.',
                lesson:
                  'A good rollout configuration turns a bad release into a stalled rollout instead of an outage. Never delete healthy pods to fix a stuck rollout.',
              },
            },
          }
        ),
        order(
          'k8s-6-3-c',
          'Safe release routine',
          'Order the steps of a production release.',
          [
            'Run the new version in staging with production-like data',
            'Roll out with maxUnavailable 0 and a readiness probe',
            'Watch error rate and latency during the rollout',
            'Roll back immediately if either regresses',
            'Contract old schema or flags only after the release is stable',
          ],
          'Validate before, protect capacity during, watch the metrics, and keep rollback cheap. Cleanup happens after stability, never during the release.'
        ),
      ],
      true
    ),
  ],
});
