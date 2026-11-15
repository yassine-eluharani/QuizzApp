import { tapToLearn } from './scenes-common';

export const readingClaim = tapToLearn(
  'k8s-5-1-k1',
  'Reading a claim',
  'A PersistentVolumeClaim is short, and each line decides what disk you get.',
  'Tap all five',
  [
    {
      label: 'accessModes: ReadWriteOnce',
      info: 'The disk attaches to one node at a time: normal for block storage. ReadWriteMany needs shared storage such as NFS.',
    },
    {
      label: 'storageClassName: fast-ssd',
      info: 'Picks the StorageClass, which says what kind of disk to build. A typo leaves the claim Pending.',
    },
    {
      label: 'storage: 20Gi',
      info: 'The size. Always write the unit: a bare 20 would mean 20 bytes.',
    },
    {
      label: 'kubectl get pvc, describe pvc',
      info: 'Pending means no volume yet. describe pvc shows the event, such as ProvisioningFailed: class not found. get storageclass lists the classes.',
    },
    {
      label: 'Growing a full disk',
      info: 'If the StorageClass has allowVolumeExpansion: true, raise the claim’s storage request. Never delete a claim that holds data.',
    },
  ]
);

export const backups = tapToLearn(
  'k8s-5-2-k1',
  'Backups that work',
  'A backup is only worth what you can restore from it. Five ways it fails.',
  'Tap all five',
  [
    {
      label: 'VolumeSnapshot',
      info: 'A point-in-time copy of a volume, taken from a PVC (for example data-orders-db-0) through a snapshot class.',
    },
    {
      label: 'Retention',
      info: 'Keep enough history: corruption is often noticed days later. Three days is too short.',
    },
    {
      label: 'Somewhere else',
      info: 'Backups beside the data die with the cluster or the region. Copy them to another region or account.',
    },
    {
      label: 'Restore tests',
      info: 'A backup you have never restored is a hope. Schedule regular restore tests.',
    },
    {
      label: 'Crash-consistent vs app-aware',
      info: 'A snapshot of a busy database may need recovery. Add WAL archiving or pg_dump. WAL is the write-ahead log: never delete it by hand.',
    },
  ]
);

export const restoring = tapToLearn(
  'k8s-5-2-k2',
  'Restoring after data loss',
  'Restoring is a procedure, not a command. Five steps.',
  'Tap all five',
  [
    {
      label: 'Stop writes',
      info: 'First stop the damage from growing: stop writes to the broken database.',
    },
    {
      label: 'Pick the point',
      info: 'Choose the last good snapshot, or a WAL position just before the damage.',
    },
    {
      label: 'Restore beside, not on top',
      info: 'Restore into a new volume or cluster. The broken copy stays as evidence and you can verify before you switch.',
    },
    {
      label: 'Verify, then switch',
      info: 'Run integrity checks and compare row counts, then point the application at the restored database.',
    },
    {
      label: 'Post-mortem',
      info: 'Fix the gap: alert early (at 80% full, and on growth rate), review retention, restore-test, and document the steps in the runbook.',
    },
  ]
);
