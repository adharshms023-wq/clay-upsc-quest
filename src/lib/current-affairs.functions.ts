import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdminContext(context: { supabase: unknown; userId: string }) {
  const { assertAdmin } = await import("./admin-questions.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await assertAdmin(context.supabase as any, context.userId);
}

/** Drops undefined keys so partial updates satisfy exactOptionalPropertyTypes. */
function compact<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)) as {
    [K in keyof T]: Exclude<T[K], undefined>;
  };
}

/** ADMIN: poll every active RSS source and store new articles. */
export const caRunIngestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminContext(context);
    const { runIngestion } = await import("./current-affairs.server");
    return runIngestion();
  });

/** ADMIN: classify fetched articles against the UPSC syllabus. */
export const caRunClassification = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ limit: z.number().int().min(1).max(40).default(20) }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdminContext(context);
    const { runClassification } = await import("./current-affairs-pipeline.server");
    return runClassification(data.limit);
  });

/** ADMIN: draft questions for the most relevant classified articles. */
export const caGenerateQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ maxArticles: z.number().int().min(1).max(10).default(3) }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdminContext(context);
    const { runQuestionGeneration } = await import("./current-affairs-pipeline.server");
    return runQuestionGeneration(data.maxArticles);
  });

/** ADMIN: pipeline counters for the dashboard. */
export const caStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminContext(context);
    const { pipelineStats } = await import("./current-affairs-pipeline.server");
    return pipelineStats();
  });

/** ADMIN: paginated article list, filtered by pipeline status. */
export const caListArticles = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        status: z.string().optional(),
        page: z.number().int().min(0).default(0),
        pageSize: z.number().int().min(1).max(50).default(20),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdminContext(context);
    const from = data.page * data.pageSize;
    let query = context.supabase
      .from("current_affairs")
      .select(
        "id, title, summary, source, source_url, published_at, category, subject, topic, subtopic, upsc_relevance, status, question_count, last_error",
        { count: "exact" },
      )
      .order("published_at", { ascending: false })
      .range(from, from + data.pageSize - 1);
    if (data.status) query = query.eq("status", data.status);
    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], total: count ?? 0 };
  });

/** ADMIN: edit an article's editorial fields or move it through the pipeline. */
export const caUpdateArticle = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().min(3).optional(),
        summary: z.string().optional(),
        subject: z.string().optional(),
        topic: z.string().optional(),
        subtopic: z.string().optional(),
        upscRelevance: z.number().int().min(0).max(100).optional(),
        status: z
          .enum(["fetched", "classified", "question_generated", "pending_review", "approved", "rejected", "pending_ai"])
          .optional(),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdminContext(context);
    const { id, upscRelevance, ...rest } = data;
    const { error } = await context.supabase
      .from("current_affairs")
      .update(compact({
        ...rest,
        ...(upscRelevance === undefined ? {} : { upsc_relevance: upscRelevance }),
      }))
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** ADMIN: delete an article (duplicates and noise). */
export const caDeleteArticle = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdminContext(context);
    const { error } = await context.supabase.from("current_affairs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** ADMIN: the current-affairs question review queue. */
export const caListPendingQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(100).default(30) }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdminContext(context);
    const { data: rows, error } = await context.supabase
      .from("questions")
      .select(
        "id, question, options, correct_answer, explanation, subject, topic, difficulty, question_type, status, source_url, created_at",
      )
      .eq("source_type", "Current Affairs")
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

/** ADMIN: edit and/or approve-reject a drafted current-affairs question. */
export const caReviewQuestion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        question: z.string().min(5).optional(),
        options: z.array(z.string()).length(4).optional(),
        correctAnswer: z.number().int().min(0).max(3).optional(),
        explanation: z.string().optional(),
        difficulty: z.string().optional(),
        status: z.enum(["draft", "approved", "rejected"]).optional(),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdminContext(context);
    const { id, correctAnswer, ...rest } = data;
    const { error } = await context.supabase
      .from("questions")
      .update(compact({
        ...rest,
        ...(correctAnswer === undefined ? {} : { correct_answer: correctAnswer }),
      }))
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** ADMIN: source configuration list. */
export const caListSources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminContext(context);
    const { data, error } = await context.supabase
      .from("ca_sources")
      .select("*")
      .order("source_name");
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

/** ADMIN: add a new feed source without any code change. */
export const caAddSource = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        sourceName: z.string().min(2),
        sourceUrl: z.string().url().or(z.literal("")).default(""),
        feedUrl: z.string().url(),
        category: z.string().default("General"),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdminContext(context);
    const { error } = await context.supabase.from("ca_sources").insert({
      source_name: data.sourceName,
      source_url: data.sourceUrl,
      feed_url: data.feedUrl,
      category: data.category,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** ADMIN: toggle a source on/off. */
export const caToggleSource = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdminContext(context);
    const { error } = await context.supabase
      .from("ca_sources")
      .update({ active: data.active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });