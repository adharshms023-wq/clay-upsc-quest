import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const generateInput = z.object({
  topicIds: z.array(z.string()).default([]),
  count: z.union([z.literal(10), z.literal(25), z.literal(50), z.literal(100)]),
  difficulty: z.enum(["Easy", "Medium", "Hard", "UPSC Standard"]),
  types: z.array(z.string()).min(1),
  mode: z.enum(["static", "current-affairs", "mixed"]),
  avoid: z.array(z.string()).default([]),
});

export const generateMockTest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => generateInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");

    const { generateQuestions } = await import("./test-generation-run.server");
    return generateQuestions(apiKey, data);
  });

export const recommendStudyPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        score: z.number(),
        total: z.number(),
        accuracy: z.number(),
        weak: z.array(z.object({ topic: z.string(), correct: z.number(), total: z.number() })),
        strong: z.array(z.string()),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");

    const { buildRecommendations } = await import("./test-generation-run.server");
    return buildRecommendations(apiKey, data);
  });
