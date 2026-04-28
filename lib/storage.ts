import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizAttempt, BookmarkMeta, StreakData } from '@/types/quiz';
import { getToday, getDaysBetween } from './utils';

const KEYS = {
  HISTORY: '@history',
  BOOKMARKS: '@bookmarks',
  BOOKMARKS_META: '@bookmarks_meta',
  STREAKS: '@streaks',
  ONBOARDING_COMPLETE: '@onboarding_complete',
  SCHEMA_VERSION: '@schema_version',
} as const;

const CURRENT_SCHEMA_VERSION = 1;

const DEFAULT_STREAKS: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: '',
  studyDates: [],
};

// ---- Schema versioning -----------------------------------------------------
//
// Bump CURRENT_SCHEMA_VERSION whenever the on-disk shape of any stored value
// changes. Add a migration branch in `ensureSchema()` for the previous version.
// All read paths should be able to assume ensureSchema() has run first.

let _schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (_schemaReady) return _schemaReady;
  _schemaReady = (async () => {
    const stored = await AsyncStorage.getItem(KEYS.SCHEMA_VERSION);
    const version = stored ? parseInt(stored, 10) : 0;
    if (Number.isNaN(version) || version > CURRENT_SCHEMA_VERSION) {
      // Future-version data from a downgraded build. Leave it alone, just
      // record the current version so future reads don't keep re-checking.
      await AsyncStorage.setItem(KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
      return;
    }
    if (version === CURRENT_SCHEMA_VERSION) return;

    // Future migrations: branch on `version` and rewrite keys as needed.
    // e.g. if (version < 2) { await migrateBookmarksTo2(); }

    await AsyncStorage.setItem(KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
  })();
  return _schemaReady;
}

// ---- History ---------------------------------------------------------------

export async function getHistory(): Promise<QuizAttempt[]> {
  await ensureSchema();
  const data = await AsyncStorage.getItem(KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
}

export async function addAttempt(attempt: QuizAttempt): Promise<QuizAttempt[]> {
  const history = await getHistory();
  history.unshift(attempt);
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  return history;
}

// ---- Bookmarks -------------------------------------------------------------

export async function getBookmarks(): Promise<string[]> {
  await ensureSchema();
  const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
  return data ? JSON.parse(data) : [];
}

export async function getBookmarksMeta(): Promise<Record<string, BookmarkMeta>> {
  await ensureSchema();
  const data = await AsyncStorage.getItem(KEYS.BOOKMARKS_META);
  return data ? JSON.parse(data) : {};
}

export async function toggleBookmark(
  questionId: string,
  meta?: BookmarkMeta
): Promise<{ bookmarks: string[]; bookmarksMeta: Record<string, BookmarkMeta> }> {
  const bookmarks = await getBookmarks();
  const bookmarksMeta = await getBookmarksMeta();

  const index = bookmarks.indexOf(questionId);
  if (index >= 0) {
    bookmarks.splice(index, 1);
    delete bookmarksMeta[questionId];
  } else {
    bookmarks.push(questionId);
    if (meta) {
      bookmarksMeta[questionId] = meta;
    }
  }

  await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  await AsyncStorage.setItem(KEYS.BOOKMARKS_META, JSON.stringify(bookmarksMeta));

  return { bookmarks, bookmarksMeta };
}

// ---- Streaks ---------------------------------------------------------------

export async function getStreakData(): Promise<StreakData> {
  await ensureSchema();
  const data = await AsyncStorage.getItem(KEYS.STREAKS);
  return data ? JSON.parse(data) : DEFAULT_STREAKS;
}

export async function recordStudySession(): Promise<StreakData> {
  const streaks = await getStreakData();
  const today = getToday();

  if (streaks.lastStudyDate === today) {
    return streaks;
  }

  if (!streaks.studyDates.includes(today)) {
    streaks.studyDates.push(today);
  }

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  streaks.studyDates = streaks.studyDates.filter((d) => d >= cutoffStr);

  if (streaks.lastStudyDate && getDaysBetween(streaks.lastStudyDate, today) === 1) {
    streaks.currentStreak += 1;
  } else if (streaks.lastStudyDate !== today) {
    streaks.currentStreak = 1;
  }

  if (streaks.currentStreak > streaks.longestStreak) {
    streaks.longestStreak = streaks.currentStreak;
  }

  streaks.lastStudyDate = today;
  await AsyncStorage.setItem(KEYS.STREAKS, JSON.stringify(streaks));

  return streaks;
}

// ---- Onboarding ------------------------------------------------------------

export async function getOnboardingComplete(): Promise<boolean> {
  await ensureSchema();
  const data = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
  return data === 'true';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
}
