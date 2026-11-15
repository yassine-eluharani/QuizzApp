import { choice, cmd, fill, lesson, order, spot, terminal, triage, unit } from '@/lib/learn/dsl';
import { hardening, netpol, rbac } from './scenes-07';
import {
  bindingScope,
  enforceLevels,
  reviewBlocks,
  networkPolicyYaml,
  trustedImage,
  compromised,
} from './cards-07';

export const unit7 = unit({
  id: 'k8s-u7',
  title: 'Security',
  blurb:
    'Checkout handles card payments, so the cluster has to be hard to abuse. Identity, hardened pods, network rules and a trustworthy supply chain.',
  icon: 'shield',
  badge: { id: 'badge-locked-down', title: 'Locked down' },
  lessons: [
    lesson('k8s-7-1', 'Identity and hardened pods', [
      rbac,
      fill(
        'k8s-7-1-b',
        'Let checkout read ConfigMaps',
        'Create a Role that reads ConfigMaps and bind it to checkout’s ServiceAccount.',
        `kind: Role
metadata:
  name: config-reader
  namespace: shop
rules:
  - apiGroups: [""]
    resources: [[res]]
    verbs: [[verbs]]
---
kind: RoleBinding
metadata:
  name: checkout-config-reader
  namespace: shop
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: config-reader
subjects:
  - kind: ServiceAccount
    namespace: shop
    name: [[sa]]`,
        {
          res: [
            '["configmaps"]',
            'Name only the resource it needs. ["*"] would grant every resource, Secrets included.',
          ],
          verbs: [
            '["get", "list"]',
            'Read-only verbs. Granting delete or ["*"] would let a bug or an attacker change the cluster.',
          ],
          sa: ['checkout', 'Bind to checkout’s own ServiceAccount, not the shared default.'],
        },
        ['["*"]', '["secrets"]', 'default']
      ),
      bindingScope,
      spot(
        'k8s-7-1-c',
        'Review this binding',
        'Tap what is dangerous.',
        `
kind: ClusterRoleBinding
subjects:
  - kind: ServiceAccount
    name: default
    namespace: shop
roleRef:
  kind: ClusterRole
  name: cluster-admin`,
        {
          0: 'ClusterRoleBinding applies cluster-wide, not just to the shop namespace.',
          3: 'The default ServiceAccount is used by every pod that does not name one, so every such pod would get this power.',
          7: 'cluster-admin is full control of the entire cluster. A single compromised pod would own everything.',
        }
      ),
      terminal(
        'k8s-7-1-d',
        'Prove the limits',
        'Check that checkout’s ServiceAccount can read ConfigMaps but cannot delete pods.',
        'Run the can-i check for deleting pods.',
        [
          'kubectl auth can-i get configmaps --as=system:serviceaccount:shop:checkout -n shop',
          'kubectl auth can-i delete pods --as=system:serviceaccount:shop:checkout -n shop',
        ],
        [
          cmd('^auth can-i get configmaps --as=system:serviceaccount:shop:checkout$', 'yes'),
          cmd(
            '^auth can-i delete pods --as=system:serviceaccount:shop:checkout$',
            'no\n\nThe ServiceAccount cannot delete pods. Least privilege holds.',
            { goal: true }
          ),
        ]
      ),
      hardening,
      enforceLevels,
      fill(
        'k8s-7-1-e',
        'Harden the container',
        'Apply the restricted baseline to checkout.',
        `securityContext:
  runAsNonRoot: [[nr]]
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: [[ape]]
  capabilities:
    drop: [[drop]]
  seccompProfile:
    type: [[sec]]`,
        {
          nr: [
            'true',
            'A process that runs as root inside a container is far more dangerous if it escapes.',
          ],
          ape: [
            'false',
            'Stops a process gaining more privileges than its parent, for example through setuid binaries.',
          ],
          drop: ['["ALL"]', 'Start with no Linux capabilities and add back only what is needed.'],
          sec: [
            'RuntimeDefault',
            'Applies the runtime’s default syscall filter. Unconfined would turn it off.',
          ],
        },
        ['Unconfined', '["NET_ADMIN"]', 'root']
      ),
      reviewBlocks,
      spot(
        'k8s-7-1-f',
        'A pod that is asking for trouble',
        'Tap what a security review would block.',
        `
securityContext:
  privileged: true
  runAsUser: 0
hostNetwork: true
volumes:
  - name: docker
    hostPath:
      path: /var/run/docker.sock`,
        {
          1: 'A privileged container has almost the same access as the node itself.',
          2: 'Running as UID 0 (root) removes a key layer of containment.',
          3: 'hostNetwork puts the pod on the node’s network, bypassing NetworkPolicies and exposing node services.',
          7: 'Mounting the container runtime socket lets the pod start any container on the node, which is full node takeover.',
        }
      ),
    ]),

    lesson('k8s-7-2', 'Network rules and supply chain', [
      netpol,
      networkPolicyYaml,
      fill(
        'k8s-7-2-b',
        'Only the ingress may call checkout',
        'Allow traffic to checkout from the ingress-nginx namespace and nothing else.',
        `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: checkout-allow
  namespace: shop
spec:
  podSelector:
    matchLabels:
      app: [[sel]]
  policyTypes: [[types]]
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: [[ns]]
      ports:
        - port: 8080`,
        {
          sel: ['checkout', 'Selects the pods this policy protects.'],
          types: [
            '[Ingress]',
            'Only ingress is restricted here. Adding Egress without an allow list would block outbound traffic, DNS included.',
          ],
          ns: [
            'ingress-nginx',
            'The namespace where the ingress controller runs, which is the only allowed source.',
          ],
        },
        ['[Ingress, Egress]', 'shop', 'cart']
      ),
      terminal(
        'k8s-7-2-c',
        'Prove it is blocked',
        'Show that cart cannot reach checkout directly any more.',
        'Try to call checkout from a cart pod.',
        [
          'kubectl get networkpolicy -n shop',
          'kubectl exec deploy/cart -n shop -- wget -qO- --timeout=3 http://checkout',
        ],
        [
          cmd(
            '^get (networkpolicy|netpol)$',
            `NAME             POD-SELECTOR   AGE
default-deny     <none>         2d
checkout-allow   app=checkout   2d`
          ),
          cmd(
            '^exec deploy(ment)?/cart .*wget',
            'wget: download timed out\n\nBlocked: checkout-allow only admits the ingress-nginx namespace.',
            { goal: true }
          ),
        ]
      ),
      trustedImage,
      order(
        'k8s-7-2-d',
        'A trustworthy image pipeline',
        'Order the supply chain from code to running pod.',
        [
          'Build the image in CI from a pinned base image',
          'Scan it for known vulnerabilities',
          'Sign it with a tool like cosign',
          'Push it to the private registry and reference it by digest',
          'The cluster verifies the signature at admission before it runs',
        ],
        'Each step narrows trust: a reproducible build, a scan, a signature, an immutable reference, and a gate at the edge of the cluster.'
      ),
      spot(
        'k8s-7-2-e',
        'Where did this image come from?',
        'Tap the image settings that are a risk.',
        `
containers:
  - name: checkout
    image: docker.io/randomuser/checkout:latest
    imagePullPolicy: IfNotPresent`,
        {
          2: 'An unvetted public image with a mutable latest tag can change underneath you, or contain anything.',
          3: 'IfNotPresent with latest means a node may keep running a stale copy. Pin an immutable tag or digest.',
        }
      ),
      compromised,
    ]),

    lesson(
      'k8s-7-3',
      'Boss: suspicious pod',
      [
        fill(
          'k8s-7-3-a',
          'Enforce a baseline on the namespace',
          'Block unsafe pods in shop now and warn about the restricted gaps.',
          `apiVersion: v1
kind: Namespace
metadata:
  name: shop
  labels:
    pod-security.kubernetes.io/enforce: [[enf]]
    pod-security.kubernetes.io/warn: [[warn]]`,
          {
            enf: [
              'baseline',
              'Rejects the dangerous settings (privileged, host namespaces) without breaking most workloads.',
            ],
            warn: [
              'restricted',
              'Shows warnings for everything the strictest profile would block, so you can migrate gradually.',
            ],
          },
          ['privileged', 'strict']
        ),
        spot(
          'k8s-7-3-b',
          'Audit the spec',
          'Find what a reviewer would flag.',
          `
serviceAccountName: default
automountServiceAccountToken: true
containers:
  - name: catalog
    image: shop/catalog:latest
    securityContext:
      runAsUser: 0`,
          {
            1: 'The pod does not use the Kubernetes API, so mounting a token only gives an attacker something to steal.',
            4: 'latest is mutable, so you cannot know or reproduce what is running.',
            6: 'Running as root widens the damage if the container is compromised.',
          }
        ),
        triage(
          'k8s-7-3-c',
          'Strange outbound traffic',
          '02:40. An alert fires: catalog-7f9c-x2k4q is opening outbound connections to an unknown IP every 30 seconds.',
          3,
          {
            start: {
              output:
                'ALERT  catalog-7f9c-x2k4q  egress to 185.220.x.x:443 every 30s (not in allow list)',
              question: 'First move?',
              choices: [
                choice(
                  'kubectl label pod catalog-7f9c-x2k4q app=quarantine --overwrite -n shop',
                  'Isolate it, keep it for investigation',
                  'isolated',
                  true,
                  1
                ),
                choice(
                  'kubectl delete pod catalog-7f9c-x2k4q -n shop',
                  'Kill it',
                  'deleted',
                  false,
                  6
                ),
                choice(
                  'kubectl exec -it catalog-7f9c-x2k4q -n shop -- sh',
                  'Look around inside',
                  'exec',
                  false,
                  4
                ),
              ],
            },
            deleted: {
              output:
                'Pod deleted along with its filesystem and memory. A replacement started from the same image, which may be the way in.',
              question: 'Evidence lost. What next?',
              choices: [
                choice(
                  'Check the image digest and recent changes in git',
                  'Find the entry point',
                  'logs',
                  true,
                  3
                ),
                choice('Assume it was a one-off', 'Move on', 'deleted', false, 5),
              ],
            },
            exec: {
              output:
                'You are inside a possibly compromised container, changing its state and exposing your own credentials to whatever runs there.',
              question: 'Get out and contain it.',
              choices: [
                choice(
                  'kubectl label pod catalog-7f9c-x2k4q app=quarantine --overwrite -n shop',
                  'Isolate it',
                  'isolated',
                  true,
                  1
                ),
                choice('Keep exploring', 'Stay in', 'exec', false, 3),
              ],
            },
            isolated: {
              output:
                'pod/catalog-7f9c-x2k4q labeled. It left the Service and the ReplicaSet, and the quarantine NetworkPolicy that selects app=quarantine now blocks all of its traffic. A clean replacement is starting. The suspect pod keeps running for forensics.',
              question: 'Contained. Next?',
              choices: [
                choice(
                  'kubectl logs catalog-7f9c-x2k4q -n shop',
                  'Read what it was doing',
                  'logs',
                  true,
                  1
                ),
                choice('Ignore it, the replacement is running', 'Move on', 'isolated', false, 4),
              ],
            },
            logs: {
              output: `fetching http://185.220.x.x/miner ... ok
spawned process: xmrig
image catalog:1.2.0 has a known remote code execution CVE`,
              question: 'It could read the database credentials mounted into it. What now?',
              choices: [
                choice(
                  'Rotate the credentials that pod could read',
                  'Assume they are exposed',
                  'fixed',
                  true,
                  1
                ),
                choice('No action, it was just one pod', 'Close the alert', 'logs', false, 6),
              ],
            },
            fixed: {
              output:
                'Credentials rotated. Patched catalog:1.2.1 deployed. Egress default-deny added for the namespace.',
              end: {
                rootCause:
                  'An old catalog image with a remote code execution flaw let an attacker run a crypto miner and call out to the internet.',
                fix: 'Quarantine the pod, preserve evidence, rotate every credential it could reach, patch the image and add an egress default-deny policy.',
                lesson:
                  'Isolate before you destroy evidence, and always rotate what a compromised pod could read.',
              },
            },
          }
        ),
        order(
          'k8s-7-3-d',
          'Incident response order',
          'Order the response to a suspected compromise.',
          [
            'Isolate the pod without deleting it',
            'Preserve evidence: logs, image digest, node',
            'Rotate credentials the pod could read',
            'Fix the root cause: patch the image, tighten policy',
            'Review what let it in and write it up',
          ],
          'Contain first, capture evidence, remove the attacker’s access, fix the hole, then learn from it.'
        ),
      ],
      true
    ),
  ],
});
