import { choice, cmd, fill, lesson, order, spot, terminal, triage, unit } from '@/lib/learn/dsl';
import { scheduling, shutdown, zones } from './scenes-09';

export const unit9 = unit({
  id: 'k8s-u9',
  title: 'Scheduling & reliability',
  blurb:
    'Where pods land decides what survives a failure. Taints, spreading across zones, graceful shutdown and surviving the loss of a whole zone.',
  icon: 'grid',
  badge: { id: 'badge-well-placed', title: 'Well placed' },
  lessons: [
    lesson('k8s-9-1', 'Where pods land', [
      scheduling,
      order(
        'k8s-9-1-b',
        'The scheduling cycle',
        'Order what happens to a new pod.',
        [
          'A pod with no node is taken from the scheduling queue',
          'Filtering drops nodes that cannot run it',
          'Scoring ranks the remaining nodes',
          'The pod is bound to the best node',
          'The kubelet on that node starts the containers',
        ],
        'Filter then score then bind. When nothing survives filtering the pod stays Pending, and the event tells you which filter failed.'
      ),
      terminal(
        'k8s-9-1-c',
        'Why is it Pending?',
        'payments-84c6b7d9f-qt8vl has been Pending for 9 minutes. Find out why.',
        'Describe the pod and read the scheduling event.',
        [
          'kubectl get pods -n shop',
          'kubectl describe pod payments-84c6b7d9f-qt8vl -n shop',
          'kubectl top nodes',
        ],
        [
          cmd(
            '^get pods?$',
            `NAME                       READY   STATUS    RESTARTS   AGE
payments-84c6b7d9f-qt8vl   0/1     Pending   0          9m`
          ),
          cmd(
            '^describe pods? payments-84c6b7d9f-qt8vl$',
            `Requests:
  cpu:     4
  memory:  8Gi
Events:
  Warning  FailedScheduling  default-scheduler  0/6 nodes are available: 6 Insufficient cpu.

The pod asks for 4 CPUs. No node has that much unreserved.`,
            { goal: true }
          ),
          cmd(
            '^top nodes$',
            `NAME     CPU(cores)   CPU%   MEMORY%
node-1   2100m        52%    61%
node-2   2400m        60%    58%`
          ),
        ]
      ),
      fill(
        'k8s-9-1-d',
        'A dedicated pool for payments',
        'Payments nodes are labelled workload=critical and tainted dedicated=payments:NoSchedule. Land the pods there.',
        `spec:
  nodeSelector:
    workload: [[ns]]
  tolerations:
    - key: "dedicated"
      operator: "Equal"
      value: "[[tv]]"
      effect: [[eff]]`,
        {
          ns: [
            'critical',
            'The nodeSelector must match the label on the nodes, which is workload=critical.',
          ],
          tv: ['payments', 'The toleration value must equal the taint value, dedicated=payments.'],
          eff: ['NoSchedule', 'The effect must match the taint, or the toleration does nothing.'],
        },
        ['payments-pool', 'NoExecute', 'gpu']
      ),
    ]),

    lesson('k8s-9-2', 'Spread, drain and shutdown', [
      zones,
      fill(
        'k8s-9-2-b',
        'Spread across zones',
        'Keep checkout evenly spread across availability zones.',
        `topologySpreadConstraints:
  - maxSkew: [[skew]]
    topologyKey: [[key]]
    whenUnsatisfiable: [[wu]]
    labelSelector:
      matchLabels:
        app: checkout`,
        {
          skew: [
            '1',
            'No zone may have more than one extra pod compared with the emptiest zone. maxSkew must be at least 1.',
          ],
          key: [
            'topology.kubernetes.io/zone',
            'Spreads across zones, so a whole zone failing leaves most capacity.',
          ],
          wu: [
            'ScheduleAnyway',
            'A soft rule: still schedules when a zone is full, so a capacity crunch never blocks a rollout.',
          ],
        },
        ['0', 'kubernetes.io/hostname', 'Never']
      ),
      spot(
        'k8s-9-2-c',
        'Anti-affinity gone wrong',
        'Tap the lines that combine to leave pods Pending.',
        `
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: checkout
        topologyKey: kubernetes.io/hostname
replicas: 12
# cluster has 6 nodes`,
        {
          2: 'A required rule: no two checkout pods may share a node. It is a hard filter.',
          7: 'Twelve replicas on six nodes with one pod per node allowed means six pods can never be scheduled.',
        }
      ),
      order(
        'k8s-9-2-d',
        'When a node dies',
        'Order what Kubernetes does after a node stops responding.',
        [
          'The node stops reporting and is marked NotReady after the grace period',
          'Pods on it get the unreachable taint, tolerated for 300 seconds by default',
          'After the toleration expires the pods are evicted',
          'The ReplicaSet creates replacements on healthy nodes',
          'The replacements pass readiness and rejoin the Service',
        ],
        'Failure handling is slow by design (minutes) to avoid reacting to blips, which is why spreading and spare capacity matter more than recovery speed.'
      ),
      shutdown,
      fill(
        'k8s-9-2-e',
        'Shut down gracefully',
        'Let the load balancer drain before the process receives SIGTERM.',
        `terminationGracePeriodSeconds: [[tg]]
containers:
  - name: checkout
    lifecycle:
      preStop:
        exec:
          command: ["sleep", "[[sl]]"]`,
        {
          tg: [
            '45',
            'Must be longer than the preStop delay plus the time the app needs to finish in-flight requests.',
          ],
          sl: [
            '10',
            'Gives the endpoints removal time to reach the proxies, so no new requests arrive during shutdown.',
          ],
        },
        ['0', '3']
      ),
      spot(
        'k8s-9-2-f',
        'Shutdown settings that drop requests',
        'Tap what will cut requests off.',
        `
terminationGracePeriodSeconds: 5
lifecycle:
  preStop:
    exec:
      command: ["sleep", "30"]
# app ignores SIGTERM`,
        {
          0: 'A 5 second grace period is shorter than the 30 second preStop, so the container is killed mid-sleep.',
          5: 'An app that ignores SIGTERM keeps serving until SIGKILL and drops in-flight requests. Handle SIGTERM and finish gracefully.',
        }
      ),
      terminal(
        'k8s-9-2-g',
        'A drain that will not drain',
        'node-2 needs maintenance, but the drain is blocked. Find out why.',
        'Look at the PodDisruptionBudgets.',
        ['kubectl drain node-2 --ignore-daemonsets', 'kubectl get pdb -n shop'],
        [
          cmd(
            '^drain node-2',
            `evicting pod shop/checkout-5f7b8c9d4-hq2lw
error when evicting pods/"checkout-5f7b8c9d4-hq2lw" -n "shop" (will retry after 5s): Cannot evict pod as it would violate the pod's disruption budget.`
          ),
          cmd(
            '^get (pdb|poddisruptionbudgets?)$',
            `NAME       MIN AVAILABLE   MAX UNAVAILABLE   ALLOWED DISRUPTIONS   AGE
checkout   3               N/A               0                     12d

minAvailable (3) equals the replica count (3), so no pod may ever be evicted.`,
            { goal: true }
          ),
        ]
      ),
    ]),

    lesson(
      'k8s-9-3',
      'Boss: lose a zone',
      [
        fill(
          'k8s-9-3-a',
          'Prefer spreading across zones',
          'Add a soft anti-affinity so checkout pods avoid sharing a zone.',
          `affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: [[w]]
        podAffinityTerm:
          topologyKey: [[tk]]
          labelSelector:
            matchLabels:
              app: checkout`,
          {
            w: ['100', 'The strongest preference. Weights range from 1 to 100.'],
            tk: ['topology.kubernetes.io/zone', 'The failure domain to spread across.'],
          },
          ['1000', 'kubernetes.io/hostname']
        ),
        triage(
          'k8s-9-3-b',
          'Zone outage',
          '14:20. A cloud provider issue takes down zone-a. Checkout errors are climbing.',
          3,
          {
            start: {
              output: 'ALERT  nodes node-a1, node-a2, node-a3 NotReady (zone-a)  checkout 5xx 38%',
              question: 'First move?',
              choices: [
                choice(
                  'kubectl get pods -n shop -o wide',
                  'Where are the checkout pods?',
                  'pods',
                  true,
                  1
                ),
                choice(
                  'kubectl delete node node-a1 node-a2 node-a3',
                  'Remove the dead nodes',
                  'delnodes',
                  false,
                  8
                ),
                choice(
                  'Wait for the cloud provider to recover',
                  'Do nothing',
                  'waitcloud',
                  false,
                  6
                ),
              ],
            },
            delnodes: {
              output:
                'The node objects are gone, but capacity is still missing and the underlying problem is unchanged.',
              question: 'That did not restore anything. Check the workload.',
              choices: [
                choice(
                  'kubectl get pods -n shop -o wide',
                  'Where are the checkout pods?',
                  'pods',
                  true,
                  1
                ),
                choice(
                  'kubectl delete node node-a1 node-a2 node-a3',
                  'Repeat',
                  'delnodes',
                  false,
                  8
                ),
              ],
            },
            waitcloud: {
              output: 'Five more minutes of errors. The provider has no ETA.',
              question: 'You cannot wait. Look at your own capacity.',
              choices: [
                choice(
                  'kubectl get pods -n shop -o wide',
                  'Where are the checkout pods?',
                  'pods',
                  true,
                  1
                ),
                choice('Keep waiting', 'Hope', 'waitcloud', false, 6),
              ],
            },
            pods: {
              output: `NAME              READY   STATUS    NODE
checkout-...-a1   1/1     Running   node-b1   (zone-b)
checkout-...-a2   1/1     Unknown   node-a2   (zone-a)
checkout-...-a3   1/1     Unknown   node-a3   (zone-a)
checkout-...-a4   0/1     Pending   <none>`,
              question: 'Two of three pods lived in zone-a. Restore capacity now.',
              choices: [
                choice(
                  'kubectl scale deployment checkout --replicas=6 -n shop',
                  'Add capacity in the healthy zones',
                  'scaled',
                  true,
                  1
                ),
                choice(
                  'kubectl delete pod checkout-...-a2 checkout-...-a3 --force --grace-period=0',
                  'Force-delete the Unknown pods',
                  'force',
                  false,
                  4
                ),
              ],
            },
            force: {
              output:
                'The Unknown pods are removed from the API, but nothing adds capacity: one pod is still serving everything.',
              question: 'Add capacity.',
              choices: [
                choice(
                  'kubectl scale deployment checkout --replicas=6 -n shop',
                  'Add capacity in the healthy zones',
                  'scaled',
                  true,
                  1
                ),
                choice(
                  'kubectl delete pod checkout-...-a1 --force --grace-period=0',
                  'Force-delete another pod',
                  'force',
                  false,
                  4
                ),
              ],
            },
            scaled: {
              output:
                'Six pods requested. Four are placed in zone-b and zone-c and become Ready. 5xx falls to 0.2%.',
              question: 'Service restored. What prevents this next time?',
              choices: [
                choice(
                  'Add topologySpreadConstraints across zones and keep nodes in all three zones',
                  'Spread by design',
                  'fixed',
                  true,
                  1
                ),
                choice('Nothing, zone outages are rare', 'Accept the risk', 'scaled', false, 5),
              ],
            },
            fixed: {
              output:
                'checkout now spreads across zones a, b and c. Draining one zone leaves two thirds of capacity.',
              end: {
                rootCause:
                  'Two of three checkout pods ran in the same zone because nothing spread them, so a zone outage removed most of the capacity.',
                fix: 'Add topologySpreadConstraints (soft) across zones, keep node pools in every zone and size for N-1 zones.',
                lesson:
                  'Replicas only protect you if they fail independently. Spread by failure domain, then test by draining a zone.',
              },
            },
          }
        ),
        order(
          'k8s-9-3-c',
          'Graceful shutdown order',
          'Order what happens when a pod is deleted.',
          [
            'The pod is marked Terminating and removed from Service endpoints',
            'The preStop hook runs, for example a short sleep to let load balancers drain',
            'SIGTERM is sent to the main process',
            'The app finishes in-flight requests and exits',
            'After terminationGracePeriodSeconds anything left gets SIGKILL',
          ],
          'The delay before SIGTERM lets traffic stop arriving, SIGTERM lets the app finish cleanly, and the grace period is the hard limit before the kernel steps in.'
        ),
      ],
      true
    ),
  ],
});
