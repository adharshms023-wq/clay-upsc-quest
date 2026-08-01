import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Clock, FileText, Minus, NotebookPen, Plus } from "lucide-react";
import { toast } from "sonner";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayProgress } from "@/components/clay/ClayProgress";
import { useStudy } from "@/context/StudyContext";
import { mainsSubjects, prelimsSubjects, type SyllabusSubject } from "@/data/syllabus";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/syllabus")({
  head: () => ({
    meta: [
      { title: "UPSC Syllabus Tracker — Prelims & Mains | UPSC Clay" },
      {
        name: "description",
        content:
          "Work through the full UPSC Prelims and Mains syllabus with completion checkboxes, study hours, personal notes and automatic progress saving.",
      },
      { property: "og:title", content: "UPSC Syllabus Tracker — Prelims & Mains" },
      {
        property: "og:description",
        content: "Track every Prelims and Mains topic with notes, hours and progress.",
      },
    ],
  }),
  component: SyllabusPage,
});

function SyllabusPage() {
  const [tab, setTab] = useState<"prelims" | "mains">("prelims");
  const subjects = tab === "prelims" ? prelimsSubjects : mainsSubjects;
  const { topics } = useStudy();

  const overall = useMemo(() => {
    const ids = subjects.flatMap((s) => s.topics.map((t) => t.id));
    const done = ids.filter((id) => topics[id]?.completed).length;
    return ids.length ? (done / ids.length) * 100 : 0;
  }, [subjects, topics]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-6">
      <h1 className="text-balance-tight text-3xl font-extrabold md:text-4xl">UPSC Syllabus</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Expand any topic to mark completion, log study hours and keep private notes. Everything
        saves automatically on this device.
      </p>

      <div className="clay-sm mt-6 flex gap-1 rounded-full p-1.5" role="tablist" aria-label="Syllabus stage">
        {(["prelims", "mains"] as const).map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "min-h-11 flex-1 rounded-full text-sm font-semibold capitalize transition-all duration-200",
              tab === key ? "bg-primary/30 shadow-[var(--clay-shadow-sm)]" : "text-muted-foreground",
            )}
          >
            {key}
          </button>
        ))}
      </div>

      <ClayCard size="sm" className="mt-5">
        <ClayProgress value={overall} label={`${tab === "prelims" ? "Prelims" : "Mains"} completion`} />
      </ClayCard>

      <div id={tab} className="mt-6 space-y-4">
        {subjects.map((s) => (
          <SubjectCard key={s.id} subject={s} />
        ))}
      </div>
    </div>
  );
}

function SubjectCard({ subject }: { subject: SyllabusSubject }) {
  const [open, setOpen] = useState(false);
  const { topics } = useStudy();
  const done = subject.topics.filter((t) => topics[t.id]?.completed).length;
  const pct = (done / subject.topics.length) * 100;

  return (
    <ClayCard className="overflow-hidden p-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-5 text-left transition-colors duration-200 hover:bg-muted/50 md:p-6"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold">{subject.name}</h2>
            <span className="clay-sm rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold text-muted-foreground">
              {done}/{subject.topics.length}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">{subject.blurb}</p>
          <ClayProgress value={pct} className="mt-3" tone={pct === 100 ? "success" : "primary"} />
        </div>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-5 shrink-0 transition-transform duration-300", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-5 pb-5 md:px-6 md:pb-6">
              {subject.topics.map((t) => (
                <TopicRow key={t.id} topic={t} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClayCard>
  );
}

function TopicRow({ topic }: { topic: SyllabusSubject["topics"][number] }) {
  const { topics, toggleTopic, setTopicHours, setTopicNotes } = useStudy();
  const [showNotes, setShowNotes] = useState(false);
  const state = topics[topic.id] ?? { completed: false, hours: 0, notes: "" };

  return (
    <div className="clay-inset rounded-[22px] p-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <button
          onClick={() => {
            toggleTopic(topic.id);
            toast.success(state.completed ? "Marked as pending" : `${topic.title} completed`);
          }}
          aria-pressed={state.completed}
          aria-label={`Mark ${topic.title} as ${state.completed ? "pending" : "complete"}`}
          className={cn(
            "clay-press grid size-11 shrink-0 place-items-center rounded-[16px] shadow-[var(--clay-shadow-sm)] transition-colors",
            state.completed ? "bg-success text-success-foreground" : "bg-card",
          )}
        >
          <Check className={cn("size-5", !state.completed && "opacity-25")} aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <h3 className={cn("font-semibold", state.completed && "text-muted-foreground line-through")}>
            {topic.title}
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {topic.points.map((p) => (
              <li key={p} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="clay-sm flex items-center gap-1 rounded-full bg-card p-1">
              <button
                aria-label={`Decrease study hours for ${topic.title}`}
                onClick={() => setTopicHours(topic.id, state.hours - 0.5)}
                className="grid size-9 place-items-center rounded-full hover:bg-muted"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <span className="flex items-center gap-1.5 px-2 text-sm font-semibold tabular-nums">
                <Clock className="size-3.5 text-primary" aria-hidden="true" />
                {state.hours}h
              </span>
              <button
                aria-label={`Increase study hours for ${topic.title}`}
                onClick={() => setTopicHours(topic.id, state.hours + 0.5)}
                className="grid size-9 place-items-center rounded-full hover:bg-muted"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
            <ClayButton variant="ghost" size="sm" onClick={() => setShowNotes((s) => !s)}>
              <NotebookPen className="size-4" aria-hidden="true" />
              {state.notes ? "Edit notes" : "Add notes"}
            </ClayButton>
          </div>

          <AnimatePresence initial={false}>
            {showNotes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.24 }}
                className="overflow-hidden"
              >
                <label className="sr-only" htmlFor={`notes-${topic.id}`}>
                  Notes for {topic.title}
                </label>
                <textarea
                  id={`notes-${topic.id}`}
                  value={state.notes}
                  onChange={(e) => setTopicNotes(topic.id, e.target.value)}
                  rows={3}
                  placeholder="Key takeaways, doubts, revision reminders…"
                  className="clay-sm mt-3 w-full resize-y bg-card p-3 text-sm outline-none placeholder:text-muted-foreground"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 flex flex-wrap gap-2">
            {topic.resources.map((r) => (
              <span
                key={r.label}
                title={r.note}
                className="clay-sm inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-medium"
              >
                <FileText className="size-3.5 text-primary" aria-hidden="true" />
                {r.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}