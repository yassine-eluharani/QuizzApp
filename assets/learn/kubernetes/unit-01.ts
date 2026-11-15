import { choice, cmd, fill, lesson, order, spot, terminal, triage, unit } from '@/lib/learn/dsl';
import { anatomy, applyChain, labels, lifecycle, limits, probes, requests } from './scenes-01';

export const unit1 = unit({
  id: 'k8s-u1',
  title: 'First deploy',
  blurb:
    'Bubbled Shop is moving to Kubernetes. Your first job: get the checkout service running as real, replicated pods, the way a production team would.',
  icon: 'box',
  badge: { id: 'badge-first-deploy', title: 'First deploy' },
  lessons: [
    lesson('k8s-1-1', 'Pods, Deployments and your first rollout', [
      applyChain,
      order(
        'k8s-1-1-b',
        'What happens when you apply a Deployment?',
        'Put the control loop in order, from kubectl apply to a running container.',
        [
          'You apply the Deployment to the API server',
          'The Deployment controller creates a ReplicaSet',
          'The ReplicaSet creates the Pod objects',
          'The scheduler assigns each Pod to a node',
          'The kubelet on that node starts the containers',
        ],
        'Kubernetes is a set of control loops. Each controller watches the desired state in the API server and acts on its own piece: Deployment to ReplicaSet to Pods, then the scheduler picks nodes and the kubelet runs them.',
        ['You SSH into a node and run docker run']
      ),
      anatomy,
      fill(
        'k8s-1-1-c',
        'Write the checkout Deployment',
        'Fill in the gaps to deploy checkout the production way.',
        `apiVersion: [[api]]
kind: Deployment
metadata:
  name: checkout
  namespace: shop
spec:
  replicas: [[rep]]
  selector:
    matchLabels:
      app: [[label]]
  template:
    metadata:
      labels:
        app: checkout
    spec:
      containers:
        - name: checkout
          image: shop/checkout:[[tag]]`,
        {
          api: [
            'apps/v1',
            'Deployments live in the apps API group. Older versions like extensions/v1beta1 were removed years ago and the API server rejects them.',
          ],
          rep: [
            '3',
            'More than one replica means losing a node or restarting a pod does not take checkout down.',
          ],
          label: [
            'checkout',
            'The selector must match the pod template labels, otherwise the API server refuses the Deployment.',
          ],
          tag: [
            '1.4.2',
            'A pinned version makes rollouts and rollbacks exact. latest can change under you.',
          ],
        },
        ['v1', 'extensions/v1beta1', '1', 'latest', 'shop']
      ),
      spot(
        'k8s-1-1-d',
        'Review this Deployment like a PR',
        'A teammate opened a PR for checkout. Tap the lines that would hurt in production.',
        `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: checkout
spec:
  replicas: 1
  selector:
    matchLabels:
      app: checkout
  template:
    metadata:
      labels:
        app: checkout
    spec:
      containers:
        - name: checkout
          image: shop/checkout:latest
          ports:
            - containerPort: 8080`,
        {
          5: 'A single replica is a single point of failure: one node drain, one crash, one OOM kill and checkout is down.',
          16: 'The latest tag is mutable. Two pods can run different code, and you cannot roll back to a known version.',
        }
      ),
      terminal(
        'k8s-1-1-e',
        'Ship it',
        'The manifest is saved as checkout.yaml. Apply it, then confirm all replicas are ready.',
        'Apply checkout.yaml, then check that the Deployment shows 3/3 ready.',
        [
          'kubectl apply -f checkout.yaml',
          'kubectl get pods -n shop',
          'kubectl get deployment checkout -n shop',
        ],
        [
          cmd('^apply -f checkout\\.ya?ml$', 'deployment.apps/checkout created'),
          cmd(
            '^get pods?$',
            `NAME                        READY   STATUS    RESTARTS   AGE
checkout-6d8f7c9b5-4hzqk    1/1     Running   0          21s
checkout-6d8f7c9b5-9xk2p    1/1     Running   0          21s
checkout-6d8f7c9b5-w7t6n    1/1     Running   0          21s`
          ),
          cmd(
            '^get (deploy|deployment|deployments)( checkout)?$',
            `NAME       READY   UP-TO-DATE   AVAILABLE   AGE
checkout   3/3     3            3           24s`,
            { goal: true }
          ),
          cmd('^delete (deploy|deployment)', '', {
            mistake:
              'Deleting the Deployment removes every checkout pod. That is an outage, not a fix.',
          }),
        ]
      ),
    ]),

    lesson('k8s-1-2', 'Labels, selectors and pod states', [
      labels,
      fill(
        'k8s-1-2-b',
        'Label it properly',
        'Add the standard labels to the checkout pod template.',
        `metadata:
  labels:
    app.kubernetes.io/name: [[name]]
    app.kubernetes.io/part-of: [[part]]
    app.kubernetes.io/version: "[[ver]]"`,
        {
          name: [
            'checkout',
            'name identifies the component. The selector and Services build on it.',
          ],
          part: [
            'bubbled-shop',
            'part-of groups components of one application, handy for dashboards and cost reports.',
          ],
          ver: [
            '1.4.2',
            'version should track the image tag so you can see what runs where at a glance.',
          ],
        },
        ['default', 'prod', 'latest']
      ),
      lifecycle,
      order(
        'k8s-1-2-c',
        'The life of a pod',
        'Order the stages a new pod goes through before it receives traffic.',
        [
          'Pending: accepted, waiting for a node',
          'Scheduled onto a node',
          'Image pulled and container created',
          'Running: the main process has started',
          'Ready: the readiness probe passes and traffic can arrive',
        ],
        'Running does not mean ready. A pod only joins a Service once its readiness probe passes, which is why READY shows 0/1 for a pod that is Running.'
      ),
      spot(
        'k8s-1-2-d',
        'Which pods need you?',
        'Here is the shop namespace at 03:12. Tap every pod that needs attention.',
        `
NAME                        READY   STATUS             RESTARTS   AGE
checkout-6d8f7c9b5-4hzqk    1/1     Running            0          2d
checkout-6d8f7c9b5-9xk2p    0/1     ImagePullBackOff   0          4m
cart-5c7d9b6f4-7wqzn        1/1     Running            0          2d
catalog-7b9f6d8c5-2mfjx     0/1     CrashLoopBackOff   14         52m
payments-84c6b7d9f-qt8vl    0/1     Pending            0          9m`,
        {
          2: 'ImagePullBackOff: the node cannot pull the image. Wrong tag, missing registry credentials or an unreachable registry.',
          4: 'CrashLoopBackOff with 14 restarts: the app starts and dies. Read kubectl logs --previous for the last crash.',
          5: 'Pending for 9 minutes: no node fits. Look for insufficient CPU or memory, taints, or an unbound volume in kubectl describe.',
        }
      ),
      terminal(
        'k8s-1-2-e',
        'Why can it not pull?',
        'checkout-6d8f7c9b5-9xk2p is stuck in ImagePullBackOff. Find out why.',
        'Describe the pod and read the failing event.',
        [
          'kubectl get pods -n shop',
          'kubectl describe pod checkout-6d8f7c9b5-9xk2p -n shop',
          'kubectl logs checkout-6d8f7c9b5-9xk2p -n shop',
        ],
        [
          cmd(
            '^get pods?$',
            `NAME                        READY   STATUS             RESTARTS   AGE
checkout-6d8f7c9b5-4hzqk    1/1     Running            0          2d
checkout-6d8f7c9b5-9xk2p    0/1     ImagePullBackOff   0          4m`
          ),
          cmd(
            '^describe pods? checkout-6d8f7c9b5-9xk2p$',
            `Events:
  Type     Reason     Age   Message
  Normal   Scheduled  4m    Successfully assigned shop/checkout-6d8f7c9b5-9xk2p to node-2
  Normal   Pulling    4m    Pulling image "shop/checkout:1.4.22"
  Warning  Failed     4m    Failed to pull image: manifest unknown: manifest unknown
  Warning  Failed     4m    Error: ErrImagePull
  Normal   BackOff    3m    Back-off pulling image "shop/checkout:1.4.22"

The tag 1.4.22 does not exist. The deploy had a typo.`,
            { goal: true }
          ),
          cmd(
            '^logs checkout-6d8f7c9b5-9xk2p',
            'Error from server (BadRequest): container "checkout" in pod "checkout-6d8f7c9b5-9xk2p" is waiting to start: trying and failing to pull image'
          ),
        ]
      ),
    ]),

    lesson('k8s-1-3', 'Resources and health probes', [
      requests,
      limits,
      fill(
        'k8s-1-3-b',
        'Size the container',
        'checkout idles around 200 MiB and uses a quarter of a core under normal load.',
        `resources:
  requests:
    cpu: [[cpu]]
    memory: [[mem]]
  limits:
    memory: [[lim]]`,
        {
          cpu: ['250m', 'Requests drive scheduling and autoscaling. 250m is a quarter of a core.'],
          mem: [
            '256Mi',
            'Slightly above idle usage, so the pod is placed on a node that really has the memory.',
          ],
          lim: [
            '512Mi',
            'The ceiling. Above it the container is OOMKilled, so leave headroom over the request.',
          ],
        },
        ['2000m', '64Gi', '1']
      ),
      probes,
      fill(
        'k8s-1-3-c',
        'Wire up the probes',
        'Readiness gates traffic, liveness restarts a stuck process.',
        `readinessProbe:
  httpGet:
    path: [[ready]]
    port: 8080
  periodSeconds: 5
livenessProbe:
  httpGet:
    path: [[live]]
    port: 8080
  initialDelaySeconds: [[delay]]`,
        {
          ready: [
            '/ready',
            'Readiness may check dependencies (database, cache): failing just removes the pod from traffic, it does not restart it.',
          ],
          live: [
            '/healthz',
            'Liveness should only prove the process itself is alive. It must not depend on other services.',
          ],
          delay: [
            '30',
            'Gives the app time to boot before liveness starts judging it. A startupProbe is the cleaner tool for slow starts.',
          ],
        },
        ['/', '/db-check', '0']
      ),
      spot(
        'k8s-1-3-d',
        'The restart storm',
        'This liveness probe took checkout down during a database blip. Tap the risky lines.',
        `
livenessProbe:
  httpGet:
    path: /healthz   # also pings Postgres and Redis
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 5
  failureThreshold: 1`,
        {
          2: 'Liveness that checks dependencies turns a database blip into every pod restarting at once, which only makes the outage worse.',
          4: 'No initial delay: a slow start is judged as dead, killed, restarted and judged again, forever.',
          6: 'failureThreshold 1: a single slow response restarts the pod. Allow a few consecutive failures.',
        }
      ),
      terminal(
        'k8s-1-3-e',
        'Running, but not ready',
        'checkout pods show 0/1 READY but STATUS is Running. Find out why.',
        'Look at the pod events, then the logs, until you find the real cause.',
        [
          'kubectl get pods -n shop',
          'kubectl describe pod checkout-6d8f7c9b5-4hzqk -n shop',
          'kubectl logs checkout-6d8f7c9b5-4hzqk -n shop',
        ],
        [
          cmd(
            '^get pods?$',
            `NAME                        READY   STATUS    RESTARTS   AGE
checkout-6d8f7c9b5-4hzqk    0/1     Running   0          3m
checkout-6d8f7c9b5-9xk2p    0/1     Running   0          3m`
          ),
          cmd(
            '^describe pods? checkout-6d8f7c9b5-4hzqk$',
            `Events:
  Warning  Unhealthy  10s (x18 over 3m)  kubelet  Readiness probe failed: HTTP probe failed with statuscode: 503

The probe fails, but not why. Check the container logs.`
          ),
          cmd(
            '^logs checkout-6d8f7c9b5-4hzqk',
            `INFO  checkout starting on :8080
WARN  /ready failing: redis unreachable: dial tcp: lookup redis on 10.96.0.10:53: no such host`,
            { goal: true }
          ),
        ]
      ),
    ]),

    lesson(
      'k8s-1-4',
      'Boss: launch day for checkout',
      [
        fill(
          'k8s-1-4-a',
          'Assemble the launch manifest',
          'Everything checkout needs to survive launch. Fill the gaps.',
          `spec:
  replicas: [[rep]]
  template:
    spec:
      containers:
        - name: checkout
          image: shop/checkout:[[tag]]
          resources:
            requests: { cpu: 250m, memory: [[mem]] }
            limits: { memory: 512Mi }
          readinessProbe:
            httpGet: { path: [[ready]], port: 8080 }`,
          {
            rep: ['3', 'Spread across nodes so one failure leaves capacity.'],
            tag: ['1.4.2', 'Immutable, known version.'],
            mem: ['256Mi', 'A realistic request so the scheduler reserves enough memory.'],
            ready: ['/ready', 'Only receive traffic once dependencies are reachable.'],
          },
          ['1', 'latest', '8Gi', '/']
        ),
        spot(
          'k8s-1-4-b',
          'Last review before merge',
          'Find everything that should block this PR.',
          `
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: checkout
          image: shop/checkout:latest
          env:
            - name: STRIPE_SECRET_KEY
              value: sk_live_51Mabc123
          livenessProbe:
            httpGet: { path: /healthz, port: 8080 }
            initialDelaySeconds: 0`,
          {
            6: 'The latest tag is mutable and impossible to roll back to.',
            9: 'A live payment secret in plain YAML ends up in git and in every kubectl get. Secrets come from a Secret or an external store (unit 3).',
            12: 'No initial delay: a slow start gets killed and restarted in a loop.',
          }
        ),
        triage(
          'k8s-1-4-c',
          'Launch stuck',
          'You applied the checkout Deployment 6 minutes ago. Zero pods are ready and the launch call is waiting.',
          6,
          {
            start: {
              output: `NAME                        READY   STATUS         RESTARTS   AGE
checkout-7c8d9f5b6-2xqtl    0/1     ErrImagePull   0          6m
checkout-7c8d9f5b6-8mkr4    0/1     ErrImagePull   0          6m
checkout-7c8d9f5b6-cj5vz    0/1     ErrImagePull   0          6m`,
              question: 'What do you do first?',
              choices: [
                choice(
                  'kubectl describe pod checkout-7c8d9f5b6-2xqtl',
                  'Read the events for the pull error',
                  'described',
                  true,
                  2
                ),
                choice('kubectl delete deployment checkout', 'Start over', 'deleted', false, 8),
                choice(
                  'kubectl rollout restart deployment checkout',
                  'Restart and hope it pulls this time',
                  'restarted',
                  false,
                  6
                ),
              ],
            },
            deleted: {
              output:
                'deployment.apps "checkout" deleted. All pods gone. You still do not know why the image failed.',
              question: 'Back to the evidence. What now?',
              choices: [
                choice(
                  'kubectl apply -f checkout.yaml',
                  'Recreate it and look at the events',
                  'start',
                  true,
                  3
                ),
                choice(
                  'kubectl scale deployment checkout --replicas=5',
                  'Add more pods',
                  'start',
                  false,
                  4
                ),
              ],
            },
            restarted: {
              output:
                'deployment.apps/checkout restarted. New pods, same ErrImagePull. A restart cannot fix a missing image.',
              question: 'Same result. Next move?',
              choices: [
                choice(
                  'kubectl describe pod checkout-7c8d9f5b6-2xqtl',
                  'Read the events',
                  'described',
                  true,
                  1
                ),
                choice(
                  'kubectl rollout restart deployment checkout',
                  'Try once more',
                  'restarted',
                  false,
                  5
                ),
              ],
            },
            described: {
              output: `Events:
  Warning  Failed  Failed to pull image "shop/checkout:1.4.22": manifest unknown
  Warning  Failed  Error: ErrImagePull`,
              question:
                'The tag 1.4.22 does not exist. The released version is 1.4.2. How do you fix it?',
              choices: [
                choice(
                  'kubectl set image deployment/checkout checkout=shop/checkout:1.4.2 -n shop',
                  'Point at the real tag (and fix it in git)',
                  'fixed',
                  true,
                  1
                ),
                choice(
                  'kubectl edit pod checkout-7c8d9f5b6-2xqtl',
                  'Edit one pod by hand',
                  'podedit',
                  false,
                  4
                ),
              ],
            },
            podedit: {
              output:
                'error: pods "checkout-7c8d9f5b6-2xqtl" is invalid: spec: Forbidden: pod updates may not change fields other than the image. The Deployment would recreate the pod anyway.',
              question: 'Edit the owner, not the pod.',
              choices: [
                choice(
                  'kubectl set image deployment/checkout checkout=shop/checkout:1.4.2 -n shop',
                  'Fix it on the Deployment',
                  'fixed',
                  true,
                  1
                ),
                choice(
                  'kubectl delete pod checkout-7c8d9f5b6-2xqtl',
                  'Delete it, the ReplicaSet will retry',
                  'podedit',
                  false,
                  3
                ),
              ],
            },
            fixed: {
              output: `deployment.apps/checkout image updated
NAME                        READY   STATUS    RESTARTS   AGE
checkout-5f7b8c9d4-hq2lw    1/1     Running   0          20s
checkout-5f7b8c9d4-m8rtn    1/1     Running   0          20s
checkout-5f7b8c9d4-zk6vp    1/1     Running   0          20s`,
              end: {
                rootCause:
                  'A typo in the image tag (1.4.22) in the manifest, so no node could pull the image.',
                fix: 'Set the correct tag on the Deployment and fix the manifest in git so the typo does not return on the next apply.',
                lesson:
                  'For any pod that will not start, read the events first: kubectl describe tells you what the kubelet tried and why it failed.',
              },
            },
          }
        ),
        order(
          'k8s-1-4-d',
          'Ship safely',
          'Put the checklist for a production first deploy in the order you would do it.',
          [
            'Pin the image to an immutable tag',
            'Set requests and a memory limit',
            'Add readiness and liveness probes',
            'Apply with at least three replicas',
            'Confirm every pod is Ready before announcing launch',
          ],
          'Pinning and sizing come before apply, because they define what the scheduler and kubelet will do. Verification comes last: Ready is the signal that traffic can safely arrive.'
        ),
      ],
      true
    ),
  ],
});
