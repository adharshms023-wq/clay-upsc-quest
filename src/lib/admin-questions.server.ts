import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { GeneratedQuestion } from "./test-generation.server";

type Client = SupabaseClient<Database>;

export async function assertAdmin(supabase: Client, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required.");
}

export type SaveQuestionInput = GeneratedQuestion & {
  language?: string | undefined;
  exam?: string | undefined;
  year?: number | null | undefined;
  marks?: number | undefined;
  negativeMarks?: number | undefined;
  subtopic?: string | undefined;
  source?: string | undefined;
  status?: string | undefined;
};

export async function saveQuestionsToBank(
  supabase: Client,
  userId: string,
  questions: SaveQuestionInput[],
) {
  const rows = questions.map((q) => ({
    question: q.question,
    options: q.options,
    correct_answer: q.answerIndex,
    explanation: q.explanation,
    subject: q.subject,
    topic: q.topic,
    subtopic: q.subtopic ?? "",
    topic_id: q.topicId,
    difficulty: q.difficulty,
    language: q.language ?? "English",
    exam: q.exam ?? "UPSC Prelims",
    year: q.year ?? null,
    marks: q.marks ?? 2,
    negative_marks: q.negativeMarks ?? 0.66,
    question_type: q.type,
    question_source: q.source ?? "AI",
    status: q.status ?? "approved",
    tags: q.tags,
    solving_seconds: q.solvingSeconds,
    created_by: userId,
  }));

  const { data, error } = await supabase
    .from("questions")
    .upsert(rows, { onConflict: "question_key", ignoreDuplicates: true })
    .select("id");
  if (error) throw new Error(error.message);

  return { saved: data?.length ?? 0, skipped: rows.length - (data?.length ?? 0) };
}