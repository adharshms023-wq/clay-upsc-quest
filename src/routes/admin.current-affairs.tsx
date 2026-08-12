import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, RefreshCw, Sparkles, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import {
  caAddSource,
  caDeleteArticle,
  caGenerateQuestions,
  caListArticles,
  caListPendingQuestions,
  caListSources,
  caReviewQuestion,
  caRunClassification,
  caRunIngestion,
  caStats,
  caToggleSource,
  caUpdateArticle,
} from "@/lib/current-affairs.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/current-affairs")({
  head: () => ({
    meta: [
      { title: "Current Affairs Pipeline — Admin Console | UPSC Clay" },
      {
        name: "description",
        content:
          "Admin console for the current-affairs pipeline: fetch official feeds, classify articles against the UPSC syllabus, draft questions and approve them into the bank.",
      },
      { property: "og:title", content: "Current Affairs Pipeline Admin" },
      { property: "og:description", content: "Fetch, classify, draft and approve current-affairs questions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminCurrentAffairs,
});

const STATUSES = [
  "fetched",
  "classified",
  "pending_review",
  "question_generated",
  "approved",
  "rejected",
  "pending_ai",
] as const;

type Article = {
  id: string;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  published_at: string;
  category: string;
  subject: string;
  topic: string;
  upsc_relevance: number;
  status: string;
  question_count: number;
  last_error: string | null;
};

type PendingQuestion = {
  id: string;
  question: string;
  options: unknown;
  correct_answer: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
  question_type: string;
  source_url: string | null;
};

type SourceRow = {
  id: string;
  source_name: string;
  feed_url: string;
  category: string;
  active: boolean;
  last_fetched_at: string | null;
  last_error: string | null;
};

function AdminCurrentAffairs() {
  const [tab, setTab] = useState<"articles" | "questions" | "sources">("articles");
  const [status, setStatus] = useState<string>("fetched");
  const [articles, setArticles] = useState<Article[]>([]);
  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [stats, setStats] = useState<{ byStatus: Record<string, number>; pendingQuestions: number; approvedQuestions: number } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, statCounts] = await Promise.all([
        caListArticles({ data: { status, page: 0, pageSize: 20 } }),
        caStats(),
      ]);
      setArticles(list.rows as Article[]);
      setStats(statCounts);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load the pipeline");
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (tab === "questions") {
      caListPendingQuestions({ data: { limit: 30 } })
        .then((r) => setQuestions(r.rows as PendingQuestion[]))
        .catch(() => toast.error("Could not load the review queue"));
    }
    if (tab === "sources") {
      caListSources()
        .then((r) => setSources(r.rows as SourceRow[]))
        .catch(() => toast.error("Could not load sources"));
    }
  }, [tab]);

  async function run(key: string, fn: () => Promise<string>) {
    setBusy(key);
    try {
      toast.success(await fn());
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Step failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-10">
      <h1 className="text-balance-tight text-3xl font-extrabold md:text-4xl">Current Affairs Pipeline</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Official feeds in, reviewed UPSC questions out. Collection keeps running even when AI is
        unavailable — nothing is lost, articles simply wait as <em>pending_ai</em>.
      </p>

      <ClayCard className="mt-6">
        <div className="flex flex-wrap gap-3">
          <ClayButton
            onClick={() =>
              run("fetch", async () => {
                const r = await caRunIngestion();
                const failed = r.sources.filter((s) => s.error);
                if (failed.length) toast.warning(`${failed.length} source(s) failed: ${failed[0]?.source}`);
                return `${r.inserted} new article(s) stored`;
              })
            }
            disabled={busy !== null}
          >
            {busy === "fetch" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="size-4" aria-hidden="true" />}
            Fetch sources
          </ClayButton>
          <ClayButton
            variant="secondary"
            onClick={() =>
              run("classify", async () => {
                const r = await caRunClassification({ data: { limit: 20 } });
                return `${r.classified} classified · ${r.relevant} above relevance 60`;
              })
            }
            disabled={busy !== null}
          >
            {busy === "classify" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Sparkles className="size-4" aria-hidden="true" />}
            Classify
          </ClayButton>
          <ClayButton
            variant="ghost"
            onClick={() =>
              run("generate", async () => {
                const r = await caGenerateQuestions({ data: { maxArticles: 3 } });
                if (r.failures.length) toast.warning(r.failures[0] ?? "Some articles failed");
                return `${r.created} question(s) queued · ${r.duplicates} duplicate(s) skipped`;
              })
            }
            disabled={busy !== null}
          >
            {busy === "generate" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Sparkles className="size-4" aria-hidden="true" />}
            Draft questions
          </ClayButton>
        </div>

        {stats ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {STATUSES.map((s) => (
              <span key={s} className="clay-inset rounded-full px-3 py-1.5 font-semibold">
                {s.replace(/_/g, " ")}: {stats.byStatus[s] ?? 0}
              </span>
            ))}
            <span className="clay-inset rounded-full px-3 py-1.5 font-semibold">
              questions pending: {stats.pendingQuestions}
            </span>
            <span className="clay-inset rounded-full px-3 py-1.5 font-semibold">
              questions approved: {stats.approvedQuestions}
            </span>
          </div>
        ) : null}
      </ClayCard>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["articles", "questions", "sources"] as const).map((t) => (
          <Chip key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </Chip>
        ))}
      </div>

      {tab === "articles" ? (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
                {s.replace(/_/g, " ")}
              </Chip>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {articles.length === 0 ? (
              <ClayCard size="sm">
                <p className="text-sm text-muted-foreground">No articles with this status yet.</p>
              </ClayCard>
            ) : null}
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} onChanged={load} />
            ))}
          </div>
        </>
      ) : null}

      {tab === "questions" ? (
        <div className="mt-4 space-y-3">
          {questions.length === 0 ? (
            <ClayCard size="sm">
              <p className="text-sm text-muted-foreground">The review queue is empty.</p>
            </ClayCard>
          ) : null}
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onDone={(id) => setQuestions((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </div>
      ) : null}

      {tab === "sources" ? <Sources rows={sources} onChanged={() => caListSources().then((r) => setSources(r.rows as SourceRow[]))} /> : null}
    </div>
  );
}

function ArticleCard({ article, onChanged }: { article: Article; onChanged: () => void }) {
  const [title, setTitle] = useState(article.title);
  const [summary, setSummary] = useState(article.summary);
  const [subject, setSubject] = useState(article.subject);
  const [relevance, setRelevance] = useState(article.upsc_relevance);
  const [saving, setSaving] = useState(false);

  async function update(status?: "approved" | "rejected") {
    setSaving(true);
    try {
      await caUpdateArticle({
        data: {
          id: article.id,
          title,
          summary,
          subject,
          upscRelevance: relevance,
          ...(status ? { status } : {}),
        },
      });
      toast.success(status ? `Article ${status}` : "Article saved");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ClayCard>
      <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">
        <span>{article.source}</span>
        <span>· {new Date(article.published_at).toLocaleDateString()}</span>
        <span>· relevance {article.upsc_relevance}</span>
        {article.question_count ? <span>· {article.question_count} drafted</span> : null}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Article title"
        className="clay-inset mt-3 w-full rounded-2xl px-4 py-2.5 text-sm font-semibold"
      />
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        aria-label="Article summary"
        rows={3}
        className="clay-inset mt-2 w-full rounded-2xl px-4 py-2.5 text-sm"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          aria-label="Subject"
          placeholder="Subject"
          className="clay-inset min-w-40 flex-1 rounded-2xl px-4 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          max={100}
          value={relevance}
          onChange={(e) => setRelevance(Number(e.target.value))}
          aria-label="Relevance score"
          className="clay-inset w-24 rounded-2xl px-4 py-2 text-sm"
        />
      </div>
      {article.last_error ? (
        <p className="mt-2 text-xs text-destructive">Last error: {article.last_error}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <ClayButton size="sm" variant="ghost" onClick={() => update()} disabled={saving}>
          Save
        </ClayButton>
        <ClayButton size="sm" onClick={() => update("approved")} disabled={saving}>
          <CheckCircle2 className="size-4" aria-hidden="true" /> Approve
        </ClayButton>
        <ClayButton size="sm" variant="danger" onClick={() => update("rejected")} disabled={saving}>
          <XCircle className="size-4" aria-hidden="true" /> Reject
        </ClayButton>
        <a
          href={article.source_url}
          target="_blank"
          rel="noreferrer noopener"
          className="clay-sm clay-press inline-flex min-h-10 items-center gap-1.5 rounded-full bg-card px-3.5 text-xs font-semibold"
        >
          <ExternalLink className="size-4" aria-hidden="true" /> Source
        </a>
        <ClayButton
          size="sm"
          variant="ghost"
          aria-label="Delete article"
          onClick={async () => {
            await caDeleteArticle({ data: { id: article.id } });
            toast.success("Article deleted");
            onChanged();
          }}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </ClayButton>
      </div>
    </ClayCard>
  );
}

function QuestionCard({ question, onDone }: { question: PendingQuestion; onDone: (id: string) => void }) {
  const initialOptions = Array.isArray(question.options) ? question.options.map(String) : ["", "", "", ""];
  const [stem, setStem] = useState(question.question);
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [answer, setAnswer] = useState(question.correct_answer);
  const [explanation, setExplanation] = useState(question.explanation);
  const [saving, setSaving] = useState(false);

  async function review(status: "approved" | "rejected" | "draft") {
    setSaving(true);
    try {
      await caReviewQuestion({
        data: {
          id: question.id,
          question: stem,
          options: [options[0] ?? "", options[1] ?? "", options[2] ?? "", options[3] ?? ""],
          correctAnswer: answer,
          explanation,
          status,
        },
      });
      toast.success(status === "draft" ? "Saved" : `Question ${status}`);
      if (status !== "draft") onDone(question.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ClayCard>
      <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">
        {question.subject} · {question.topic} · {question.question_type} · {question.difficulty}
      </p>
      <textarea
        value={stem}
        onChange={(e) => setStem(e.target.value)}
        aria-label="Question text"
        rows={4}
        className="clay-inset mt-2 w-full rounded-2xl px-4 py-2.5 text-sm font-semibold"
      />
      <div className="mt-2 space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <button
              onClick={() => setAnswer(index)}
              aria-pressed={answer === index}
              aria-label={`Mark option ${String.fromCharCode(65 + index)} correct`}
              className={cn(
                "clay-sm clay-press grid size-10 shrink-0 place-items-center rounded-2xl text-xs font-bold",
                answer === index ? "bg-secondary/60" : "bg-card text-muted-foreground",
              )}
            >
              {String.fromCharCode(65 + index)}
            </button>
            <input
              value={option}
              aria-label={`Option ${String.fromCharCode(65 + index)}`}
              onChange={(e) =>
                setOptions((prev) => prev.map((o, i) => (i === index ? e.target.value : o)))
              }
              className="clay-inset w-full rounded-2xl px-4 py-2 text-sm"
            />
          </div>
        ))}
      </div>
      <textarea
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        aria-label="Explanation"
        rows={4}
        className="clay-inset mt-2 w-full rounded-2xl px-4 py-2.5 text-xs"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <ClayButton size="sm" onClick={() => review("approved")} disabled={saving}>
          <CheckCircle2 className="size-4" aria-hidden="true" /> Approve
        </ClayButton>
        <ClayButton size="sm" variant="ghost" onClick={() => review("draft")} disabled={saving}>
          Save draft
        </ClayButton>
        <ClayButton size="sm" variant="danger" onClick={() => review("rejected")} disabled={saving}>
          <XCircle className="size-4" aria-hidden="true" /> Reject
        </ClayButton>
        {question.source_url ? (
          <a
            href={question.source_url}
            target="_blank"
            rel="noreferrer noopener"
            className="clay-sm clay-press inline-flex min-h-10 items-center gap-1.5 rounded-full bg-card px-3.5 text-xs font-semibold"
          >
            <ExternalLink className="size-4" aria-hidden="true" /> Verify source
          </a>
        ) : null}
      </div>
    </ClayCard>
  );
}

function Sources({ rows, onChanged }: { rows: SourceRow[]; onChanged: () => void }) {
  const [name, setName] = useState("");
  const [feed, setFeed] = useState("");
  const [category, setCategory] = useState("General");

  return (
    <div className="mt-4 space-y-3">
      <ClayCard size="sm">
        <p className="text-sm font-bold">Add a source</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Source name" aria-label="Source name" className="clay-inset rounded-2xl px-4 py-2 text-sm" />
          <input value={feed} onChange={(e) => setFeed(e.target.value)} placeholder="Feed URL" aria-label="Feed URL" className="clay-inset rounded-2xl px-4 py-2 text-sm" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" aria-label="Category" className="clay-inset rounded-2xl px-4 py-2 text-sm" />
        </div>
        <ClayButton
          size="sm"
          className="mt-3"
          onClick={async () => {
            try {
              await caAddSource({ data: { sourceName: name, sourceUrl: "", feedUrl: feed, category } });
              setName("");
              setFeed("");
              toast.success("Source added");
              onChanged();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Could not add source");
            }
          }}
          disabled={!name || !feed}
        >
          Add source
        </ClayButton>
      </ClayCard>

      {rows.map((s) => (
        <ClayCard key={s.id} size="sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold">{s.source_name}</p>
              <p className="truncate text-xs text-muted-foreground">{s.feed_url}</p>
              <p className="text-xs text-muted-foreground">
                {s.category} · last fetched {s.last_fetched_at ? new Date(s.last_fetched_at).toLocaleString() : "never"}
              </p>
              {s.last_error ? <p className="text-xs text-destructive">Error: {s.last_error}</p> : null}
            </div>
            <ClayButton
              size="sm"
              variant={s.active ? "ghost" : "primary"}
              onClick={async () => {
                await caToggleSource({ data: { id: s.id, active: !s.active } });
                onChanged();
              }}
            >
              {s.active ? "Disable" : "Enable"}
            </ClayButton>
          </div>
        </ClayCard>
      ))}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "clay-sm clay-press inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold capitalize",
        active ? "bg-primary/30" : "bg-card text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}