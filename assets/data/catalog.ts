import { Platform } from '@/types/quiz';
import { Colors } from '@/constants/Colors';

export const platforms: Platform[] = [
  {
    id: 'claude',
    name: 'Claude by Anthropic',
    shortName: 'Claude',
    color: '#D97757',
    icon: 'sparkles',
    certifications: [
      {
        id: 'claude-ccdvf',
        name: 'Claude Certified Developer – Foundations',
        code: 'CCDV-F',
        platformId: 'claude',
        examInfo: {
          questionCount: 53,
          duration: 120,
          passingScore: 70,
          practicePassingScore: true,
          questionTypes: ['Multiple Choice', 'Multiple Response'],
          delivery: ['Online Proctored', 'Testing Center'],
          note: 'Unofficial questions based on the July 2026 blueprint. The 70% practice goal is not the official pass mark (720 on a 100–1,000 scale). The exam updates on December 7, 2026; consult the revised guide.',
          domains: [
            { name: 'Agents and Workflows', percentage: 14.7 },
            { name: 'Applications and Integration', percentage: 33.1 },
            { name: 'Claude Code', percentage: 3.1 },
            { name: 'Eval, Testing, and Debugging', percentage: 2.6 },
            { name: 'Model Selection and Optimization', percentage: 16.8 },
            { name: 'Prompt and Context Engineering', percentage: 11.0 },
            { name: 'Security and Safety', percentage: 8.1 },
            { name: 'Tools and MCPs', percentage: 10.6 },
          ],
        },
        quizzes: [
          {
            id: 'claude-ccdvf-quiz-1',
            name: 'Exam Prep 1',
            certificationId: 'claude-ccdvf',
            questionCount: 53,
          },
          {
            id: 'claude-ccdvf-quiz-2',
            name: 'Exam Prep 2',
            certificationId: 'claude-ccdvf',
            questionCount: 53,
          },
          {
            id: 'claude-ccdvf-quiz-3',
            name: 'Learn: API & Integration',
            certificationId: 'claude-ccdvf',
            questionCount: 20,
            includeInExam: false,
          },
          {
            id: 'claude-ccdvf-quiz-4',
            name: 'Learn: Agents, Tools & Security',
            certificationId: 'claude-ccdvf',
            questionCount: 20,
            includeInExam: false,
          },
          {
            id: 'claude-ccdvf-quiz-5',
            name: 'Learn: Claude Code, Prompts & Evals',
            certificationId: 'claude-ccdvf',
            questionCount: 20,
            includeInExam: false,
          },
        ],
      },
    ],
  },
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
        examInfo: {
          questionCount: 65,
          duration: 130,
          passingScore: 72,
          questionTypes: ['Multiple Choice', 'Multiple Select'],
          delivery: ['Testing Center', 'Online Proctored'],
          domains: [
            { name: 'Design Secure Architectures', percentage: 30 },
            { name: 'Design Resilient Architectures', percentage: 26 },
            { name: 'Design High-Performing Architectures', percentage: 24 },
            { name: 'Design Cost-Optimized Architectures', percentage: 20 },
          ],
        },
        freeSample: { quizId: 'aws-saa-sample', questionCount: 15 },
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
        examInfo: {
          questionCount: 65,
          duration: 130,
          passingScore: 72,
          questionTypes: ['Multiple Choice', 'Multiple Select'],
          delivery: ['Testing Center', 'Online Proctored'],
          domains: [
            { name: 'Development with AWS Services', percentage: 32 },
            { name: 'Security', percentage: 26 },
            { name: 'Deployment', percentage: 24 },
            { name: 'Troubleshooting and Optimization', percentage: 18 },
          ],
        },
        freeSample: { quizId: 'aws-dva-sample', questionCount: 15 },
        quizzes: [
          { id: 'aws-dva-quiz-1', name: 'Quiz 1', certificationId: 'aws-dva', questionCount: 65 },
          { id: 'aws-dva-quiz-2', name: 'Quiz 2', certificationId: 'aws-dva', questionCount: 65 },
          { id: 'aws-dva-quiz-3', name: 'Quiz 3', certificationId: 'aws-dva', questionCount: 65 },
        ],
      },
      {
        id: 'aws-soa',
        name: 'SysOps Administrator Associate',
        code: 'SOA-C02',
        platformId: 'aws',
        examInfo: {
          questionCount: 65,
          duration: 180,
          passingScore: 72,
          questionTypes: ['Multiple Choice', 'Multiple Select', 'Exam Labs'],
          delivery: ['Testing Center', 'Online Proctored'],
          domains: [
            { name: 'Monitoring, Logging, and Remediation', percentage: 20 },
            { name: 'Reliability and Business Continuity', percentage: 16 },
            { name: 'Deployment, Provisioning, and Automation', percentage: 18 },
            { name: 'Security and Compliance', percentage: 16 },
            { name: 'Networking and Content Delivery', percentage: 18 },
            { name: 'Cost and Performance Optimization', percentage: 12 },
          ],
          note: 'Includes optional exam labs section (hands-on tasks in a live AWS environment).',
        },
        quizzes: [
          { id: 'aws-soa-quiz-1', name: 'Quiz 1', certificationId: 'aws-soa', questionCount: 30 },
        ],
      },
      {
        id: 'aws-dop',
        name: 'DevOps Engineer Professional',
        code: 'DOP-C02',
        platformId: 'aws',
        examInfo: {
          questionCount: 75,
          duration: 180,
          passingScore: 75,
          questionTypes: ['Multiple Choice', 'Multiple Select'],
          delivery: ['Testing Center', 'Online Proctored'],
          domains: [
            { name: 'SDLC Automation', percentage: 22 },
            { name: 'Configuration Management and IaC', percentage: 17 },
            { name: 'Resilient Cloud Solutions', percentage: 15 },
            { name: 'Monitoring and Logging', percentage: 15 },
            { name: 'Incident and Event Response', percentage: 14 },
            { name: 'Security and Compliance', percentage: 17 },
          ],
        },
        quizzes: [
          { id: 'aws-dop-quiz-1', name: 'Quiz 1', certificationId: 'aws-dop', questionCount: 30 },
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
        examInfo: {
          questionCount: 50,
          duration: 85,
          passingScore: 70,
          questionTypes: ['Multiple Choice', 'Multiple Select', 'Drag and Drop', 'Yes/No'],
          delivery: ['Testing Center', 'Online Proctored'],
          domains: [
            { name: 'Describe Cloud Concepts', percentage: 25 },
            { name: 'Describe Azure Architecture and Services', percentage: 35 },
            { name: 'Describe Azure Management and Governance', percentage: 30 },
          ],
          note: 'Domain percentages are approximate ranges (Microsoft uses 5% bands).',
        },
        quizzes: [
          {
            id: 'azure-az900-quiz-1',
            name: 'Quiz 1',
            certificationId: 'azure-az900',
            questionCount: 30,
          },
        ],
      },
      {
        id: 'azure-az104',
        name: 'Azure Administrator',
        code: 'AZ-104',
        platformId: 'azure',
        examInfo: {
          questionCount: 50,
          duration: 120,
          passingScore: 70,
          questionTypes: ['Multiple Choice', 'Multiple Select', 'Drag and Drop', 'Case Studies'],
          delivery: ['Testing Center', 'Online Proctored'],
          domains: [
            { name: 'Manage Azure Identities and Governance', percentage: 20 },
            { name: 'Implement and Manage Storage', percentage: 15 },
            { name: 'Deploy and Manage Azure Compute Resources', percentage: 25 },
            { name: 'Implement and Manage Virtual Networking', percentage: 20 },
            { name: 'Monitor and Maintain Azure Resources', percentage: 10 },
          ],
          note: 'Domain percentages are approximate ranges (Microsoft uses 5% bands).',
        },
        quizzes: [
          {
            id: 'azure-az104-quiz-1',
            name: 'Quiz 1',
            certificationId: 'azure-az104',
            questionCount: 30,
          },
        ],
      },
      {
        id: 'azure-az305',
        name: 'Azure Solutions Architect',
        code: 'AZ-305',
        platformId: 'azure',
        examInfo: {
          questionCount: 50,
          duration: 120,
          passingScore: 70,
          questionTypes: ['Multiple Choice', 'Multiple Select', 'Drag and Drop', 'Case Studies'],
          delivery: ['Testing Center', 'Online Proctored'],
          domains: [
            { name: 'Design Identity, Governance, and Monitoring Solutions', percentage: 25 },
            { name: 'Design Data Storage Solutions', percentage: 25 },
            { name: 'Design Business Continuity Solutions', percentage: 10 },
            { name: 'Design Infrastructure Solutions', percentage: 25 },
          ],
          note: 'Domain percentages are approximate ranges (Microsoft uses 5% bands).',
        },
        quizzes: [
          {
            id: 'azure-az305-quiz-1',
            name: 'Quiz 1',
            certificationId: 'azure-az305',
            questionCount: 30,
          },
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
        examInfo: {
          questionCount: 50,
          duration: 120,
          passingScore: 70,
          questionTypes: ['Multiple Choice', 'Multiple Select'],
          delivery: ['Testing Center', 'Online Proctored'],
          domains: [
            { name: 'Setting Up a Cloud Solution Environment', percentage: 17 },
            { name: 'Planning and Configuring a Cloud Solution', percentage: 18 },
            { name: 'Deploying and Implementing a Cloud Solution', percentage: 25 },
            { name: 'Ensuring Successful Operation of a Cloud Solution', percentage: 20 },
            { name: 'Configuring Access and Security', percentage: 20 },
          ],
        },
        quizzes: [
          { id: 'gcp-ace-quiz-1', name: 'Quiz 1', certificationId: 'gcp-ace', questionCount: 30 },
        ],
      },
      {
        id: 'gcp-pca',
        name: 'Professional Cloud Architect',
        code: 'PCA',
        platformId: 'gcp',
        examInfo: {
          questionCount: 50,
          duration: 120,
          passingScore: 70,
          questionTypes: ['Multiple Choice', 'Multiple Select'],
          delivery: ['Testing Center', 'Online Proctored'],
          domains: [
            { name: 'Designing and Planning a Cloud Solution Architecture', percentage: 24 },
            { name: 'Managing and Provisioning Solution Infrastructure', percentage: 15 },
            { name: 'Designing for Security and Compliance', percentage: 18 },
            { name: 'Analyzing and Optimizing Technical and Business Processes', percentage: 18 },
            { name: 'Managing Implementation', percentage: 11 },
            { name: 'Ensuring Solution and Operations Reliability', percentage: 14 },
          ],
        },
        quizzes: [
          { id: 'gcp-pca-quiz-1', name: 'Quiz 1', certificationId: 'gcp-pca', questionCount: 30 },
        ],
      },
      {
        id: 'gcp-pde',
        name: 'Professional Data Engineer',
        code: 'PDE',
        platformId: 'gcp',
        examInfo: {
          questionCount: 50,
          duration: 120,
          passingScore: 70,
          questionTypes: ['Multiple Choice', 'Multiple Select'],
          delivery: ['Testing Center', 'Online Proctored'],
          domains: [
            { name: 'Designing Data Processing Systems', percentage: 22 },
            { name: 'Ingesting and Processing the Data', percentage: 25 },
            { name: 'Storing the Data', percentage: 20 },
            { name: 'Preparing and Using Data for Analysis', percentage: 15 },
            { name: 'Maintaining and Automating Data Workloads', percentage: 18 },
          ],
        },
        quizzes: [
          { id: 'gcp-pde-quiz-1', name: 'Quiz 1', certificationId: 'gcp-pde', questionCount: 30 },
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
        examInfo: {
          questionCount: 57,
          duration: 60,
          passingScore: 70,
          questionTypes: ['Multiple Choice', 'Multiple Select', 'Fill in the Blank'],
          delivery: ['Online Proctored'],
          domains: [
            { name: 'Understand IaC Concepts', percentage: 16 },
            { name: "Understand Terraform's Purpose", percentage: 13 },
            { name: 'Understand Terraform Basics', percentage: 19 },
            { name: 'Use the Terraform CLI', percentage: 26 },
            { name: 'Interact with Terraform Modules', percentage: 10 },
            { name: 'Use the Core Terraform Workflow', percentage: 7 },
            { name: 'Implement and Maintain State', percentage: 9 },
          ],
          note: 'Online proctored only via PSI. No in-person testing centers.',
        },
        quizzes: [
          {
            id: 'devops-terraform-quiz-1',
            name: 'Quiz 1',
            certificationId: 'devops-terraform',
            questionCount: 30,
          },
        ],
      },
      {
        id: 'devops-cka',
        name: 'Certified Kubernetes Administrator',
        code: 'CKA',
        platformId: 'devops',
        examInfo: {
          questionCount: 17,
          duration: 120,
          passingScore: 66,
          questionTypes: ['Performance-Based (hands-on tasks)'],
          delivery: ['Online Proctored'],
          domains: [
            { name: 'Cluster Architecture, Installation & Configuration', percentage: 25 },
            { name: 'Workloads & Scheduling', percentage: 15 },
            { name: 'Services & Networking', percentage: 20 },
            { name: 'Storage', percentage: 10 },
            { name: 'Troubleshooting', percentage: 30 },
          ],
          note: 'Performance-based exam — you work in a live Kubernetes environment, no multiple choice. Online proctored only via PSI.',
        },
        quizzes: [
          {
            id: 'devops-cka-quiz-1',
            name: 'Quiz 1',
            certificationId: 'devops-cka',
            questionCount: 30,
          },
        ],
      },
      {
        id: 'devops-docker',
        name: 'Docker Certified Associate',
        code: 'DCA',
        platformId: 'devops',
        examInfo: {
          questionCount: 55,
          duration: 90,
          passingScore: 65,
          questionTypes: ['Multiple Choice'],
          delivery: ['Online Proctored'],
          domains: [
            { name: 'Orchestration', percentage: 25 },
            { name: 'Image Creation, Management, and Registry', percentage: 20 },
            { name: 'Installation and Configuration', percentage: 15 },
            { name: 'Networking', percentage: 15 },
            { name: 'Security', percentage: 15 },
            { name: 'Storage and Volumes', percentage: 10 },
          ],
          note: 'Online proctored only via Mirantis.',
        },
        quizzes: [
          {
            id: 'devops-docker-quiz-1',
            name: 'Quiz 1',
            certificationId: 'devops-docker',
            questionCount: 30,
          },
        ],
      },
    ],
  },
];

