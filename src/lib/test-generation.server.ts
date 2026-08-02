import { z } from "zod";
import { allTopics, type FlatTopic } from "@/data/upscSyllabus";

export const QUESTION_TYPES = [
  "MCQ",
  "Assertion & Reason",
  "Match the Following",
  "Statement Based",
  "Chronology",
  "Map Based",
] as const;

export const generatedQuestionSchema = z.object({
  type: z.string(),
  question: z.string(),
  options: z.array(z.string()).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
  topicId: z.string(),
  topic: z.string(),
  subject: z.string(),
  difficulty: z.string(),
  solvingSeconds: z.number().int().min(15).max(600),
  tags: z.array(z.string()),
});

export const generationBatchSchema = z.object({
  questions: z.array(generatedQuestionSchema),
});

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;

export function resolveTopics(topicIds: string[]): FlatTopic[] {
  const picked = allTopics.filter((t) => topicIds.includes(t.id));
  return picked.length ? picked : allTopics;
}

export function buildSystemPrompt() {
  return [
    "You are a senior UPSC Civil Services question setter with 15 years of experience writing Prelims papers for the Union Public Service Commission.",
    "You write questions that match the actual UPSC style: conceptual, multi-layered, often statement-based, never trivial factual recall.",
    "Rules you never break:",
    "- Exactly four options per question, exactly one unambiguously correct answer.",
    "- Distractors must be plausible to a well-prepared aspirant.",
    "- Explanations must state why the answer is correct AND why key distractors are wrong, in 2-4 sentences.",
    "- Statement-based questions present numbered statements inside the question text and ask how many/which are correct.",
    "- Assertion & Reason questions use the standard four UPSC options about A, R and whether R explains A.",
    "- Match the Following questions list two columns inside the question text and options give pairings.",
    "- Chronology questions ask for correct temporal order.",
    "- Map based questions reference locations, rivers, ranges, straits or protected areas.",
    "- Never repeat a question stem you were told to avoid, and never repeat within the same batch.",
    "- Return strictly valid data matching the requested schema.",
  ].join("\n");
}

export function buildUserPrompt(input: {
  topics: FlatTopic[];
  count: number;
  difficulty: string;
  types: string[];
  mode: "static" | "current-affairs" | "mixed";
  currentAffairsShare: number;
  avoid: string[];
  seed: string;
}) {
  const { topics, count, difficulty, types, mode, currentAffairsShare, avoid, seed } = input;
  const topicLines = topics
    .map((t) => `- [${t.id}] ${t.subject} > ${t.module} > ${t.name}: ${t.description} (keywords: ${t.keywords.join(", ")})`)
    .join("\n");

  const modeLine =
    mode === "static"
      ? "Use only static syllabus content. Do not depend on news from a specific month."
      : mode === "current-affairs"
        ? "Every question must be rooted in contemporary current affairs of the last 18 months, linked back to the static syllabus topic."
        : `Approximately ${Math.round(currentAffairsShare * 100)}% of questions must be current-affairs based (last 18 months) and the rest purely static.`;

  return [
    `Generate exactly ${count} UPSC-standard questions.`,
    `Difficulty target: ${difficulty}. "UPSC Standard" means the real difficulty spread of a Prelims paper.`,
    `Allowed question types (distribute them reasonably): ${types.join(", ")}.`,
    modeLine,
    "",
    "Draw questions ONLY from these syllabus topics. Set topicId to the bracketed id, and topic/subject to the matching names:",
    topicLines,
    "",
    avoid.length
      ? `Do NOT generate any question similar to these already-asked stems:\n${avoid.slice(0, 60).map((a) => `- ${a}`).join("\n")}`
      : "",
    `Variation seed: ${seed}. Use it to make this batch different from any previous batch.`,
    "Set solvingSeconds to a realistic per-question solving time and tags to 2-4 short lowercase keywords.",
  ]
    .filter(Boolean)
    .join("\n");
}
