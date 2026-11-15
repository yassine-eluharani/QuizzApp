import { tapToLearn } from './scenes-common';

export const kubectlBasics = tapToLearn(
  'k8s-0-2-k1',
  'Talking to the cluster',
  'You talk to the cluster with one tool, kubectl. It sends your request to the API server.',
  'Tap all five',
  [
    {
      label: 'kubectl get nodes',
      info: 'get lists things. get nodes lists the machines, get pods lists pods. Add -n shop for one namespace, or -A for all of them.',
    },
    {
      label: 'kubectl get pods -n shop',
      info: 'A namespace is a folder inside the cluster. -n shop looks inside the shop namespace. READY 1/1 means the container is up.',
    },
    {
      label: 'kubectl describe pod NAME',
      info: 'Full details of one object, with its events at the bottom: what Kubernetes tried, and what went wrong.',
    },
    {
      label: 'kubectl logs NAME',
      info: 'What the container printed, like docker logs. Add --previous to read the container that just crashed.',
    },
    {
      label: 'kubectl apply -f file.yaml',
      info: 'Declare what you want. Kubernetes makes the cluster match the file. kubectl delete removes things, so use it with care.',
    },
  ]
);
