import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  RELEVANCE_THRESHOLD,
  classifyArticles,
  generateQuestionsForArticle,
  similarity,
} from "./current-affairs-ai.server";

const ARTICLE_FIELDS =
  "id, title, summary, content, source, source_url, published_at, subject, topic, subtopic, upsc_relevance, tags";

function requireApiKey() {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project.");
  return apiKey;
}

/**
 * Classifies pending articles. AI failures leave the article intact and marked
 * pending_ai so it can be retried later — nothing is ever lost.
 */
export async function runClassification(limit = 20) {
  const { data, error } = await supabaseAdmin
    .from("current_affairs")
    .select(ARTICLE_FIELDS)
    .in("status", ["fetched", "pending_ai"])
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  const articles = data ?? [];
  if (!articles.length) return { classified: 0, relevant: 0 };

  try {
    const apiKey = requireApiKey();
    return await classifyArticles(apiKey, articles);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "AI unavailable";
    await supabaseAdmin
      .from("current_affairs")
      .update({ status: "pending_ai", last_error: message })
      .in(
        "id",
        articles.map((a) => a.id),
      );
    return { classified: 0, relevant: 0, error: message };
  }
}

const normaliseKey = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 180);

/** Generates review-queue questions for the most relevant classified articles. */
export async function runQuestionGeneration(maxArticles = 3) {
  const { data, error } = await supabaseAdmin
    .from("current_affairs")
    .select(ARTICLE_FIELDS)
    .eq("status", "classified")
    .gte("upsc_relevance", RELEVANCE_THRESHOLD)
    .order("upsc_relevance", { ascending: false })
    .limit(maxArticles);
  if (error) throw new Error(error.message);

  const articles = data ?? [];
  let created = 0;
  let duplicates = 0;
  const failures: string[] = [];

  // Recent current-affairs stems, used to block near-duplicate concepts.
  const { data: recent } = await supabaseAdmin
    .from("questions")
    .select("question")
    .eq("source_type", "Current Affairs")
    .order("created_at", { ascending: false })
    .limit(200);
  const existing = (recent ?? []).map((r) => r.question);

  for (const article of articles) {
    try {
      const apiKey = requireApiKey();
      const drafts = await generateQuestionsForArticle(apiKey, article, existing.slice(0, 40));

      const rows = [];
      for (const draft of drafts) {
        if (existing.some((q) => similarity(q, draft.question) >= 0.72)) {
          duplicates++;
          continue;
        }
        existing.unshift(draft.question);
        rows.push({
          question: draft.question,
          options: draft.options,
          correct_answer: draft.answerIndex,
          explanation: draft.explanation,
          subject: article.subject || "Miscellaneous",
          topic: article.topic || "",
          subtopic: article.subtopic || "",
          topic_id: "",
          difficulty: draft.difficulty === "Very Hard" ? "Hard" : draft.difficulty,
          language: "English",
          exam: "UPSC Prelims",
          year: new Date(article.published_at).getUTCFullYear(),
          marks: 2,
          negative_marks: 0.66,
          question_type: draft.type || "MCQ",
          question_source: "Current Affairs",
          source_type: "Current Affairs",
          current_affair_id: article.id,
          source_url: article.source_url,
          status: "draft",
          tags: draft.tags,
          solving_seconds: draft.solvingSeconds,
          question_key: normaliseKey(draft.question),
        });
      }

      if (rows.length) {
        const { data: saved, error: saveError } = await supabaseAdmin
          .from("questions")
          .upsert(rows, { onConflict: "question_key", ignoreDuplicates: true })
          .select("id");
        if (saveError) throw new Error(saveError.message);
        created += saved?.length ?? 0;
        duplicates += rows.length - (saved?.length ?? 0);
      }

      await supabaseAdmin
        .from("current_affairs")
        .update({
          status: rows.length ? "pending_review" : "question_generated",
          question_count: rows.length,
          last_error: null,
        })
        .eq("id", article.id);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "AI unavailable";
      failures.push(`${article.title}: ${message}`);
      await supabaseAdmin
        .from("current_affairs")
        .update({ status: "pending_ai", last_error: message })
        .eq("id", article.id);
    }
  }

  return { articles: articles.length, created, duplicates, failures };
}

export async function pipelineStats() {
  const { data, error } = await supabaseAdmin.rpc("current_affairs_pipeline_stats");
  if (error) throw new Error(error.message);
  const byStatus = Object.fromEntries(
    ((data ?? []) as { status: string; total: number }[]).map((r) => [r.status, r.total]),
  );
  const { count: pendingQuestions } = await supabaseAdmin
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("source_type", "Current Affairs")
    .eq("status", "draft");
  const { count: approvedQuestions } = await supabaseAdmin
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("source_type", "Current Affairs")
    .eq("status", "approved");
  return {
    byStatus,
    pendingQuestions: pendingQuestions ?? 0,
    approvedQuestions: approvedQuestions ?? 0,
  };
}