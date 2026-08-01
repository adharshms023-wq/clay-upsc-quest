import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bookmark, Download, Eye, FileSearch, History, Search, X } from "lucide-react";
import { toast } from "sonner";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { useStudy } from "@/context/StudyContext";
import {
  resources,
  resourceSubjects,
  resourceTypes,
  resourceYears,
  type Resource,
} from "@/data/resources";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources Hub — NCERTs, Notes & PYQs | UPSC Clay" },
      {
        name: "description",
        content:
          "Search and filter NCERTs, standard reference books, study notes, previous year papers and current affairs compilations for UPSC preparation.",
      },
      { property: "og:title", content: "UPSC Resources Hub" },
      {
        property: "og:description",
        content: "Searchable NCERTs, standard books, notes, PYQs and revision material.",
      },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");
  const [year, setYear] = useState("All");
  const [type, setType] = useState("All");
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [preview, setPreview] = useState<Resource | null>(null);
  const { bookmarks, toggleBookmark, recentlyViewed, markViewed } = useStudy();

  const filtered = useMemo(
    () =>
      resources.filter((r) => {
        const q = query.trim().toLowerCase();
        return (
          (!q ||
            r.title.toLowerCase().includes(q) ||
            r.author.toLowerCase().includes(q) ||
            r.summary.toLowerCase().includes(q)) &&
          (subject === "All" || r.subject === subject) &&
          (year === "All" || r.year === year) &&
          (type === "All" || r.type === type) &&
          (!onlyBookmarks || bookmarks.includes(r.id))
        );
      }),
    [query, subject, year, type, onlyBookmarks, bookmarks],
  );

  const recent = recentlyViewed
    .map((id) => resources.find((r) => r.id === id))
    .filter((r): r is Resource => Boolean(r));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6">
      <h1 className="text-balance-tight text-3xl font-extrabold md:text-4xl">Resources Hub</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Everything worth reading, in one shelf. Bookmark what matters and pick it up later.
      </p>

      <ClayCard className="mt-6">
        <div className="clay-inset flex items-center gap-3 rounded-full px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <label className="sr-only" htmlFor="resource-search">
            Search resources
          </label>
          <input
            id="resource-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, notes, papers…"
            className="min-h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <FilterSelect label="Subject" value={subject} onChange={setSubject} options={resourceSubjects} />
          <FilterSelect label="Type" value={type} onChange={setType} options={resourceTypes} />
          <FilterSelect label="Year" value={year} onChange={setYear} options={resourceYears} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ClayButton
            size="sm"
            variant={onlyBookmarks ? "primary" : "ghost"}
            onClick={() => setOnlyBookmarks((v) => !v)}
            aria-pressed={onlyBookmarks}
          >
            <Bookmark className="size-4" aria-hidden="true" />
            Bookmarked ({bookmarks.length})
          </ClayButton>
          <span className="text-xs text-muted-foreground">{filtered.length} results</span>
        </div>
      </ClayCard>

      {recent.length > 0 && (
        <section aria-labelledby="recent-heading" className="mt-8">
          <h2 id="recent-heading" className="flex items-center gap-2 text-sm font-bold">
            <History className="size-4 text-primary" aria-hidden="true" /> Recently viewed
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {recent.map((r) => (
              <button
                key={r.id}
                onClick={() => setPreview(r)}
                className="clay-sm clay-press bg-card px-4 py-2 text-xs font-medium"
              >
                {r.title}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              <ClayCard className="flex h-full flex-col">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <span className="clay-sm inline-block rounded-full bg-accent/50 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide">
                      {r.type}
                    </span>
                    <h2 className="mt-3 text-base font-bold leading-snug">{r.title}</h2>
                    <p className="text-xs text-muted-foreground">
                      {r.author} · {r.subject} · {r.year}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      toggleBookmark(r.id);
                      toast.success(bookmarks.includes(r.id) ? "Bookmark removed" : "Bookmarked");
                    }}
                    aria-pressed={bookmarks.includes(r.id)}
                    aria-label={`Bookmark ${r.title}`}
                    className="clay-press grid size-11 shrink-0 place-items-center rounded-[16px] bg-card shadow-[var(--clay-shadow-sm)]"
                  >
                    <Bookmark
                      className={cn("size-4", bookmarks.includes(r.id) && "fill-primary text-primary")}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{r.summary}</p>
                <div className="mt-5 flex gap-2">
                  <ClayButton
                    size="sm"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setPreview(r);
                      markViewed(r.id);
                    }}
                  >
                    <Eye className="size-4" aria-hidden="true" />
                    Preview
                  </ClayButton>
                  <ClayButton
                    size="sm"
                    className="flex-1"
                    onClick={() => toast.success(`Preparing "${r.title}" for offline reading`)}
                  >
                    <Download className="size-4" aria-hidden="true" />
                    Download
                  </ClayButton>
                </div>
              </ClayCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <ClayCard size="lg" className="mt-8 text-center">
          <FileSearch className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold">Nothing matches those filters</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a broader search term or clear the subject and year filters.
          </p>
          <ClayButton
            className="mt-5"
            onClick={() => {
              setQuery("");
              setSubject("All");
              setYear("All");
              setType("All");
              setOnlyBookmarks(false);
            }}
          >
            Clear filters
          </ClayButton>
        </ClayCard>
      )}

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-foreground/25 p-4 backdrop-blur-sm"
            onClick={() => setPreview(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Preview of ${preview.title}`}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="clay-lg w-full max-w-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold">{preview.title}</h2>
                <button
                  onClick={() => setPreview(null)}
                  aria-label="Close preview"
                  className="clay-press grid size-11 shrink-0 place-items-center rounded-[16px] bg-card shadow-[var(--clay-shadow-sm)]"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {preview.author} · {preview.pages} pages · {preview.year}
              </p>
              <p className="mt-4 text-sm leading-relaxed">{preview.summary}</p>
              <div className="clay-inset mt-5 space-y-2 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">How to use this</p>
                <p>
                  Skim the contents first, then read actively with the syllabus open beside you. Mark
                  the matching topics complete as you finish each chapter.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground" htmlFor={`f-${label}`}>
        {label}
      </label>
      <select
        id={`f-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="clay-inset min-h-12 w-full appearance-none px-4 text-sm font-medium outline-none"
      >
        <option value="All">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}