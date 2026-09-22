import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flag,
  Loader2,
  Maximize2,
  Minimize2,
  Sparkles,
  SkipForward,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton, ClayLinkButton } from "@/components/clay/ClayButton";
import { ClayProgress } from "@/components/clay/ClayProgress";
import { useStudy, type TestResult } from "@/context/StudyContext";
import { getTest, recordAttempts, type BankQuestion } from "@/lib/questionBank";
import { recommendStudyPlan } from "@/lib/test-generation.functions";
import { cn } from "@/lib/utils";
import { requestUserFeedback } from "@/lib/feedback";

export const Route = createFileRoute("/mock-tests/ai/$sessionId")({
  head: () => ({
    meta: [
      { title: "AI Mock Test in Progress | UPSC Clay" },
      {
        name: "description",
        content:
          "Distraction-free full-screen UPSC exam interface with countdown, auto-save, mark-for-review and instant AI analysis.",
      },
      { property: "og:title", content: "UPSC AI Mock Test" },
      { property: "og:description", content: "Timed AI-generated UPSC practice paper with full analytics." },
    ],
  }),
  component: AiTestRunner,
});

type Draft = { answers: Record<string, number | null>; review: Record<string, boolean>; remaining: number };

function draftKey(id: string) {
  return `upsc-clay-attempt-${id}`;
}

