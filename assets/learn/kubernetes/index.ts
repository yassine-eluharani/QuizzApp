import type { LearnPath } from '@/lib/learn/types';
import { unit1 } from './unit-01';
import { unit2 } from './unit-02';
import { unit3 } from './unit-03';
import { unit4 } from './unit-04';
import { unit5 } from './unit-05';
import { unit6 } from './unit-06';
import { unit7 } from './unit-07';
import { unit8 } from './unit-08';
import { unit9 } from './unit-09';
import { unit10 } from './unit-10';
import { unit11 } from './unit-11';

export const kubernetes: LearnPath = {
  id: 'kubernetes',
  title: 'Kubernetes',
  story: 'Run Bubbled Shop in production',
  units: [unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8, unit9, unit10, unit11],
};