// Interview Prep — one topic per real-world tool named in the EPG job description.
// Kept out of `platforms` (the Browse tab lists only certification platforms);
// surfaced instead by the Interview tab. Each topic reuses the same
// Certification/QuizMeta shape purely so it can flow through the existing
// getCertification/getQuizMeta lookups and the existing quiz-taking screen.
function interviewCert(id: string, name: string, questionCount: number) {
  return {
    id: `interview-${id}`,
    name,
    code: 'INTERVIEW',
    platformId: 'interview',
    examInfo: {
      questionCount,
      duration: Math.round(questionCount * 1.5),
      passingScore: 70,
      questionTypes: ['Multiple Choice'],
      delivery: ['Self-Paced'],
      domains: [{ name: 'Core Concepts', percentage: 100 }],
    },
    quizzes: [
      {
        id: `interview-${id}-quiz-1`,
        name: 'Interview Quiz',
        certificationId: `interview-${id}`,
        questionCount,
      },
    ],
  };
}

export const interviewPlatform: Platform = {
  id: 'interview',
  name: 'Interview Prep',
  shortName: 'Interview',
  color: Colors.primary,
  icon: 'chatbubbles',
  certifications: [
    interviewCert('ceph', 'Ceph', 15),
    interviewCert('k8s', 'Kubernetes', 15),
    interviewCert('docker', 'Docker', 15),
    interviewCert('linux', 'Linux', 15),
    interviewCert('ansible', 'Ansible', 15),
    interviewCert('azure-networking', 'Azure Infrastructure & Networking', 15),
  ],
};

