import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Loader2, Newspaper, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { buildCurrentAffairsTest } from "@/lib/mock-test.functions";
import { saveGeneratedTest } from "@/lib/questionBank";
import { isQuestPlus } from "@/lib/plan";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/daily-quiz")({
  head: () => ({
    meta: [
      { title: "Today's UPSC Current Affairs Quiz — 10 Questions | UPSC Clay" },
      {
        name: "description",
        content:
          "Take today's 10-question UPSC current affairs quiz built from official PIB, RBI, ISRO and UN updates, with detailed explanations after every attempt.",
      },
      { property: "og:title", content: "Today's UPSC Current Affairs Quiz" },
      {
        property: "og:description",
        content: "10 analytical current-affairs questions a day, drawn from official sources.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DailyQuizPage,
});

const SUBJECTS = [
  "Indian Polity",
  "Economy",
  "Environment & Ecology",
  "Science & Technology",
  "International Relations",
  "Government Schemes",
];

type Preset = {
  key: string;
  label: string;
  description: string;
  count: number;
  sinceDays: number | null;
  difficulty: string | null;
  plus: boolean;
};

const PRESETS: Preset[] = [
  { key: "today", label: "Today's UPSC Quiz", description: "10 questions · 10 minutes", count: 10, sinceDays: 3, difficulty: null, plus: false },
  { key: "7d", label: "Last 7 Days Current Affairs", description: "20 questions from the past week", count: 20, sinceDays: 7, difficulty: null, plus: true },
  { key: "30d", label: "Last 30 Days Current Affairs", description: "30 questions from the past month", count: 30, sinceDays: 30, difficulty: null, plus: true },
  { key: "hard", label: "Very Hard Current Affairs Test", description: "25 of the toughest analytical questions", count: 25, sinceDays: 90, difficulty: "Hard", plus: true },
];

function DailyQuizPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const plus = isQuestPlus();

  async function start(preset: Preset) {
    if (preset.plus && !plus) {
      toast.info("Quest Plus unlocks unlimited current-affairs practice. The daily quiz stays free.");
      return;
    }
    setBusy(preset.key);
    const toastId = toast.loading("Assembling your current-affairs paper…");
    try {
      const { questions } = await buildCurrentAffairsTest({
        data: {
          count: preset.count,
          subjects: subject ? [subject] : [],
          difficulty: preset.difficulty,
          sinceDays: preset.sinceDays,
        },
      });
      if (!questions.length) {
        toast.error("No approved current-affairs questions yet — check back after the next update.", { id: toastId });
        return;
      }
      const test = saveGeneratedTest({
        name: `${preset.label}${subject ? ` · ${subject}` : ""}`,
        durationMinutes: Math.max(10, Math.round(questions.length)),
        source: "Current affairs bank",
        config: {
          scopeLabel: subject ?? "Current Affairs",
          topicIds: [],
          count: questions.length,
          difficulty: preset.difficulty ?? "UPSC Standard",
          types: [],
          mode: "current-affairs",
        },
        questions,
      });
      toast.success(`${questions.length} questions ready`, { id: toastId });
      navigate({ to: "/mock-tests/ai/$sessionId", params: { sessionId: test.id } });
    } catch (error) {
      console.error(error);
      toast.error("Could not build the quiz. Please try again.", { id: toastId });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-6 pb-10">
      <h1 className="text-balance-tight text-3xl font-extrabold md:text-4xl">Daily Current Affairs Quiz</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Questions written from official PIB, RBI, ISRO, UN and World Bank updates — every one reviewed
        before it reaches you, with the source link kept for verification.
      </p>

      <ClayCard className="mt-6">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Newspaper className="size-4 text-primary" aria-hidden="true" /> Filter by subject
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip active={subject === null} onClick={() => setSubject(null)}>
            All subjects
          </Chip>
          {SUBJECTS.map((s) => (
            <Chip key={s} active={subject === s} onClick={() => setSubject(s)}>
              {s}
            </Chip>
          ))}
        </div>
      </ClayCard>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {PRESETS.map((preset) => (
          <ClayCard key={preset.key}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold">{preset.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{preset.description}</p>
              </div>
              {preset.plus && !plus ? (
                <span className="clay-sm rounded-full bg-secondary/50 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wide">
                  Quest Plus
                </span>
              ) : (
                <CalendarDays className="size-5 text-primary" aria-hidden="true" />
              )}
            </div>
            <ClayButton className="mt-4" size="sm" onClick={() => start(preset)} disabled={busy !== null}>
              {busy === preset.key ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
              Start
            </ClayButton>
          </ClayCard>
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "clay-sm clay-press inline-flex min-h-10 items-center rounded-full px-3.5 text-xs font-semibold",
        active ? "bg-primary/30" : "bg-card text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}