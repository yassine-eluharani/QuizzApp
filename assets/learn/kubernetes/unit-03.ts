import { choice, cmd, fill, lesson, order, spot, terminal, triage, unit } from '@/lib/learn/dsl';
import { configEnv, rotation, secretEncoded } from './scenes-03';

export const unit3 = unit({
  id: 'k8s-u3',
  title: 'Config & secrets',
  blurb:
    'Stop baking settings into images. Learn where configuration lives, how secrets stay secret, and how to rotate a payment key without an outage.',
  icon: 'key',
  badge: { id: 'badge-config-secrets', title: 'Secret keeper' },
  lessons: [
    lesson('k8s-3-1', 'ConfigMaps and Secrets', [
      configEnv,
      fill(
        'k8s-3-1-b',
        'Wire a ConfigMap in',
        'Load all checkout settings, plus one key under a different name.',
        `envFrom:
  - configMapRef:
      name: [[cm]]
env:
  - name: LOG_LEVEL
    valueFrom:
      configMapKeyRef:
        name: checkout-config
        key: [[key]]`,
        {
          cm: [
            'checkout-config',
            'envFrom turns every key of the named ConfigMap into an environment variable.',
          ],
          key: [
            'log_level',
            'The key inside the ConfigMap. The env name (LOG_LEVEL) and the key do not have to match.',
          ],
        },
        ['checkout-secret', 'LOG_LEVEL', 'default']
      ),
      spot(
        'k8s-3-1-c',
        'Config smells',
        'Tap what should not be in this Deployment.',
        `
env:
  - name: DATABASE_URL
    value: postgres://checkout:S3cret!@pg.shop.svc:5432/checkout
  - name: LOG_LEVEL
    value: debug
  - name: PAYMENTS_URL
    value: http://payments.shop.svc`,
        {
          2: 'A database password in plain YAML ends up in git and in every kubectl get. It belongs in a Secret.',
          4: 'debug logging in production is noisy and expensive, and can leak personal data into logs.',
        }
      ),
      terminal(
        'k8s-3-1-d',
        'The config that did not change',
        'You set log_level to debug in the ConfigMap, but the pods still log at info. Make them pick it up.',
        'Restart the checkout pods so they read the new value.',
        [
          'kubectl exec deploy/checkout -n shop -- env',
          'kubectl rollout restart deployment/checkout -n shop',
        ],
        [
          cmd(
            '^exec deploy(ment)?/checkout .*env',
            `LOG_LEVEL=info
PAYMENTS_URL=http://payments.shop.svc

The ConfigMap says debug, but this pod still has info: environment variables are read once, at start.`
          ),
          cmd(
            '^rollout restart deploy(ment)?/checkout$',
            'deployment.apps/checkout restarted\nNew pods start with LOG_LEVEL=debug.',
            { goal: true }
          ),
          cmd('^delete pod', '', {
            mistake:
              'Deleting pods by hand works once, but it is not repeatable and skips the rollout safety. Use rollout restart.',
          }),
        ]
      ),
      secretEncoded,
      terminal(
        'k8s-3-1-f',
        'Read a Secret',
        'Someone says base64 keeps stripe-key safe. Prove otherwise.',
        'Decode the api-key value of the stripe-key Secret.',
        [
          'kubectl get secret stripe-key -n shop -o yaml',
          "kubectl get secret stripe-key -n shop -o jsonpath='{.data.api-key}' | base64 -d",
        ],
        [
          cmd(
            '^get secret stripe-key( -o yaml)?$',
            `apiVersion: v1
data:
  api-key: c2tfdGVzdF81MU1leGFtcGxl
kind: Secret
metadata:
  name: stripe-key
type: Opaque`
          ),
          cmd(
            '^get secret stripe-key .*base64 (-d|--decode)',
            'sk_test_51Mexample\n\nAnyone with get access to Secrets can read this. Base64 is not encryption.',
            { goal: true }
          ),
        ]
      ),
    ]),

    lesson('k8s-3-2', 'External secrets and rotation', [
      rotation,
      fill(
        'k8s-3-2-b',
        'Sync a secret in',
        'Pull the Stripe key from Azure Key Vault into the shop namespace.',
        `apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: stripe-key
  namespace: shop
spec:
  refreshInterval: [[refresh]]
  secretStoreRef:
    kind: ClusterSecretStore
    name: [[store]]
  target:
    name: [[target]]
  data:
    - secretKey: api-key
      remoteRef:
        key: [[remote]]`,
        {
          refresh: [
            '1h',
            'How often the operator re-reads the manager. A rotated value reaches the cluster within this window.',
          ],
          store: [
            'azure-keyvault',
            'The store object that knows how to authenticate to the vault.',
          ],
          target: [
            'stripe-key',
            'The Kubernetes Secret the operator creates. Pods reference this name.',
          ],
          remote: ['prod/stripe/api-key', 'The secret path inside the manager.'],
        },
        ['never', 'default-store', 'checkout']
      ),
      order(
        'k8s-3-2-c',
        'Rotate the payment key',
        'Order the rotation so payments never stop.',
        [
          'Create the new key at the provider and keep the old one valid',
          'Store the new key in the secret manager',
          'The operator syncs it into the cluster Secret',
          'Pods pick it up (file reload or rollout restart)',
          'Revoke the old key once traffic is on the new one',
        ],
        'Overlap is the whole trick: both keys are valid while the change propagates. Revoking the old key first takes payments down for as long as the sync takes.'
      ),
      spot(
        'k8s-3-2-d',
        'Review the rotation script',
        'Tap the lines that can cause an outage or a leak.',
        `
# rotate-stripe.sh
stripe keys revoke --old
stripe keys create > new.key
az keyvault secret set --name stripe-key --file new.key
kubectl rollout restart deployment/checkout`,
        {
          1: 'Revoking the old key before the new one is live breaks every payment until the sync finishes.',
          2: 'Writing the key to a file on disk leaves a plaintext copy behind. Pipe it straight into the vault.',
          4: 'Restarting right away may start pods before the operator has synced, so they would still read the old, now revoked, key.',
        }
      ),
    ]),

    lesson(
      'k8s-3-3',
      'Boss: the missing secret',
      [
        fill(
          'k8s-3-3-a',
          'Mount it as a file',
          'Give checkout the Stripe key as a read-only file.',
          `volumes:
  - name: stripe
    secret:
      secretName: [[sn]]
containers:
  - name: checkout
    volumeMounts:
      - name: stripe
        mountPath: [[mp]]
        readOnly: [[ro]]`,
          {
            sn: ['stripe-key', 'The Secret object that holds the key.'],
            mp: [
              '/etc/secrets/stripe',
              'A dedicated path outside the app directory, so nothing overwrites it.',
            ],
            ro: ['true', 'The app only needs to read the key. Read-only blocks accidental writes.'],
          },
          ['stripe', '/', 'false']
        ),
        spot(
          'k8s-3-3-b',
          'Audit the manifest',
          'Find the secret-handling mistakes.',
          `
env:
  - name: STRIPE_SECRET_KEY
    value: sk_live_51Mabc123
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: orders-db
        key: password
  - name: ADMIN_TOKEN
    value: "c3VwZXItc2VjcmV0"`,
          {
            2: 'A live payment key in plain YAML lands in git and every kubectl get.',
            9: 'Base64 in a plain env value is still a secret in git. Move it to a Secret.',
          }
        ),
        triage(
          'k8s-3-3-c',
          'Pod will not start',
          'After a deploy, the new checkout pods show CreateContainerConfigError. Payments are down.',
          4,
          {
            start: {
              output: `NAME                        READY   STATUS                       RESTARTS
checkout-7b6c9d5f8-4xk2p    0/1     CreateContainerConfigError   0
checkout-7b6c9d5f8-9tq6m    0/1     CreateContainerConfigError   0`,
              question: 'First move?',
              choices: [
                choice(
                  'kubectl describe pod checkout-7b6c9d5f8-4xk2p -n shop',
                  'Read the events for the config error',
                  'desc',
                  true,
                  1
                ),
                choice(
                  'kubectl delete pod -l app=checkout -n shop',
                  'Recreate the pods',
                  'recreated',
                  false,
                  4
                ),
                choice(
                  'kubectl logs checkout-7b6c9d5f8-4xk2p -n shop',
                  'Read the app logs',
                  'nologs',
                  false,
                  2
                ),
              ],
            },
            recreated: {
              output:
                'New pods, same error. A config error is decided before the container starts, so recreating cannot fix it.',
              question: 'Go to the evidence.',
              choices: [
                choice(
                  'kubectl describe pod checkout-7b6c9d5f8-4xk2p -n shop',
                  'Read the events',
                  'desc',
                  true,
                  1
                ),
                choice(
                  'kubectl delete pod -l app=checkout -n shop',
                  'Try again',
                  'recreated',
                  false,
                  4
                ),
              ],
            },
            nologs: {
              output:
                'Error from server (BadRequest): container "checkout" in pod is waiting to start: CreateContainerConfigError. The container never ran, so there are no logs.',
              question: 'No logs. Where else?',
              choices: [
                choice(
                  'kubectl describe pod checkout-7b6c9d5f8-4xk2p -n shop',
                  'Read the events',
                  'desc',
                  true,
                  1
                ),
                choice(
                  'kubectl logs checkout-7b6c9d5f8-4xk2p -n shop',
                  'Try logs again',
                  'nologs',
                  false,
                  2
                ),
              ],
            },
            desc: {
              output: `Events:
  Warning  Failed  kubelet  Error: secret "stripe-key" not found`,
              question:
                'The Secret is missing. It should be synced from the vault. What do you check?',
              choices: [
                choice(
                  'kubectl get externalsecret stripe-key -n shop',
                  'Why did the sync not create it?',
                  'es',
                  true,
                  1
                ),
                choice(
                  'kubectl create secret generic stripe-key --from-literal=api-key=sk_live_...',
                  'Create it by hand',
                  'byhand',
                  false,
                  5
                ),
              ],
            },
            byhand: {
              output:
                'secret/stripe-key created. Pods start, but the operator will overwrite it and your key now lives in your shell history.',
              question: 'Use the real source of truth.',
              choices: [
                choice(
                  'kubectl get externalsecret stripe-key -n shop',
                  'Check the sync',
                  'es',
                  true,
                  1
                ),
                choice(
                  'kubectl create secret generic stripe-key --from-literal=api-key=sk_live_...',
                  'Do it again',
                  'byhand',
                  false,
                  5
                ),
              ],
            },
            es: {
              output: `NAME         STORE            REFRESH   STATUS
stripe-key   azure-keyvault   1h        SecretSyncedError

message: could not get secret data from provider: access denied for identity checkout-eso`,
              question: 'The operator identity is denied. Fix it properly.',
              choices: [
                choice(
                  'Grant the operator identity read access to the stripe-key secret in Key Vault',
                  'Least-privilege read on that one secret',
                  'fixed',
                  true,
                  1
                ),
                choice(
                  'Give the operator identity full Key Vault admin',
                  'Make the error disappear',
                  'overgrant',
                  false,
                  3
                ),
              ],
            },
            overgrant: {
              output:
                'It works, but a compromised operator can now read or change every secret in the vault.',
              question: 'Scope it down.',
              choices: [
                choice(
                  'Grant the operator identity read access to the stripe-key secret in Key Vault',
                  'Least privilege',
                  'fixed',
                  true,
                  1
                ),
                choice(
                  'Give the operator identity full Key Vault admin',
                  'Leave it',
                  'overgrant',
                  false,
                  3
                ),
              ],
            },
            fixed: {
              output:
                'ExternalSecret status: SecretSynced. Secret stripe-key created. Pods start and become Ready.',
              end: {
                rootCause:
                  'The operator identity had no permission on the new Key Vault secret, so the Kubernetes Secret was never created and pods could not start.',
                fix: 'Grant read access on that one secret to the operator identity, then let the sync run.',
                lesson:
                  'CreateContainerConfigError means something the pod references is missing. describe tells you what, and the owner of that object tells you why.',
              },
            },
          }
        ),
        order(
          'k8s-3-3-d',
          'Safe secret hygiene',
          'Order the lifecycle of a production secret.',
          [
            'Create it in the secret manager, never in git',
            'Grant the sync identity read access to that one secret',
            'Sync it into a Kubernetes Secret',
            'Mount it read-only as a file in the pod',
            'Rotate on a schedule and after any suspected leak',
          ],
          'Secrets enter through the manager, flow with least privilege, and are rotated. Git and plain environment values are never part of the path.'
        ),
      ],
      true
    ),
  ],
});
