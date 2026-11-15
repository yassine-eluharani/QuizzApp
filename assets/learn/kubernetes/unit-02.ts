import {
  box,
  choice,
  cmd,
  diagram,
  fill,
  gap,
  lesson,
  order,
  spot,
  terminal,
  triage,
  unit,
} from '@/lib/learn/dsl';
import { badGateway, ingressFlow, serviceStable } from './scenes-02';

export const unit2 = unit({
  id: 'k8s-u2',
  title: 'Traffic in',
  blurb:
    'Checkout runs, but nobody can reach it. Give it a stable address, put it behind a front door with TLS, and learn to debug the classic 502.',
  icon: 'gate',
  badge: { id: 'badge-traffic-in', title: 'Front door' },
  lessons: [
    lesson('k8s-2-1', 'Services: a stable address', [
      serviceStable,
      fill(
        'k8s-2-1-b',
        'Give checkout a Service',
        'Internal callers (cart, the ingress) need a stable address for checkout.',
        `apiVersion: v1
kind: Service
metadata:
  name: checkout
  namespace: shop
spec:
  type: [[type]]
  selector:
    app: [[sel]]
  ports:
    - port: 80
      targetPort: [[tp]]`,
        {
          type: [
            'ClusterIP',
            'Internal-only is the safe default. External traffic enters through one Ingress instead of one cloud load balancer per service.',
          ],
          sel: [
            'checkout',
            'The selector must match the pod labels. A typo gives a Service with no endpoints.',
          ],
          tp: ['8080', 'targetPort is where the container listens. port (80) is what callers use.'],
        },
        ['LoadBalancer', 'NodePort', 'cart', '80']
      ),
      order(
        'k8s-2-1-c',
        'How cart finds checkout',
        'Put the lookup in order, from the cart code to the checkout container.',
        [
          'cart calls http://checkout.shop',
          'CoreDNS resolves the name to the Service ClusterIP',
          'kube-proxy rules on the node pick one ready endpoint',
          'The connection reaches a checkout pod on port 8080',
        ],
        'The ClusterIP is virtual. DNS returns it, and kube-proxy (or the CNI) rewrites the connection to one of the ready pod IPs behind it.'
      ),
      spot(
        'k8s-2-1-d',
        'Why do requests fail?',
        'Users get connection errors although all checkout pods are Running. Tap the line that explains it.',
        `
$ kubectl get svc,endpoints checkout -n shop
NAME               TYPE        CLUSTER-IP    PORT(S)   AGE
service/checkout   ClusterIP   10.96.41.12   80/TCP    3d

NAME                 ENDPOINTS   AGE
endpoints/checkout   <none>      3d`,
        {
          5: 'ENDPOINTS is <none>: no ready pod matches the Service selector, so there is nothing to send traffic to.',
        }
      ),
      terminal(
        'k8s-2-1-e',
        'Hunt the mismatch',
        'The checkout Service has no endpoints. Find out why.',
        'Compare the Service selector with the pod labels.',
        [
          'kubectl get endpoints checkout -n shop',
          'kubectl describe svc checkout -n shop',
          'kubectl get pods -n shop --show-labels',
        ],
        [
          cmd(
            '^get endpoints? checkout$',
            `NAME       ENDPOINTS   AGE
checkout   <none>      3d`
          ),
          cmd(
            '^describe svc checkout$',
            `Name:       checkout
Selector:   app=checkout-api
Type:       ClusterIP
Endpoints:  <none>`
          ),
          cmd(
            '^get pods .*--show-labels$',
            `NAME                        READY   STATUS    LABELS
checkout-5f7b8c9d4-hq2lw    1/1     Running   app=checkout,pod-template-hash=5f7b8c9d4
checkout-5f7b8c9d4-m8rtn    1/1     Running   app=checkout,pod-template-hash=5f7b8c9d4

The Service selects app=checkout-api, the pods carry app=checkout.`,
            { goal: true }
          ),
          cmd('^delete svc', '', {
            mistake:
              'Deleting the Service does not fix the selector and cuts every caller off. Fix the selector instead.',
          }),
        ]
      ),
    ]),

    lesson('k8s-2-2', 'Ingress, TLS and the 502', [
      ingressFlow,
      diagram(
        'k8s-2-2-b',
        'Draw the front door',
        'Place the pieces between a customer and the checkout pods.',
        [
          [box('c', 'Customer browser')],
          [
            gap(
              'lb',
              'Cloud load balancer',
              'One public IP and entry point in front of the cluster, shared by many services.'
            ),
          ],
          [
            gap(
              'ctl',
              'Ingress controller',
              'Pods running NGINX or Traefik. They read Ingress rules and route HTTP by host and path.'
            ),
          ],
          [box('svc', 'Service: checkout', 'stable address')],
          [
            gap(
              'pods',
              'Ready pods',
              'The Service only sends traffic to pods that pass their readiness probe.'
            ),
          ],
        ],
        ['etcd', 'kubelet', 'Node disk']
      ),
      fill(
        'k8s-2-2-c',
        'Route and secure it',
        'Send /checkout to the Service over HTTPS with an automatic certificate.',
        `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop
  annotations:
    cert-manager.io/cluster-issuer: [[issuer]]
spec:
  ingressClassName: nginx
  tls:
    - hosts: [shop.example.com]
      secretName: [[secret]]
  rules:
    - host: shop.example.com
      http:
        paths:
          - path: /checkout
            pathType: [[pt]]
            backend:
              service:
                name: checkout
                port: { number: 80 }`,
        {
          issuer: [
            'letsencrypt-prod',
            'cert-manager asks this issuer for a trusted certificate and renews it before it expires.',
          ],
          secret: [
            'shop-tls',
            'cert-manager stores the certificate in this Secret and the controller reads it to terminate TLS.',
          ],
          pt: [
            'Prefix',
            'Prefix matches /checkout and everything under it. Exact would match only /checkout itself.',
          ],
        },
        ['letsencrypt-staging', 'Exact', 'default']
      ),
      spot(
        'k8s-2-2-d',
        'Review the Ingress',
        'Tap what is wrong before this ships.',
        `
metadata:
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  rules:
    - host: shop.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: checkout
                port: { number: 8080 }`,
        {
          2: 'Turning off the HTTPS redirect (and having no tls section) lets customers reach checkout over plain HTTP.',
          13: 'The backend port must be the Service port (80), not the container port. 8080 matches no Service port, so the controller has no upstream.',
        }
      ),
      badGateway,
      order(
        'k8s-2-2-e',
        'Debugging a 502',
        'Order the checks from the outside in, the way you would on call.',
        [
          'Reproduce it: curl the public URL and note the status code',
          'Ingress: does the rule point at the right Service and port?',
          'Service: does it have endpoints?',
          'Pods: are they Ready and do their labels match the selector?',
          'App: read the container logs',
        ],
        'Walk the request path outermost to innermost. Each layer you prove healthy narrows the search, and a 502 from the ingress almost always means the upstream (Service or pods) is the problem.'
      ),
    ]),

    lesson(
      'k8s-2-3',
      'Boss: Black Friday front door',
      [
        fill(
          'k8s-2-3-a',
          'Fix the Service',
          'The Service for payments is not routing. Complete it.',
          `apiVersion: v1
kind: Service
metadata:
  name: payments
spec:
  selector:
    app: [[sel]]
  ports:
    - port: 80
      targetPort: [[tp]]`,
          {
            sel: ['payments', 'Must match the label on the payments pods.'],
            tp: ['9090', 'The port the payments container actually listens on.'],
          },
          ['payments-api', '80', 'checkout']
        ),
        spot(
          'k8s-2-3-b',
          'Find the three risks',
          'Review this edge setup.',
          `
service type: LoadBalancer   # one per service (7 services)
ingress tls: none
ingress backend port: 80     # Service port is 8080
readiness probe: none`,
          {
            0: 'Seven public load balancers cost money and widen the attack surface. Use one ingress instead.',
            1: 'No TLS: card data would travel in clear text.',
            2: 'The backend port does not match the Service port, so the route has no upstream.',
          }
        ),
        triage(
          'k8s-2-3-c',
          'Checkout returns 502',
          'Black Friday, 09:02. Customers see 502 Bad Gateway from shop.example.com/checkout.',
          3,
          {
            start: {
              output: '$ curl -I https://shop.example.com/checkout\nHTTP/2 502\nserver: nginx',
              question: 'Where do you look first?',
              choices: [
                choice(
                  'kubectl get endpoints checkout -n shop',
                  'Does the Service have anything to send traffic to?',
                  'noep',
                  true,
                  1
                ),
                choice(
                  'kubectl rollout restart deployment ingress-nginx-controller -n ingress-nginx',
                  'Restart the edge',
                  'edgerestart',
                  false,
                  5
                ),
                choice(
                  'kubectl delete ingress shop -n shop',
                  'Recreate the route',
                  'deleted',
                  false,
                  7
                ),
              ],
            },
            edgerestart: {
              output:
                'Ingress controller pods restarted. Still 502: the upstream is the problem, not the edge.',
              question: 'Same error. Next?',
              choices: [
                choice(
                  'kubectl get endpoints checkout -n shop',
                  'Check the upstream',
                  'noep',
                  true,
                  1
                ),
                choice(
                  'kubectl rollout restart deployment ingress-nginx-controller -n ingress-nginx',
                  'Restart again',
                  'edgerestart',
                  false,
                  4
                ),
              ],
            },
            deleted: {
              output:
                'ingress.networking.k8s.io "shop" deleted. Now every route returns 404 and the certificate request is gone.',
              question: 'You made it worse. Recover.',
              choices: [
                choice(
                  'kubectl apply -f ingress.yaml',
                  'Restore the Ingress from git',
                  'start',
                  true,
                  3
                ),
                choice(
                  'kubectl get endpoints checkout -n shop',
                  'Look at the upstream anyway',
                  'noep',
                  false,
                  2
                ),
              ],
            },
            noep: {
              output: 'NAME       ENDPOINTS   AGE\ncheckout   <none>      5m',
              question: 'No endpoints. What next?',
              choices: [
                choice(
                  'kubectl get pods -l app=checkout -n shop',
                  'Are the pods Ready?',
                  'notready',
                  true,
                  1
                ),
                choice(
                  'kubectl scale deployment checkout --replicas=10 -n shop',
                  'Add more pods',
                  'scaled',
                  false,
                  4
                ),
              ],
            },
            scaled: {
              output:
                '10 pods requested. They all start, and none become Ready. More of a broken thing is still broken.',
              question: 'Look at why they are not Ready.',
              choices: [
                choice(
                  'kubectl get pods -l app=checkout -n shop',
                  'Inspect the pods',
                  'notready',
                  true,
                  1
                ),
                choice(
                  'kubectl scale deployment checkout --replicas=20 -n shop',
                  'Add even more',
                  'scaled',
                  false,
                  4
                ),
              ],
            },
            notready: {
              output: `NAME                       READY   STATUS    RESTARTS   AGE
checkout-6c9d7b8f5-2lqvx   0/1     Running   0          5m
checkout-6c9d7b8f5-9fz4k   0/1     Running   0          5m

Readiness probe failed: HTTP probe failed with statuscode: 404 (GET /readyz)`,
              question:
                'Probes hit /readyz, the app serves /ready. How do you restore service fastest?',
              choices: [
                choice(
                  'kubectl rollout undo deployment/checkout -n shop',
                  'Roll back the bad probe path',
                  'fixed',
                  true,
                  1
                ),
                choice(
                  'kubectl delete pod -l app=checkout -n shop',
                  'Delete the pods',
                  'notready',
                  false,
                  3
                ),
              ],
            },
            fixed: {
              output: `deployment.apps/checkout rolled back
checkout-5f7b8c9d4-hq2lw   1/1   Running
Endpoints: 10.244.1.7:8080,10.244.2.4:8080`,
              end: {
                rootCause:
                  'A release changed the readiness path to /readyz. Pods never became Ready, the Service had no endpoints and the ingress returned 502.',
                fix: 'Roll back to the last good revision, then fix the probe path in git and redeploy through the pipeline.',
                lesson:
                  'A 502 from the ingress points at the upstream. Walk Service, endpoints and pod readiness before touching the edge.',
              },
            },
          }
        ),
        order(
          'k8s-2-3-d',
          'Launch checklist for the edge',
          'Order what you verify before Black Friday traffic arrives.',
          [
            'Services select the right pods and show endpoints',
            'Ingress rules point at Service ports, not container ports',
            'TLS certificate is issued and not near expiry',
            'HTTP redirects to HTTPS',
            'A synthetic check hits the public URL from outside',
          ],
          'Internal wiring comes first (endpoints, ports), then the public surface (TLS, redirect), and finally an outside-in check that proves the whole path.'
        ),
      ],
      true
    ),
  ],
});
