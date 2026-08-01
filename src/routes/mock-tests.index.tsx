import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Clock, ListChecks, Play, Trophy } from "lucide-react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayLinkButton } from "@/components/clay/ClayButton";
import { useStudy } from "@/context/StudyContext";
import { mockTests } from "@/data/mockTests";

export const Route = createFileRoute("/mock-tests/")({
  head: () => ({
    meta: [
      { title: "UPSC Mock Tests — Exam-Style Practice | UPSC Clay" },
      {
        name: "description",
        content:
          "Attempt distraction-free, timed UPSC mock tests with a question palette, mark-for-review and a detailed post-test analytics dashboard.",
      },
      { property: "og:title", content: "UPSC Mock Tests with Analytics" },
      {
        property: "og:description",
        content: "Timed, exam-style tests with subject-wise analysis and weak-area detection.",
      },
    ],
  }),
  component: MockTestsPage,
});

function MockTestsPage() {
  const { results, hydrated } = useStudy();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-6">
      <h1 className="text-balance-tight text-3xl font-extrabold md:text-4xl">Mock Tests</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Sit down, close everything else, and give it the full time. The analytics afterwards are
        only as honest as the attempt.
      </p>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {mockTests.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <ClayCard className="flex h-full flex-col">
              <h2 className="text-lg font-bold">{t.name}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="clay-inset inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
                  <Clock className="size-3.5" aria-hidden="true" /> {t.durationMinutes} min
                </span>
                <span className="clay-inset inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
                  <ListChecks className="size-3.5" aria-hidden="true" /> {t.questions.length} questions
                </span>
              </div>
              <Link
                to="/mock-tests/$testId"
                params={{ testId: t.id }}
                className="clay-sm clay-press mt-5 inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-6 text-sm font-semibold text-primary-foreground"
              >
                <Play className="size-4" aria-hidden="true" /> Start test
              </Link>
            </ClayCard>
          </motion.div>
        ))}
      </div>

      <section aria-labelledby="attempts" className="mt-12">
        <h2 id="attempts" className="text-xl font-bold">
          Past attempts
        </h2>
        {hydrated && results.length > 0 ? (
          <div className="mt-4 space-y-3">
            {results.map((r) => (
              <ClayCard key={r.id} size="sm">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{r.testName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.takenAt).toLocaleString()} · {r.correct}/{r.total} correct
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold tabular-nums">
                      {Math.round((r.correct / r.total) * 100)}%
                    </span>
                    <Link
                      to="/mock-tests/$testId"
                      params={{ testId: r.testId }}
                      className="clay-sm clay-press bg-card px-4 py-2 text-xs font-semibold"
                    >
                      Retake
                    </Link>
                  </div>
                </div>
              </ClayCard>
            ))}
          </div>
        ) : (
          <ClayCard size="lg" className="mt-4 text-center">
            <Trophy className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-bold">No attempts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your scores, accuracy and weak areas will appear here after your first test.
            </p>
          </ClayCard>
        )}
      </section>
    </div>
  );
}