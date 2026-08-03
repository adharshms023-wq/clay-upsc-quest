import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Save, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { QUESTION_TYPES, type GeneratedQuestion } from "@/lib/test-generation.server";
import { adminGenerateQuestions, adminSaveQuestions } from "@/lib/admin-questions.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/questions")({
  head: () => ({
    meta: [
      { title: "Question Bank Admin — Generate & Review | UPSC Clay" },
      {
        name: "description",
        content:
          "Admin-only console to draft UPSC questions with AI, review each one and publish them into the permanent question bank used by student mock tests.",
      },
      { property: "og:title", content: "UPSC Clay Question Bank Admin" },
      { property: "og:description", content: "Draft, review and publish questions into the question bank." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminQuestions,
});

function AdminQuestions() {
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "UPSC Standard">("UPSC Standard");
  const [types, setTypes] = useState<string[]>(["MCQ", "Statement Based"]);
  const [drafts, setDrafts] = useState<GeneratedQuestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  async function generate() {
    setBusy(true);
    try {
      const { questions } = await adminGenerateQuestions({
        data: { topicIds: [], count, difficulty, types, mode: "static", avoid: drafts.map((d) => d.question) },
      });
      setDrafts((prev) => [...questions, ...prev]);
      toast.success(`${questions.length} drafts ready for review`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const result = await adminSaveQuestions({ data: { questions: drafts } });
      toast.success(`Saved ${result.saved} questions (${result.skipped} duplicates skipped)`);
      setDrafts([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-6 pb-10">
      <h1 className="text-balance-tight text-3xl font-extrabold md:text-4xl">Question Bank Admin</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        AI drafts questions here only. Students never call AI — their mock tests are assembled from the
        questions you publish below.
      </p>

      <ClayCard className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          {[10, 25, 50].map((n) => (
            <Chip key={n} active={count === n} onClick={() => setCount(n)}>
              {n}
            </Chip>
          ))}
          {(["Easy", "Medium", "Hard", "UPSC Standard"] as const).map((d) => (
            <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
              {d}
            </Chip>
          ))}
          {QUESTION_TYPES.map((t) => (
            <Chip
              key={t}
              active={types.includes(t)}
              onClick={() => setTypes((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))}
            >
              {t}
            </Chip>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <ClayButton onClick={generate} disabled={busy || !types.length}>
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Sparkles className="size-4" aria-hidden="true" />}
            Generate drafts
          </ClayButton>
          <ClayButton variant="ghost" onClick={save} disabled={saving || !drafts.length}>
            <Save className="size-4" aria-hidden="true" /> Publish {drafts.length || ""} to bank
          </ClayButton>
        </div>
      </ClayCard>

      <div className="mt-6 space-y-3">
        {drafts.map((q, i) => (
          <ClayCard key={`${q.question}-${i}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {q.subject} · {q.topic} · {q.type} · {q.difficulty}
                </p>
                <p className="mt-2 text-sm font-semibold">{q.question}</p>
                <ol className="mt-2 space-y-1 text-sm">
                  {q.options.map((o, oi) => (
                    <li key={o} className={cn(oi === q.answerIndex && "font-bold text-success")}>
                      {String.fromCharCode(65 + oi)}. {o}
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-xs text-muted-foreground">{q.explanation}</p>
              </div>
              <ClayButton
                variant="ghost"
                size="sm"
                aria-label="Discard draft"
                onClick={() => setDrafts((p) => p.filter((_, x) => x !== i))}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </ClayButton>
            </div>
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
        "clay-sm clay-press inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold",
        active ? "bg-primary/30" : "bg-card text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}