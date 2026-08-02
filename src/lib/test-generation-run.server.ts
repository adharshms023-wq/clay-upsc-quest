import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import {
  buildSystemPrompt,
  buildUserPrompt,
  generationBatchSchema,
  resolveTopics,
  type GeneratedQuestion,
} from "./test-generation.server";

const MODEL = "google/gemini-3.6-flash";
const BATCH_SIZE = 25;

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

export async function generateQuestions(
  apiKey: string,
  data: {
    topicIds: string[];
    count: number;
    difficulty: string;
    types: string[];
    mode: "static" | "current-affairs" | "mixed";
    avoid: string[];
  },
) {
  const gateway = createLovableAiGatewayProvider(apiKey);
  const topics = resolveTopics(data.topicIds);
  const batches: number[] = [];
  let left = data.count;
  while (left > 0) {
    batches.push(Math.min(BATCH_SIZE, left));
    left -= BATCH_SIZE;
  }

  const results = await Promise.all(
    batches.map(async (size, index) => {
      const { object } = await generateObject({
        model: gateway(MODEL),
        schema: generationBatchSchema,
        system: buildSystemPrompt(),
        prompt: buildUserPrompt({
          topics,
          count: size,
          difficulty: data.difficulty,
          types: data.types,
          mode: data.mode,
          currentAffairsShare: 0.3,
          avoid: data.avoid,
          seed: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
        }),
      });
      return object.questions;
    }),
  );

  const seen = new Set(data.avoid.map(normalise));
  const deduped: GeneratedQuestion[] = [];
  for (const q of results.flat()) {
    const key = normalise(q.question);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(q);
  }

  // Shuffle question order and answer options so repeat attempts differ.
  const shuffled = shuffle(deduped).slice(0, data.count).map(shuffleOptions);
  return { questions: shuffled };
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

/** Option shuffling is skipped for types whose options are positional. */
function shuffleOptions(q: GeneratedQuestion): GeneratedQuestion {
  if (q.type === "Assertion & Reason") return q;
  const correct = q.options[q.answerIndex];
  const options = shuffle(q.options);
  return { ...q, options, answerIndex: Math.max(0, options.indexOf(correct as string)) };
}

const recommendationSchema = z.object({
  summary: z.string(),
  reviseTopics: z.array(z.string()).max(6),
  suggestedTests: z.array(z.string()).max(4),
  studyPlan: z.array(z.object({ day: z.string(), focus: z.string(), action: z.string() })).max(7),
});

export async function buildRecommendations(
  apiKey: string,
  data: {
    score: number;
    total: number;
    accuracy: number;
    weak: { topic: string; correct: number; total: number }[];
    strong: string[];
  },
) {
  const gateway = createLovableAiGatewayProvider(apiKey);
  const { object } = await generateObject({
    model: gateway(MODEL),
    schema: recommendationSchema,
    system:
      "You are a UPSC mentor who has guided hundreds of selected candidates. You give specific, actionable, encouraging but honest feedback. Never generic filler.",
    prompt: [
      `A student scored ${data.score} out of ${data.total} with ${data.accuracy}% accuracy.`,
      `Weak areas: ${data.weak.map((w) => `${w.topic} (${w.correct}/${w.total})`).join(", ") || "none"}.`,
      `Strong areas: ${data.strong.join(", ") || "none"}.`,
      "Write a 2-sentence summary, list the topics to revise first, suggest the next mock tests to attempt, and give a 5-7 day study plan with a focus and a concrete action per day.",
    ].join("\n"),
  });
  return object;
}