// Display metadata for the Interview tab's topic list. `id` matches both the
// `interview-${id}` certification id and the `${id}` key in lib/interviewQA.ts.
export const interviewTopics: { id: string; name: string; icon: string }[] = [
  { id: 'ceph', name: 'Ceph', icon: 'layers-outline' },
  { id: 'k8s', name: 'Kubernetes', icon: 'git-network-outline' },
  { id: 'docker', name: 'Docker', icon: 'cube-outline' },
  { id: 'linux', name: 'Linux', icon: 'terminal-outline' },
  { id: 'ansible', name: 'Ansible', icon: 'infinite-outline' },
  { id: 'azure-networking', name: 'Azure Infrastructure & Networking', icon: 'globe-outline' },
];

const allPlatforms: Platform[] = [...platforms, interviewPlatform];

export function getPlatform(platformId: string): Platform | undefined {
  return allPlatforms.find((p) => p.id === platformId);
}

export function getCertification(certId: string) {
  for (const platform of allPlatforms) {
    const cert = platform.certifications.find((c) => c.id === certId);
    if (cert) return { certification: cert, platform };
  }
  return undefined;
}

export function getQuizMeta(quizId: string) {
  for (const platform of allPlatforms) {
    for (const cert of platform.certifications) {
      if (cert.freeSample && cert.freeSample.quizId === quizId) {
        return {
          quiz: {
            id: quizId,
            name: 'Free Sample',
            certificationId: cert.id,
            questionCount: cert.freeSample.questionCount,
          },
          certification: cert,
          platform,
          isSample: true,
        };
      }
      const quiz = cert.quizzes.find((q) => q.id === quizId);
      if (quiz) return { quiz, certification: cert, platform, isSample: false };
    }
  }
  return undefined;
}
