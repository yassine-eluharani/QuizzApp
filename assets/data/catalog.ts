import { Platform } from '@/types/quiz';

export const platforms: Platform[] = [
  {
    id: 'aws',
    name: 'Amazon Web Services',
    shortName: 'AWS',
    color: '#FF9900',
    icon: 'cloud',
    certifications: [
      {
        id: 'aws-saa',
        name: 'Solutions Architect Associate',
        code: 'SAA-C03',
        platformId: 'aws',
        examDuration: 130,
        passingScore: 72,
        totalExamQuestions: 65,
        quizzes: [
          { id: 'aws-saa-quiz-1', name: 'Quiz 1', certificationId: 'aws-saa', questionCount: 65 },
          { id: 'aws-saa-quiz-2', name: 'Quiz 2', certificationId: 'aws-saa', questionCount: 65 },
          { id: 'aws-saa-quiz-3', name: 'Quiz 3', certificationId: 'aws-saa', questionCount: 65 },
          { id: 'aws-saa-quiz-4', name: 'Quiz 4', certificationId: 'aws-saa', questionCount: 65 },
          { id: 'aws-saa-quiz-5', name: 'Quiz 5', certificationId: 'aws-saa', questionCount: 65 },
          { id: 'aws-saa-quiz-6', name: 'Quiz 6', certificationId: 'aws-saa', questionCount: 65 },
          { id: 'aws-saa-quiz-7', name: 'Quiz 7', certificationId: 'aws-saa', questionCount: 65 },
        ],
      },
      {
        id: 'aws-dva',
        name: 'Developer Associate',
        code: 'DVA-C02',
        platformId: 'aws',
        examDuration: 130,
        passingScore: 72,
        totalExamQuestions: 65,
        quizzes: [
          { id: 'aws-dva-quiz-1', name: 'Quiz 1', certificationId: 'aws-dva', questionCount: 5 },
        ],
      },
      {
        id: 'aws-soa',
        name: 'SysOps Administrator Associate',
        code: 'SOA-C02',
        platformId: 'aws',
        examDuration: 130,
        passingScore: 72,
        totalExamQuestions: 65,
        quizzes: [
          { id: 'aws-soa-quiz-1', name: 'Quiz 1', certificationId: 'aws-soa', questionCount: 5 },
        ],
      },
      {
        id: 'aws-dop',
        name: 'DevOps Engineer Professional',
        code: 'DOP-C02',
        platformId: 'aws',
        examDuration: 180,
        passingScore: 75,
        totalExamQuestions: 75,
        quizzes: [
          { id: 'aws-dop-quiz-1', name: 'Quiz 1', certificationId: 'aws-dop', questionCount: 5 },
        ],
      },
    ],
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    shortName: 'Azure',
    color: '#0078D4',
    icon: 'cloudy',
    certifications: [
      {
        id: 'azure-az900',
        name: 'Azure Fundamentals',
        code: 'AZ-900',
        platformId: 'azure',
        examDuration: 85,
        passingScore: 70,
        totalExamQuestions: 50,
        quizzes: [
          { id: 'azure-az900-quiz-1', name: 'Quiz 1', certificationId: 'azure-az900', questionCount: 5 },
        ],
      },
      {
        id: 'azure-az104',
        name: 'Azure Administrator',
        code: 'AZ-104',
        platformId: 'azure',
        examDuration: 120,
        passingScore: 70,
        totalExamQuestions: 55,
        quizzes: [
          { id: 'azure-az104-quiz-1', name: 'Quiz 1', certificationId: 'azure-az104', questionCount: 5 },
        ],
      },
      {
        id: 'azure-az305',
        name: 'Azure Solutions Architect',
        code: 'AZ-305',
        platformId: 'azure',
        examDuration: 120,
        passingScore: 70,
        totalExamQuestions: 50,
        quizzes: [
          { id: 'azure-az305-quiz-1', name: 'Quiz 1', certificationId: 'azure-az305', questionCount: 5 },
        ],
      },
    ],
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    shortName: 'GCP',
    color: '#4285F4',
    icon: 'cloud-circle',
    certifications: [
      {
        id: 'gcp-ace',
        name: 'Associate Cloud Engineer',
        code: 'ACE',
        platformId: 'gcp',
        examDuration: 120,
        passingScore: 70,
        totalExamQuestions: 50,
        quizzes: [
          { id: 'gcp-ace-quiz-1', name: 'Quiz 1', certificationId: 'gcp-ace', questionCount: 5 },
        ],
      },
      {
        id: 'gcp-pca',
        name: 'Professional Cloud Architect',
        code: 'PCA',
        platformId: 'gcp',
        examDuration: 120,
        passingScore: 70,
        totalExamQuestions: 50,
        quizzes: [
          { id: 'gcp-pca-quiz-1', name: 'Quiz 1', certificationId: 'gcp-pca', questionCount: 5 },
        ],
      },
      {
        id: 'gcp-pde',
        name: 'Professional Data Engineer',
        code: 'PDE',
        platformId: 'gcp',
        examDuration: 120,
        passingScore: 70,
        totalExamQuestions: 50,
        quizzes: [
          { id: 'gcp-pde-quiz-1', name: 'Quiz 1', certificationId: 'gcp-pde', questionCount: 5 },
        ],
      },
    ],
  },
  {
    id: 'devops',
    name: 'DevOps Tools',
    shortName: 'DevOps',
    color: '#8B5CF6',
    icon: 'construct',
    certifications: [
      {
        id: 'devops-terraform',
        name: 'Terraform Associate',
        code: 'TA-003',
        platformId: 'devops',
        examDuration: 60,
        passingScore: 70,
        totalExamQuestions: 57,
        quizzes: [
          { id: 'devops-terraform-quiz-1', name: 'Quiz 1', certificationId: 'devops-terraform', questionCount: 5 },
        ],
      },
      {
        id: 'devops-cka',
        name: 'Certified Kubernetes Administrator',
        code: 'CKA',
        platformId: 'devops',
        examDuration: 120,
        passingScore: 66,
        totalExamQuestions: 17,
        quizzes: [
          { id: 'devops-cka-quiz-1', name: 'Quiz 1', certificationId: 'devops-cka', questionCount: 5 },
        ],
      },
      {
        id: 'devops-docker',
        name: 'Docker Certified Associate',
        code: 'DCA',
        platformId: 'devops',
        examDuration: 90,
        passingScore: 65,
        totalExamQuestions: 55,
        quizzes: [
          { id: 'devops-docker-quiz-1', name: 'Quiz 1', certificationId: 'devops-docker', questionCount: 5 },
        ],
      },
    ],
  },
];

export function getPlatform(platformId: string): Platform | undefined {
  return platforms.find(p => p.id === platformId);
}

export function getCertification(certId: string) {
  for (const platform of platforms) {
    const cert = platform.certifications.find(c => c.id === certId);
    if (cert) return { certification: cert, platform };
  }
  return undefined;
}

export function getQuizMeta(quizId: string) {
  for (const platform of platforms) {
    for (const cert of platform.certifications) {
      const quiz = cert.quizzes.find(q => q.id === quizId);
      if (quiz) return { quiz, certification: cert, platform };
    }
  }
  return undefined;
}
