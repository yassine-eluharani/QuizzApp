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
import { gitops, upgrade } from './scenes-11';

export const unit11 = unit({
  id: 'k8s-u11',
  title: 'Cluster operations',
  blurb:
    'Keep the platform itself healthy: GitOps and Helm for every change, safe upgrades, quotas that stop one team starving the rest, and a launch-day capstone.',
  icon: 'wheel',
  badge: { id: 'badge-cluster-captain', title: 'Cluster captain' },
  lessons: [
    lesson('k8s-11-1', 'GitOps and Helm', [
      gitops,
      fill(
        'k8s-11-1-b',
        'Declare the shop app',
        'Argo CD should keep the production overlay in sync with git.',
        `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: shop
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/bubbled-shop/deploy
    targetRevision: [[rev]]
    path: [[path]]
  destination:
    server: https://kubernetes.default.svc
    namespace: shop
  syncPolicy:
    automated:
      prune: true
      selfHeal: [[heal]]`,
        {
          rev: ['main', 'The branch that represents production. Promotion is a merge into it.'],
          path: [
            'overlays/prod',
            'The production overlay: the same base as staging with prod values.',
          ],
          heal: [
            'true',
            'Reverts manual changes in the cluster so git stays the single source of truth.',
          ],
        },
        ['latest', 'overlays/dev', 'false']
      ),
      order(
        'k8s-11-1-c',
        'A GitOps change',
        'Order a change from idea to running pods.',
        [
          'A developer opens a pull request with the change',
          'CI runs tests and builds the image',
          'The change is reviewed and merged to main',
          'Argo CD notices the new commit',
          'Argo CD applies the difference to the cluster',
          'Health checks report Synced and Healthy',
        ],
        'The pipeline never touches the cluster with kubectl. It only changes git, and the controller does the rest, so every change is reviewed and reversible.'
      ),
      spot(
        'k8s-11-1-d',
        'Review the Helm values',
        'Tap the values that should not ship to production.',
        `
replicaCount: 1
image:
  tag: latest
resources: {}
ingress:
  tls: false`,
        {
          0: 'One replica means no redundancy in production.',
          2: 'latest is mutable. Pin the image tag the pipeline produced.',
          3: 'No requests or limits: the scheduler cannot place it well and one pod can starve a node.',
          5: 'Production ingress without TLS sends customer data in clear text.',
        }
      ),
      terminal(
        'k8s-11-1-e',
        'Roll back a Helm release',
        'A helm upgrade broke checkout. Return to the previous release.',
        'Roll the checkout release back.',
        ['helm history checkout -n shop', 'helm rollback checkout 3 -n shop'],
        [
          cmd(
            '^helm history checkout$',
            `REVISION  STATUS      CHART           DESCRIPTION
2         superseded  checkout-1.3.0  Upgrade complete
3         superseded  checkout-1.4.0  Upgrade complete
4         deployed    checkout-1.5.0  Upgrade complete`
          ),
          cmd('^helm rollback checkout( 3)?$', 'Rollback was a success! Happy Helming!', {
            goal: true,
          }),
          cmd('^helm uninstall', '', {
            mistake:
              'Uninstalling removes the release and its resources. Use helm rollback to return to a working revision.',
          }),
        ]
      ),
    ]),

    lesson('k8s-11-2', 'Upgrades and quotas', [
      upgrade,
      order(
        'k8s-11-2-b',
        'A safe cluster upgrade',
        'Order the upgrade.',
        [
          'Read the release notes and check for removed APIs',
          'Upgrade a staging cluster and run the smoke tests',
          'Upgrade the control plane',
          'Upgrade node pools one at a time: surge, cordon, drain, replace',
          'Verify workloads and cluster add-ons are healthy',
        ],
        'Prove it in staging, then move outward from the control plane, one node pool at a time, so PodDisruptionBudgets can keep services up.'
      ),
      spot(
        'k8s-11-2-c',
        'Judge the upgrade plan',
        'Tap what could cause an outage.',
        `
plan: upgrade prod 1.29 -> 1.32
step 1: upgrade all nodes first
step 2: upgrade control plane
step 3: skip staging, we are short on time
step 4: ignore deprecated API warnings`,
        {
          0: 'Upgrades go one minor version at a time. Skipping versions is not supported.',
          1: 'Nodes may not run a newer version than the control plane. Upgrade the control plane first.',
          3: 'Skipping staging means production finds the problems.',
          4: 'Deprecated APIs that are removed in the target version break your manifests and controllers.',
        }
      ),
      fill(
        'k8s-11-2-d',
        'Give the shop a fair share',
        'Cap the shop namespace so it cannot starve other teams.',
        `apiVersion: v1
kind: ResourceQuota
metadata:
  name: shop-quota
  namespace: shop
spec:
  hard:
    requests.cpu: [[cpu]]
    requests.memory: [[mem]]
    pods: [[pods]]`,
        {
          cpu: ['40', 'Total CPU the namespace may request: forty cores.'],
          mem: [
            '80Gi',
            'Total memory requests. Pairs with a LimitRange so every pod has a request.',
          ],
          pods: ['100', 'A pod count cap stops a runaway controller creating thousands of pods.'],
        },
        ['4000', '1Ti', '5']
      ),
      terminal(
        'k8s-11-2-e',
        'The quota wall',
        'A new deployment in shop is stuck with "exceeded quota". Find the limit.',
        'Describe the ResourceQuota.',
        ['kubectl get events -n shop', 'kubectl describe resourcequota shop-quota -n shop'],
        [
          cmd(
            '^get events?$',
            `Warning  FailedCreate  replicaset/reports-6d9  Error creating: pods "reports-6d9-x" is forbidden: exceeded quota: shop-quota, requested: requests.cpu=500m, used: requests.cpu=39800m, limited: requests.cpu=40`
          ),
          cmd(
            '^describe (resourcequota|quota) shop-quota$',
            `Name:         shop-quota
Resource       Used     Hard
--------       ----     ----
pods           63       100
requests.cpu   39800m   40
requests.memory 71Gi    80Gi

The namespace has used nearly all of its CPU requests.`,
            { goal: true }
          ),
        ]
      ),
    ]),

    lesson(
      'k8s-11-3',
      'Capstone: launch day',
      [
        diagram(
          'k8s-11-3-a',
          'The finished Bubbled Shop',
          'Place the pieces that make the platform production-ready.',
          [
            [box('u', 'Customers')],
            [gap('ing', 'Ingress with TLS', 'One public entry point with automatic certificates.')],
            [box('co', 'checkout', '3+ pods, probes'), box('ca', 'cart', '3+ pods, probes')],
            [
              gap(
                'hpa',
                'Autoscaler',
                'Adds pods on load so a flash sale does not melt the service.'
              ),
              gap(
                'pdb',
                'Disruption budget',
                'Keeps a minimum of pods up during drains and upgrades.'
              ),
            ],
            [
              gap(
                'sts',
                'StatefulSet with PVC',
                'The database keeps its own volume and a stable identity.'
              ),
            ],
            [gap('es', 'External Secrets', 'Keys come from the vault, never from git.')],
          ],
          ['emptyDir volume', 'NodePort Service', 'cluster-admin ServiceAccount']
        ),
        triage(
          'k8s-11-3-b',
          'Launch is blocked',
          '20 minutes before the sale. Argo CD shows the shop app Degraded and checkout stuck Progressing.',
          3,
          {
            start: {
              output: 'Argo CD: shop  Sync: Synced  Health: Degraded  checkout Progressing for 10m',
              question: 'First move?',
              choices: [
                choice('kubectl get pods -n shop', 'What state are the pods in?', 'pods', true, 1),
                choice(
                  'kubectl set image deployment/checkout checkout=shop/checkout:1.5.0 -n shop',
                  'Patch the image live',
                  'drift',
                  false,
                  4
                ),
                choice('argocd app sync shop --force', 'Force another sync', 'resync', false, 3),
              ],
            },
            drift: {
              output:
                'Image updated live. Thirty seconds later Argo CD self-heal puts the git version back. The bad image returns.',
              question: 'With GitOps, git wins. Investigate first.',
              choices: [
                choice('kubectl get pods -n shop', 'What state are the pods in?', 'pods', true, 1),
                choice(
                  'kubectl set image deployment/checkout checkout=shop/checkout:1.5.0 -n shop',
                  'Patch it again',
                  'drift',
                  false,
                  4
                ),
              ],
            },
            resync: {
              output:
                'Synced again to the same commit. Same result: the problem is in git, not in the sync.',
              question: 'Look at the pods.',
              choices: [
                choice('kubectl get pods -n shop', 'What state are the pods in?', 'pods', true, 1),
                choice('argocd app sync shop --force', 'Sync again', 'resync', false, 3),
              ],
            },
            pods: {
              output: `checkout-9d4f7c6b5-q2xzl   0/1   ImagePullBackOff   0   10m
checkout-5f7b8c9d4-hq2lw   1/1   Running            0   2d`,
              question: 'The new pod cannot pull its image. Why?',
              choices: [
                choice(
                  'kubectl describe pod checkout-9d4f7c6b5-q2xzl -n shop',
                  'Read the pull error',
                  'desc',
                  true,
                  1
                ),
                choice(
                  'kubectl delete pod checkout-9d4f7c6b5-q2xzl -n shop',
                  'Recreate it',
                  'pods',
                  false,
                  3
                ),
              ],
            },
            desc: {
              output:
                'Failed to pull image "shop/checkout:1.4.22": manifest unknown. The commit in git has a typo in the tag.',
              question: 'The bug is in git. How do you fix it?',
              choices: [
                choice(
                  'Revert the commit in git and let Argo CD sync',
                  'Fix the source of truth',
                  'fixed',
                  true,
                  1
                ),
                choice(
                  'kubectl edit deployment checkout -n shop',
                  'Edit it live',
                  'drift',
                  false,
                  4
                ),
              ],
            },
            fixed: {
              output: 'Commit reverted. Argo CD: Synced and Healthy. checkout 3/3 Ready on 1.4.2.',
              end: {
                rootCause:
                  'A commit changed the checkout image tag to one that does not exist (1.4.22).',
                fix: 'Revert the commit. GitOps applies the previous known-good state, and the pipeline fixes the tag properly later.',
                lesson:
                  'In GitOps, fix problems where the truth lives. Live edits are reverted and force-syncs repeat the same mistake.',
              },
            },
          }
        ),
        order(
          'k8s-11-3-c',
          'Launch-day checklist',
          'Order what you verify before the sale starts.',
          [
            'Every service has endpoints and Ready pods',
            'The ingress serves valid TLS and redirects HTTP',
            'Autoscalers and node pools have headroom for the peak',
            'Alerts and the on-call rota are live',
            'Run a final smoke test and keep rollback one command away',
          ],
          'Prove the wiring, then the public edge, then capacity, then your ability to notice and react, and finish with an end-to-end test and a rollback plan.'
        ),
      ],
      true
    ),
  ],
});
