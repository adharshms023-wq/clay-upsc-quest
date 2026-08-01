import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  BookOpen,
  CalendarDays,
  Flame,
  GraduationCap,
  Library,
  ScrollText,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayLinkButton } from "@/components/clay/ClayButton";
import { useStudy } from "@/context/StudyContext";
import { allTopicIds } from "@/data/syllabus";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UPSC Clay — Prepare for UPSC Smarter" },
      {
        name: "description",
        content:
          "A calm, claymorphic UPSC workspace: interactive syllabus tracking, curated resources, realistic mock tests and progress analytics.",
      },
      { property: "og:title", content: "UPSC Clay — Prepare for UPSC Smarter" },
      {
        property: "og:description",
        content: "Interactive syllabus, resources, mock tests and analytics for UPSC aspirants.",
      },
    ],
  }),
  component: Landing,
});

const modules = [
  { to: "/syllabus", title: "UPSC Syllabus", copy: "Prelims and Mains, topic by topic.", icon: BookOpen, tone: "primary" as const },
  { to: "/resources", title: "Resources", copy: "NCERTs, standard books and notes.", icon: Library, tone: "secondary" as const },
  { to: "/mock-tests", title: "Mock Tests", copy: "Exam-style tests with analytics.", icon: GraduationCap, tone: "accent" as const },
  { to: "/resources", title: "Previous Papers", copy: "A decade of PYQs, sorted.", icon: ScrollText, tone: "warning" as const },
  { to: "/current-affairs", title: "Current Affairs", copy: "Daily briefs and monthly PDFs.", icon: CalendarDays, tone: "success" as const },
  { to: "/progress", title: "Progress Tracker", copy: "Streaks, heatmaps and goals.", icon: TrendingUp, tone: "primary" as const },
];

function Landing() {
  const { streak, completedCount, results, studyLog, goals, hydrated } = useStudy();
  const weekHours = Object.entries(studyLog)
    .filter(([d]) => Date.now() - new Date(d).getTime() < 7 * 864e5)
    .reduce((a, [, v]) => a + v, 0);

  const stats = [
    { label: "Study Streak", value: `${streak}`, suffix: streak === 1 ? "day" : "days", icon: Flame },
    { label: "Topics Completed", value: `${completedCount}`, suffix: `of ${allTopicIds.length}`, icon: Target },
    { label: "Mock Tests Taken", value: `${results.length}`, suffix: "attempts", icon: Trophy },
    {
      label: "Weekly Progress",
      value: `${Math.min(100, Math.round((weekHours / Math.max(1, goals.weekly)) * 100))}%`,
      suffix: `${weekHours.toFixed(1)}h logged`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <section className="relative overflow-hidden pt-8 pb-4 text-center md:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <span className="clay-sm inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            Built for long, focused study sessions
          </span>
          <h1 className="text-balance-tight mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] md:text-6xl">
            Prepare for UPSC Smarter
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            One calm workspace for the entire journey — track every topic, revise from curated
            material, test yourself honestly, and watch consistency compound.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ClayLinkButton to="/syllabus" size="lg">
              Start Learning
            </ClayLinkButton>
            <ClayLinkButton to="/syllabus" variant="ghost" size="lg" hash="prelims">
              Explore Syllabus
            </ClayLinkButton>
          </div>
        </motion.div>
      </section>

      <section aria-labelledby="stats-heading" className="mt-12">
        <h2 id="stats-heading" className="sr-only">
          Your statistics
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
            >
              <ClayCard size="sm" className="h-full">
                <s.icon className="size-5 text-primary" aria-hidden="true" />
                <p className="mt-3 text-3xl font-extrabold tabular-nums">
                  {hydrated ? s.value : "—"}
                </p>
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.suffix}</p>
              </ClayCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section aria-labelledby="modules-heading" className="mt-16">
        <h2 id="modules-heading" className="text-balance-tight text-2xl font-bold md:text-3xl">
          Everything you need, nothing you don't
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Six focused modules that carry you from the first NCERT to the final revision.
        </p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: 0.04 * i }}
            >
              <ClayLinkButton
                to={m.to}
                variant="ghost"
                className="clay-press h-full w-full flex-col items-start gap-3 rounded-[28px] p-6 text-left"
              >
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-[18px] shadow-[var(--clay-shadow-sm)] ${
                    { primary: "bg-primary/30", secondary: "bg-secondary/50", accent: "bg-accent/50", warning: "bg-warning/40", success: "bg-success/40" }[m.tone]
                  }`}
                >
                  <m.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-lg font-bold">{m.title}</span>
                <span className="text-sm font-normal leading-relaxed text-muted-foreground">
                  {m.copy}
                </span>
              </ClayLinkButton>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}