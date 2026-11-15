import { tapToLearn } from './scenes-common';

export const exitCodes = tapToLearn(
  'k8s-10-1-k1',
  'Exit codes',
  'When a container dies, the exit code says how.',
  'Tap all five',
  [
    {
      label: '0 and 1',
      info: '0 is a normal exit. 1 is an application error: read the logs.',
    },
    {
      label: '137',
      info: 'SIGKILL: an OOM kill, or killed after the grace period ran out.',
    },
    {
      label: '143',
      info: 'SIGTERM: a graceful stop was requested. Normal during a rollout.',
    },
    {
      label: '126',
      info: 'The command exists but cannot run (permissions, wrong file type): a wrong entrypoint. The app never started.',
    },
    {
      label: '127',
      info: 'The command is not in the image at all: a wrong entrypoint or a broken build. The app never started.',
    },
  ]
);

export const nodeTrouble = tapToLearn(
  'k8s-10-2-k1',
  'Node trouble',
  'A node can fail because of the pods on it. Find the cause before you act.',
  'Tap all four',
  [
    {
      label: 'kubectl describe node',
      info: 'Conditions show why: Ready False, MemoryPressure True. It also lists the pods running on the node.',
    },
    {
      label: 'No limits, no mercy',
      info: 'Pods without memory limits can use all of a node’s memory, starve the kubelet and push the node NotReady.',
    },
    {
      label: 'LimitRange',
      info: 'Gives every container in a namespace a default request and limit, so nothing runs unbounded.',
    },
    {
      label: 'Fix the cause',
      info: 'Cordon and drain the node and replace it. Deleting or rebooting a node hides the cause.',
    },
  ]
);

export const dontWorsen = tapToLearn(
  'k8s-10-2-k2',
  'Do not make it worse',
  'In an incident the wrong first move costs more than the outage.',
  'Tap all six',
  [
    {
      label: 'Do not restart everything',
      info: 'All pods restart at once: cold caches and connection storms hit the database even harder.',
    },
    {
      label: 'Do not blindly scale a dependency',
      info: 'More pods open more database connections, until max_connections refuses everyone.',
    },
    {
      label: 'Fix it at the source',
      info: 'A live kubectl edit drifts from git. With GitOps self-heal, the controller reverts it at the next sync. Change git instead.',
    },
    {
      label: 'Never delete a namespace',
      info: 'It deletes everything inside it, claims and secrets included.',
    },
    {
      label: 'Shed load while caches warm',
      info: 'Rate limiting gives the database room to recover. Never restart a loaded database.',
    },
    {
      label: 'Ask what changed',
      info: 'When unrelated services fail together, kubectl get events -A --sort-by=.lastTimestamp and recent changes point at the cause.',
    },
  ]
);
