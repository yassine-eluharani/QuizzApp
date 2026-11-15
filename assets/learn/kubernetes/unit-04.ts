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
import { hpa, qosEvict, twoScalers } from './scenes-04';

export const unit4 = unit({
  id: 'k8s-u4',
  title: 'Scaling',
  blurb:
    'Black Friday is coming. Size pods correctly, let the autoscaler add replicas, and understand where capacity really runs out.',
  icon: 'layers',
  badge: { id: 'badge-scale-out', title: 'Scale-out' },
  lessons: [
    lesson('k8s-4-1', 'Sizing pods', [
      qosEvict,
      order(
        'k8s-4-1-b',
        'Who goes first when a node is full?',
        'Put the eviction order from first to last.',
        [
          'BestEffort pods (no requests or limits)',
          'Burstable pods using more than they requested',
          'Burstable pods using less than they requested',
          'Guaranteed pods (limits equal requests)',
        ],
        'Under memory pressure the kubelet evicts the pods that are furthest over their promise first, and protects the ones that asked for exactly what they use.'
      ),
      fill(
        'k8s-4-1-c',
        'Make payments Guaranteed',
        'payments must survive node pressure. Set limits so its QoS is Guaranteed.',
        `resources:
  requests: { cpu: 500m, memory: 512Mi }
  limits:   { cpu: [[c]], memory: [[m]] }`,
        {
          c: [
            '500m',
            'Guaranteed needs limits equal to requests for every resource, CPU included.',
          ],
          m: [
            '512Mi',
            'Equal to the memory request. That, plus the CPU match, makes the pod Guaranteed.',
          ],
        },
        ['1', '1Gi', '2000m']
      ),
      spot(
        'k8s-4-1-d',
        'Why did it restart?',
        'checkout restarted three times in ten minutes. Tap the lines that tell you the cause.',
        `
Last State:     Terminated
  Reason:       OOMKilled
  Exit Code:    137
Limits:
  memory:  256Mi`,
        {
          1: 'OOMKilled: the container went over its memory limit and the kernel killed it.',
          2: 'Exit code 137 is 128 + 9, a SIGKILL. Together with OOMKilled it confirms a memory limit hit, not an app crash.',
        }
      ),
      terminal(
        'k8s-4-1-e',
        'Raise the ceiling',
        'checkout is OOMKilled at 512Mi. Usage peaks near 600Mi. Fix it without redeploying code.',
        'Raise the memory limit of the checkout Deployment.',
        [
          'kubectl top pods -n shop',
          'kubectl describe pod checkout-5f7b8c9d4-hq2lw -n shop',
          'kubectl set resources deployment checkout -n shop --limits=memory=1Gi',
        ],
        [
          cmd(
            '^top pods?$',
            `NAME                        CPU(cores)   MEMORY(bytes)
checkout-5f7b8c9d4-hq2lw    180m         498Mi
checkout-5f7b8c9d4-m8rtn    175m         505Mi`
          ),
          cmd(
            '^describe pods? checkout-5f7b8c9d4-hq2lw$',
            `Last State:  Terminated
  Reason:    OOMKilled
Limits:
  memory:  512Mi
Requests:
  memory:  256Mi`
          ),
          cmd(
            '^set resources deploy(ment)?[ /]checkout .*--limits=memory=(768Mi|1Gi|1536Mi)$',
            'deployment.apps/checkout resource requirements updated\nA rolling restart starts pods with the new limit.',
            { goal: true }
          ),
          cmd('^set resources deploy(ment)?[ /]checkout .*--limits=memory=(32|64|128|256)Mi$', '', {
            mistake: 'That lowers the limit. The pods would be OOMKilled even sooner.',
          }),
        ]
      ),
    ]),

    lesson('k8s-4-2', 'Autoscaling', [
      hpa,
      fill(
        'k8s-4-2-b',
        'Write the HPA',
        'Keep checkout between three and twenty pods, scaling on CPU.',
        `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: checkout
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: checkout
  minReplicas: [[min]]
  maxReplicas: [[max]]
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: [[util]]`,
        {
          min: ['3', 'Never drop below the high-availability baseline, even at 3 a.m.'],
          max: [
            '20',
            'A cap protects the cluster budget and the database behind checkout from a runaway scale-up.',
          ],
          util: [
            '70',
            'Leaves headroom for spikes while new pods start. At 95 you scale too late.',
          ],
        },
        ['1', '1000', '100']
      ),
      order(
        'k8s-4-2-c',
        'A traffic spike, step by step',
        'Order what happens from the spike to extra capacity.',
        [
          'Traffic rises and CPU use per pod climbs',
          'metrics-server reports the higher usage',
          'The HPA computes a larger desired replica count',
          'The Deployment creates more pods',
          'The scheduler places them (or the cluster autoscaler adds nodes)',
          'New pods pass readiness and start taking traffic',
        ],
        'The HPA only changes a number. Everything after that is the normal Deployment, scheduler and readiness machinery, and the last mile can take minutes if a new node is needed.'
      ),
      spot(
        'k8s-4-2-d',
        'Review this HPA',
        'Tap the settings that would hurt on launch day.',
        `
spec:
  minReplicas: 1
  maxReplicas: 500
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 95`,
        {
          1: 'A minimum of 1 means no redundancy: one node loss is an outage until scale-up finishes.',
          2: 'A maximum of 500 can stampede the database and the cloud bill. Cap it at what the dependencies can take.',
          9: 'A 95% target scales when pods are already saturated, so users feel the lag first.',
        }
      ),
      terminal(
        'k8s-4-2-e',
        'The HPA that does nothing',
        'The checkout HPA shows <unknown> for its target and never scales. Find out why.',
        'Describe the HPA and read the failing condition.',
        ['kubectl get hpa -n shop', 'kubectl describe hpa checkout -n shop'],
        [
          cmd(
            '^get hpa$',
            `NAME       REFERENCE             TARGETS         MINPODS   MAXPODS   REPLICAS
checkout   Deployment/checkout   <unknown>/70%   3         20        3`
          ),
          cmd(
            '^describe hpa checkout$',
            `Conditions:
  Type           Status  Reason                   Message
  AbleToScale    True    SucceededGetScale        the HPA controller was able to get the target's current scale
  ScalingActive  False   FailedGetResourceMetric  failed to get cpu utilization: missing request for cpu in container checkout

The percentage is relative to the CPU request, and the pod has none.`,
            { goal: true }
          ),
        ]
      ),
      twoScalers,
      diagram(
        'k8s-4-2-f',
        'Two autoscalers',
        'Place the component that adds pods and the one that adds nodes.',
        [
          [box('a', 'Traffic spike')],
          [
            gap(
              'hpa',
              'Horizontal Pod Autoscaler',
              'Raises the replica count when CPU per pod climbs.'
            ),
          ],
          [box('b', 'New pods are Pending', 'no node has room')],
          [
            gap(
              'ca',
              'Cluster autoscaler',
              'Sees unschedulable pods and adds nodes to the node pool.'
            ),
          ],
          [box('c', 'Pods scheduled and Ready')],
        ],
        ['Vertical Pod Autoscaler', 'kube-proxy', 'etcd']
      ),
    ]),

    lesson(
      'k8s-4-3',
      'Boss: the flash sale',
      [
        fill(
          'k8s-4-3-a',
          'Protect capacity during maintenance',
          'Keep at least two checkout pods up while nodes are drained.',
          `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: checkout
spec:
  minAvailable: [[min]]
  selector:
    matchLabels:
      app: [[sel]]`,
          {
            min: [
              '2',
              'With three replicas this allows one pod to be evicted at a time. Setting 3 would block every drain.',
            ],
            sel: ['checkout', 'The PDB must select the checkout pods, or it protects nothing.'],
          },
          ['3', '0', 'cart']
        ),
        triage(
          'k8s-4-3-b',
          'Slow checkout, HPA maxed out',
          'Flash sale, 12:01. Checkout latency has tripled and the HPA is already at its maximum.',
          3,
          {
            start: {
              output: `NAME       REFERENCE             TARGETS    MINPODS   MAXPODS   REPLICAS
checkout   Deployment/checkout   190%/70%   3         20        20`,
              question: 'The HPA wants more than 20 pods. What do you check?',
              choices: [
                choice(
                  'kubectl get pods -n shop',
                  'Are all 20 pods actually running?',
                  'pending',
                  true,
                  1
                ),
                choice(
                  'kubectl delete hpa checkout -n shop',
                  'Remove the autoscaler',
                  'nohpa',
                  false,
                  6
                ),
                choice(
                  'kubectl scale deployment checkout --replicas=40 -n shop',
                  'Force more pods',
                  'scale40',
                  false,
                  4
                ),
              ],
            },
            nohpa: {
              output:
                'horizontalpodautoscaler "checkout" deleted. Replicas freeze at 20 and nothing adapts to load any more.',
              question: 'You removed the safety net. Recover.',
              choices: [
                choice('kubectl apply -f hpa.yaml', 'Restore the HPA from git', 'start', true, 2),
                choice('kubectl get pods -n shop', 'Carry on regardless', 'nohpa', false, 3),
              ],
            },
            scale40: {
              output:
                'deployment scaled to 40. The HPA overrides it within a minute, and the extra pods that were created are Pending with no room.',
              question: 'Manual scaling fights the HPA. Look at the real problem.',
              choices: [
                choice(
                  'kubectl get pods -n shop',
                  'See which pods are Pending',
                  'pending',
                  true,
                  1
                ),
                choice(
                  'kubectl scale deployment checkout --replicas=60 -n shop',
                  'Try even more',
                  'scale40',
                  false,
                  4
                ),
              ],
            },
            pending: {
              output: `checkout-...   14 Running
checkout-...   6 Pending

Events: 0/9 nodes are available: 9 Insufficient cpu.`,
              question: 'Pods are Pending for CPU. Who is supposed to add nodes?',
              choices: [
                choice(
                  'kubectl logs -n kube-system deploy/cluster-autoscaler',
                  'Ask the cluster autoscaler',
                  'ca',
                  true,
                  1
                ),
                choice(
                  'kubectl delete pod -l app=checkout -n shop',
                  'Recycle the pods',
                  'pending',
                  false,
                  5
                ),
              ],
            },
            ca: {
              output: 'scale-up failed for node group shop-pool: max node group size reached (9/9)',
              question: 'The node pool is capped at 9 nodes. Fix it.',
              choices: [
                choice(
                  'Raise the node pool maximum to 15 in infrastructure code',
                  'Remove the real ceiling',
                  'fixed',
                  true,
                  1
                ),
                choice(
                  'kubectl scale deployment checkout --replicas=14 -n shop',
                  'Cut the replicas so nothing is Pending',
                  'ca',
                  false,
                  3
                ),
              ],
            },
            fixed: {
              output: `Cluster autoscaler: scale-up 9 -> 14 nodes
checkout: 20/20 pods Ready
latency back under 400 ms`,
              end: {
                rootCause:
                  'The HPA asked for 20 pods, but the node pool capped at 9 nodes only had room for 14. The extra pods stayed Pending.',
                fix: 'Raise the node pool maximum and keep the HPA maximum in line with what nodes and the database can carry.',
                lesson:
                  'Autoscaling has two ceilings, replicas and nodes. When pods are Pending, check the cluster autoscaler before the HPA.',
              },
            },
          }
        ),
        order(
          'k8s-4-3-c',
          'Drain a node safely',
          'Order the steps to take a node out for maintenance without a customer noticing.',
          [
            'Cordon the node so nothing new lands on it',
            'Drain it: pods are evicted, respecting PodDisruptionBudgets',
            'ReplicaSets recreate the pods on other nodes',
            'Patch or upgrade the node',
            'Uncordon it so it takes pods again',
          ],
          'Cordon first so the node stops receiving work, then drain gracefully. The PDB makes sure enough replicas stay up while pods move.'
        ),
      ],
      true
    ),
  ],
});