function AiTestRunner() {
  const { sessionId } = useParams({ from: "/mock-tests/ai/$sessionId" });
  const { addResult } = useStudy();
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<{ name: string; durationMinutes: number; questions: BankQuestion[] } | null>(null);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [review, setReview] = useState<Record<string, boolean>>({});
  const [remaining, setRemaining] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [summary, setSummary] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const found = getTest(sessionId);
    if (found) {
      setData({ name: found.test.name, durationMinutes: found.test.durationMinutes, questions: found.questions });
      let draft: Draft | null = null;
      try {
        const raw = window.localStorage.getItem(draftKey(sessionId));
        if (raw) draft = JSON.parse(raw) as Draft;
      } catch {
        /* ignore */
      }
      setAnswers(draft?.answers ?? {});
      setReview(draft?.review ?? {});
      setRemaining(draft?.remaining ?? found.test.durationMinutes * 60);
    }
    setLoaded(true);
  }, [sessionId]);

  // Auto-save every state change.
  useEffect(() => {
    if (!data || result) return;
    try {
      window.localStorage.setItem(draftKey(sessionId), JSON.stringify({ answers, review, remaining }));
    } catch {
      /* ignore */
    }
  }, [answers, review, remaining, data, result, sessionId]);

  const submit = useCallback(
    (auto = false) => {
      if (!data || result) return;
      const topicMap = new Map<string, { correct: number; total: number }>();
      const subjectMap = new Map<string, { correct: number; total: number }>();
      let correct = 0;
      let wrong = 0;
      let skipped = 0;

      data.questions.forEach((q) => {
        const given = answers[q.id];
        const bucket = subjectMap.get(q.subject) ?? { correct: 0, total: 0 };
        const tBucket = topicMap.get(q.topic) ?? { correct: 0, total: 0 };
        bucket.total += 1;
        tBucket.total += 1;
        if (given == null) skipped += 1;
        else if (given === q.answerIndex) {
          correct += 1;
          bucket.correct += 1;
          tBucket.correct += 1;
        } else wrong += 1;
        subjectMap.set(q.subject, bucket);
        topicMap.set(q.topic, tBucket);
      });

      const r: TestResult = {
        id: `${sessionId}-${Date.now()}`,
        testId: sessionId,
        testName: data.name,
        takenAt: new Date().toISOString(),
        total: data.questions.length,
        correct,
        wrong,
        skipped,
        score: Number((correct * 2 - wrong * 0.66).toFixed(2)),
        timeTakenSeconds: data.durationMinutes * 60 - remaining,
        subjectStats: [...subjectMap].map(([subject, v]) => ({ subject, ...v })),
        answers,
      };
      setResult(r);
      addResult(r);
      recordAttempts(
        data.questions.map((q) => ({ id: q.id, correct: answers[q.id] === q.answerIndex })),
      );
      try {
        window.localStorage.removeItem(draftKey(sessionId));
      } catch {
        /* ignore */
      }
      if (document.fullscreenElement) void document.exitFullscreen();
      toast.success(auto ? "Time up — test submitted" : "Test submitted");
      window.setTimeout(requestUserFeedback, 450);
    },
    [data, result, answers, remaining, sessionId, addResult],
  );

  useEffect(() => {
    if (!data || result) return;
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
  }, [data, result, submit]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  if (!loaded) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <ClayCard size="lg">
          <h1 className="text-xl font-bold">Test not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Generated tests are stored on this device. Generate a new one to continue.
          </p>
          <ClayLinkButton to="/mock-tests/generate" className="mt-5">
            Generate a test
          </ClayLinkButton>
        </ClayCard>
      </div>
    );
  }

  if (result) return <Analytics result={result} questions={data.questions} />;

  const q = data.questions[current]!;
  const answered = Object.values(answers).filter((v) => v != null).length;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-2 pb-10">
      <ClayCard size="sm" className="sticky top-2 z-40 md:top-24">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{data.name}</p>
            <p className="text-xs text-muted-foreground">
              Question {current + 1} of {data.questions.length} · autosaved
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => {
                if (document.fullscreenElement) void document.exitFullscreen();
                else void document.documentElement.requestFullscreen().catch(() => undefined);
              }}
              aria-label={fullscreen ? "Exit full screen" : "Enter full screen"}
              className="clay-sm clay-press grid size-10 place-items-center rounded-full bg-card"
            >
              {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
            <span
              className={cn(
                "clay-inset flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold tabular-nums",
                remaining < 60 && "text-destructive",
              )}
              aria-live="polite"
            >
              <Timer className="size-4" aria-hidden="true" />
              {mm}:{ss}
            </span>
          </div>
        </div>
        <ClayProgress className="mt-3" value={((current + 1) / data.questions.length) * 100} />
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
            <div className="flex flex-wrap gap-2">
              <span className="clay-sm rounded-full bg-secondary/50 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide">
                {q.subject}
              </span>
              <span className="clay-sm rounded-full bg-accent/40 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide">
                {q.type}
              </span>
              <span className="clay-sm rounded-full bg-card px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">
                {q.difficulty}
              </span>
            </div>
            <h1 className="mt-4 whitespace-pre-line text-lg font-semibold leading-relaxed md:text-xl">
              {q.question}
            </h1>
            <fieldset className="mt-6 space-y-3">
              <legend className="sr-only">Answer options</legend>
              {q.options.map((opt, i) => {
                const selected = answers[q.id] === i;
                return (
                  <label
                    key={`${q.id}-${i}`}
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
                    <span className="whitespace-pre-line text-sm leading-relaxed md:text-base">{opt}</span>
                  </label>
                );
              })}
            </fieldset>
          </ClayCard>
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex flex-wrap gap-3">
        <ClayButton variant="ghost" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
          <ArrowLeft className="size-4" aria-hidden="true" /> Previous
        </ClayButton>
        <ClayButton
          variant="ghost"
          onClick={() => {
            setAnswers((a) => ({ ...a, [q.id]: null }));
            setCurrent((c) => Math.min(data.questions.length - 1, c + 1));
          }}
        >
          <SkipForward className="size-4" aria-hidden="true" /> Skip
        </ClayButton>
        <ClayButton
          variant={review[q.id] ? "accent" : "ghost"}
          onClick={() => setReview((r) => ({ ...r, [q.id]: !r[q.id] }))}
          aria-pressed={Boolean(review[q.id])}
        >
          <Flag className="size-4" aria-hidden="true" /> Mark for review
        </ClayButton>
        <ClayButton
          onClick={() => setCurrent((c) => Math.min(data.questions.length - 1, c + 1))}
          disabled={current === data.questions.length - 1}
        >
          Next <ArrowRight className="size-4" aria-hidden="true" />
        </ClayButton>
        <ClayButton variant="secondary" className="ml-auto" onClick={() => setSummary(true)}>
          <CheckCircle2 className="size-4" aria-hidden="true" /> Review & submit ({answered}/
          {data.questions.length})
        </ClayButton>
      </div>

      <ClayCard className="mt-6">
        <h2 className="text-sm font-bold">Question palette</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.questions.map((qq, i) => {
            const isAnswered = answers[qq.id] != null;
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
                    : review[qq.id]
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
      </ClayCard>

      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/25 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Review summary"
          >
            <motion.div initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-md">
              <ClayCard size="lg">
                <h2 className="text-xl font-bold">Review summary</h2>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Answered", answered],
                    ["Unanswered", data.questions.length - answered],
                    ["Marked for review", Object.values(review).filter(Boolean).length],
                    ["Time left", `${mm}:${ss}`],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="clay-inset rounded-[18px] p-3">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-1 text-lg font-extrabold tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
                {confirming ? (
                  <>
                    <p className="mt-5 text-sm font-semibold">
                      Submit now? You can't change answers afterwards.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <ClayButton variant="ghost" onClick={() => setConfirming(false)}>
                        Keep going
                      </ClayButton>
                      <ClayButton className="flex-1 justify-center" onClick={() => submit()}>
                        Yes, submit
                      </ClayButton>
                    </div>
                  </>
                ) : (
                  <div className="mt-5 flex gap-3">
                    <ClayButton variant="ghost" onClick={() => setSummary(false)}>
                      Back to paper
                    </ClayButton>
                    <ClayButton variant="secondary" className="flex-1 justify-center" onClick={() => setConfirming(true)}>
                      Submit test
                    </ClayButton>
                  </div>
                )}
              </ClayCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Analytics({ result, questions }: { result: TestResult; questions: BankQuestion[] }) {
  const [showReview, setShowReview] = useState(false);
  const [plan, setPlan] = useState<{
    summary: string;
    reviseTopics: string[];
    suggestedTests: string[];
    studyPlan: { day: string; focus: string; action: string }[];
  } | null>(null);
  const [planBusy, setPlanBusy] = useState(false);

  const pct = Math.round((result.correct / result.total) * 100);
  const attempted = result.correct + result.wrong;
  const accuracy = attempted ? Math.round((result.correct / attempted) * 100) : 0;
  const percentile = Math.min(99.9, Number((40 + pct * 0.6).toFixed(1)));
  const rank = Math.max(1, Math.round(45000 - pct * 430));

  const topicStats = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();
    questions.forEach((q) => {
      const b = map.get(q.topic) ?? { correct: 0, total: 0 };
      b.total += 1;
      if (result.answers[q.id] === q.answerIndex) b.correct += 1;
      map.set(q.topic, b);
    });
    return [...map].map(([topic, v]) => ({ topic, ...v })).sort((a, b) => a.correct / a.total - b.correct / b.total);
  }, [questions, result.answers]);

  const weak = topicStats.filter((s) => s.correct / s.total < 0.6);
  const strong = topicStats.filter((s) => s.correct / s.total >= 0.6).reverse();
  const incorrect = questions.filter((q) => result.answers[q.id] != null && result.answers[q.id] !== q.answerIndex);

  async function loadPlan() {
    setPlanBusy(true);
    try {
      const res = await recommendStudyPlan({
        data: {
          score: result.score,
          total: result.total,
          accuracy,
          weak: weak.map((w) => ({ topic: w.topic, correct: w.correct, total: w.total })),
          strong: strong.map((s) => s.topic),
        },
      });
      setPlan(res);
    } catch (error) {
      console.error(error);
      toast.error("Could not generate recommendations right now.");
    } finally {
      setPlanBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-4 pb-10">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <ClayCard size="lg" tone="primary" className="text-center">
          <p className="text-sm font-semibold text-muted-foreground">{result.testName}</p>
          <p className="mt-3 text-6xl font-extrabold tabular-nums">{pct}%</p>
          <p className="mt-2 text-sm">
            Score {result.score} · {result.correct} correct · {result.wrong} wrong · {result.skipped} skipped
          </p>
        </ClayCard>
      </motion.div>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Accuracy", value: `${accuracy}%` },
          { label: "Percentile", value: `${percentile}` },
          { label: "Estimated rank", value: `~${rank.toLocaleString()}` },
          {
            label: "Time taken",
            value: `${Math.floor(result.timeTakenSeconds / 60)}m ${result.timeTakenSeconds % 60}s`,
          },
        ].map((s) => (
          <ClayCard key={s.label} size="sm">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{s.value}</p>
          </ClayCard>
        ))}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <ClayCard>
          <h2 className="text-lg font-bold">Subject-wise</h2>
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
        <ClayCard>
          <h2 className="text-lg font-bold">Topic-wise</h2>
          <div className="mt-4 space-y-4">
            {topicStats.map((s) => (
              <ClayProgress
                key={s.topic}
                value={(s.correct / s.total) * 100}
                label={`${s.topic} — ${s.correct}/${s.total}`}
                tone={s.correct / s.total >= 0.6 ? "success" : "warning"}
              />
            ))}
          </div>
        </ClayCard>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <ClayCard tone="warning">
          <h2 className="text-base font-bold">Weak areas</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {weak.length ? weak.map((w) => w.topic).join(", ") : "None — well balanced attempt."}
          </p>
        </ClayCard>
        <ClayCard tone="success">
          <h2 className="text-base font-bold">Strong areas</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {strong.length ? strong.map((w) => w.topic).join(", ") : "Keep revising the basics."}
          </p>
        </ClayCard>
      </div>

      <ClayCard className="mt-5" tone="secondary">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">AI recommendations</h2>
          {!plan && (
            <ClayButton size="sm" onClick={loadPlan} disabled={planBusy}>
              {planBusy ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Analysing…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden="true" /> Get my plan
                </>
              )}
            </ClayButton>
          )}
        </div>
        {plan ? (
          <div className="mt-4 space-y-4 text-sm">
            <p className="leading-relaxed">{plan.summary}</p>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Revise first</p>
              <p className="mt-1">{plan.reviseTopics.join(" · ")}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Next mock tests</p>
              <p className="mt-1">{plan.suggestedTests.join(" · ")}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Study plan</p>
              {plan.studyPlan.map((d) => (
                <div key={d.day} className="clay-inset rounded-[18px] p-3">
                  <p className="font-semibold">
                    {d.day} · {d.focus}
                  </p>
                  <p className="mt-1 text-muted-foreground">{d.action}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Get a personalised revision list, suggested next tests and a week-long plan based on this attempt.
          </p>
        )}
      </ClayCard>

      <div className="mt-6 flex flex-wrap gap-3">
        <ClayButton onClick={() => setShowReview((s) => !s)}>
          {showReview ? "Hide solutions" : `Review ${incorrect.length} incorrect + all solutions`}
        </ClayButton>
        <ClayLinkButton to="/mock-tests/generate" variant="secondary">
          <Sparkles className="size-4" aria-hidden="true" /> Generate a fresh paper
        </ClayLinkButton>
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
            {questions.map((q, i) => {
              const given = result.answers[q.id];
              const ok = given === q.answerIndex;
              return (
                <ClayCard key={q.id} size="sm" tone={given == null ? "base" : ok ? "success" : "warning"}>
                  <p className="whitespace-pre-line text-sm font-semibold">
                    {i + 1}. {q.question}
                  </p>
                  <p className="mt-2 text-sm">
                    Your answer: {given == null ? "Skipped" : q.options[given]}
                  </p>
                  <p className="mt-1 text-sm font-medium">Correct: {q.options[q.answerIndex]}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{q.explanation}</p>
                  <p className="mt-2 text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                    {q.subject} · {q.topic} · {q.difficulty}
                  </p>
                </ClayCard>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
