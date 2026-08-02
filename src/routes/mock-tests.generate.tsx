import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, Loader2, Search, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { upscSyllabus, type SyllabusSubject } from "@/data/upscSyllabus";
import { QUESTION_TYPES } from "@/lib/test-generation.server";
import { generateMockTest } from "@/lib/test-generation.functions";
import { existingStems, saveGeneratedTest } from "@/lib/questionBank";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mock-tests/generate")({
  head: () => ({
    meta: [
      { title: "AI Mock Test Generator — Any Topic, Any Length | UPSC Clay" },
      {
        name: "description",
        content:
          "Generate UPSC-standard mock tests on demand from any subject, module or topic — choose 10 to 100 questions, difficulty, question types and current-affairs mix.",
      },
      { property: "og:title", content: "AI UPSC Mock Test Generator" },
      {
        property: "og:description",
        content: "Fresh, non-repeating UPSC-standard questions generated for exactly the topics you pick.",
      },
    ],
  }),
  component: GeneratePage,
});

type Mode = "static" | "current-affairs" | "mixed";
type Difficulty = "Easy" | "Medium" | "Hard" | "UPSC Standard";

function GeneratePage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"all" | "prelims" | "mains">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [count, setCount] = useState<10 | 25 | 50 | 100>(25);
  const [difficulty, setDifficulty] = useState<Difficulty>("UPSC Standard");
  const [types, setTypes] = useState<string[]>(["MCQ", "Statement Based", "Assertion & Reason"]);
  const [mode, setMode] = useState<Mode>("static");
  const [busy, setBusy] = useState(false);

  const subjects = useMemo(() => {
    const base = upscSyllabus.filter((s) => stage === "all" || s.stage === stage);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base
      .map((s) => ({
        ...s,
        modules: s.modules
          .map((m) => ({
            ...m,
            topics: m.topics.filter(
              (t) =>
                t.name.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.keywords.some((k) => k.toLowerCase().includes(q)) ||
                m.name.toLowerCase().includes(q) ||
                s.name.toLowerCase().includes(q),
            ),
          }))
          .filter((m) => m.topics.length),
      }))
      .filter((s) => s.modules.length);
  }, [stage, query]);

  const toggle = (ids: string[]) =>
    setSelected((prev) => {
      const allOn = ids.every((id) => prev.includes(id));
      return allOn ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])];
    });

  const scopeLabel = selected.length
    ? `${selected.length} topic${selected.length > 1 ? "s" : ""} selected`
    : "Entire UPSC syllabus";

  async function handleGenerate() {
    if (!types.length) {
      toast.error("Pick at least one question type");
      return;
    }
    setBusy(true);
    const toastId = toast.loading(`Writing ${count} UPSC-standard questions…`);
    try {
      const { questions } = await generateMockTest({
        data: {
          topicIds: selected,
          count,
          difficulty,
          types,
          mode,
          avoid: existingStems(),
        },
      });
      if (!questions.length) throw new Error("No questions returned");
      const test = saveGeneratedTest({
        name: `AI Test · ${scopeLabel} · ${difficulty}`,
        durationMinutes: Math.max(10, Math.round(questions.length * 1.2)),
        source: "Lovable AI",
        config: { scopeLabel, topicIds: selected, count, difficulty, types, mode },
        questions,
      });
      toast.success(`${questions.length} questions ready`, { id: toastId });
      navigate({ to: "/mock-tests/ai/$sessionId", params: { sessionId: test.id } });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Generation failed";
      toast.error(
        /429|rate/i.test(message)
          ? "Too many requests right now — try again in a minute."
          : /402|credit/i.test(message)
            ? "AI credits are exhausted for this workspace."
            : "Could not generate the test. Please try again.",
        { id: toastId },
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-10">
      <h1 className="text-balance-tight text-3xl font-extrabold md:text-4xl">AI Mock Test Generator</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Pick any slice of the syllabus — one topic or all of it — and get a fresh, non-repeating
        paper written in real UPSC style, with explanations for every question.
      </p>

      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ClayCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">1 · Choose your scope</h2>
            {selected.length > 0 && (
              <ClayButton variant="ghost" size="sm" onClick={() => setSelected([])}>
                <X className="size-4" aria-hidden="true" /> Clear ({selected.length})
              </ClayButton>
            )}
          </div>

          <div className="clay-sm mt-4 flex gap-1 rounded-full p-1.5" role="tablist" aria-label="Exam stage">
            {(["all", "prelims", "mains"] as const).map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={stage === key}
                onClick={() => setStage(key)}
                className={cn(
                  "min-h-10 flex-1 rounded-full text-sm font-semibold capitalize transition-all",
                  stage === key ? "bg-primary/30 shadow-[var(--clay-shadow-sm)]" : "text-muted-foreground",
                )}
              >
                {key === "all" ? "Full syllabus" : key}
              </button>
            ))}
          </div>

          <div className="clay-inset mt-4 flex items-center gap-3 rounded-full px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <label className="sr-only" htmlFor="topic-search">
              Search topics
            </label>
            <input
              id="topic-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any subject, module or topic…"
              className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {subjects.map((s) => (
              <SubjectPicker key={s.id} subject={s} selected={selected} toggle={toggle} />
            ))}
            {!subjects.length && (
              <p className="py-8 text-center text-sm text-muted-foreground">No topics match “{query}”.</p>
            )}
          </div>
        </ClayCard>

        <div className="space-y-5">
          <ClayCard>
            <h2 className="text-lg font-bold">2 · Paper settings</h2>

            <Field label="Questions">
              {([10, 25, 50, 100] as const).map((n) => (
                <Chip key={n} active={count === n} onClick={() => setCount(n)}>
                  {n}
                </Chip>
              ))}
            </Field>

            <Field label="Difficulty">
              {(["Easy", "Medium", "Hard", "UPSC Standard"] as const).map((d) => (
                <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
                  {d}
                </Chip>
              ))}
            </Field>

            <Field label="Question types">
              {QUESTION_TYPES.map((qt) => (
                <Chip
                  key={qt}
                  active={types.includes(qt)}
                  onClick={() =>
                    setTypes((prev) => (prev.includes(qt) ? prev.filter((x) => x !== qt) : [...prev, qt]))
                  }
                >
                  {types.includes(qt) && <Check className="size-3.5" aria-hidden="true" />}
                  {qt}
                </Chip>
              ))}
            </Field>

            <Field label="Content mode">
              {(
                [
                  ["static", "Static only"],
                  ["current-affairs", "Current affairs"],
                  ["mixed", "Mixed 70/30"],
                ] as const
              ).map(([value, label]) => (
                <Chip key={value} active={mode === value} onClick={() => setMode(value)}>
                  {label}
                </Chip>
              ))}
            </Field>
          </ClayCard>

          <motion.div layout>
            <ClayCard tone="primary">
              <p className="text-sm font-semibold">{scopeLabel}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {count} questions · {difficulty} · ~{Math.max(10, Math.round(count * 1.2))} minutes
              </p>
              <ClayButton className="mt-4 w-full justify-center" onClick={handleGenerate} disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" aria-hidden="true" /> Generate test
                  </>
                )}
              </ClayButton>
              <p className="mt-3 text-[0.7rem] leading-relaxed text-muted-foreground">
                Every question is stored in your question bank, and repeat attempts on the same scope
                generate a fresh paper.
              </p>
            </ClayCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SubjectPicker({
  subject,
  selected,
  toggle,
}: {
  subject: SyllabusSubject;
  selected: string[];
  toggle: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ids = subject.modules.flatMap((m) => m.topics.map((t) => t.id));
  const chosen = ids.filter((id) => selected.includes(id)).length;

  return (
    <div className="clay-inset rounded-[22px] p-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => toggle(ids)}
          aria-pressed={chosen === ids.length}
          aria-label={`Select all topics in ${subject.name}`}
          className={cn(
            "clay-press grid size-9 shrink-0 place-items-center rounded-[13px] shadow-[var(--clay-shadow-sm)]",
            chosen === ids.length ? "bg-success text-success-foreground" : chosen ? "bg-primary/40" : "bg-card",
          )}
        >
          <Check className={cn("size-4", !chosen && "opacity-25")} aria-hidden="true" />
        </button>
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold">{subject.name}</p>
          <p className="text-xs text-muted-foreground">
            {subject.paper} · {chosen}/{ids.length} topics
          </p>
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          {subject.modules.map((m) => (
            <div key={m.id}>
              <button
                onClick={() => toggle(m.topics.map((t) => t.id))}
                className="text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                {m.name}
              </button>
              <div className="mt-2 flex flex-wrap gap-2">
                {m.topics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggle([t.id])}
                    aria-pressed={selected.includes(t.id)}
                    title={t.description}
                    className={cn(
                      "clay-sm clay-press rounded-full px-3 py-1.5 text-xs font-medium",
                      selected.includes(t.id) ? "bg-primary/30" : "bg-card",
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "clay-sm clay-press inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold",
        active ? "bg-primary/30" : "bg-card text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
