import { useSyncExternalStore } from "react";
import type { GeneratedQuestion } from "./test-generation.server";

export type BankQuestion = GeneratedQuestion & {
  id: string;
  source: string;
  aiGenerated: boolean;
  createdAt: string;
  attempts: number;
  correctAttempts: number;
};

export type AiTestConfig = {
  scopeLabel: string;
  topicIds: string[];
  count: number;
  difficulty: string;
  types: string[];
  mode: "static" | "current-affairs" | "mixed";
};

export type AiTest = {
  id: string;
  name: string;
  createdAt: string;
  durationMinutes: number;
  config: AiTestConfig;
  questionIds: string[];
};

type BankState = { questions: BankQuestion[]; tests: AiTest[] };

const KEY = "upsc-clay-question-bank-v1";
const empty: BankState = { questions: [], tests: [] };

let state: BankState = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load(): BankState {
  if (loaded || typeof window === "undefined") return state;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...empty, ...(JSON.parse(raw) as BankState) };
  } catch {
    /* ignore corrupted storage */
  }
  return state;
}

function commit(next: BankState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useQuestionBank(): BankState {
  return useSyncExternalStore(subscribe, () => load(), () => empty);
}

export function getBank(): BankState {
  return load();
}

export function getTest(id: string) {
  const s = load();
  const test = s.tests.find((t) => t.id === id);
  if (!test) return null;
  const byId = new Map(s.questions.map((q) => [q.id, q]));
  const questions = test.questionIds.map((qid) => byId.get(qid)).filter(Boolean) as BankQuestion[];
  return { test, questions };
}

export function saveGeneratedTest(input: {
  name: string;
  durationMinutes: number;
  config: AiTestConfig;
  questions: GeneratedQuestion[];
  source: string;
}): AiTest {
  const s = load();
  const stamp = Date.now();
  const stored: BankQuestion[] = input.questions.map((q, i) => ({
    ...q,
    id: `q-${stamp}-${i}`,
    source: input.source,
    aiGenerated: true,
    createdAt: new Date().toISOString(),
    attempts: 0,
    correctAttempts: 0,
  }));
  const test: AiTest = {
    id: `ai-${stamp}`,
    name: input.name,
    createdAt: new Date().toISOString(),
    durationMinutes: input.durationMinutes,
    config: input.config,
    questionIds: stored.map((q) => q.id),
  };
  commit({
    questions: [...stored, ...s.questions].slice(0, 2000),
    tests: [test, ...s.tests].slice(0, 100),
  });
  return test;
}

export function recordAttempts(entries: { id: string; correct: boolean }[]) {
  const s = load();
  const map = new Map(entries.map((e) => [e.id, e.correct]));
  commit({
    ...s,
    questions: s.questions.map((q) =>
      map.has(q.id)
        ? { ...q, attempts: q.attempts + 1, correctAttempts: q.correctAttempts + (map.get(q.id) ? 1 : 0) }
        : q,
    ),
  });
}

export function deleteQuestion(id: string) {
  const s = load();
  commit({
    questions: s.questions.filter((q) => q.id !== id),
    tests: s.tests.map((t) => ({ ...t, questionIds: t.questionIds.filter((q) => q !== id) })),
  });
}

export function clearBank() {
  commit(empty);
}

/** Existing question stems, used to stop the model repeating itself. */
export function existingStems(limit = 60) {
  return load().questions.slice(0, limit).map((q) => q.question);
}
