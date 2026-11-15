import { tapToLearn } from './scenes-common';

export const taints = tapToLearn(
  'k8s-9-1-k1',
  'Taints, tolerations, selectors',
  'Three tools steer pods to some nodes and away from others.',
  'Tap all five',
  [
    {
      label: 'Taint on a node',
      info: 'dedicated=payments:NoSchedule keeps pods away from the node unless they tolerate it.',
    },
    {
      label: 'Toleration on a pod',
      info: 'Its key, value and effect must match the taint exactly, or it does nothing. It allows the pod there. It does not attract it.',
    },
    {
      label: 'nodeSelector',
      info: 'Attracts: matches node labels, like workload=critical.',
    },
    {
      label: 'Both, for a dedicated pool',
      info: 'The taint keeps other pods out, and the nodeSelector pulls yours in.',
    },
    {
      label: 'NoSchedule vs NoExecute',
      info: 'NoSchedule blocks new pods only. NoExecute also evicts pods that are already running.',
    },
  ]
);

export const spreadRules = tapToLearn(
  'k8s-9-2-k1',
  'Spread and anti-affinity',
  'Two ways to tell the scheduler to keep replicas apart, hard and soft.',
  'Tap all five',
  [
    {
      label: 'topologySpreadConstraints',
      info: 'Spreads pods evenly across failure domains. topologyKey says which: a zone, or a node (kubernetes.io/hostname).',
    },
    {
      label: 'maxSkew: 1',
      info: 'No zone may have more than one extra pod compared with the emptiest zone.',
    },
    {
      label: 'whenUnsatisfiable',
      info: 'ScheduleAnyway is soft: the pod is still placed. DoNotSchedule is hard and can leave pods Pending.',
    },
    {
      label: 'Required anti-affinity',
      info: 'A hard filter: no two matching pods on one node. With 12 replicas on 6 nodes, six pods stay Pending.',
    },
    {
      label: 'Preferred anti-affinity',
      info: 'A soft preference with a weight from 1 to 100. The scheduler tries, but never blocks.',
    },
  ]
);

export const nodeDeath = tapToLearn(
  'k8s-9-2-k2',
  'When a node dies',
  'Recovery from a dead node is automatic, and slow on purpose.',
  'Tap all five',
  [
    {
      label: 'NotReady',
      info: 'The node stops reporting and is marked NotReady after a grace period.',
    },
    {
      label: 'The unreachable taint',
      info: 'Its pods get a taint that they tolerate for 300 seconds by default.',
    },
    {
      label: 'Eviction',
      info: 'When the toleration runs out, the pods are evicted.',
    },
    {
      label: 'Replacement',
      info: 'The ReplicaSet creates new pods on healthy nodes. They rejoin the Service once Ready.',
    },
    {
      label: 'Slow by design',
      info: 'Minutes, so a blip does not cause churn. Spread and spare capacity matter more. kubectl get pods -o wide shows each pod’s node.',
    },
  ]
);
