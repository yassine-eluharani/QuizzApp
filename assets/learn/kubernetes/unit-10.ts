import { choice, lesson, order, spot, triage, unit } from '@/lib/learn/dsl';
import { backoff, dnsDown, statuses } from './scenes-10';
import { exitCodes, nodeTrouble, dontWorsen } from './cards-10';

export const unit10 = unit({
  id: 'k8s-u10',
  title: 'Production incidents',
  blurb:
    'Real outages, no hand-holding. Read the evidence, mitigate before you investigate, and avoid the moves that turn an incident into a disaster.',
  icon: 'alert',
  badge: { id: 'badge-incident-commander', title: 'Incident commander' },
  lessons: [
    lesson('k8s-10-1', 'Pods that will not run', [
      statuses,
      exitCodes,
      spot(
        'k8s-10-1-b',
        'Exit codes',
        'Tap the exit codes that mean the app never even started.',
        `
Exit Code 0    Completed normally
Exit Code 1    Application error (read the logs)
Exit Code 137  SIGKILL (OOM kill, or killed after the grace period)
Exit Code 143  SIGTERM (a graceful stop was requested)
Exit Code 126  Command found but not executable
Exit Code 127  Command not found in the image`,
        {
          4: '126 means the command exists but cannot run (permissions or wrong file type). The entrypoint is wrong.',
          5: '127 means the command is not in the image at all. A wrong entrypoint or a broken build.',
        }
      ),
      backoff,
      triage(
        'k8s-10-1-c',
        'catalog is crash-looping',
        'After a deploy that used the Recreate strategy, catalog is in CrashLoopBackOff and product pages are empty.',
        2,
        {
          start: {
            output: `NAME                      READY   STATUS             RESTARTS
catalog-6b7f9c-4xkq2      0/1     CrashLoopBackOff   6
catalog-6b7f9c-9tz7m      0/1     CrashLoopBackOff   6`,
            question: 'First move?',
            choices: [
              choice(
                'kubectl logs catalog-6b7f9c-4xkq2 -n shop --previous',
                'Read why the last container died',
                'logs',
                true,
                1
              ),
              choice(
                'kubectl delete pod -l app=catalog -n shop',
                'Recreate the pods',
                'recreated',
                false,
                4
              ),
              choice(
                'kubectl rollout restart deployment/catalog -n shop',
                'Restart the rollout',
                'recreated',
                false,
                3
              ),
            ],
          },
          recreated: {
            output:
              'New pods, same crash. A crash caused by the pod spec is not fixed by recreating pods.',
            question: 'Read the evidence.',
            choices: [
              choice(
                'kubectl logs catalog-6b7f9c-4xkq2 -n shop --previous',
                'Read why it died',
                'logs',
                true,
                1
              ),
              choice(
                'kubectl delete pod -l app=catalog -n shop',
                'Try again',
                'recreated',
                false,
                4
              ),
            ],
          },
          logs: {
            output: 'panic: environment variable CATALOG_DB_URL is required',
            question:
              'The new release needs a variable it does not have. Customers are down. What now?',
            choices: [
              choice(
                'kubectl rollout undo deployment/catalog -n shop',
                'Roll back to the working version',
                'fixed',
                true,
                1
              ),
              choice(
                'kubectl set env deployment/catalog CATALOG_DB_URL=postgres://user:pass@db/catalog -n shop',
                'Set the variable directly',
                'plainenv',
                false,
                5
              ),
            ],
          },
          plainenv: {
            output:
              'Pods start. But the database password is now in plain text in the Deployment spec and in your shell history.',
            question: 'It works, but you have created a leak. Fix it properly.',
            choices: [
              choice(
                'Move it into a Secret and reference it with secretKeyRef',
                'Use a Secret',
                'fixed',
                true,
                2
              ),
              choice('Leave it, it is working', 'Move on', 'plainenv', false, 4),
            ],
          },
          fixed: {
            output: 'catalog 2/2 Ready on the previous revision. Product pages are back.',
            end: {
              rootCause:
                'The new release required CATALOG_DB_URL, which was never added to the Deployment, so the app panicked on start.',
              fix: 'Roll back to restore service, then add the variable through a Secret in the next release and validate required config in CI.',
              lesson:
                'Read kubectl logs --previous first. Mitigate with a rollback, and never put credentials in plain environment values.',
            },
          },
        }
      ),
      triage(
        'k8s-10-1-d',
        'Image will not pull',
        'The registry token was rotated this morning. New checkout pods are stuck in ErrImagePull.',
        2,
        {
          start: {
            output: `checkout-8c6d4f7b9-xk2pq   0/1   ErrImagePull   0   3m`,
            question: 'First move?',
            choices: [
              choice(
                'kubectl describe pod checkout-8c6d4f7b9-xk2pq -n shop',
                'Read the pull error',
                'desc',
                true,
                1
              ),
              choice('Change the image tag to latest', 'Pull something else', 'latest', false, 6),
              choice(
                'kubectl rollout undo deployment/checkout -n shop',
                'Roll back',
                'undone',
                false,
                3
              ),
            ],
          },
          latest: {
            output:
              'Same error: it is the registry credential, not the tag. You also just made the deployment non-reproducible.',
            question: 'Read the actual error.',
            choices: [
              choice(
                'kubectl describe pod checkout-8c6d4f7b9-xk2pq -n shop',
                'Read the pull error',
                'desc',
                true,
                1
              ),
              choice('Try another tag', 'Keep guessing', 'latest', false, 6),
            ],
          },
          undone: {
            output:
              'Rolled back, but any new node or evicted pod still cannot pull images: the credential is the real problem.',
            question: 'You bought time. Find the cause.',
            choices: [
              choice(
                'kubectl describe pod checkout-8c6d4f7b9-xk2pq -n shop',
                'Read the pull error',
                'desc',
                true,
                1
              ),
              choice('Assume it is fixed', 'Move on', 'undone', false, 6),
            ],
          },
          desc: {
            output: 'Failed to pull image: unauthorized: authentication required',
            question: 'The pull secret holds the old token. Fix it.',
            choices: [
              choice(
                'Update the imagePullSecret with the new registry token',
                'Refresh the credential',
                'fixed',
                true,
                1
              ),
              choice('Make the image repository public', 'Remove the auth', 'public', false, 8),
            ],
          },
          public: {
            output: 'Pods pull now. But anyone on the internet can pull your application images.',
            question: 'That is a security regression. Undo it.',
            choices: [
              choice(
                'Update the imagePullSecret with the new registry token and make the repository private again',
                'Do it properly',
                'fixed',
                true,
                2
              ),
              choice('Leave it public', 'Accept', 'public', false, 10),
            ],
          },
          fixed: {
            output: 'imagePullSecret updated. Pods pull the image and become Ready.',
            end: {
              rootCause:
                'The registry token was rotated, but the imagePullSecret in the cluster still held the old one.',
              fix: 'Refresh the pull secret (and automate it with an operator or workload identity so rotation does not break pulls).',
              lesson:
                'Rotating a credential means updating everything that uses it. ErrImagePull with unauthorized is a credential problem, not a tag problem.',
            },
          },
        }
      ),
      order(
        'k8s-10-1-e',
        'A general debugging routine',
        'Order the steps for any unhealthy workload.',
        [
          'Check what changed recently (deploys, config, traffic)',
          'Read the pod status and restart count',
          'Describe the pod: events and last state',
          'Read the logs, including --previous',
          'Mitigate: roll back, scale or fail over',
        ],
        'Start with the cheapest evidence, then mitigate as soon as you have a safe move. Deep investigation happens after customers are served.'
      ),
    ]),

    lesson('k8s-10-2', 'DNS and node incidents', [
      dnsDown,
      triage(
        'k8s-10-2-b',
        'Names do not resolve',
        'Checkout cannot reach payments. Logs show "lookup payments.shop.svc: i/o timeout" and other services show the same.',
        2,
        {
          start: {
            output:
              'checkout logs: dial tcp: lookup payments.shop.svc on 10.96.0.10:53: i/o timeout',
            question: 'Several services see lookup timeouts. First move?',
            choices: [
              choice(
                'kubectl top pods -n kube-system -l k8s-app=kube-dns',
                'Look at CoreDNS',
                'dns',
                true,
                1
              ),
              choice(
                'kubectl rollout restart deployment/checkout -n shop',
                'Restart checkout',
                'restartedc',
                false,
                4
              ),
              choice(
                'kubectl delete svc payments -n shop',
                'Recreate the Service',
                'delsvc',
                false,
                8
              ),
            ],
          },
          restartedc: {
            output: 'checkout restarted. The same timeouts: the lookup fails for every service.',
            question: 'Think shared dependency.',
            choices: [
              choice(
                'kubectl top pods -n kube-system -l k8s-app=kube-dns',
                'Look at CoreDNS',
                'dns',
                true,
                1
              ),
              choice(
                'kubectl rollout restart deployment/checkout -n shop',
                'Restart again',
                'restartedc',
                false,
                4
              ),
            ],
          },
          delsvc: {
            output:
              'Service deleted. Now the name does not exist at all and callers get NXDOMAIN. You made it worse.',
            question: 'Restore it.',
            choices: [
              choice(
                'kubectl apply -f payments-svc.yaml',
                'Restore the Service from git',
                'start',
                true,
                3
              ),
              choice('Leave it deleted', 'Move on', 'delsvc', false, 8),
            ],
          },
          dns: {
            output: `NAME                       CPU(cores)
coredns-5d78c9869d-4rkzp   998m
coredns-5d78c9869d-mq8zt   1000m

2 replicas, both pinned at their 1000m CPU limit.`,
            question: 'CoreDNS is saturated. Fix it.',
            choices: [
              choice(
                'kubectl scale deployment coredns -n kube-system --replicas=6',
                'Add DNS capacity',
                'fixed',
                true,
                1
              ),
              choice(
                'Hardcode the payments IP in the checkout config',
                'Bypass DNS',
                'hardcode',
                false,
                6
              ),
            ],
          },
          hardcode: {
            output:
              'Checkout works until the pod IP changes, and every other service is still failing on DNS.',
            question: 'It does not scale. Fix the shared problem.',
            choices: [
              choice(
                'kubectl scale deployment coredns -n kube-system --replicas=6',
                'Add DNS capacity',
                'fixed',
                true,
                1
              ),
              choice('Hardcode more IPs', 'Keep patching', 'hardcode', false, 6),
            ],
          },
          fixed: {
            output: 'coredns 6/6 Ready. Lookups succeed across the namespace.',
            end: {
              rootCause:
                'CoreDNS had two replicas at their CPU limit while traffic had grown, so lookups timed out for every service.',
              fix: 'Scale CoreDNS now, then add the DNS autoscaler and a node-local DNS cache so it scales with the cluster.',
              lesson:
                'When unrelated services fail together, check the shared dependency. DNS needs monitoring and capacity like any other service.',
            },
          },
        }
      ),
      nodeTrouble,
      triage(
        'k8s-10-2-c',
        'Node not ready',
        'node-3 went NotReady and its pods were evicted. Two services are degraded.',
        3,
        {
          start: {
            output: 'node-3   NotReady   (kubelet stopped posting status 4m ago)',
            question: 'First move?',
            choices: [
              choice('kubectl describe node node-3', 'Why is it not ready?', 'nodedesc', true, 1),
              choice('kubectl delete node node-3', 'Remove it', 'delnode', false, 6),
              choice('Reboot the virtual machine', 'Turn it off and on again', 'reboot', false, 4),
            ],
          },
          delnode: {
            output:
              'node/node-3 deleted. The kubelet re-registers it a minute later, still unhealthy. You learned nothing.',
            question: 'Find the cause.',
            choices: [
              choice('kubectl describe node node-3', 'Why is it not ready?', 'nodedesc', true, 1),
              choice('kubectl delete node node-3', 'Delete again', 'delnode', false, 6),
            ],
          },
          reboot: {
            output:
              'The node came back and went NotReady again 10 minutes later. The cause is still there.',
            question: 'Look at the conditions.',
            choices: [
              choice('kubectl describe node node-3', 'Why is it not ready?', 'nodedesc', true, 1),
              choice('Reboot again', 'Same again', 'reboot', false, 4),
            ],
          },
          nodedesc: {
            output: `Conditions:
  MemoryPressure   True    KubeletHasInsufficientMemory
  Ready            False   KubeletNotReady: PLEG is not healthy
Non-terminated Pods: 41 (28 with no memory limit)`,
            question: 'Pods without limits exhausted the node. What is the lasting fix?',
            choices: [
              choice(
                'Cordon and drain node-3, replace it, and enforce requests and limits with a LimitRange',
                'Fix the cause',
                'fixed',
                true,
                2
              ),
              choice(
                'Add more nodes and move on',
                'Spread the problem around',
                'nodedesc',
                false,
                5
              ),
            ],
          },
          fixed: {
            output:
              'node-3 replaced. LimitRange now gives every container a default request and limit.',
            end: {
              rootCause:
                'Pods with no memory limits consumed the whole node, starving the kubelet and pushing the node NotReady.',
              fix: 'Replace the node, then require memory requests and limits (a LimitRange default and an admission policy).',
              lesson:
                'Rebooting and deleting nodes hides the cause. Read the node conditions, and make requests and limits mandatory so one workload cannot starve the rest.',
            },
          },
        }
      ),
      spot(
        'k8s-10-2-d',
        'Why was this pod evicted?',
        'Tap the line that explains the eviction.',
        `
Warning  Evicted   The node was low on resource: memory. Container checkout was using 1.2Gi, request is 256Mi.
Warning  Unhealthy Readiness probe failed: connection refused
Normal   Pulled    Container image already present on machine`,
        {
          0: 'The pod used 1.2 GiB against a 256 MiB request, so it was the first to be evicted when the node ran low on memory.',
        }
      ),
      dontWorsen,
    ]),

    lesson(
      'k8s-10-3',
      'Boss: the cascade',
      [
        triage(
          'k8s-10-3-a',
          'Everything is failing at 11:02',
          'Checkout, cart and payments all show errors and high latency. The sale started an hour ago.',
          4,
          {
            start: {
              output: 'checkout 5xx 22%   cart 5xx 18%   payments p99 6s   database CPU 95%',
              question: 'Several services fail together. Where is the common cause?',
              choices: [
                choice(
                  'kubectl get events -A --sort-by=.lastTimestamp',
                  'What changed in the cluster?',
                  'events',
                  true,
                  1
                ),
                choice('Restart every deployment', 'Reset everything', 'restartall', false, 8),
                choice(
                  'Double the replicas of every service',
                  'Add capacity everywhere',
                  'scaleall',
                  false,
                  5
                ),
              ],
            },
            restartall: {
              output:
                'Everything restarts at once: cold caches, connection storms, and the database is hit even harder.',
              question: 'That made it worse. Find the cause.',
              choices: [
                choice(
                  'kubectl get events -A --sort-by=.lastTimestamp',
                  'What changed in the cluster?',
                  'events',
                  true,
                  1
                ),
                choice('Restart every deployment again', 'Again', 'restartall', false, 8),
              ],
            },
            scaleall: {
              output:
                'More pods open more database connections. Postgres hits max_connections and starts refusing everyone.',
              question: 'Scaling a dependency problem makes it worse.',
              choices: [
                choice(
                  'kubectl get events -A --sort-by=.lastTimestamp',
                  'What changed in the cluster?',
                  'events',
                  true,
                  1
                ),
                choice('Double the replicas again', 'More', 'scaleall', false, 5),
              ],
            },
            events: {
              output: `10:58  Normal  Killing  pod/redis-0  Stopping container redis
10:58  Normal  Started  pod/redis-0  Started container redis

Dashboard: cache hit ratio fell from 95% to 9% at 10:58.
Argo CD: redis-config synced from commit a3f9c1 at 10:57.`,
              question:
                'Redis restarted right after a config sync, four minutes before the incident. Next?',
              choices: [
                choice(
                  'kubectl get configmap redis-config -n shop -o yaml',
                  'Inspect the change',
                  'cm',
                  true,
                  1
                ),
                choice(
                  'kubectl rollout undo deployment/checkout -n shop',
                  'Roll back checkout',
                  'wrongundo',
                  false,
                  4
                ),
              ],
            },
            wrongundo: {
              output:
                'Nothing changed in checkout, so undo restores the same code. The cache is still wrong.',
              question: 'Follow the change.',
              choices: [
                choice(
                  'kubectl get configmap redis-config -n shop -o yaml',
                  'Inspect the change',
                  'cm',
                  true,
                  1
                ),
                choice(
                  'kubectl rollout undo deployment/checkout -n shop',
                  'Roll back again',
                  'wrongundo',
                  false,
                  4
                ),
              ],
            },
            cm: {
              output: 'maxmemory 64mb   (was 6gb: a typo, MB instead of GB)',
              question:
                'Redis evicts nearly everything, so every request hits the database. Fix it.',
              choices: [
                choice(
                  'Revert the ConfigMap in git, let GitOps sync, then restart Redis',
                  'Fix it at the source',
                  'warm',
                  true,
                  1
                ),
                choice(
                  'kubectl edit configmap redis-config -n shop',
                  'Edit it live',
                  'handedit',
                  false,
                  4
                ),
              ],
            },
            handedit: {
              output:
                'Fixed for now. Argo CD self-heal reverts your live edit at the next sync, and the incident returns in three minutes.',
              question: 'Fix it in git.',
              choices: [
                choice(
                  'Revert the ConfigMap in git, let GitOps sync, then restart Redis',
                  'Fix it at the source',
                  'warm',
                  true,
                  1
                ),
                choice('Leave the live edit', 'Hope it holds', 'handedit', false, 6),
              ],
            },
            warm: {
              output:
                'Redis restarted with 6 GiB. The cache is cold and the database is still at 95% CPU.',
              question: 'The database needs relief while the cache warms. How do you finish?',
              choices: [
                choice(
                  'Enable rate limiting while the cache warms and let the HPAs settle',
                  'Shed load temporarily',
                  'fixed',
                  true,
                  1
                ),
                choice('Restart the database', 'Reset it', 'dbrestart', false, 8),
              ],
            },
            dbrestart: {
              output:
                'The database restarts with an empty buffer cache and every client reconnects at once. Recovery takes longer.',
              question: 'Do not restart a loaded database.',
              choices: [
                choice(
                  'Enable rate limiting while the cache warms and let the HPAs settle',
                  'Shed load temporarily',
                  'fixed',
                  true,
                  1
                ),
                choice('Restart the database again', 'Again', 'dbrestart', false, 8),
              ],
            },
            fixed: {
              output: 'Cache hit ratio back above 90%. Database CPU 40%. Error rates normal.',
              end: {
                rootCause:
                  'A typo in the Redis ConfigMap (64mb instead of 6gb) made the cache evict almost everything, so all services hammered the database.',
                fix: 'Revert the config through git, restart Redis, shed load while the cache warms, and add config validation and a cache-hit alert.',
                lesson:
                  'When many services fail together, find what changed. Mitigate through the source of truth, and never scale or restart a shared dependency blindly.',
              },
            },
          }
        ),
        spot(
          'k8s-10-3-b',
          'A runbook with traps',
          'Tap the steps that would make an outage worse.',
          `
runbook: when checkout is down
  1. restart all services at once
  2. delete the namespace and re-apply everything
  3. ask in chat if anyone changed something
  4. fix it directly with kubectl edit`,
          {
            1: 'Restarting everything at once causes cold caches and connection storms, which usually deepens the outage.',
            2: 'Deleting a namespace deletes its data, including claims and secrets. Never a first move.',
            4: 'Live edits drift from git. GitOps reverts them, or worse, nobody remembers what changed.',
          }
        ),
        order(
          'k8s-10-3-c',
          'Command the incident',
          'Order the incident process.',
          [
            'Declare the incident and assign an incident commander',
            'Stabilise: mitigate customer impact first',
            'Find the trigger: what changed?',
            'Fix the cause through git and the pipeline',
            'Run a blameless post-mortem with action items',
          ],
          'A named commander keeps the response coordinated. Mitigation comes before diagnosis, and the lasting fix goes through the normal pipeline.'
        ),
      ],
      true
    ),
  ],
});
