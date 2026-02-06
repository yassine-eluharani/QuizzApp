import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { QuizAttempt, BookmarkMeta, StreakData } from '@/types/quiz';
import * as Storage from '@/lib/storage';
import { canAddBookmark, FREE_BOOKMARK_LIMIT } from '@/lib/entitlements';

interface AppState {
  history: QuizAttempt[];
  bookmarks: string[];
  bookmarksMeta: Record<string, BookmarkMeta>;
  streaks: StreakData;
  isLoaded: boolean;
  hasCompletedOnboarding: boolean;
}

interface AppContextType extends AppState {
  addAttempt: (attempt: QuizAttempt) => Promise<void>;
  toggleBookmark: (questionId: string, meta?: BookmarkMeta, isPro?: boolean, onLimitReached?: () => void) => Promise<void>;
  isBookmarked: (questionId: string) => boolean;
  recordStudySession: () => Promise<void>;
  getBestScore: (quizId: string) => number | null;
  getAttemptsForCert: (certId: string) => QuizAttempt[];
  completeOnboarding: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    history: [],
    bookmarks: [],
    bookmarksMeta: {},
    streaks: { currentStreak: 0, longestStreak: 0, lastStudyDate: '', studyDates: [] },
    isLoaded: false,
    hasCompletedOnboarding: false,
  });

  useEffect(() => {
    (async () => {
      const [history, bookmarks, bookmarksMeta, streaks, hasCompletedOnboarding] = await Promise.all([
        Storage.getHistory(),
        Storage.getBookmarks(),
        Storage.getBookmarksMeta(),
        Storage.getStreakData(),
        Storage.getOnboardingComplete(),
      ]);
      setState({ history, bookmarks, bookmarksMeta, streaks, isLoaded: true, hasCompletedOnboarding });
    })();
  }, []);

  const addAttempt = useCallback(async (attempt: QuizAttempt) => {
    const history = await Storage.addAttempt(attempt);
    setState(prev => ({ ...prev, history }));
  }, []);

  const toggleBookmark = useCallback(async (questionId: string, meta?: BookmarkMeta, isPro: boolean = true, onLimitReached?: () => void) => {
    const isCurrentlyBookmarked = state.bookmarks.includes(questionId);
    if (!isCurrentlyBookmarked && !canAddBookmark(state.bookmarks.length, isPro)) {
      if (onLimitReached) {
        onLimitReached();
      } else {
        Alert.alert('Bookmark Limit', `Free users can save up to ${FREE_BOOKMARK_LIMIT} bookmarks. Upgrade to Pro for unlimited bookmarks.`);
      }
      return;
    }
    const result = await Storage.toggleBookmark(questionId, meta);
    setState(prev => ({
      ...prev,
      bookmarks: result.bookmarks,
      bookmarksMeta: result.bookmarksMeta,
    }));
  }, [state.bookmarks]);

  const isBookmarked = useCallback((questionId: string) => {
    return state.bookmarks.includes(questionId);
  }, [state.bookmarks]);

  const recordStudySession = useCallback(async () => {
    const streaks = await Storage.recordStudySession();
    setState(prev => ({ ...prev, streaks }));
  }, []);

  const getBestScore = useCallback((quizId: string) => {
    const attempts = state.history.filter(a => a.quizId === quizId);
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map(a => a.percentage));
  }, [state.history]);

  const getAttemptsForCert = useCallback((certId: string) => {
    return state.history.filter(a => a.certificationId === certId);
  }, [state.history]);

  const completeOnboarding = useCallback(async () => {
    await Storage.setOnboardingComplete();
    setState(prev => ({ ...prev, hasCompletedOnboarding: true }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addAttempt,
        toggleBookmark,
        isBookmarked,
        recordStudySession,
        getBestScore,
        getAttemptsForCert,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
