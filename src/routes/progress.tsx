import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Award, CalendarCheck, Flame, Target, Timer } from "lucide-react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayProgress } from "@/components/clay/ClayProgress";
import { useStudy, todayKey } from "@/context/StudyContext";
import { syllabus, allTopicIds } from "@/data/syllabus";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress Dashboard — Streaks, Goals & Analytics | UPSC Clay" },
      {
        name: "description",
        content:
          "Track daily, weekly and monthly UPSC study goals with streaks, a completion heatmap, subject-wise progress and achievement badges.",
      },
      { property: "og:title", content: "UPSC Progress Dashboard" },
      {
        property: "og:description",
        content: "Streaks, heatmaps, study-time analytics and achievement badges.",
      },
    ],
  }),
  component: ProgressPage,
});

function lastDays(n: number) {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const c = new Date(d);
    c.setDate(d.getDate() - i);
    out.push(c.toISOString().slice(0, 10));
  }
  return out;
}

function ProgressPage() {
  const { studyLog, goals, streak, topics, results, completedCount, hydrated } = useStudy();
  const today = studyLog[todayKey()] ?? 0;
  const days = lastDays(112);
  const week = lastDays(7).reduce((a, d) => a + (studyLog[d] ?? 0), 0);
  const month = lastDays(30).reduce((a, d) => a + (studyLog[d] ?? 0), 0);

  const badges = [
    { label: "First Step", earned: completedCount >= 1, note: "Complete your first topic" },
    { label: "Consistent", earned: streak >= 3, note: "3-day study streak" },
    { label: "Test Taker", earned: results.length >= 1, note: "Attempt a mock test" },
    { label: "Deep Diver", earned: completedCount >= 10, note: "Complete 10 topics" },
    { label: "Marathoner", earned: month >= 40, note: "40 hours in a month" },
    { label: "Sharp Shooter", earned: results.some((r) => r.correct / r.total >= 0.7), note: "Score 70% in a test" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-6">
      <h1 className="text-balance-tight text-3xl font-extrabold md:text-4xl">Progress Dashboard</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Consistency beats intensity. Here is what your last few months actually look like.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Flame, label: "Current streak", value: hydrated ? `${streak}d` : "—" },
          { icon: Timer, label: "Hours this week", value: hydrated ? `${week.toFixed(1)}h` : "—" },
          { icon: Target, label: "Topics done", value: hydrated ? `${completedCount}/${allTopicIds.length}` : "—" },
          { icon: CalendarCheck, label: "Tests taken", value: hydrated ? `${results.length}` : "—" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <ClayCard size="sm">
              <s.icon className="size-5 text-primary" aria-hidden="true" />
              <p className="mt-3 text-2xl font-extrabold tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </ClayCard>
          </motion.div>
        ))}
      </div>

      <ClayCard className="mt-6">
        <h2 className="text-lg font-bold">Goals</h2>
        <div className="mt-5 space-y-5">
          <ClayProgress value={(today / goals.daily) * 100} label={`Daily · ${today.toFixed(1)} / ${goals.daily}h`} />
          <ClayProgress value={(week / goals.weekly) * 100} label={`Weekly · ${week.toFixed(1)} / ${goals.weekly}h`} tone="accent" />
          <ClayProgress value={(month / goals.monthly) * 100} label={`Monthly · ${month.toFixed(1)} / ${goals.monthly}h`} tone="success" />
        </div>
      </ClayCard>

      <ClayCard className="mt-6">
        <h2 className="text-lg font-bold">Completion heatmap</h2>
        <p className="mt-1 text-xs text-muted-foreground">Last 16 weeks of logged study activity.</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {days.map((d) => {
            const h = studyLog[d] ?? 0;
            const level = h === 0 ? 0 : h < 1 ? 1 : h < 3 ? 2 : h < 5 ? 3 : 4;
            return (
              <span
                key={d}
                title={`${d}: ${h}h`}
                className={cn(
                  "size-4 rounded-[6px]",
                  ["clay-inset", "bg-secondary/50", "bg-secondary", "bg-success", "bg-primary"][level],
                )}
              />
            );
          })}
        </div>
      </ClayCard>

      <ClayCard className="mt-6">
        <h2 className="text-lg font-bold">Subject-wise progress</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {syllabus.map((s) => {
            const done = s.topics.filter((t) => topics[t.id]?.completed).length;
            return (
              <ClayProgress
                key={s.id}
                value={(done / s.topics.length) * 100}
                label={`${s.name} (${s.paper})`}
                tone={done === s.topics.length ? "success" : "primary"}
              />
            );
          })}
        </div>
      </ClayCard>

      <ClayCard className="mt-6">
        <h2 className="text-lg font-bold">Achievements</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
          {badges.map((b) => (
            <div
              key={b.label}
              className={cn(
                "clay-sm flex flex-col items-center gap-2 p-4 text-center transition-opacity",
                b.earned ? "bg-accent/40" : "bg-card opacity-55",
              )}
            >
              <Award className={cn("size-6", b.earned ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
              <p className="text-sm font-bold">{b.label}</p>
              <p className="text-[0.7rem] text-muted-foreground">{b.note}</p>
            </div>
          ))}
        </div>
      </ClayCard>
    </div>
  );
}