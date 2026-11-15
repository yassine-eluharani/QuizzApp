import {
  box,
  choice,
  cmd,
  diagram,
  fill,
  gap,
  lesson,
  order,
  read,
  spot,
  terminal,
  triage,
  unit,
} from '@/lib/learn/dsl';

export const unit8 = unit({
  id: 'k8s-u8',
  title: 'Observability',
  blurb:
    'You cannot fix what you cannot see. Logs, metrics, alerts that wake people for the right reasons, and traces that show where the time goes.',
  icon: 'eye',
  badge: { id: 'badge-always-watching', title: 'Always watching' },
  lessons: [
    lesson('k8s-8-1', 'Logs, events and metrics', [
      read(
        'k8s-8-1-a',
        'Three kinds of evidence',
        [
          'Logs say what happened in one place. Containers write to stdout and stderr, a node agent (Fluent Bit, Vector) ships them to a store, and kubectl logs reads the latest. After a crash use --previous to see the container that died.',
          'Events are the cluster’s own diary (scheduling, probes, evictions) and expire after about an hour. Metrics are numbers over time: Prometheus scrapes /metrics endpoints on an interval, and Grafana draws them. Tracing adds the story of a single request across services.',
        ],
        {
          callout:
            'Log structured JSON with a request or trace id, and never log secrets or personal data. Logs outlive the incident, and so do their leaks.',
        }
      ),
      spot(
        'k8s-8-1-b',
        'Spot the bad log lines',
        'Tap the lines that hurt you in production.',
        `
{"level":"debug","msg":"charge request","card":"4242424242424242","email":"ana@example.com"}
{"level":"info","msg":"order created","order_id":"o_8841","latency_ms":182}
{"level":"error","msg":"payment failed"}`,
        {
          0: 'A card number and an email in logs is a data leak (and a PCI problem), and debug level should not run in production.',
          2: 'No order id, error reason or trace id. On call, this line tells you nothing you can act on.',
        }
      ),
      terminal(
        'k8s-8-1-c',
        'What restarted checkout?',
        'checkout restarted five minutes ago. Find out what triggered it.',
        'Read the namespace events, newest last.',
        [
          'kubectl get events -n shop --sort-by=.lastTimestamp',
          'kubectl logs checkout-5f7b8c9d4-hq2lw -n shop --previous',
        ],
        [
          cmd(
            '^get events?( --sort-by=\\.lastTimestamp)?$',
            `LAST SEEN   TYPE      REASON      OBJECT                         MESSAGE
6m          Warning   Unhealthy   pod/checkout-5f7b8c9d4-hq2lw   Liveness probe failed: HTTP probe failed with statuscode: 500
6m          Normal    Killing     pod/checkout-5f7b8c9d4-hq2lw   Container checkout failed liveness probe, will be restarted
5m          Normal    Pulled      pod/checkout-5f7b8c9d4-hq2lw   Container image already present on machine
5m          Normal    Started     pod/checkout-5f7b8c9d4-hq2lw   Started container checkout`,
            { goal: true }
          ),
          cmd(
            '^logs checkout-5f7b8c9d4-hq2lw --previous$',
            'ERROR db connection pool exhausted (50/50)\nERROR /healthz: dependency check failed'
          ),
        ]
      ),
      order(
        'k8s-8-1-d',
        'Where to look first',
        'Order the checks for a misbehaving pod.',
        [
          'kubectl get pods: status and restart count',
          'kubectl describe pod: events and last state',
          'kubectl logs (and --previous after a crash)',
          'Metrics: CPU, memory, saturation, error rate',
          'Traces: find the slow dependency',
        ],
        'Go from cheap and general to expensive and specific. Status and events usually name the problem before you ever open a dashboard.'
      ),
      fill(
        'k8s-8-1-e',
        'Teach Prometheus to scrape checkout',
        'Create a ServiceMonitor for the checkout Service.',
        `apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: checkout
spec:
  selector:
    matchLabels:
      app: [[sel]]
  endpoints:
    - port: [[port]]
      path: [[path]]
      interval: [[iv]]`,
        {
          sel: ['checkout', 'A ServiceMonitor selects Services by label, not pods.'],
          port: ['metrics', 'The name of the Service port that serves the metrics endpoint.'],
          path: [
            '/metrics',
            'The conventional Prometheus endpoint, separate from the health probes.',
          ],
          iv: [
            '30s',
            'A balance between resolution and storage. A 1s interval would multiply the cost for little gain.',
          ],
        },
        ['8080', '/healthz', '1s']
      ),
      diagram(
        'k8s-8-1-f',
        'The metrics pipeline',
        'Place the tools between the pods and the people.',
        [
          [box('p', 'checkout pods', 'expose /metrics')],
          [
            gap(
              'prom',
              'Prometheus',
              'Scrapes metrics on an interval and stores them as time series.'
            ),
          ],
          [
            gap('g', 'Grafana', 'Queries Prometheus to draw dashboards.', 'dashboards'),
            gap(
              'am',
              'Alertmanager',
              'Receives firing alerts, groups and de-duplicates them and routes them to on-call.',
              'pages on-call'
            ),
          ],
        ],
        ['etcd', 'CoreDNS']
      ),
    ]),

    lesson('k8s-8-2', 'Alerts, SLOs and traces', [
      read(
        'k8s-8-2-a',
        'Alert on pain, not on causes',
        [
          'An SLO is a promise in numbers: for example 99.9% of checkout requests succeed over 30 days. The remaining 0.1% is the error budget (about 43 minutes a month), and you page when you are burning it too fast.',
          'Alert on symptoms users feel (errors, latency), not on causes (high CPU). High CPU with happy users is a ticket, not a 3 a.m. page. Traces then show where the time went across services.',
        ],
        {
          callout:
            'Every page should be urgent, real and actionable. If it is not, delete it or turn it into a ticket.',
        }
      ),
      order(
        'k8s-8-2-b',
        'Define an SLO',
        'Order the steps.',
        [
          'Pick a user-facing SLI such as checkout success rate',
          'Choose a target, for example 99.9% over 30 days',
          'Compute the error budget (0.1%, about 43 minutes)',
          'Alert when the budget burns too fast',
          'Slow risky releases when the budget is spent',
        ],
        'The SLI says what to measure, the SLO says how good is good enough, and the budget turns reliability into a decision tool for releases.'
      ),
      fill(
        'k8s-8-2-c',
        'Route the alerts',
        'Send everything to Slack, but page on-call only for real incidents.',
        `route:
  receiver: slack-shop
  group_by: [[gb]]
  repeat_interval: [[rep]]
  routes:
    - matchers:
        - severity="[[sev]]"
      receiver: pagerduty-oncall`,
        {
          gb: [
            '[alertname, namespace]',
            'Grouping turns fifty alerts from one incident into one page.',
          ],
          rep: ['4h', 'Remind about a still-firing alert without nagging every few minutes.'],
          sev: ['page', 'Only alerts explicitly labelled page reach the on-call phone.'],
        },
        ['[...]', '5s', 'info']
      ),
      spot(
        'k8s-8-2-d',
        'A broken SLO setup',
        'Tap what is wrong.',
        `
SLO: 100% availability
SLI: CPU utilisation of checkout pods
Alert: page when CPU > 80% for 1m
Dashboard: 47 panels, no owner`,
        {
          0: '100% leaves no error budget and is impossible to hit. Every deploy would break the SLO.',
          1: 'CPU is a cause, not what users experience. Use success rate or latency as the SLI.',
          2: 'This pages for CPU spikes users may never notice. Page on SLO burn rate instead.',
        }
      ),
      triage(
        'k8s-8-2-e',
        'Checkout is slow',
        'p99 latency on checkout is 4.2 seconds (normally 400 ms). Error rates look normal.',
        3,
        {
          start: {
            output:
              'p99 checkout latency 4.2s. 5xx rate 0.1%. CPU and memory on checkout look normal.',
            question: 'Where do you start?',
            choices: [
              choice(
                'Open a distributed trace of a slow request',
                'See where the time goes',
                'trace',
                true,
                1
              ),
              choice(
                'kubectl rollout restart deployment/checkout -n shop',
                'Restart checkout',
                'restarted',
                false,
                5
              ),
              choice(
                'kubectl scale deployment checkout --replicas=10 -n shop',
                'Add replicas',
                'scaledup',
                false,
                4
              ),
            ],
          },
          restarted: {
            output:
              'checkout pods restarted. Latency unchanged: the slow part is not inside checkout.',
            question: 'Same result. Look at the evidence.',
            choices: [
              choice(
                'Open a distributed trace of a slow request',
                'See where the time goes',
                'trace',
                true,
                1
              ),
              choice(
                'kubectl rollout restart deployment/checkout -n shop',
                'Restart again',
                'restarted',
                false,
                5
              ),
            ],
          },
          scaledup: {
            output: 'Ten replicas. Latency unchanged: each request still waits on something slow.',
            question: 'More pods did not help. Find the wait.',
            choices: [
              choice(
                'Open a distributed trace of a slow request',
                'See where the time goes',
                'trace',
                true,
                1
              ),
              choice(
                'kubectl scale deployment checkout --replicas=20 -n shop',
                'Even more replicas',
                'scaledup',
                false,
                4
              ),
            ],
          },
          trace: {
            output: `trace 9f31  checkout 4.2s
  cart       12ms
  catalog    40ms
  payments   4.0s
    fraud-service  3.9s`,
            question: 'The time is inside fraud-service. Next?',
            choices: [
              choice(
                'kubectl top pods -n fraud',
                'Look at fraud-service resources',
                'fraud',
                true,
                1
              ),
              choice('Add retries to the payments call', 'Try again on failure', 'retry', false, 4),
            ],
          },
          retry: {
            output: 'Retries multiply the load on an already slow service. Latency gets worse.',
            question: 'Go to the slow service.',
            choices: [
              choice(
                'kubectl top pods -n fraud',
                'Look at fraud-service resources',
                'fraud',
                true,
                1
              ),
              choice('Add even more retries', 'More retries', 'retry', false, 4),
            ],
          },
          fraud: {
            output: `NAME                    CPU(cores)
fraud-service-6d7c-x9   1000m   (limit 1000m, throttled 94%)

A CPU limit was lowered in yesterday's deploy.`,
            question: 'fraud-service is CPU throttled. Fix?',
            choices: [
              choice(
                'Raise the fraud-service CPU limit and add a timeout in payments',
                'Fix the cause and protect the caller',
                'fixed',
                true,
                1
              ),
              choice(
                'kubectl rollout restart deployment/fraud-service -n fraud',
                'Restart it',
                'fraud',
                false,
                4
              ),
            ],
          },
          fixed: {
            output: 'fraud-service CPU throttling 0%. p99 checkout latency 410ms.',
            end: {
              rootCause:
                'A lowered CPU limit on fraud-service throttled it, so every payment waited on it.',
              fix: 'Raise the limit to match real usage, and add a timeout (and later a circuit breaker) in payments so a slow dependency cannot stall checkout.',
              lesson:
                'When latency is high and the service looks healthy, follow a trace to the span that owns the time. Scaling and restarting the wrong service only wastes minutes.',
            },
          },
        }
      ),
    ]),

    lesson(
      'k8s-8-3',
      'Boss: the 2 a.m. page',
      [
        spot(
          'k8s-8-3-a',
          'Review this alert rule',
          'Tap what makes this a bad page.',
          `
alert: CheckoutDown
expr: up{job="checkout"} == 0
for: 0m
labels:
  severity: page
annotations:
  summary: "something is wrong"`,
          {
            1: 'up == 0 only says Prometheus could not scrape. It does not catch 500s or slow responses that customers feel.',
            2: 'for: 0m pages on a single blip. Require the condition to hold for a few minutes.',
            6: 'A vague summary wastes the first ten minutes of the incident. Say what is wrong and link a runbook.',
          }
        ),
        triage(
          'k8s-8-3-b',
          'Error budget burning',
          '02:10. CheckoutErrorBudgetBurn is firing. The 5xx rate is 12% and has been since 01:47.',
          2,
          {
            start: {
              output: 'ALERT CheckoutErrorBudgetBurn  5xx ratio 12%  firing since 01:47',
              question: 'First move?',
              choices: [
                choice(
                  'kubectl rollout history deployment/checkout -n shop',
                  'What changed recently?',
                  'hist',
                  true,
                  1
                ),
                choice(
                  'Silence the alert and go back to sleep',
                  'Wait for the morning',
                  'silenced',
                  false,
                  10
                ),
                choice(
                  'kubectl delete pods -l app=checkout -n shop',
                  'Restart everything',
                  'killpods',
                  false,
                  6
                ),
              ],
            },
            silenced: {
              output: 'Alert silenced. Customers are still failing; nobody is looking.',
              question: 'You muted the symptom, not the problem.',
              choices: [
                choice(
                  'kubectl rollout history deployment/checkout -n shop',
                  'Investigate now',
                  'hist',
                  true,
                  1
                ),
                choice('Stay silent', 'Sleep', 'silenced', false, 10),
              ],
            },
            killpods: {
              output: 'Pods recreated from the same template. Same errors within a minute.',
              question: 'Restarting does not fix a bad release.',
              choices: [
                choice(
                  'kubectl rollout history deployment/checkout -n shop',
                  'Check what changed',
                  'hist',
                  true,
                  1
                ),
                choice(
                  'kubectl delete pods -l app=checkout -n shop',
                  'Restart again',
                  'killpods',
                  false,
                  6
                ),
              ],
            },
            hist: {
              output: `REVISION  CHANGE-CAUSE
7         checkout 1.4.2
8         checkout 1.5.0   (deployed 01:45)

Errors began at 01:47.`,
              question: 'A release landed two minutes before the errors. What now?',
              choices: [
                choice(
                  'kubectl rollout undo deployment/checkout -n shop',
                  'Roll back first, debug later',
                  'fixed',
                  true,
                  1
                ),
                choice('Wait to see if it clears by itself', 'Watch', 'waited', false, 6),
              ],
            },
            waited: {
              output: 'Ten more minutes of customers failing. It did not clear.',
              question: 'Roll back.',
              choices: [
                choice(
                  'kubectl rollout undo deployment/checkout -n shop',
                  'Roll back',
                  'fixed',
                  true,
                  1
                ),
                choice('Keep waiting', 'Watch', 'waited', false, 6),
              ],
            },
            fixed: {
              output: 'deployment.apps/checkout rolled back. 5xx ratio 0.1% within two minutes.',
              end: {
                rootCause:
                  'Release 1.5.0 introduced a bug that returned 500s on checkout, starting two minutes after the deploy.',
                fix: 'Roll back to 1.4.2 immediately, then debug 1.5.0 in staging during working hours.',
                lesson:
                  'When errors start right after a change, mitigate by reverting the change. Investigation can wait until customers are served again.',
              },
            },
          }
        ),
        order(
          'k8s-8-3-c',
          'Run the incident',
          'Order the incident process.',
          [
            'Acknowledge the page and open an incident channel',
            'Check what changed recently: deploys, config, traffic',
            'Mitigate first: roll back or scale',
            'Confirm recovery in the metrics',
            'Write a blameless post-mortem with action items',
          ],
          'Stabilise customers first, understand second. The post-mortem turns the pain into prevention.'
        ),
      ],
      true
    ),
  ],
});
