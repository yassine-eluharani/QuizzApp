import { tapToLearn } from './scenes-common';

export const argoApplication = tapToLearn(
  'k8s-11-1-k1',
  'An Argo CD Application',
  'One small object tells Argo CD what to keep in sync.',
  'Tap all seven',
  [
    {
      label: 'repoURL + path',
      info: 'Which git repo and folder to watch, like overlays/prod: the same base as staging with production values.',
    },
    {
      label: 'targetRevision: main',
      info: 'The branch that represents production. Promotion is a merge into it.',
    },
    {
      label: 'destination',
      info: 'Which cluster and namespace to apply it to.',
    },
    {
      label: 'automated sync',
      info: 'Argo CD applies new commits by itself.',
    },
    {
      label: 'selfHeal: true',
      info: 'Reverts manual changes in the cluster, so git stays the only truth.',
    },
    {
      label: 'prune: true',
      info: 'Deletes objects that you removed from git.',
    },
    {
      label: 'The pipeline',
      info: 'CI tests and builds the image, a reviewed PR changes git, and Argo CD applies it. The pipeline never runs kubectl on the cluster.',
    },
  ]
);

export const helmBasics = tapToLearn(
  'k8s-11-1-k2',
  'Helm in two minutes',
  'Helm packages manifests so one chart can serve every environment.',
  'Tap all five',
  [
    {
      label: 'Chart',
      info: 'A package of Kubernetes manifests with knobs you can turn.',
    },
    {
      label: 'values.yaml',
      info: 'The knobs per environment: replicaCount, image.tag, resources, ingress.tls. Production rules still apply: no latest, set resources, TLS on.',
    },
    {
      label: 'helm history',
      info: 'Lists the revisions of an installed release.',
    },
    {
      label: 'helm rollback checkout 3',
      info: 'Returns to revision 3. Use it when an upgrade breaks things.',
    },
    {
      label: 'helm uninstall',
      info: 'Removes the release and its resources. That is not a rollback.',
    },
  ]
);

export const quotas = tapToLearn(
  'k8s-11-2-k1',
  'Quotas and limits',
  'A shared cluster needs a fair-share rule per namespace.',
  'Tap all four',
  [
    {
      label: 'ResourceQuota',
      info: 'Caps what a namespace may request in total: requests.cpu: 40 is forty cores, plus requests.memory and a pod count.',
    },
    {
      label: 'LimitRange',
      info: 'Sets defaults so every pod has a request, which a quota needs.',
    },
    {
      label: 'exceeded quota',
      info: 'When the cap is hit, new pods are refused and a FailedCreate event says so.',
    },
    {
      label: 'kubectl describe resourcequota',
      info: 'Shows Used against Hard for each resource. Find the wall.',
    },
  ]
);
