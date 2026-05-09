export interface Platform {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  certifications: Certification[];
}

export interface ExamDomain {
  name: string;
  percentage: number;
}

export interface ExamInfo {
  questionCount: number;
  duration: number; // minutes
  passingScore: number; // percentage, e.g. 72
  questionTypes: string[]; // e.g. ["Multiple Choice", "Multiple Select"]
  delivery: string[]; // e.g. ["Testing Center", "Online Proctored"]
  domains: ExamDomain[];
  note?: string; // optional caveat (e.g. performance-based, range percentages)
}

export interface FreeSample {
  quizId: string; // e.g. "aws-saa-sample"
  questionCount: number;
}

export interface Certification {
  id: string;
  name: string;
  code: string;
  platformId: string;
  examInfo: ExamInfo;
  freeSample?: FreeSample;
  quizzes: QuizMeta[]; // pro quizzes only
  comingSoon?: boolean;
}

export interface QuizMeta {
  id: string;
  name: string;
  certificationId: string;
  questionCount: number;
}

export interface EntitlementStatus {
  isPro: boolean;
  source: 'revenuecat' | 'cache' | 'none';
  productId?: string;
}

export interface Question {
  id: string;
  question_number: string;
  question: string;
  choices: string[];
  correct_answer_indices: number[];
  explanation_html: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  certificationId: string;
  platformId: string;
  mode: 'quiz' | 'exam';
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  answers: AnswerRecord[];
}

export interface AnswerRecord {
  questionId: string;
  selectedIndices: number[];
  correct: boolean;
}

export interface BookmarkMeta {
  certId: string;
  quizId: string;
  dateAdded: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  studyDates: string[];
}
