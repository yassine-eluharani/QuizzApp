import { Question } from '@/types/quiz';
import { isQuizAccessible } from '@/lib/entitlements';
import { canAccessContent, isValidQuizId } from '@/lib/accessControl';
import { getSecurityState } from '@/lib/security';

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

// Validate quiz ID format before processing
function validateQuizIdFormat(quizId: string): boolean {
  if (!quizId || typeof quizId !== 'string') return false;
  if (!isValidQuizId(quizId)) return false;
  return quizId in questionFiles;
}

// Multi-layer access validation
function validateAccess(quizId: string, isPro: boolean): boolean {
  // Layer 1: Format validation
  if (!validateQuizIdFormat(quizId)) return false;

  // Layer 2: Entitlement check (uses accessControl internally)
  if (!isQuizAccessible(quizId, isPro)) return false;

  // Layer 3: Direct access control check (redundant but adds protection)
  if (!canAccessContent('quiz', { quizId, isPro })) return false;

  return true;
}

export function loadQuizQuestions(quizId: string, isPro: boolean = true): Question[] {
  // Validate access through multiple layers
  if (!validateAccess(quizId, isPro)) {
    return [];
  }

  const questions = questionFiles[quizId];
  if (!questions || !Array.isArray(questions)) {
    return [];
  }

  // Return a copy to prevent mutation
  return [...questions];
}

export function loadCertQuestions(certId: string, isPro: boolean = true): Question[] {
  if (!certId || typeof certId !== 'string') {
    return [];
  }

  const results: Question[] = [];

  for (const [quizId, questions] of Object.entries(questionFiles)) {
    // Check if quiz belongs to this certification
    if (!quizId.startsWith(certId)) continue;

    // Validate access for each quiz
    if (!validateAccess(quizId, isPro)) continue;

    // Add questions from accessible quizzes
    if (Array.isArray(questions)) {
      results.push(...questions);
    }
  }

  return results;
}

export function loadQuestionById(questionId: string): Question | undefined {
  if (!questionId || typeof questionId !== 'string') {
    return undefined;
  }

  // Search through all question files
  // Note: This doesn't check access - used for review of already-answered questions
  for (const questions of Object.values(questionFiles)) {
    if (!Array.isArray(questions)) continue;

    const found = questions.find(q => q.id === questionId);
    if (found) {
      // Return a copy
      return { ...found };
    }
  }

  return undefined;
}

export function loadQuestionsByIds(questionIds: string[]): Question[] {
  if (!Array.isArray(questionIds)) {
    return [];
  }

  const idSet = new Set(questionIds.filter(id => typeof id === 'string'));
  const results: Question[] = [];

  for (const questions of Object.values(questionFiles)) {
    if (!Array.isArray(questions)) continue;

    for (const q of questions) {
      if (idSet.has(q.id)) {
        results.push({ ...q });
        idSet.delete(q.id);
      }
    }

    // Early exit if all found
    if (idSet.size === 0) break;
  }

  return results;
}

// Get available quiz IDs (for validation purposes)
export function getAvailableQuizIds(): string[] {
  return Object.keys(questionFiles);
}

// Check if a quiz exists (without loading)
export function quizExists(quizId: string): boolean {
  return validateQuizIdFormat(quizId);
}
