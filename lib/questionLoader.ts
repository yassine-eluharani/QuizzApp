import { Question } from '@/types/quiz';
import { isQuizAccessible, FREE_QUIZZES } from '@/lib/entitlements';

const questionFiles: Record<string, Question[]> = {
  // AWS Solutions Architect
  'aws-saa-quiz-1': require('@/assets/data/questions/aws/solutions-architect/quiz-1.json'),
  'aws-saa-quiz-2': require('@/assets/data/questions/aws/solutions-architect/quiz-2.json'),
  'aws-saa-quiz-3': require('@/assets/data/questions/aws/solutions-architect/quiz-3.json'),
  'aws-saa-quiz-4': require('@/assets/data/questions/aws/solutions-architect/quiz-4.json'),
  'aws-saa-quiz-5': require('@/assets/data/questions/aws/solutions-architect/quiz-5.json'),
  'aws-saa-quiz-6': require('@/assets/data/questions/aws/solutions-architect/quiz-6.json'),
  'aws-saa-quiz-7': require('@/assets/data/questions/aws/solutions-architect/quiz-7.json'),
  // AWS Developer Associate
  'aws-dva-quiz-1': require('@/assets/data/questions/aws/developer-associate/quiz-1.json'),
  // AWS SysOps Admin
  'aws-soa-quiz-1': require('@/assets/data/questions/aws/sysops-admin/quiz-1.json'),
  // AWS DevOps Professional
  'aws-dop-quiz-1': require('@/assets/data/questions/aws/devops-professional/quiz-1.json'),
  // Azure
  'azure-az900-quiz-1': require('@/assets/data/questions/azure/az-900/quiz-1.json'),
  'azure-az104-quiz-1': require('@/assets/data/questions/azure/az-104/quiz-1.json'),
  'azure-az305-quiz-1': require('@/assets/data/questions/azure/az-305/quiz-1.json'),
  // GCP
  'gcp-ace-quiz-1': require('@/assets/data/questions/gcp/associate-cloud-engineer/quiz-1.json'),
  'gcp-pca-quiz-1': require('@/assets/data/questions/gcp/professional-cloud-architect/quiz-1.json'),
  'gcp-pde-quiz-1': require('@/assets/data/questions/gcp/professional-data-engineer/quiz-1.json'),
  // DevOps Tools
  'devops-terraform-quiz-1': require('@/assets/data/questions/devops/terraform-associate/quiz-1.json'),
  'devops-cka-quiz-1': require('@/assets/data/questions/devops/cka-ckad/quiz-1.json'),
  'devops-docker-quiz-1': require('@/assets/data/questions/devops/docker-dca/quiz-1.json'),
};

export function loadQuizQuestions(quizId: string, isPro: boolean = true): Question[] {
  if (!isQuizAccessible(quizId, isPro)) return [];
  return questionFiles[quizId] ?? [];
}

export function loadCertQuestions(certId: string, isPro: boolean = true): Question[] {
  return Object.entries(questionFiles)
    .filter(([key]) => key.startsWith(certId) && isQuizAccessible(key, isPro))
    .flatMap(([, questions]) => questions);
}

export function loadQuestionById(questionId: string): Question | undefined {
  for (const questions of Object.values(questionFiles)) {
    const found = questions.find(q => q.id === questionId);
    if (found) return found;
  }
  return undefined;
}

export function loadQuestionsByIds(questionIds: string[]): Question[] {
  const idSet = new Set(questionIds);
  const results: Question[] = [];
  for (const questions of Object.values(questionFiles)) {
    for (const q of questions) {
      if (idSet.has(q.id)) {
        results.push(q);
        idSet.delete(q.id);
      }
    }
  }
  return results;
}
