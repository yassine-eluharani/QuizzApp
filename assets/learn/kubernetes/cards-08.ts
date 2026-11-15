import { tapToLearn } from './scenes-common';

export const serviceMonitor = tapToLearn(
  'k8s-8-1-k1',
  'Telling Prometheus what to scrape',
  'With the Prometheus Operator, a ServiceMonitor says which Services to scrape.',
  'Tap all five',
  [
    {
      label: 'ServiceMonitor',
      info: 'A custom object of the Prometheus Operator. One per thing you want scraped.',
    },
    {
      label: 'selector.matchLabels',
      info: 'Matches Services by label, not pods. The Service must carry that label.',
    },
    {
      label: 'port: metrics',
      info: 'The name of the Service port that serves the metrics.',
    },
    {
      label: 'path: /metrics',
      info: 'The conventional endpoint, separate from the health probes.',
    },
    {
      label: 'interval: 30s',
      info: 'How often to scrape. 30s balances detail and storage cost. 1s would multiply the cost for little gain.',
    },
  ]
);

export const sloTerms = tapToLearn(
  'k8s-8-2-k1',
  'SLI, SLO and the budget',
  'Three words turn reliability into a number you can manage.',
  'Tap all five',
  [
    {
      label: 'SLI',
      info: 'What you measure, from the user’s side: checkout success rate or latency. CPU is a cause, not an experience.',
    },
    {
      label: 'SLO',
      info: 'The target for it, like 99.9% over 30 days. 100% is impossible and leaves no room to ship.',
    },
    {
      label: 'Error budget',
      info: '100% minus the SLO. 0.1% of 30 days is about 43 minutes of failure you may spend.',
    },
    {
      label: 'Burn-rate alert',
      info: 'Page when the budget burns too fast, not on every CPU spike.',
    },
    {
      label: 'Budget spent',
      info: 'When the budget is gone, slow risky releases and fix reliability first.',
    },
  ]
);

export const alertRules = tapToLearn(
  'k8s-8-2-k2',
  'A good alert rule',
  'A page at 2 a.m. has to be worth it. Four parts decide that.',
  'Tap all four',
  [
    {
      label: 'expr measures users',
      info: 'Alert on error ratio or latency. up == 0 only says a scrape failed: it misses 500s and slow answers.',
    },
    {
      label: 'for: 5m',
      info: 'The condition must hold this long. for: 0m pages on a single blip.',
    },
    {
      label: 'severity label',
      info: 'Routes the alert: page wakes someone, info goes to chat.',
    },
    {
      label: 'summary + runbook',
      info: 'Say what is wrong and link the runbook. “Something is wrong” wastes the first ten minutes.',
    },
  ]
);

export const alertRouting = tapToLearn(
  'k8s-8-2-k3',
  'Routing alerts',
  'Alertmanager decides who hears about an alert, and how often.',
  'Tap all four',
  [
    {
      label: 'receiver',
      info: 'Where an alert goes. By default here: the Slack channel.',
    },
    {
      label: 'group_by',
      info: 'Alerts with the same labels are grouped: fifty alerts from one incident become one notification.',
    },
    {
      label: 'repeat_interval',
      info: 'How long before a still-firing alert is sent again. 4h reminds without nagging.',
    },
    {
      label: 'severity matcher',
      info: 'A child route that matches severity="page" sends only real incidents to the on-call phone.',
    },
  ]
);

export const incidentRoutine = tapToLearn(
  'k8s-8-2-k4',
  'Running an incident',
  'When the page comes, a routine beats heroics.',
  'Tap all five',
  [
    {
      label: 'Acknowledge',
      info: 'Take the page and open an incident channel. Name one incident commander so the response stays coordinated.',
    },
    {
      label: 'What changed?',
      info: 'Check deploys, config and traffic first. Most incidents start with a change.',
    },
    {
      label: 'Mitigate first',
      info: 'Roll back or scale so customers are served again. Investigating can wait.',
    },
    {
      label: 'Confirm recovery',
      info: 'Check the metrics, not a feeling.',
    },
    {
      label: 'Post-mortem',
      info: 'Write a blameless post-mortem with action items. The goal is prevention, not blame.',
    },
  ]
);
