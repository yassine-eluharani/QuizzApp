import { tapToLearn } from './scenes-common';

export const rolloutSettings = tapToLearn(
  'k8s-6-1-k1',
  'Rollout settings',
  'Six settings decide how safe a release is.',
  'Tap all six',
  [
    {
      label: 'maxSurge: 1',
      info: 'How many extra pods may exist during a rollout. One at a time keeps cost and risk small.',
    },
    {
      label: 'maxUnavailable: 0',
      info: 'How many pods may be missing. 0 never removes a working pod before its replacement is Ready.',
    },
    {
      label: 'minReadySeconds: 10',
      info: 'A new pod must stay Ready this long before it counts. It catches pods that crash right after starting.',
    },
    {
      label: 'progressDeadlineSeconds: 300',
      info: 'If a rollout makes no progress for this long it is marked failed, so CI and alerts can react.',
    },
    {
      label: 'revisionHistoryLimit: 10',
      info: 'How many old ReplicaSets are kept for rollbacks. 0 would disable rollbacks.',
    },
    {
      label: 'strategy: Recreate',
      info: 'Stops every old pod before starting new ones. There is a gap with zero pods: downtime.',
    },
  ]
);

export const rolloutCommands = tapToLearn(
  'k8s-6-1-k2',
  'Rollout commands',
  'Four commands run a release, and one limit to remember.',
  'Tap all five',
  [
    {
      label: 'kubectl set image ...',
      info: 'Changes the image on the Deployment and starts a rolling update.',
    },
    {
      label: 'kubectl rollout status',
      info: 'Waits and prints progress until the rollout finishes or fails.',
    },
    {
      label: 'kubectl rollout history',
      info: 'Lists the revisions (one per ReplicaSet) you can go back to.',
    },
    {
      label: 'kubectl rollout undo',
      info: 'Returns to the previous revision. It is quick because the old ReplicaSet is still there.',
    },
    {
      label: 'What undo does not undo',
      info: 'Only the pod template goes back. A database migration stays (expand, then contract), and so does a changed ConfigMap.',
    },
  ]
);

export const canarySteps = tapToLearn(
  'k8s-6-2-k1',
  'Scripting a canary',
  'A canary tool such as Argo Rollouts runs the release from a list of steps.',
  'Tap all five',
  [
    {
      label: 'setWeight',
      info: 'The share of traffic sent to the canary: 5, then 25, then 100. Widen gradually. Starting at 50 is not a canary.',
    },
    {
      label: 'pause: { duration: 5m }',
      info: 'Long enough for error rate and latency to show up. A bare pause waits for a human.',
    },
    {
      label: 'analysis',
      info: 'An automated check of error rate and latency that aborts the rollout for you.',
    },
    {
      label: 'The abort rule',
      info: 'Decide the abort criteria before you ship, and abort fast when they are met.',
    },
    {
      label: 'kubectl argo rollouts',
      info: 'abort sends all traffic back to stable. promote --full ships to everyone. undo returns to the previous revision.',
    },
  ]
);
