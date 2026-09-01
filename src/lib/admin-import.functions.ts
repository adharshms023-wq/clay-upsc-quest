import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { importRowSchema } from "./question-import";

const chunkInput = z.object({
  questions: z.array(importRowSchema).min(1).max(200),
});

/** ADMIN ONLY: insert a chunk of manually imported questions into the existing bank. */
export const adminImportQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => chunkInput.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin-questions.server");
    await assertAdmin(context.supabase, context.userId);

    const rows = data.questions.map((q) => ({ ...q, created_by: context.userId }));

    const { data: inserted, error } = await context.supabase
      .from("questions")
      .upsert(rows, { onConflict: "question_key", ignoreDuplicates: true })
      .select("id");

    if (error) {
      // Fall back to row-by-row so one bad row does not fail the whole chunk.
      let imported = 0;
      const failures: { question: string; reason: string }[] = [];
      for (const row of rows) {
        const { data: one, error: rowError } = await context.supabase
          .from("questions")
          .upsert([row], { onConflict: "question_key", ignoreDuplicates: true })
          .select("id");
        if (rowError) failures.push({ question: row.question.slice(0, 120), reason: rowError.message });
        else imported += one?.length ?? 0;
      }
      const duplicates = rows.length - imported - failures.length;
      return { imported, duplicates, failures };
    }

    const imported = inserted?.length ?? 0;
    return { imported, duplicates: rows.length - imported, failures: [] as { question: string; reason: string }[] };
  });
