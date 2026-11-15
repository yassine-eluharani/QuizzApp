import type { LearnPath } from '@/lib/learn/types';
import { unit1 } from './unit-01';

export const kubernetes: LearnPath = {
  id: 'kubernetes',
  title: 'Kubernetes',
  story: 'Run Bubbled Shop in production',
  units: [unit1],
};
