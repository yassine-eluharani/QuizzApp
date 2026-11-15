import type { LearnPath, Lesson, Unit } from '@/lib/learn/types';
import { kubernetes } from './kubernetes';

export const learnPaths: LearnPath[] = [kubernetes];

export function findLesson(
  lessonId: string
): { path: LearnPath; unit: Unit; lesson: Lesson; index: number } | null {
  for (const path of learnPaths) {
    for (const unit of path.units) {
      const index = unit.lessons.findIndex((l) => l.id === lessonId);
      if (index >= 0) return { path, unit, lesson: unit.lessons[index], index };
    }
  }
  return null;
}

export function findUnit(unitId: string): { path: LearnPath; unit: Unit } | null {
  for (const path of learnPaths) {
    const unit = path.units.find((u) => u.id === unitId);
    if (unit) return { path, unit };
  }
  return null;
}
