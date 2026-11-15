import {
  box,
  choice,
  cmd,
  diagram,
  fill,
  gap,
  lesson,
  order,
  read,
  spot,
  terminal,
  triage,
  unit,
} from '@/lib/learn/dsl';

export const unit5 = unit({
  id: 'k8s-u5',
  title: 'Storage & state',
  blurb:
    'Containers forget everything. Learn how disks attach to pods, why databases get a StatefulSet, and how backups actually save you.',
  icon: 'disk',
  badge: { id: 'badge-state-holder', title: 'State holder' },
  lessons: [
    lesson('k8s-5-1', 'Volumes and claims', [
      read(
        'k8s-5-1-a',
        'Data that outlives a pod',
        [
          'A container’s filesystem disappears with it. An emptyDir lives as long as the pod and is good for scratch space. Anything that must survive needs a PersistentVolume.',
          'You do not create PersistentVolumes by hand. A pod asks for storage with a PersistentVolumeClaim, the claim names a StorageClass, and the provisioner creates a disk and a PV that binds to it. Access mode ReadWriteOnce means one node at a time, which is how most block disks work.',
        ],
        {
          callout:
            'Check the StorageClass reclaim policy. With Delete, removing the claim deletes the disk and its data. Databases usually want Retain.',
        }
      ),
      order(
        'k8s-5-1-b',
        'Dynamic provisioning',
        'Order what happens when a pod asks for a volume.',
        [
          'A pod references a PersistentVolumeClaim',
          'The claim names a StorageClass',
          'The provisioner creates a disk and a PersistentVolume',
          'The PV binds to the claim',
          'The kubelet attaches and mounts the volume into the pod',
        ],
        'The claim is a request, the StorageClass says how to fulfil it, and the provisioner does the work. The pod only ever sees the mounted path.'
      ),
      fill(
        'k8s-5-1-c',
        'Claim 20 GiB',
        'catalog stores uploaded product images on a fast disk.',
        `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: catalog-uploads
spec:
  accessModes:
    - [[am]]
  storageClassName: [[sc]]
  resources:
    requests:
      storage: [[size]]`,
        {
          am: [
            'ReadWriteOnce',
            'The disk attaches to one node at a time, which is what block storage supports.',
          ],
          sc: ['fast-ssd', 'Names the class that provisions an SSD-backed disk on demand.'],
          size: ['20Gi', 'Units are required. A bare 20 is not valid storage syntax.'],
        },
        ['ReadWriteMany', 'default', '20']
      ),
      spot(
        'k8s-5-1-d',
        'Which claim is stuck?',
        'Uploads fail because a volume never attached. Tap the problem row.',
        `
NAME              STATUS    VOLUME     CAPACITY   STORAGECLASS   AGE
catalog-uploads   Pending   -          -          fast-sdd       12m
orders-db-0       Bound     pvc-9a1c   50Gi       fast-ssd       30d
cache-data        Bound     pvc-33be   5Gi        fast-ssd       30d`,
        {
          1: 'Pending for 12 minutes with StorageClass fast-sdd: a typo for fast-ssd, so no provisioner picks the claim up.',
        }
      ),
      terminal(
        'k8s-5-1-e',
        'Why is it Pending?',
        'catalog-uploads has been Pending for 12 minutes. Find the cause.',
        'Describe the claim and read the provisioning error.',
        [
          'kubectl get pvc -n shop',
          'kubectl describe pvc catalog-uploads -n shop',
          'kubectl get storageclass',
        ],
        [
          cmd(
            '^get pvc$',
            `NAME              STATUS    VOLUME     CAPACITY   STORAGECLASS   AGE
catalog-uploads   Pending   -          -          fast-sdd       12m
orders-db-0       Bound     pvc-9a1c   50Gi       fast-ssd       30d`
          ),
          cmd(
            '^describe pvc catalog-uploads$',
            `Events:
  Warning  ProvisioningFailed  persistentvolume-controller  storageclass.storage.k8s.io "fast-sdd" not found`,
            { goal: true }
          ),
          cmd(
            '^get (storageclass|sc)$',
            `NAME                 PROVISIONER          RECLAIMPOLICY   VOLUMEBINDINGMODE
fast-ssd (default)   ebs.csi.aws.com      Delete          WaitForFirstConsumer
standard-hdd         ebs.csi.aws.com      Delete          WaitForFirstConsumer`
          ),
        ]
      ),
    ]),

    lesson('k8s-5-2', 'StatefulSets and backups', [
      read(
        'k8s-5-2-a',
        'When pods need an identity',
        [
          'A Deployment treats pods as interchangeable. Databases, queues and caches that replicate do not: each member needs a stable name, a stable address and its own disk. That is a StatefulSet.',
          'Pods are named redis-0, redis-1, redis-2 and start in order. A headless Service (clusterIP: None) gives each one its own DNS name. volumeClaimTemplates create one PVC per pod, and a pod that is rescheduled keeps its own volume.',
        ],
        {
          callout:
            'Many teams run Postgres outside the cluster (a managed service) and keep Kubernetes for stateless workloads. If you do run databases in-cluster, use an operator that handles failover and backups.',
        }
      ),
      diagram(
        'k8s-5-2-b',
        'A three-node Redis',
        'Place the missing pieces of the StatefulSet.',
        [
          [
            gap(
              'hs',
              'Headless Service',
              'clusterIP: None gives every pod its own DNS name like redis-0.redis-headless.'
            ),
          ],
          [box('p0', 'redis-0'), box('p1', 'redis-1'), box('p2', 'redis-2')],
          [
            gap(
              'pvc',
              'Per-pod PVCs',
              'volumeClaimTemplates create data-redis-0, -1 and -2. Each pod keeps its own disk.'
            ),
          ],
        ],
        ['Shared emptyDir', 'LoadBalancer Service', 'ConfigMap']
      ),
      spot(
        'k8s-5-2-c',
        'Postgres as a Deployment?',
        'A teammate wants three Postgres replicas in a Deployment. Tap what breaks.',
        `
kind: Deployment
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: postgres
          image: postgres:16
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: pg-data`,
        {
          0: 'A Deployment gives pods no stable identity or per-pod storage. A database needs a StatefulSet (or an operator).',
          2: 'Three replicas pointing at one ReadWriteOnce claim cannot all mount it, and three writers on one data directory would corrupt it.',
        }
      ),
      fill(
        'k8s-5-2-d',
        'Snapshot the orders database',
        'Take a nightly volume snapshot of the PVC behind orders-db-0.',
        `apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: orders-db-nightly
spec:
  volumeSnapshotClassName: [[vsc]]
  source:
    persistentVolumeClaimName: [[pvc]]`,
        {
          vsc: [
            'csi-ssd-snapclass',
            'The snapshot class tells the CSI driver how to take the snapshot.',
          ],
          pvc: [
            'data-orders-db-0',
            'PVCs from volumeClaimTemplates are named <template>-<pod>, so data-orders-db-0.',
          ],
        },
        ['fast-ssd', 'orders-db-0', 'catalog-uploads']
      ),
      spot(
        'k8s-5-2-e',
        'Judge the backup policy',
        'Tap everything that would leave you unable to recover.',
        `
# backup policy for orders-db
schedule: "0 3 * * *"
retention: 3 days
target: same cluster, same region
restore-test: never
snapshot: crash-consistent only`,
        {
          2: 'Three days of retention misses corruption that is noticed on day four.',
          3: 'Backups stored beside the data are lost with the cluster or the region.',
          4: 'A backup that has never been restored is a hope. Schedule regular restore tests.',
          5: 'A crash-consistent snapshot of a busy database may need recovery or fail. Add application-aware backups (WAL archiving, pg_dump).',
        }
      ),
      order(
        'k8s-5-2-f',
        'Restore after data loss',
        'Order the recovery.',
        [
          'Stop writes to the damaged database',
          'Choose the last good snapshot or WAL position',
          'Restore into a new volume or cluster, not on top of the broken one',
          'Run integrity checks and compare row counts',
          'Point the application at the restored database',
          'Write the post-mortem and fix the gap in the backups',
        ],
        'Restoring beside the broken copy keeps the evidence and lets you verify before you switch. The post-mortem closes the loop.'
      ),
    ]),

    lesson(
      'k8s-5-3',
      'Boss: the full disk at 3 a.m.',
      [
        fill(
          'k8s-5-3-a',
          'Give each replica its own disk',
          'Finish the StatefulSet volume setup for orders-db.',
          `spec:
  serviceName: [[svc]]
  replicas: 3
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: [[size]]`,
          {
            svc: [
              'orders-db-headless',
              'The headless Service that gives each pod a stable DNS name.',
            ],
            size: ['50Gi', 'Sized for the data plus WAL and growth. Revisit it with real usage.'],
          },
          ['orders-db', '1Ti', '50']
        ),
        triage(
          'k8s-5-3-b',
          'Database down',
          '03:07. orders-db-0 is in CrashLoopBackOff and checkout cannot place orders.',
          3,
          {
            start: {
              output: `NAME          READY   STATUS             RESTARTS
orders-db-0   0/1     CrashLoopBackOff   7`,
              question: 'First move?',
              choices: [
                choice(
                  'kubectl logs orders-db-0 -n shop --previous',
                  'Read why the last container died',
                  'logs',
                  true,
                  1
                ),
                choice(
                  'kubectl delete pod orders-db-0 -n shop',
                  'Restart it',
                  'recycled',
                  false,
                  4
                ),
                choice(
                  'kubectl delete pvc data-orders-db-0 -n shop',
                  'Give it a fresh disk',
                  'wipe',
                  false,
                  10
                ),
              ],
            },
            recycled: {
              output: 'Pod recreated. Same volume, same crash. Nothing changed.',
              question: 'Read the evidence.',
              choices: [
                choice(
                  'kubectl logs orders-db-0 -n shop --previous',
                  'Read the crash log',
                  'logs',
                  true,
                  1
                ),
                choice(
                  'kubectl delete pod orders-db-0 -n shop',
                  'Restart again',
                  'recycled',
                  false,
                  4
                ),
              ],
            },
            wipe: {
              output:
                'The claim is protected while a pod uses it, so it sits in Terminating. But the moment the pod goes, the disk and your data go with it. Stop.',
              question: 'You nearly destroyed the database. What now?',
              choices: [
                choice(
                  'kubectl logs orders-db-0 -n shop --previous',
                  'Back off and read the logs',
                  'logs',
                  true,
                  2
                ),
                choice(
                  'kubectl delete pod orders-db-0 -n shop',
                  'Delete the pod to finish the job',
                  'wipe',
                  false,
                  20
                ),
              ],
            },
            logs: {
              output: 'PANIC: could not write to file "pg_wal/xlogtemp.1": No space left on device',
              question: 'The data disk is full. What do you verify before growing it?',
              choices: [
                choice(
                  'kubectl get storageclass fast-ssd -o yaml',
                  'Can this class expand volumes?',
                  'sc',
                  true,
                  1
                ),
                choice(
                  'kubectl exec -it orders-db-0 -n shop -- rm -rf /var/lib/postgresql/data/pg_wal',
                  'Free space by deleting WAL',
                  'rmwal',
                  false,
                  10
                ),
              ],
            },
            rmwal: {
              output:
                'error: unable to upgrade connection: container not running. Lucky: deleting WAL files by hand would have corrupted the database.',
              question: 'Do it properly.',
              choices: [
                choice(
                  'kubectl get storageclass fast-ssd -o yaml',
                  'Check expansion support',
                  'sc',
                  true,
                  1
                ),
                choice(
                  'kubectl exec -it orders-db-0 -n shop -- rm -rf /var/lib/postgresql/data/pg_wal',
                  'Try again',
                  'rmwal',
                  false,
                  10
                ),
              ],
            },
            sc: {
              output: 'allowVolumeExpansion: true',
              question: 'Expansion is allowed. Grow the disk.',
              choices: [
                choice(
                  `kubectl patch pvc data-orders-db-0 -n shop -p '{"spec":{"resources":{"requests":{"storage":"100Gi"}}}}'`,
                  'Request a bigger volume',
                  'fixed',
                  true,
                  1
                ),
                choice(
                  'kubectl scale statefulset orders-db -n shop --replicas=0',
                  'Stop the database first',
                  'stopped',
                  false,
                  5
                ),
              ],
            },
            stopped: {
              output:
                'orders-db scaled to 0. The outage is now complete, and the disk is still full.',
              question: 'That did not help. Grow the volume.',
              choices: [
                choice(
                  `kubectl patch pvc data-orders-db-0 -n shop -p '{"spec":{"resources":{"requests":{"storage":"100Gi"}}}}'`,
                  'Request a bigger volume',
                  'fixed',
                  true,
                  1
                ),
                choice(
                  'kubectl scale statefulset orders-db -n shop --replicas=0',
                  'Leave it stopped',
                  'stopped',
                  false,
                  5
                ),
              ],
            },
            fixed: {
              output: `persistentvolumeclaim/data-orders-db-0 patched
Volume resized to 100Gi (online). orders-db-0 1/1 Running.`,
              end: {
                rootCause:
                  'The 50 GiB data volume filled up with data and WAL. Postgres could not write, so it crashed on every start.',
                fix: 'Expand the PersistentVolumeClaim (the StorageClass allows it), let the pod restart, then add a disk-usage alert at 80% and review retention.',
                lesson:
                  'Check allowVolumeExpansion, never delete database files by hand, and never delete a claim that holds data. Alert on disk usage long before it is full.',
              },
            },
          }
        ),
        order(
          'k8s-5-3-c',
          'Make it not happen again',
          'Order the follow-up work after the incident.',
          [
            'Add a disk-usage alert at 80%',
            'Add a second alert on the growth rate of the volume',
            'Review WAL and data retention settings',
            'Run a restore test from the latest snapshot',
            'Document the expansion steps in the runbook',
          ],
          'Detection comes first (you want to hear about it at 80%), then the causes, then proof that your backups work, and finally the knowledge for the next on-call.'
        ),
      ],
      true
    ),
  ],
});
