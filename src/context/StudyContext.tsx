import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type TopicProgress = {
  completed: boolean;
  hours: number;
  notes: string;
};

export type TestResult = {
  id: string;
  testId: string;
  testName: string;
  takenAt: string;
  score: number;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  timeTakenSeconds: number;
  subjectStats: { subject: string; correct: number; total: number }[];
  answers: Record<string, number | null>;
};

type StudyState = {
  topics: Record<string, TopicProgress>;
  bookmarks: string[];
  recentlyViewed: string[];
  readLater: string[];
  results: TestResult[];
  studyLog: Record<string, number>;
  goals: { daily: number; weekly: number; monthly: number };
  profile: { name: string; target: string };
};

const STORAGE_KEY = "upsc-clay-study-state-v1";

const defaultState: StudyState = {
  topics: {},
  bookmarks: [],
  recentlyViewed: [],
  readLater: [],
  results: [],
  studyLog: {},
  goals: { daily: 4, weekly: 24, monthly: 100 },
  profile: { name: "Aspirant", target: "CSE 2027" },
};

export const todayKey = () => new Date().toISOString().slice(0, 10);

type StudyContextValue = StudyState & {
  hydrated: boolean;
  toggleTopic: (id: string) => void;
  setTopicHours: (id: string, hours: number) => void;
  setTopicNotes: (id: string, notes: string) => void;
  toggleBookmark: (id: string) => void;
  markViewed: (id: string) => void;
  toggleReadLater: (id: string) => void;
  addResult: (result: TestResult) => void;
  setGoals: (goals: Partial<StudyState["goals"]>) => void;
  setProfile: (profile: Partial<StudyState["profile"]>) => void;
  resetAll: () => void;
  streak: number;
  totalHours: number;
  completedCount: number;
};

const StudyContext = createContext<StudyContextValue | null>(null);

function computeStreak(log: Record<string, number>) {
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 400; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if ((log[key] ?? 0) > 0) {
      streak += 1;
    } else if (i > 0) {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...defaultState, ...(JSON.parse(raw) as StudyState) });
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const logActivity = useCallback((hours = 0.25) => {
    setState((s) => ({
      ...s,
      studyLog: { ...s.studyLog, [todayKey()]: Number(((s.studyLog[todayKey()] ?? 0) + hours).toFixed(2)) },
    }));
  }, []);

  const value = useMemo<StudyContextValue>(() => {
    const topicOf = (id: string) => state.topics[id] ?? { completed: false, hours: 0, notes: "" };
    return {
      ...state,
      hydrated,
      streak: computeStreak(state.studyLog),
      totalHours: Object.values(state.studyLog).reduce((a, b) => a + b, 0),
      completedCount: Object.values(state.topics).filter((t) => t.completed).length,
      toggleTopic: (id) => {
        setState((s) => {
          const prev = s.topics[id] ?? { completed: false, hours: 0, notes: "" };
          return { ...s, topics: { ...s.topics, [id]: { ...prev, completed: !prev.completed } } };
        });
        logActivity(0.5);
      },
      setTopicHours: (id, hours) =>
        setState((s) => ({
          ...s,
          topics: { ...s.topics, [id]: { ...topicOf(id), hours: Math.max(0, hours) } },
        })),
      setTopicNotes: (id, notes) =>
        setState((s) => ({ ...s, topics: { ...s.topics, [id]: { ...topicOf(id), notes } } })),
      toggleBookmark: (id) =>
        setState((s) => ({
          ...s,
          bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter((b) => b !== id) : [id, ...s.bookmarks],
        })),
      markViewed: (id) =>
        setState((s) => ({ ...s, recentlyViewed: [id, ...s.recentlyViewed.filter((r) => r !== id)].slice(0, 8) })),
      toggleReadLater: (id) =>
        setState((s) => ({
          ...s,
          readLater: s.readLater.includes(id) ? s.readLater.filter((b) => b !== id) : [id, ...s.readLater],
        })),
      addResult: (result) => {
        setState((s) => ({
          ...s,
          results: [result, ...s.results].slice(0, 30),
          studyLog: {
            ...s.studyLog,
            [todayKey()]: Number(
              ((s.studyLog[todayKey()] ?? 0) + result.timeTakenSeconds / 3600).toFixed(2),
            ),
          },
        }));
      },
      setGoals: (goals) => setState((s) => ({ ...s, goals: { ...s.goals, ...goals } })),
      setProfile: (profile) => setState((s) => ({ ...s, profile: { ...s.profile, ...profile } })),
      resetAll: () => setState(defaultState),
    };
  }, [state, hydrated, logActivity]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used within StudyProvider");
  return ctx;
}