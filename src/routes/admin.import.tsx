import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileJson, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayProgress } from "@/components/clay/ClayProgress";
import { adminImportQuestions } from "@/lib/admin-import.functions";
import { parseQuestionFile, type ParseResult } from "@/lib/question-import";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/import")({
  head: () => ({
    meta: [
      { title: "Import Questions — Admin Tool | UPSC Clay" },
      {
        name: "description",
        content:
          "Admin-only JSON importer to bulk load UPSC questions into the existing question bank used by Practice and Mock Tests.",
      },
      { property: "og:title", content: "UPSC Clay — Import Questions" },
      { property: "og:description", content: "Bulk import validated UPSC questions from a JSON file." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminImport,
});

const CHUNK = 100;

type Summary = {
  imported: number;
  duplicates: number;
  failures: { question: string; reason: string }[];
};

function AdminImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [parseError, setParseError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);

  const loadFile = useCallback(async (file: File) => {
    setSummary(null);
    setParsed(null);
    setParseError("");
    setFileName(file.name);
    if (!file.name.toLowerCase().endsWith(".json")) {
      setParseError("Please choose a .json file.");
      return;
    }
    try {
      const text = await file.text();
      const result = parseQuestionFile(text);
      setParsed(result);
      toast.success(`${result.valid.length} valid · ${result.invalid.length} invalid`);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Could not read the file.");
    }
  }, []);

  async function runImport() {
    if (!parsed?.valid.length) return;
    setBusy(true);
    setProgress(0);
    const total = parsed.valid.length;
    const acc: Summary = { imported: 0, duplicates: 0, failures: [] };
    try {
      for (let i = 0; i < total; i += CHUNK) {
        const chunk = parsed.valid.slice(i, i + CHUNK).map((v) => v.row);
        const res = await adminImportQuestions({ data: { questions: chunk } });
        acc.imported += res.imported;
        acc.duplicates += res.duplicates;
        acc.failures.push(...res.failures);
        setProgress(Math.min(i + CHUNK, total) / total);
        setSummary({ ...acc, failures: [...acc.failures] });
      }
      toast.success(`Imported ${acc.imported} questions into the bank`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-6 pb-10">
      <h1 className="text-balance-tight text-3xl font-extrabold md:text-4xl">Import Questions</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Temporary admin tool. Upload a JSON file of questions — they are validated, previewed and then written
        straight into the existing question bank used by Practice and Mock Tests.
      </p>

      <ClayCard
        className={cn("mt-6 text-center", dragging && "bg-primary/20")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void loadFile(file);
        }}
      >
        <FileJson className="mx-auto size-8 text-primary" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold">Drag & drop your .json file here</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Array of questions, or an object with a <code>questions</code> array.
        </p>
        <div className="mt-4">
          <ClayButton onClick={() => inputRef.current?.click()} disabled={busy}>
            <Upload className="size-4" aria-hidden="true" /> Choose JSON file
          </ClayButton>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Choose a JSON file of questions"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void loadFile(file);
            e.target.value = "";
          }}
        />
        {fileName ? <p className="mt-3 text-xs text-muted-foreground">{fileName}</p> : null}
      </ClayCard>

      {parseError ? (
        <ClayCard tone="warning" className="mt-4 flex items-start gap-2 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{parseError}</span>
        </ClayCard>
      ) : null}

      {parsed ? (
        <ClayCard className="mt-4">
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <span className="clay-sm rounded-full bg-success/30 px-3 py-1">{parsed.valid.length} valid</span>
            <span className="clay-sm rounded-full bg-warning/30 px-3 py-1">{parsed.invalid.length} invalid</span>
            <span className="clay-sm rounded-full bg-card px-3 py-1 text-muted-foreground">
              {parsed.duplicateInFile} duplicates in file
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ClayButton onClick={runImport} disabled={busy || !parsed.valid.length}>
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              )}
              Import {parsed.valid.length} questions
            </ClayButton>
            {busy ? (
              <span className="text-xs text-muted-foreground">{Math.round(progress * 100)}%</span>
            ) : null}
          </div>
          {busy ? <ClayProgress className="mt-3" value={Math.round(progress * 100)} /> : null}
        </ClayCard>
      ) : null}

      {summary ? (
        <ClayCard tone="success" className="mt-4 text-sm">
          <p className="font-bold">
            Imported {summary.imported} · {summary.duplicates} duplicates skipped · {summary.failures.length} failed
          </p>
          {summary.failures.length ? (
            <ul className="mt-2 space-y-1 text-xs">
              {summary.failures.slice(0, 20).map((f, i) => (
                <li key={`${f.question}-${i}`}>
                  <span className="font-semibold">{f.question}</span> — {f.reason}
                </li>
              ))}
            </ul>
          ) : null}
        </ClayCard>
      ) : null}

      {parsed?.invalid.length ? (
        <ClayCard tone="warning" className="mt-4">
          <p className="text-sm font-bold">Invalid questions ({parsed.invalid.length})</p>
          <ul className="mt-2 space-y-1 text-xs">
            {parsed.invalid.slice(0, 50).map((row) => (
              <li key={row.index}>
                <span className="font-semibold">#{row.index + 1}</span> {row.preview || "(no question text)"} —{" "}
                {row.reason}
              </li>
            ))}
          </ul>
          {parsed.invalid.length > 50 ? (
            <p className="mt-2 text-xs text-muted-foreground">…and {parsed.invalid.length - 50} more.</p>
          ) : null}
        </ClayCard>
      ) : null}

      {parsed?.valid.length ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-bold">Preview (first 20 of {parsed.valid.length})</p>
          {parsed.valid.slice(0, 20).map((v) => (
            <ClayCard key={v.key}>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {v.row.subject} · {v.row.topic || "—"} · {v.row.question_type} · {v.row.difficulty}
              </p>
              <p className="mt-2 text-sm font-semibold">{v.row.question}</p>
              <ol className="mt-2 space-y-1 text-sm">
                {v.row.options.map((o, oi) => (
                  <li key={o} className={cn(oi === v.row.correct_answer && "font-bold text-success")}>
                    {String.fromCharCode(65 + oi)}. {o}
                  </li>
                ))}
              </ol>
              {v.row.explanation ? (
                <p className="mt-2 text-xs text-muted-foreground">{v.row.explanation}</p>
              ) : null}
            </ClayCard>
          ))}
        </div>
      ) : null}
    </div>
  );
}
