import { tapToLearn } from './scenes-common';

export const bindingScope = tapToLearn(
  'k8s-7-1-k1',
  'How far a binding reaches',
  'Giving power to the wrong account is the classic RBAC mistake.',
  'Tap all six',
  [
    {
      label: 'Role + RoleBinding',
      info: 'Work inside one namespace. A RoleBinding gives a Role to a ServiceAccount there.',
    },
    {
      label: 'ClusterRole + ClusterRoleBinding',
      info: 'Work across the whole cluster. A ClusterRoleBinding is far wider than it looks.',
    },
    {
      label: 'The default ServiceAccount',
      info: 'Every pod that names no ServiceAccount uses it. Give it power and every such pod gets it.',
    },
    {
      label: 'cluster-admin',
      info: 'Full control of the entire cluster. One compromised pod would own everything.',
    },
    {
      label: 'automountServiceAccountToken',
      info: 'Mounts an API token into the pod. If the app never calls the API, turn it off: it is only something to steal.',
    },
    {
      label: 'kubectl auth can-i',
      info: 'kubectl auth can-i delete pods --as=system:serviceaccount:shop:checkout -n shop asks the API server what that account may do.',
    },
  ]
);

export const enforceLevels = tapToLearn(
  'k8s-7-1-k3',
  'Enforce it per namespace',
  'Pod Security Admission applies those hardening rules to a whole namespace, with labels.',
  'Tap all six',
  [
    {
      label: 'pod-security.kubernetes.io/enforce',
      info: 'A namespace label. Pods that break the chosen level are rejected.',
    },
    {
      label: '.../warn',
      info: 'Same idea, but pods are admitted and a warning is shown. Use it to migrate gradually.',
    },
    {
      label: 'privileged',
      info: 'No restrictions at all.',
    },
    {
      label: 'baseline',
      info: 'Blocks the dangerous settings (privileged, host namespaces) without breaking most workloads.',
    },
    {
      label: 'restricted',
      info: 'The strictest profile: non-root, drop ALL capabilities, no privilege escalation, a seccomp profile set.',
    },
    {
      label: 'A sensible start',
      info: 'enforce: baseline blocks the worst now, and warn: restricted shows what to fix next.',
    },
  ]
);

export const reviewBlocks = tapToLearn(
  'k8s-7-1-k2',
  'What a review blocks',
  'Four settings that give a container the keys to the node.',
  'Tap all four',
  [
    {
      label: 'privileged: true',
      info: 'Almost the same access as the node itself.',
    },
    {
      label: 'runAsUser: 0',
      info: 'Root inside the container. It removes a layer of containment.',
    },
    {
      label: 'hostNetwork: true',
      info: 'Puts the pod on the node’s network, bypassing NetworkPolicies.',
    },
    {
      label: 'hostPath volume',
      info: 'Mounts a node path. Mounting the container runtime socket (docker.sock) lets the pod start any container on the node: full takeover.',
    },
  ]
);

export const networkPolicyYaml = tapToLearn(
  'k8s-7-2-k1',
  'Reading a NetworkPolicy',
  'A NetworkPolicy says who is protected and who may talk to them.',
  'Tap all five',
  [
    {
      label: 'podSelector',
      info: 'The pods this policy protects, for example app: checkout.',
    },
    {
      label: 'policyTypes: [Ingress]',
      info: 'Which directions are restricted. Adding Egress without an allow list blocks outbound traffic, DNS included.',
    },
    {
      label: 'namespaceSelector',
      info: 'Allows traffic from every pod in the namespaces with that label, such as ingress-nginx.',
    },
    {
      label: 'ports',
      info: 'Limits the allowed traffic to these ports.',
    },
    {
      label: 'kubectl get networkpolicy',
      info: 'Lists the policies in a namespace. With none, everything is open.',
    },
  ]
);

export const trustedImage = tapToLearn(
  'k8s-7-2-k2',
  'Trusting an image',
  'Each step in the pipeline narrows what you have to trust.',
  'Tap all six',
  [
    {
      label: 'Build in CI, pinned base',
      info: 'Build in CI from a pinned base image, so the same input gives the same image.',
    },
    {
      label: 'Scan',
      info: 'Scan for known vulnerabilities (CVEs) before the image can ship.',
    },
    {
      label: 'Sign with cosign',
      info: 'A signature proves the image came from your pipeline.',
    },
    {
      label: 'Private registry and digest',
      info: 'Push to a private registry and reference the digest, which is immutable. Never an unvetted public image, never latest.',
    },
    {
      label: 'Admission check',
      info: 'The cluster verifies the signature before it runs the pod, so unsigned images are rejected.',
    },
    {
      label: 'imagePullPolicy',
      info: 'IfNotPresent with latest can keep a stale copy on a node. Pin an immutable tag or digest.',
    },
  ]
);

export const compromised = tapToLearn(
  'k8s-7-2-k3',
  'A compromised pod',
  'Contain first. Do not destroy the evidence.',
  'Tap all five',
  [
    {
      label: 'Isolate, do not delete',
      info: 'Change its label so it leaves the Service and ReplicaSet (a clean replacement starts), and let a deny-all NetworkPolicy on that label cut its network. It keeps running for the investigation.',
    },
    {
      label: 'Do not exec in',
      info: 'Poking around inside changes its state and exposes your own credentials to whatever runs there.',
    },
    {
      label: 'Preserve evidence',
      info: 'Read its logs and note the image digest and the node.',
    },
    {
      label: 'Rotate what it could read',
      info: 'Assume every secret mounted into it is exposed, and rotate them.',
    },
    {
      label: 'Fix the hole',
      info: 'Patch the image and add an egress default-deny, then review how it got in and write it up.',
    },
  ]
);
