import { createFileRoute } from "@tanstack/react-router";

/**
 * Scheduled entry point for the current-affairs pipeline (run every 6 hours).
 * Collection always runs; AI classification/generation is best-effort so the
 * article store keeps filling even when AI quota is unavailable.
 */
export const Route = createFileRoute("/api/public/cron-current-affairs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CRON_SECRET"];
        const provided = request.headers.get("x-cron-secret");
        if (!secret || provided !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { runIngestion } = await import("@/lib/current-affairs.server");
        const { runClassification, runQuestionGeneration } = await import(
          "@/lib/current-affairs-pipeline.server"
        );

        const ingestion = await runIngestion();

        let classification: unknown = null;
        let generation: unknown = null;
        try {
          classification = await runClassification(20);
          generation = await runQuestionGeneration(3);
        } catch (cause) {
          classification = { error: cause instanceof Error ? cause.message : "AI step failed" };
        }

        return Response.json({ ingestion, classification, generation });
      },
    },
  },
});