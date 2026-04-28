import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  toggleBookmark: (
    questionId: string,
    meta?: BookmarkMeta,
    isPro?: boolean,
    onLimitReached?: () => void
  ) => Promise<void>;
  isBookmarked: (questionId: string) => boolean;
  recordStudySession: () => Promise<void>;
  getBestScore: (quizId: string) => number | null;
  getAttemptsForCert: (certId: string) => QuizAttempt[];
  completeOnboarding: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_STATE: AppState = {
  history: [],
  bookmarks: [],
  bookmarksMeta: {},
  streaks: { currentStreak: 0, longestStreak: 0, lastStudyDate: '', studyDates: [] },
  isLoaded: false,
  hasCompletedOnboarding: false,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  // Keep a ref to the latest state so memoized callbacks below can read it
  // without taking a dependency on changing arrays. This avoids re-creating
  // every callback whenever bookmarks/history change.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [history, bookmarks, bookmarksMeta, streaks, hasCompletedOnboarding] =
          await Promise.all([
            Storage.getHistory(),
            Storage.getBookmarks(),
            Storage.getBookmarksMeta(),
            Storage.getStreakData(),
            Storage.getOnboardingComplete(),
          ]);
        if (cancelled) return;
        setState({
          history,
          bookmarks,
          bookmarksMeta,
          streaks,
          isLoaded: true,
          hasCompletedOnboarding,
        });
      } catch (err) {
        if (__DEV__) console.warn('[AppContext] hydrate failed', err);
        if (cancelled) return;
        // Fall back to empty state but mark loaded so the UI can render.
        setState((prev) => ({ ...prev, isLoaded: true }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addAttempt = useCallback(async (attempt: QuizAttempt) => {
    const history = await Storage.addAttempt(attempt);
    setState((prev) => ({ ...prev, history }));
  }, []);

  const toggleBookmark = useCallback(
    async (
      questionId: string,
      meta?: BookmarkMeta,
      isPro: boolean = true,
      onLimitReached?: () => void
    ) => {
      const current = stateRef.current.bookmarks;
      const isCurrentlyBookmarked = current.includes(questionId);
      if (!isCurrentlyBookmarked && !canAddBookmark(current.length, isPro)) {
        if (onLimitReached) {
          onLimitReached();
        } else {
          Alert.alert(
            'Bookmark Limit',
            `Free users can save up to ${FREE_BOOKMARK_LIMIT} bookmarks. Upgrade to Pro for unlimited bookmarks.`
          );
        }
        return;
      }
      const result = await Storage.toggleBookmark(questionId, meta);
      setState((prev) => ({
        ...prev,
        bookmarks: result.bookmarks,
        bookmarksMeta: result.bookmarksMeta,
      }));
    },
    []
  );

  const isBookmarked = useCallback((questionId: string) => {
    return stateRef.current.bookmarks.includes(questionId);
  }, []);

  const recordStudySession = useCallback(async () => {
    const streaks = await Storage.recordStudySession();
    setState((prev) => ({ ...prev, streaks }));
  }, []);

  const getBestScore = useCallback((quizId: string) => {
    const attempts = stateRef.current.history.filter((a) => a.quizId === quizId);
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map((a) => a.percentage));
  }, []);

  const getAttemptsForCert = useCallback((certId: string) => {
    return stateRef.current.history.filter((a) => a.certificationId === certId);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await Storage.setOnboardingComplete();
    setState((prev) => ({ ...prev, hasCompletedOnboarding: true }));
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
