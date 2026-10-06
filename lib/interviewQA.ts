import { InterviewQA } from '@/types/quiz';

const qaFiles: Record<string, InterviewQA[]> = {
  ceph: require('@/assets/data/interview-qa/ceph.json'),
  k8s: require('@/assets/data/interview-qa/k8s.json'),
  docker: require('@/assets/data/interview-qa/docker.json'),
  linux: require('@/assets/data/interview-qa/linux.json'),
  ansible: require('@/assets/data/interview-qa/ansible.json'),
  'azure-networking': require('@/assets/data/interview-qa/azure-networking.json'),
};

// Order is deliberate (foundational -> core -> advanced); never shuffle.
export function loadInterviewQA(topicId: string): InterviewQA[] {
  const items = qaFiles[topicId];
  return Array.isArray(items) ? [...items] : [];
}
