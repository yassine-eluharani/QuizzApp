import { tapToLearn } from './scenes-common';

export const shopCommands = tapToLearn(
  'k8s-1-1-k1',
  'kubectl on the shop',
  'Four more commands you will use all course.',
  'Tap all four',
  [
    {
      label: 'kubectl get deployment checkout',
      info: 'READY 3/3 means three of three pods are ready. UP-TO-DATE and AVAILABLE show how a rollout is going.',
    },
    {
      label: 'kubectl set image deployment/checkout',
      info: 'Changes the image on the Deployment, so its pods are replaced. Fix problems on the Deployment, never on one pod: it would just be recreated.',
    },
    {
      label: 'kubectl rollout undo',
      info: 'Goes back to the previous version of the Deployment. The fastest safe way out of a bad release.',
    },
    {
      label: 'kubectl delete deployment checkout',
      info: 'Removes every pod. During an incident that is an outage, not a fix.',
    },
  ]
);

export const standardLabels = tapToLearn(
  'k8s-1-2-k1',
  'Standard labels',
  'Selectors use labels. Teams also agree on a standard set, so people and tools read them the same way.',
  'Tap all four',
  [
    {
      label: 'app.kubernetes.io/name',
      info: 'The component: checkout. The selector and Services build on it.',
    },
    {
      label: 'app.kubernetes.io/part-of',
      info: 'The application it belongs to: bubbled-shop. Handy for dashboards and cost reports.',
    },
    {
      label: 'app.kubernetes.io/version',
      info: 'The version that is running, like 1.4.2. Keep it in step with the image tag.',
    },
    {
      label: 'A typo is silent',
      info: 'Labels are free text, so a typo is not an error: it just stops matching. kubectl get pods --show-labels prints them, and -l app=checkout filters by one.',
    },
  ]
);

export const podStatus = tapToLearn(
  'k8s-1-2-k2',
  'Reading pod status',
  'The STATUS column tells you where to look. Three you will meet on day one.',
  'Tap all four',
  [
    {
      label: 'ImagePullBackOff',
      info: 'The node cannot pull the image: wrong tag, or a private registry without credentials (an imagePullSecret). kubectl describe pod shows the error.',
    },
    {
      label: 'CrashLoopBackOff',
      info: 'The container starts, dies and is restarted with growing waits. RESTARTS climbs. kubectl logs --previous shows why the last one died.',
    },
    {
      label: 'Pending',
      info: 'No node was chosen. The Events in kubectl describe pod say why: not enough CPU or memory, a taint, or a volume that is not ready.',
    },
    {
      label: 'Running, but READY 0/1',
      info: 'The process runs, but its readiness probe is failing, so it gets no traffic.',
    },
  ]
);

export const sizingNumbers = tapToLearn(
  'k8s-1-3-k1',
  'Sizing numbers',
  'Before you size a container, learn the units and the shape.',
  'Tap all five',
  [
    {
      label: 'cpu: 250m',
      info: 'm means thousandths of a core. 250m is a quarter of a core. 1000m, or 1, is one whole core.',
    },
    {
      label: 'memory: 256Mi',
      info: 'Mi is mebibytes, Gi is gibibytes. A bare number means bytes, so always write the unit.',
    },
    {
      label: 'requests: what you reserve',
      info: 'Set it a little above what the app really uses at idle. Too high wastes money, too low packs nodes too tight.',
    },
    {
      label: 'limits: the ceiling',
      info: 'Leave headroom over the request. The memory limit is where the container gets OOMKilled.',
    },
    {
      label: 'Where it goes in YAML',
      info: 'resources: then requests: { cpu, memory } and limits: { memory }. The reservation goes under requests, the ceiling under limits.',
    },
  ]
);

export const probeSettings = tapToLearn(
  'k8s-1-3-k2',
  'Probe settings',
  'A probe is a small HTTP check. Where it points and how patient it is decides everything.',
  'Tap all five',
  [
    {
      label: 'readinessProbe path: /ready',
      info: 'Can this pod take traffic? It may check dependencies such as the database. If it fails, the pod only leaves the Service.',
    },
    {
      label: 'livenessProbe path: /healthz',
      info: 'Is the process alive? Check only the process, never other services: a database blip would restart every pod at once.',
    },
    {
      label: 'initialDelaySeconds',
      info: 'Wait this long before the first check. Too small and a slow start is judged dead, killed and restarted forever.',
    },
    {
      label: 'periodSeconds',
      info: 'How often to check. Every 5 seconds is typical.',
    },
    {
      label: 'failureThreshold',
      info: 'How many failures in a row before acting. 1 means one slow answer restarts the pod, so allow a few. The default is 3.',
    },
  ]
);
