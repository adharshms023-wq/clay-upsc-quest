import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { allTopics } from "@/data/upscSyllabus";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const MODEL = "google/gemini-3.6-flash";

export const CA_SUBJECTS = [
  "Indian Polity",
  "Governance",
  "Economy",
  "Environment & Ecology",
  "Geography",
  "History",
  "Art & Culture",
  "Science & Technology",
  "International Relations",
  "Agriculture",
  "Society",
  "Internal Security",
  "Government Schemes",
  "Miscellaneous",
] as const;

export const RELEVANCE_THRESHOLD = 60;

const classificationSchema = z.object({
  items: z.array(
    z.object({
      index: z.number().int(),
      subject: z.string(),
      topic: z.string(),
      subtopic: z.string(),
      topicId: z.string(),
      relevance: z.number().int().min(0).max(100),
      tags: z.array(z.string()).max(6),
      summary: z.string(),
    }),
  ),
});

const topicCatalogue = allTopics
  .map((t) => `[${t.id}] ${t.subject} > ${t.module} > ${t.name}`)
  .join("\n");

type ArticleRow = {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  source_url: string;
  published_at: string;
  subject: string;
  topic: string;
  subtopic: string;
  upsc_relevance: number;
  tags: string[];
};

/** Classifies a batch of fetched articles against the UPSC syllabus in one AI call. */
export async function classifyArticles(apiKey: string, articles: ArticleRow[]) {
  if (!articles.length) return { classified: 0, relevant: 0 };
  const gateway = createLovableAiGatewayProvider(apiKey);

  const { object } = await generateObject({
    model: gateway(MODEL),
    schema: classificationSchema,
    system: [
      "You are a UPSC Civil Services faculty member who triages daily news for Prelims relevance.",
      "You judge strictly: routine appointments, sports scores, local crime and PR fluff score below 40.",
      "Scheme launches, policy, indices, treaties, institutions, environment reports, space/defence tech and economy data score 70-95.",
      "Never invent facts. Base every judgement only on the supplied title and extract.",
    ].join("\n"),
    prompt: [
      `Classify each article. Allowed subjects: ${CA_SUBJECTS.join(", ")}.`,
      "Choose the closest topicId from this syllabus catalogue (use \"\" if nothing fits):",
      topicCatalogue,
      "",
      "Write summary as a neutral 2-sentence factual brief in your own words (never copy the extract verbatim).",
      "Articles:",
      ...articles.map(
        (a, i) => `#${i} | ${a.source} | ${a.title}\n${a.summary || a.content}`.slice(0, 1200),
      ),
    ].join("\n"),
  });

  let relevant = 0;
  for (const item of object.items) {
    const article = articles[item.index];
    if (!article) continue;
    if (item.relevance >= RELEVANCE_THRESHOLD) relevant++;
    await supabaseAdmin
      .from("current_affairs")
      .update({
        subject: item.subject,
        topic: item.topic,
        subtopic: item.subtopic,
        upsc_relevance: item.relevance,
        tags: item.tags,
        summary: item.summary || article.summary,
        status: "classified",
        last_error: null,
      })
      .eq("id", article.id);
  }

  return { classified: object.items.length, relevant };
}

const questionSchema = z.object({
  questions: z.array(
    z.object({
      type: z.string(),
      question: z.string(),
      options: z.array(z.string()).length(4),
      answerIndex: z.number().int().min(0).max(3),
      explanation: z.string(),
      difficulty: z.enum(["Hard", "Very Hard"]),
      tags: z.array(z.string()).max(5),
      solvingSeconds: z.number().int().min(30).max(300),
    }),
  ),
});

export type DraftCaQuestion = z.infer<typeof questionSchema>["questions"][number];

/** Drafts 2-5 analytical Prelims questions from one classified article. */
export async function generateQuestionsForArticle(
  apiKey: string,
  article: ArticleRow,
  avoid: string[],
) {
  const gateway = createLovableAiGatewayProvider(apiKey);
  const { object } = await generateObject({
    model: gateway(MODEL),
    schema: questionSchema,
    system: [
      "You are a senior UPSC Prelims question setter converting current affairs into exam-grade questions.",
      "Every question must fuse the news item with the underlying static syllabus concept.",
      "Use these formats only: multiple-statement ('How many of the above statements are correct?'), Statement 1 / Statement 2, match-the-following, conceptual application, elimination-based.",
      "Never write a trivial factual question whose answer is lifted straight from the article.",
      "Never invent facts, numbers, dates or citations. If a fact is not in the extract, do not use it.",
      "Explanations must: state why the correct option is correct, why each wrong option is wrong, and explain the static concept behind it. Separate verified fact from inference.",
      "Exactly four options, exactly one unambiguously correct answer.",
    ].join("\n"),
    prompt: [
      `Source: ${article.source} (${article.source_url})`,
      `Published: ${article.published_at}`,
      `Syllabus placement: ${article.subject} > ${article.topic} > ${article.subtopic}`,
      `Title: ${article.title}`,
      `Extract: ${(article.content || article.summary).slice(0, 3000)}`,
      "",
      "Generate between 2 and 5 questions. Difficulty must be Hard or Very Hard.",
      avoid.length
        ? `Do NOT produce anything similar to these existing question stems:\n${avoid.slice(0, 40).map((a) => `- ${a}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return object.questions.slice(0, 5);
}

const normalise = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

/** Word-overlap similarity — cheap near-duplicate screen before saving. */
export function similarity(a: string, b: string) {
  const left = new Set(normalise(a).split(" ").filter((w) => w.length > 3));
  const right = new Set(normalise(b).split(" ").filter((w) => w.length > 3));
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const word of left) if (right.has(word)) shared++;
  return shared / Math.min(left.size, right.size);
}