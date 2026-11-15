import { tapToLearn } from './scenes-common';

export const wiringConfig = tapToLearn(
  'k8s-3-1-k1',
  'Wiring config into a pod',
  'Config reaches a container in a few ways. Know which to use.',
  'Tap all six',
  [
    {
      label: 'envFrom: configMapRef',
      info: 'Every key of the ConfigMap becomes an environment variable.',
    },
    {
      label: 'env + configMapKeyRef',
      info: 'One key, optionally under another variable name: LOG_LEVEL can come from the key log_level.',
    },
    {
      label: 'Secret: same idea, for secrets',
      info: 'A Secret holds passwords and keys. Wire it with secretKeyRef, or mount it as a file with volumes + volumeMounts and readOnly: true.',
    },
    {
      label: 'Never a plain value in YAML',
      info: 'A password written as value: lands in git and in every kubectl get. Put it in a Secret.',
    },
    {
      label: 'Mind the log level',
      info: 'debug in production is noisy and expensive, and can leak personal data into logs.',
    },
    {
      label: 'kubectl exec deploy/x -- env',
      info: 'Runs a command inside a pod. Here it prints the environment, so you see what the pod really has.',
    },
  ]
);

export const externalSecrets = tapToLearn(
  'k8s-3-2-k1',
  'The External Secrets operator',
  'The operator turns a vault entry into a Kubernetes Secret. These are its parts.',
  'Tap all seven',
  [
    {
      label: 'ExternalSecret',
      info: 'Says which secret to fetch from the vault and which Kubernetes Secret to create from it.',
    },
    {
      label: 'secretStoreRef',
      info: 'Points at the store object that knows how to log in to the vault (here Azure Key Vault).',
    },
    {
      label: 'remoteRef.key',
      info: 'The path of the secret inside the vault, like prod/stripe/api-key.',
    },
    {
      label: 'target.name',
      info: 'The Kubernetes Secret the operator creates. Pods reference this name.',
    },
    {
      label: 'refreshInterval: 1h',
      info: 'How often the operator re-reads the vault. A rotated value reaches the cluster within that window.',
    },
    {
      label: 'kubectl get externalsecret',
      info: 'STATUS shows whether the sync worked. SecretSyncedError means the operator could not read the vault.',
    },
    {
      label: 'CreateContainerConfigError',
      info: 'The pod references a Secret or ConfigMap that does not exist. kubectl describe pod names the missing object.',
    },
  ]
);

export const rotationTraps = tapToLearn(
  'k8s-3-2-k2',
  'Rotation traps',
  'Rotation scripts fail in three classic ways.',
  'Tap all three',
  [
    {
      label: 'Revoke last',
      info: 'Revoke the old key only after traffic uses the new one. Revoking first breaks payments until the sync finishes.',
    },
    {
      label: 'Wait for the sync',
      info: 'Restart pods only after the operator has created the new Secret, or they read the old, now revoked, key.',
    },
    {
      label: 'No key on disk',
      info: 'Writing a key to a file leaves a plaintext copy behind. Pipe it straight from the provider into the vault.',
    },
  ]
);
