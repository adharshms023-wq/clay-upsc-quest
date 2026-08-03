import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { GeneratedQuestion } from "./test-generation.server";

export type BankFilters = {
  count: number;
  subjects: string[];
  topicIds: string[];
  difficulty: string;
  types: string[];
  language: string;
  exam: string | null;
};

type QuestionRow = Database["public"]["Tables"]["questions"]["Row"];

/** Publishable-key client for public, read-only question-bank access. */
export function createPublicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Question bank is not configured.");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/** Difficulty ladders used when the exact difficulty has too few questions. */
const LADDER: Record<string, string[]> = {
  Easy: ["Easy", "Medium", "UPSC Standard", "Hard"],
  Medium: ["Medium", "UPSC Standard", "Easy", "Hard"],
  Hard: ["Hard", "UPSC Standard", "Medium", "Easy"],
  "UPSC Standard": ["UPSC Standard", "Hard", "Medium", "Easy"],
};

export async function fetchMockTestQuestions(filters: BankFilters) {
  const supabase = createPublicClient();
  const ladder = LADDER[filters.difficulty] ?? [filters.difficulty];

  const collected: QuestionRow[] = [];
  const seen = new Set<string>();
  let expanded = false;

  // Widen the difficulty window step by step until the paper is full.
  for (let depth = 1; depth <= ladder.length; depth++) {
    const remaining = filters.count - collected.length;
    if (remaining <= 0) break;

    const { data, error } = await supabase.rpc("pick_random_questions", {
      _limit: remaining,
      _subjects: filters.subjects.length ? filters.subjects : undefined,
      _topic_ids: filters.topicIds.length ? filters.topicIds : undefined,
      _difficulties: ladder.slice(0, depth),
      _types: filters.types.length ? filters.types : undefined,
      _language: filters.language || null,
      _exam: filters.exam ?? undefined,
      _exclude: collected.length ? collected.map((q) => q.id) : undefined,
    });
    if (error) throw new Error(error.message);

    for (const row of (data ?? []) as QuestionRow[]) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      collected.push(row);
    }
    if (depth > 1 && collected.length) expanded = true;
  }

  const { data: available } = await supabase.rpc("count_matching_questions", {
    _subjects: filters.subjects.length ? filters.subjects : undefined,
    _topic_ids: filters.topicIds.length ? filters.topicIds : undefined,
    _difficulties: [filters.difficulty],
    _types: filters.types.length ? filters.types : undefined,
    _language: filters.language || null,
    _exam: filters.exam ?? undefined,
  });

  const questions = shuffle(collected).map(toGenerated).map(shuffleOptions);

  return {
    questions,
    requested: filters.count,
    available: typeof available === "number" ? available : collected.length,
    expandedDifficulty: expanded,
  };
}

function toGenerated(row: QuestionRow): GeneratedQuestion & { id: string } {
  const options = Array.isArray(row.options) ? (row.options as unknown[]).map(String) : [];
  return {
    id: row.id,
    type: row.question_type,
    question: row.question,
    options,
    answerIndex: Math.max(0, Math.min(options.length - 1, row.correct_answer)),
    explanation: row.explanation,
    topicId: row.topic_id,
    topic: row.topic,
    subject: row.subject,
    difficulty: row.difficulty,
    solvingSeconds: row.solving_seconds,
    tags: row.tags ?? [],
  };
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

/** Options are shuffled while keeping the correct answer pointed at the same text. */
function shuffleOptions<T extends GeneratedQuestion>(q: T): T {
  if (q.type === "Assertion & Reason") return q;
  const correct = q.options[q.answerIndex];
  const options = shuffle(q.options);
  return { ...q, options, answerIndex: Math.max(0, options.indexOf(correct as string)) };
}