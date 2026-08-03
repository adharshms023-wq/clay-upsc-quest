import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generatedQuestionSchema } from "./test-generation.server";

const generateInput = z.object({
  topicIds: z.array(z.string()).default([]),
  count: z.number().int().min(1).max(100),
  difficulty: z.enum(["Easy", "Medium", "Hard", "UPSC Standard"]),
  types: z.array(z.string()).min(1),
  mode: z.enum(["static", "current-affairs", "mixed"]),
  avoid: z.array(z.string()).default([]),
});

/** ADMIN ONLY: draft new questions with AI. Nothing is stored until they are saved. */
export const adminGenerateQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => generateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin-questions.server");
    await assertAdmin(context.supabase, context.userId);

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");

    const { generateQuestions } = await import("./test-generation-run.server");
    return generateQuestions(apiKey, data);
  });

const saveInput = z.object({
  questions: z.array(
    generatedQuestionSchema.extend({
      language: z.string().optional(),
      exam: z.string().optional(),
      year: z.number().int().nullable().optional(),
      marks: z.number().optional(),
      negativeMarks: z.number().optional(),
      subtopic: z.string().optional(),
      source: z.string().optional(),
      status: z.enum(["draft", "approved", "rejected"]).optional(),
    }),
  ),
});

/** ADMIN ONLY: persist reviewed questions into the permanent question bank. */
export const adminSaveQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveInput.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, saveQuestionsToBank } = await import("./admin-questions.server");
    await assertAdmin(context.supabase, context.userId);
    return saveQuestionsToBank(context.supabase, context.userId, data.questions);
  });

const listInput = z.object({
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(25),
  subject: z.string().optional(),
  status: z.string().optional(),
});

/** ADMIN ONLY: paginated question-bank listing. Never loads the whole bank. */
export const adminListQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listInput.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin-questions.server");
    await assertAdmin(context.supabase, context.userId);

    const from = data.page * data.pageSize;
    let query = context.supabase
      .from("questions")
      .select("id, question, subject, topic, difficulty, question_type, status, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, from + data.pageSize - 1);
    if (data.subject) query = query.eq("subject", data.subject);
    if (data.status) query = query.eq("status", data.status);

    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], total: count ?? 0 };
  });

/** ADMIN ONLY: update the review status of a stored question. */
export const adminSetQuestionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["draft", "approved", "rejected"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin-questions.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("questions")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });