import { tapToLearn } from './scenes-common';

export const serviceAnatomy = tapToLearn(
  'k8s-2-1-k1',
  'Anatomy of a Service',
  'A Service is a few lines of YAML. Each one matters.',
  'Tap all five',
  [
    {
      label: 'type: ClusterIP',
      info: 'Reachable only inside the cluster: the safe default. LoadBalancer makes one public cloud load balancer per Service. NodePort opens a port on every node.',
    },
    {
      label: 'selector: app=checkout',
      info: 'The labels of the pods behind the Service. It must match the pod labels exactly, or the Service has nothing to send traffic to.',
    },
    {
      label: 'port and targetPort',
      info: 'port is what callers use (80). targetPort is where the container listens (8080).',
    },
    {
      label: 'Endpoints',
      info: 'The ready pod IPs behind a Service. kubectl get endpoints checkout lists them. <none> means nothing matches. describe svc shows the selector too.',
    },
    {
      label: 'kubectl get pods --show-labels',
      info: 'Prints each pod’s labels. Compare them with the Service selector to find a mismatch.',
    },
  ]
);

export const nameLookup = tapToLearn(
  'k8s-2-1-k2',
  'How a name becomes a pod',
  'cart calls checkout by name. Four hops get it to a pod.',
  'Tap all four',
  [
    {
      label: '1. cart calls http://checkout.shop',
      info: 'The name is service.namespace. Nobody hard-codes an IP.',
    },
    {
      label: '2. CoreDNS answers',
      info: 'CoreDNS, the cluster DNS, replies with the Service ClusterIP: a virtual IP that never changes.',
    },
    {
      label: '3. kube-proxy picks an endpoint',
      info: 'Rules on each node send the connection to one of the ready pod IPs behind the Service.',
    },
    {
      label: '4. A pod answers on targetPort',
      info: 'The connection reaches a checkout pod on port 8080.',
    },
  ]
);

export const ingressYaml = tapToLearn(
  'k8s-2-2-k1',
  'Reading an Ingress',
  'An Ingress is routing rules, TLS and a few settings that are easy to get wrong.',
  'Tap all seven',
  [
    {
      label: 'host + path → Service',
      info: 'A rule matches a host and path and names a Service and port. The backend port is the Service port (80), not the container port (8080).',
    },
    {
      label: 'ingressClassName: nginx',
      info: 'Which ingress controller handles this Ingress. Without a controller installed, an Ingress does nothing.',
    },
    {
      label: 'pathType: Prefix',
      info: 'Prefix matches /checkout and everything under it. Exact matches only /checkout itself.',
    },
    {
      label: 'tls + cert-manager',
      info: 'tls lists the host and a secretName. cert-manager asks the issuer named in the annotation for a certificate and stores it in that Secret.',
    },
    {
      label: 'letsencrypt-prod vs staging',
      info: 'prod issues trusted certificates. staging issues untrusted test ones: fine for practice, wrong for customers.',
    },
    {
      label: 'Keep the HTTPS redirect',
      info: 'Turning ssl-redirect off, or having no tls section, lets customers use plain HTTP.',
    },
    {
      label: 'One Ingress, not seven balancers',
      info: 'A LoadBalancer Service per app means a paid public IP each and more to attack. Route everything through one Ingress.',
    },
  ]
);
