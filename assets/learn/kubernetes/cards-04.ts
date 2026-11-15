import { tapToLearn } from './scenes-common';

export const rightSizing = tapToLearn(
  'k8s-4-1-k1',
  'Right-sizing with kubectl',
  'When a pod restarts, these commands tell you why and let you fix it.',
  'Tap all four',
  [
    {
      label: 'kubectl top pods',
      info: 'Live CPU and memory use per pod (it needs metrics-server). Compare it with the requests and limits.',
    },
    {
      label: 'kubectl describe pod',
      info: 'Shows Last State and Reason (such as OOMKilled), plus the Requests and Limits the pod has.',
    },
    {
      label: 'kubectl set resources',
      info: 'kubectl set resources deployment checkout --limits=memory=1Gi raises the limit and rolls the pods. Go above the peak, never below.',
    },
    {
      label: 'A config fix, not a code fix',
      info: 'A limit that is too low needs no new build: change the limit, roll the Deployment, then update git.',
    },
  ]
);

export const hpaNeeds = tapToLearn(
  'k8s-4-2-k1',
  'What an HPA needs',
  'The HPA is only a number-changer. It needs data and sensible bounds.',
  'Tap all five',
  [
    {
      label: 'metrics-server',
      info: 'Collects CPU and memory from the kubelets. The HPA reads its numbers.',
    },
    {
      label: 'A CPU request on the pods',
      info: 'Utilisation is a percentage of the request. Without one the HPA shows <unknown> and never scales.',
    },
    {
      label: 'kubectl get hpa',
      info: 'TARGETS shows current/target CPU. <unknown>/70% means no metrics. kubectl describe hpa lists the failing condition.',
    },
    {
      label: 'minReplicas and maxReplicas',
      info: 'Keep min at 3 or more for redundancy. Cap max at what the database and the budget can carry, not at 500.',
    },
    {
      label: 'The target: about 70%',
      info: 'Leaves headroom while new pods start. At 95% you scale when users already feel it.',
    },
  ]
);

export const maintenance = tapToLearn(
  'k8s-4-2-k2',
  'Maintenance without downtime',
  'Taking a node out for patching without a customer noticing takes five moves.',
  'Tap all five',
  [
    {
      label: 'kubectl cordon node',
      info: 'Marks the node unschedulable: nothing new lands on it. Pods already there keep running.',
    },
    {
      label: 'kubectl drain node',
      info: 'Evicts the pods so they restart on other nodes. Use --ignore-daemonsets. It respects PodDisruptionBudgets.',
    },
    {
      label: 'PodDisruptionBudget',
      info: 'minAvailable: 2 keeps at least two checkout pods up during drains. With 3 replicas that allows one at a time. 3 would block every drain.',
    },
    {
      label: 'kubectl get pdb',
      info: 'ALLOWED DISRUPTIONS 0 means a drain is blocked until another pod is ready.',
    },
    {
      label: 'kubectl uncordon node',
      info: 'Lets the node take pods again after the maintenance.',
    },
  ]
);
