import { createFileRoute } from "@tanstack/react-router";
import { BookmarkPlus, FileDown, Newspaper } from "lucide-react";
import { toast } from "sonner";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { useStudy } from "@/context/StudyContext";
import { currentAffairs, editorials, monthlyCompilations } from "@/data/currentAffairs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/current-affairs")({
  head: () => ({
    meta: [
      { title: "Current Affairs — Daily Briefs & Monthly PDFs | UPSC Clay" },
      {
        name: "description",
        content:
          "Daily UPSC current affairs briefs with prelims pointers and mains angles, monthly compilations, editorial notes and read-later bookmarking.",
      },
      { property: "og:title", content: "UPSC Current Affairs" },
      { property: "og:description", content: "Daily briefs, monthly PDFs and editorial notes." },
    ],
  }),
  component: CurrentAffairsPage,
});

function CurrentAffairsPage() {
  const { readLater, toggleReadLater } = useStudy();
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-6">
      <h1 className="text-balance-tight text-3xl font-extrabold md:text-4xl">Current Affairs</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        One short read a day, linked back to the static syllabus.
      </p>

      <div className="mt-7 space-y-4">
        {currentAffairs.map((n) => (
          <ClayCard key={n.id}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <span className="clay-sm inline-block rounded-full bg-secondary/50 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide">
                  {n.category}
                </span>
                <h2 className="mt-3 text-base font-bold leading-snug">{n.title}</h2>
                <p className="text-xs text-muted-foreground">{n.date}</p>
              </div>
              <button
                onClick={() => {
                  toggleReadLater(n.id);
                  toast.success(readLater.includes(n.id) ? "Removed from read later" : "Saved for later");
                }}
                aria-pressed={readLater.includes(n.id)}
                aria-label={`Save ${n.title} for later`}
                className="clay-press grid size-11 shrink-0 place-items-center rounded-[16px] bg-card shadow-[var(--clay-shadow-sm)]"
              >
                <BookmarkPlus
                  className={cn("size-4", readLater.includes(n.id) && "text-primary")}
                  aria-hidden="true"
                />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{n.summary}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="clay-inset p-4 text-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Prelims pointer</p>
                <p className="mt-1.5">{n.prelimsPointer}</p>
              </div>
              <div className="clay-inset p-4 text-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Mains angle</p>
                <p className="mt-1.5">{n.mainsAngle}</p>
              </div>
            </div>
          </ClayCard>
        ))}
      </div>

      <section aria-labelledby="pdfs" className="mt-10">
        <h2 id="pdfs" className="text-xl font-bold">Monthly compilations</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {monthlyCompilations.map((m) => (
            <ClayCard key={m.id} size="sm">
              <p className="font-bold">{m.month}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.pages} pages · {m.highlights}</p>
              <ClayButton
                size="sm"
                variant="ghost"
                className="mt-4"
                onClick={() => toast.success(`${m.month} compilation ready`)}
              >
                <FileDown className="size-4" aria-hidden="true" /> Download PDF
              </ClayButton>
            </ClayCard>
          ))}
        </div>
      </section>

      <section aria-labelledby="editorials" className="mt-10">
        <h2 id="editorials" className="text-xl font-bold">Editorial notes</h2>
        <div className="mt-4 space-y-3">
          {editorials.map((e) => (
            <ClayCard key={e.id} size="sm">
              <p className="flex items-center gap-2 font-semibold">
                <Newspaper className="size-4 text-primary" aria-hidden="true" />
                {e.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{e.source} · {e.takeaway}</p>
            </ClayCard>
          ))}
        </div>
      </section>
    </div>
  );
}