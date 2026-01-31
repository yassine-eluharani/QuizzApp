export interface Platform {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  certifications: Certification[];
}

export interface Certification {
  id: string;
  name: string;
  code: string;
  platformId: string;
  examDuration: number;
  passingScore: number;
  totalExamQuestions: number;
  quizzes: QuizMeta[];
}

export interface QuizMeta {
  id: string;
  name: string;
  certificationId: string;
  questionCount: number;
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
