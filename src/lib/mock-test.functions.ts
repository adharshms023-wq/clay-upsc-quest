import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const buildInput = z.object({
  count: z.number().int().min(1).max(100),
  subjects: z.array(z.string()).default([]),
  topicIds: z.array(z.string()).default([]),
  difficulty: z.string().default("UPSC Standard"),
  types: z.array(z.string()).default([]),
  language: z.string().default("English"),
  exam: z.string().nullable().default(null),
});

/**
 * Student mock-test builder. Reads only from the question bank in the database —
 * no AI is involved on this path.
 */
export const buildMockTest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => buildInput.parse(input))
  .handler(async ({ data }) => {
    const { fetchMockTestQuestions } = await import("./mock-test-bank.server");
    return fetchMockTestQuestions(data);
  });