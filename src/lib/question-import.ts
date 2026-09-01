import { z } from "zod";

/** Row shape matching the existing public.questions table. */
export const importRowSchema = z.object({
  question: z.string().trim().min(10).max(4000),
  options: z.array(z.string().trim().min(1).max(1000)).min(2).max(6),
  correct_answer: z.number().int().min(0),
  explanation: z.string().trim().max(4000).default(""),
  subject: z.string().trim().min(1).max(120),
  topic: z.string().trim().max(160).default(""),
  subtopic: z.string().trim().max(160).default(""),
  topic_id: z.string().trim().max(160).default(""),
  difficulty: z.enum(["Easy", "Medium", "Hard", "UPSC Standard"]).default("Medium"),
  language: z.string().trim().max(40).default("English"),
  exam: z.string().trim().max(60).default("UPSC Prelims"),
  year: z.number().int().min(1900).max(2100).nullable().default(null),
  marks: z.number().default(2),
  negative_marks: z.number().default(0.66),
  question_type: z.string().trim().max(60).default("MCQ"),
  question_source: z.string().trim().max(60).default("Manual Import"),
  status: z.enum(["draft", "approved", "rejected"]).default("approved"),
  tags: z.array(z.string().trim().max(60)).max(20).default([]),
  solving_seconds: z.number().int().min(15).max(600).default(60),
  source_type: z.string().trim().max(40).default("Static"),
  source_url: z.string().trim().max(500).nullable().default(null),
});

export type ImportRow = z.infer<typeof importRowSchema>;

export type ValidRow = { index: number; row: ImportRow; key: string };
export type InvalidRow = { index: number; reason: string; preview: string };

/** Same normalisation as the DB's generated question_key column. */
export function normaliseKey(question: string) {
  return question.toLowerCase().replace(/[^a-zA-Z0-9]+/g, " ");
}

function pick(obj: Record<string, unknown>, ...keys: string[]) {
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  return undefined;
}

const DIFFICULTIES = ["Easy", "Medium", "Hard", "UPSC Standard"];

/** Map a loose JSON object onto the existing questions schema. */
function normalise(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return raw;
  const o = raw as Record<string, unknown>;

  const optionsRaw = pick(o, "options", "choices", "answers");
  let options: string[] = [];
  if (Array.isArray(optionsRaw)) options = optionsRaw.map((x) => String(x));
  else if (optionsRaw && typeof optionsRaw === "object")
    options = Object.values(optionsRaw as Record<string, unknown>).map((x) => String(x));

  const answerRaw = pick(o, "correct_answer", "correctAnswer", "answer", "answerIndex", "correct_option");
  let correct = -1;
  if (typeof answerRaw === "number") correct = answerRaw;
  else if (typeof answerRaw === "string") {
    const s = answerRaw.trim();
    const byText = options.findIndex((opt) => opt.trim().toLowerCase() === s.toLowerCase());
    if (byText >= 0) correct = byText;
    else if (/^[A-Ha-h]$/.test(s)) correct = s.toUpperCase().charCodeAt(0) - 65;
    else if (/^\d+$/.test(s)) correct = Number(s);
  }
  // Tolerate 1-based indexes when 0-based would be out of range.
  if (correct === options.length && correct > 0) correct -= 1;

  const diffRaw = String(pick(o, "difficulty", "level") ?? "Medium").trim();
  const difficulty =
    DIFFICULTIES.find((d) => d.toLowerCase() === diffRaw.toLowerCase()) ?? "Medium";

  const tagsRaw = pick(o, "tags", "keywords");

  return {
    question: String(pick(o, "question", "question_text", "stem") ?? ""),
    options,
    correct_answer: correct,
    explanation: String(pick(o, "explanation", "solution", "reason") ?? ""),
    subject: String(pick(o, "subject") ?? ""),
    topic: String(pick(o, "topic") ?? ""),
    subtopic: String(pick(o, "subtopic") ?? ""),
    topic_id: String(pick(o, "topic_id", "topicId") ?? ""),
    difficulty,
    language: String(pick(o, "language") ?? "English"),
    exam: String(pick(o, "exam") ?? "UPSC Prelims"),
    year: typeof o["year"] === "number" ? o["year"] : null,
    marks: typeof o["marks"] === "number" ? o["marks"] : 2,
    negative_marks:
      typeof pick(o, "negative_marks", "negativeMarks") === "number"
        ? (pick(o, "negative_marks", "negativeMarks") as number)
        : 0.66,
    question_type: String(pick(o, "question_type", "questionType", "type") ?? "MCQ"),
    question_source: String(pick(o, "question_source") ?? "Manual Import"),
    status: String(pick(o, "status") ?? "approved"),
    tags: Array.isArray(tagsRaw) ? tagsRaw.map((t) => String(t)) : [],
    solving_seconds:
      typeof pick(o, "solving_seconds", "solvingSeconds") === "number"
        ? (pick(o, "solving_seconds", "solvingSeconds") as number)
        : 60,
    source_type: String(pick(o, "source_type") ?? "Static"),
    source_url: typeof pick(o, "source_url") === "string" ? String(pick(o, "source_url")) : null,
  };
}

export type ParseResult = {
  valid: ValidRow[];
  invalid: InvalidRow[];
  duplicateInFile: number;
};

/** Parse + validate a JSON payload into rows ready for the questions table. */
export function parseQuestionFile(text: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`File is not valid JSON: ${e instanceof Error ? e.message : "parse error"}`);
  }
  const list = Array.isArray(json)
    ? json
    : typeof json === "object" && json !== null && Array.isArray((json as { questions?: unknown }).questions)
      ? ((json as { questions: unknown[] }).questions)
      : null;
  if (!list) throw new Error('JSON must be an array of questions, or an object with a "questions" array.');

  const valid: ValidRow[] = [];
  const invalid: InvalidRow[] = [];
  const seen = new Set<string>();
  let duplicateInFile = 0;

  list.forEach((raw, index) => {
    const preview =
      typeof raw === "object" && raw !== null
        ? String((raw as Record<string, unknown>)["question"] ?? "").slice(0, 120)
        : String(raw).slice(0, 120);
    const parsed = importRowSchema.safeParse(normalise(raw));
    if (!parsed.success) {
      invalid.push({
        index,
        preview,
        reason: parsed.error.issues.map((i) => `${i.path.join(".") || "root"}: ${i.message}`).join("; "),
      });
      return;
    }
    const row = parsed.data;
    if (row.correct_answer >= row.options.length) {
      invalid.push({ index, preview, reason: "correct_answer does not match any option" });
      return;
    }
    if (new Set(row.options.map((o) => o.toLowerCase())).size !== row.options.length) {
      invalid.push({ index, preview, reason: "duplicate options in the same question" });
      return;
    }
    const key = normaliseKey(row.question);
    if (seen.has(key)) {
      duplicateInFile += 1;
      invalid.push({ index, preview, reason: "duplicate question inside this file (skipped)" });
      return;
    }
    seen.add(key);
    valid.push({ index, row, key });
  });

  return { valid, invalid, duplicateInFile };
}
