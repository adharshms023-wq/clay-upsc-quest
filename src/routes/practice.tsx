import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, Loader2, RefreshCw, Sparkles, Target, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton, ClayLinkButton } from "@/components/clay/ClayButton";
import { ClayProgress } from "@/components/clay/ClayProgress";
import { buildMockTest } from "@/lib/mock-test.functions";
import { useStudy, type MissedQuestion } from "@/context/StudyContext";
import { cn } from "@/lib/utils";
import { requestUserFeedback } from "@/lib/feedback";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Daily Practice — 10 Quick UPSC Questions | UPSC Clay" },
      {
        name: "description",
        content:
          "A short daily UPSC practice set with instant feedback and explanations, plus a revision mode that replays every question you got wrong.",
      },
      { property: "og:title", content: "Daily UPSC Practice with Instant Feedback" },
      {
        property: "og:description",
        content: "Ten questions a day, instant explanations and automatic mistake revision.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PracticePage,
});

type PracticeQuestion = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
};

const SET_SIZE = 10;

function PracticePage() {
  const { missed, addMissed, clearMissed, logPractice, hydrated } = useStudy();
  const [questions, setQuestions] = useState<PracticeQuestion[] | null>(null);
  const [mode, setMode] = useState<"fresh" | "revision">("fresh");
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const reset = useCallback((qs: PracticeQuestion[], next: "fresh" | "revision") => {
    setQuestions(qs);
    setMode(next);
    setIndex(0);
    setPicked(null);
    setAnswers({});
    setStartedAt(Date.now());
  }, []);

  const loadFresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await buildMockTest({
        data: {
          count: SET_SIZE,
          subjects: [],
          topicIds: [],
          difficulty: "UPSC Standard",
          types: [],
          language: "English",
          exam: null,
        },
      });
      const qs = (result.questions as PracticeQuestion[]).filter((q) => q.options.length > 1);
      if (!qs.length) {
        toast.error("The question bank is empty right now — check back soon.");
        setQuestions([]);
        return;
      }
      reset(qs, "fresh");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load practice questions");
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    void loadFresh();
  }, [loadFresh]);

  const startRevision = () => {
    if (!missed.length) return;
    reset(
      missed.slice(0, SET_SIZE).map((m) => ({
        id: m.id,
        question: m.question,
        options: m.options,
        answerIndex: m.answerIndex,
        explanation: m.explanation,
        subject: m.subject,
        topic: m.topic,
        difficulty: m.difficulty,
      })),
      "revision",
    );
  };

  const current = questions?.[index];
  const done = !!questions && questions.length > 0 && index >= questions.length;

  const score = useMemo(() => {
    if (!questions) return 0;
    return questions.filter((q) => answers[q.id] === q.answerIndex).length;
  }, [questions, answers]);

  function choose(optionIndex: number) {
    if (picked !== null || !current) return;
    setPicked(optionIndex);
    setAnswers((a) => ({ ...a, [current.id]: optionIndex }));
  }

  function next() {
    if (!questions || !current) return;
    const isLast = index + 1 >= questions.length;
    setIndex((i) => i + 1);
    setPicked(null);

    if (isLast) {
      const wrong: MissedQuestion[] = questions
        .filter((q) => (answers[q.id] ?? (q === current ? picked : null)) !== q.answerIndex)
        .map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          answerIndex: q.answerIndex,
          explanation: q.explanation,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          missedAt: new Date().toISOString(),
        }));
      const correctIds = questions.filter((q) => !wrong.some((w) => w.id === q.id)).map((q) => q.id);
      if (wrong.length) addMissed(wrong);
      if (correctIds.length) clearMissed(correctIds);
      logPractice(Math.max(0.05, Math.min(1, (Date.now() - startedAt) / 3600000)));
      window.setTimeout(requestUserFeedback, 450);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-28 md:pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-balance-tight text-3xl font-extrabold md:text-4xl">Daily Practice</h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Ten questions, instant explanations. Anything you get wrong is saved and comes back in
            revision mode until you nail it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ClayButton size="sm" variant="ghost" onClick={() => void loadFresh()} disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="size-4" aria-hidden="true" />
            )}
            New set
          </ClayButton>
          <ClayButton
            size="sm"
            variant={missed.length ? "secondary" : "ghost"}
            onClick={startRevision}
            disabled={!hydrated || !missed.length}
          >
            <Target className="size-4" aria-hidden="true" />
            Revise mistakes{hydrated && missed.length ? ` (${missed.length})` : ""}
          </ClayButton>
        </div>
      </div>

      {loading && !questions ? (
        <ClayCard size="lg" className="mt-8 text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" aria-hidden="true" />
          <p className="mt-4 text-sm text-muted-foreground">Pulling questions from the bank…</p>
        </ClayCard>
      ) : questions && questions.length === 0 ? (
        <ClayCard size="lg" className="mt-8 text-center">
          <Sparkles className="mx-auto size-9 text-muted-foreground" aria-hidden="true" />
          <p className="mt-4 font-bold">No questions in the bank yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Once questions are published, your daily set appears here.
          </p>
        </ClayCard>
      ) : done && questions ? (
        <ClayCard size="lg" className="mt-8 text-center">
          <Zap className="mx-auto size-9 text-primary" aria-hidden="true" />
          <p className="mt-3 text-4xl font-extrabold tabular-nums">
            {score}/{questions.length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "revision" ? "Revision set complete" : "Daily set complete"} ·{" "}
            {Math.round((score / questions.length) * 100)}% accuracy
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ClayButton onClick={() => void loadFresh()} disabled={loading}>
              <RefreshCw className="size-4" aria-hidden="true" /> Another set
            </ClayButton>
            <ClayLinkButton to="/mock-tests" variant="ghost">
              Take a full mock
            </ClayLinkButton>
          </div>
        </ClayCard>
      ) : current ? (
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>
              Question {index + 1} of {questions?.length}
            </span>
            <span>
              {current.subject} · {current.difficulty}
            </span>
          </div>
          <ClayProgress
            value={(index / Math.max(1, questions?.length ?? 1)) * 100}
            className="mt-2"
          />

          <ClayCard size="lg" className="mt-5">
            <p className="whitespace-pre-line text-base font-semibold leading-relaxed">
              {current.question}
            </p>
            <ul className="mt-5 space-y-3">
              {current.options.map((option, oi) => {
                const isCorrect = oi === current.answerIndex;
                const isPicked = picked === oi;
                const revealed = picked !== null;
                return (
                  <li key={option}>
                    <button
                      onClick={() => choose(oi)}
                      disabled={revealed}
                      aria-pressed={isPicked}
                      className={cn(
                        "clay-sm clay-press flex w-full items-start gap-3 p-4 text-left text-sm transition-colors",
                        !revealed && "bg-card hover:bg-muted",
                        revealed && isCorrect && "bg-success/40",
                        revealed && isPicked && !isCorrect && "bg-destructive/25",
                        revealed && !isCorrect && !isPicked && "bg-card opacity-70",
                      )}
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-background/70 text-xs font-bold">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="min-w-0 flex-1">{option}</span>
                      {revealed && isCorrect ? (
                        <Check className="size-4 shrink-0" aria-hidden="true" />
                      ) : revealed && isPicked ? (
                        <X className="size-4 shrink-0" aria-hidden="true" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>

            {picked !== null ? (
              <div className="clay-inset mt-5 rounded-[20px] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {picked === current.answerIndex ? "Correct" : "Explanation"}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{current.explanation}</p>
              </div>
            ) : null}

            <div className="mt-5 flex justify-end">
              <ClayButton onClick={next} disabled={picked === null}>
                {index + 1 >= (questions?.length ?? 0) ? "Finish" : "Next question"}
              </ClayButton>
            </div>
          </ClayCard>
        </motion.div>
      ) : null}
    </div>
  );
}