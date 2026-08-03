import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Question generation for students is DB-driven (see mock-test.functions.ts).
// AI generation lives in admin-questions.functions.ts and is admin-only.
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
