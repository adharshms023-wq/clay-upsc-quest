import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Flag,
  RotateCcw,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton, ClayLinkButton } from "@/components/clay/ClayButton";
import { ClayProgress } from "@/components/clay/ClayProgress";
import { useStudy, type TestResult } from "@/context/StudyContext";
import { mockTests } from "@/data/mockTests";
import { cn } from "@/lib/utils";
import { requestUserFeedback } from "@/lib/feedback";

export const Route = createFileRoute("/mock-tests/$testId")({
  head: () => ({
    meta: [
      { title: "Mock Test in Progress | UPSC Clay" },
      {
        name: "description",
        content:
          "A distraction-free UPSC mock test interface with countdown timer, question palette and mark-for-review.",
      },
      { property: "og:title", content: "UPSC Mock Test" },
      { property: "og:description", content: "Timed, exam-style UPSC practice test." },
    ],
  }),
  component: TestRunner,
});

function TestRunner() {
  const { testId } = useParams({ from: "/mock-tests/$testId" });
  const test = mockTests.find((t) => t.id === testId);
  const { addResult } = useStudy();

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [review, setReview] = useState<Record<string, boolean>>({});
  const [remaining, setRemaining] = useState((test?.durationMinutes ?? 20) * 60);
  const [result, setResult] = useState<TestResult | null>(null);

  const submit = useMemo(
    () => (auto = false) => {
      if (!test || result) return;
      const subjectMap = new Map<string, { correct: number; total: number }>();
      let correct = 0;
      let wrong = 0;
      let skipped = 0;
      test.questions.forEach((q) => {
        const a = answers[q.id];
        const bucket = subjectMap.get(q.subject) ?? { correct: 0, total: 0 };
        bucket.total += 1;
        if (a == null) skipped += 1;
        else if (a === q.answer) {
          correct += 1;
          bucket.correct += 1;
        } else wrong += 1;
        subjectMap.set(q.subject, bucket);
      });
      const r: TestResult = {
        id: `${test.id}-${Date.now()}`,
        testId: test.id,
        testName: test.name,
        takenAt: new Date().toISOString(),
        total: test.questions.length,
        correct,
        wrong,
        skipped,
        score: Number((correct * 2 - wrong * 0.66).toFixed(2)),
        timeTakenSeconds: test.durationMinutes * 60 - remaining,
        subjectStats: [...subjectMap].map(([subject, v]) => ({ subject, ...v })),
        answers,
      };
      setResult(r);
      addResult(r);
      toast.success(auto ? "Time up — test submitted" : "Test submitted");
      window.setTimeout(requestUserFeedback, 450);
    },
    [test, answers, remaining, result, addResult],
  );

  useEffect(() => {
    if (result || !test) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          submit(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [result, test, submit]);

  if (!test) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <ClayCard size="lg">
          <h1 className="text-xl font-bold">Test not found</h1>
          <ClayLinkButton to="/mock-tests" className="mt-5">
            Back to mock tests
          </ClayLinkButton>
        </ClayCard>
      </div>
    );
  }

  if (result) return <Analytics result={result} testId={test.id} />;

  const q = test.questions[current]!;
  const answered = Object.values(answers).filter((v) => v != null).length;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-2 pb-8">
      <ClayCard size="sm" className="sticky top-2 z-40 md:top-24">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{test.name}</p>
            <p className="text-xs text-muted-foreground">
              Question {current + 1} of {test.questions.length}
            </p>
          </div>
          <span
            className={cn(
              "clay-inset flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold tabular-nums",
              remaining < 60 && "text-destructive",
            )}
            aria-live="polite"
          >
            <Timer className="size-4" aria-hidden="true" />
            {mm}:{ss}
          </span>
        </div>
        <ClayProgress className="mt-3" value={((current + 1) / test.questions.length) * 100} />
      </ClayCard>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <ClayCard size="lg" className="mt-5">
            <span className="clay-sm inline-block rounded-full bg-secondary/50 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide">
              {q.subject}
            </span>
            <h1 className="mt-4 text-lg font-semibold leading-relaxed md:text-xl">{q.text}</h1>
            <fieldset className="mt-6 space-y-3">
              <legend className="sr-only">Answer options</legend>
              {q.options.map((opt, i) => {
                const selected = answers[q.id] === i;
                return (
                  <label
                    key={opt}
                    className={cn(
                      "clay-press flex cursor-pointer items-center gap-4 rounded-[20px] p-4 shadow-[var(--clay-shadow-sm)] transition-colors",
                      selected ? "bg-primary/25" : "bg-card",
                    )}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      className="sr-only"
                      checked={selected}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full transition-all duration-200",
                        selected ? "bg-primary" : "clay-inset",
                      )}
                    >
                      {selected && <span className="size-2.5 rounded-full bg-card" />}
                    </span>
                    <span className="text-sm leading-relaxed md:text-base">{opt}</span>
                  </label>
                );
              })}
            </fieldset>
          </ClayCard>
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex flex-wrap gap-3">
        <ClayButton
          variant="ghost"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Previous
        </ClayButton>
        <ClayButton
          variant={review[q.id] ? "accent" : "ghost"}
          onClick={() => setReview((r) => ({ ...r, [q.id]: !r[q.id] }))}
          aria-pressed={Boolean(review[q.id])}
        >
          <Flag className="size-4" aria-hidden="true" /> Mark for review
        </ClayButton>
        <ClayButton
          onClick={() => setCurrent((c) => Math.min(test.questions.length - 1, c + 1))}
          disabled={current === test.questions.length - 1}
        >
          Next <ArrowRight className="size-4" aria-hidden="true" />
        </ClayButton>
        <ClayButton variant="secondary" className="ml-auto" onClick={() => submit()}>
          <CheckCircle2 className="size-4" aria-hidden="true" /> Submit ({answered}/
          {test.questions.length})
        </ClayButton>
      </div>

      <ClayCard className="mt-6">
        <h2 className="text-sm font-bold">Question palette</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {test.questions.map((qq, i) => {
            const isAnswered = answers[qq.id] != null;
            const isReview = review[qq.id];
            return (
              <button
                key={qq.id}
                onClick={() => setCurrent(i)}
                aria-label={`Go to question ${i + 1}`}
                aria-current={current === i}
                className={cn(
                  "clay-press grid size-11 place-items-center rounded-[16px] text-sm font-bold shadow-[var(--clay-shadow-sm)]",
                  current === i
                    ? "bg-primary text-primary-foreground"
                    : isReview
                      ? "bg-accent text-accent-foreground"
                      : isAnswered
                        ? "bg-success text-success-foreground"
                        : "bg-card text-muted-foreground",
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Legend className="bg-success" label="Answered" />
          <Legend className="bg-card" label="Unanswered" />
          <Legend className="bg-accent" label="Marked for review" />
          <Legend className="bg-primary" label="Current" />
        </div>
      </ClayCard>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className={cn("size-3 rounded-full shadow-[var(--clay-shadow-sm)]", className)}
      />
      {label}
    </span>
  );
}

function Analytics({ result, testId }: { result: TestResult; testId: string }) {
  const test = mockTests.find((t) => t.id === testId)!;
  const [showReview, setShowReview] = useState(false);
  const pct = Math.round((result.correct / result.total) * 100);
  const attempted = result.correct + result.wrong;
  const accuracy = attempted ? Math.round((result.correct / attempted) * 100) : 0;
  const rank = Math.max(1, Math.round(45000 - pct * 430));
  const sorted = [...result.subjectStats].sort(
    (a, b) => a.correct / a.total - b.correct / b.total,
  );
  const weak = sorted.filter((s) => s.correct / s.total < 0.6);
  const strong = sorted.filter((s) => s.correct / s.total >= 0.6).reverse();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-4">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <ClayCard size="lg" tone="primary" className="text-center">
          <p className="text-sm font-semibold text-muted-foreground">{result.testName}</p>
          <p className="mt-3 text-6xl font-extrabold tabular-nums">{pct}%</p>
          <p className="mt-2 text-sm">
            Score {result.score} · {result.correct} correct · {result.wrong} wrong · {result.skipped}{" "}
            skipped
          </p>
        </ClayCard>
      </motion.div>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Accuracy", value: `${accuracy}%` },
          { label: "Estimated rank", value: `~${rank.toLocaleString()}` },
          {
            label: "Time taken",
            value: `${Math.floor(result.timeTakenSeconds / 60)}m ${result.timeTakenSeconds % 60}s`,
          },
          { label: "Attempted", value: `${attempted}/${result.total}` },
        ].map((s) => (
          <ClayCard key={s.label} size="sm">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{s.value}</p>
          </ClayCard>
        ))}
      </div>

      <ClayCard className="mt-5">
        <h2 className="text-lg font-bold">Subject-wise analysis</h2>
        <div className="mt-4 space-y-4">
          {result.subjectStats.map((s) => (
            <ClayProgress
              key={s.subject}
              value={(s.correct / s.total) * 100}
              label={`${s.subject} — ${s.correct}/${s.total}`}
              tone={s.correct / s.total >= 0.6 ? "success" : "warning"}
            />
          ))}
        </div>
      </ClayCard>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <ClayCard tone="warning">
          <h2 className="text-base font-bold">Weak areas</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {weak.length ? weak.map((w) => w.subject).join(", ") : "None — well balanced attempt."}
          </p>
        </ClayCard>
        <ClayCard tone="success">
          <h2 className="text-base font-bold">Strong areas</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {strong.length ? strong.map((w) => w.subject).join(", ") : "Keep revising the basics."}
          </p>
        </ClayCard>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <ClayButton onClick={() => setShowReview((s) => !s)}>
          {showReview ? "Hide answers" : "Review answers"}
        </ClayButton>
        <ClayButton variant="ghost" onClick={() => toast.success("Report ready for download")}>
          <Download className="size-4" aria-hidden="true" /> Download report
        </ClayButton>
        <ClayButton variant="secondary" onClick={() => window.location.reload()}>
          <RotateCcw className="size-4" aria-hidden="true" /> Retake test
        </ClayButton>
        <Link
          to="/progress"
          className="clay-sm clay-press ml-auto inline-flex min-h-12 items-center bg-card px-5 text-sm font-semibold"
        >
          View progress
        </Link>
      </div>

      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-4 overflow-hidden"
          >
            {test.questions.map((q, i) => {
              const given = result.answers[q.id];
              const ok = given === q.answer;
              return (
                <ClayCard key={q.id} size="sm">
                  <p className="text-sm font-semibold">
                    {i + 1}. {q.text}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-sm font-medium",
                      given == null ? "text-muted-foreground" : ok ? "text-success-foreground" : "text-destructive-foreground",
                    )}
                  >
                    Your answer: {given == null ? "Skipped" : q.options[given]}
                  </p>
                  <p className="mt-1 text-sm">Correct: {q.options[q.answer]}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{q.explanation}</p>
                </ClayCard>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}