import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { useStudy } from "@/context/StudyContext";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile & Study Goals | UPSC Clay" },
      {
        name: "description",
        content: "Set your target attempt, daily, weekly and monthly study goals, and manage locally stored UPSC preparation data.",
      },
      { property: "og:title", content: "Your UPSC Profile & Goals" },
      { property: "og:description", content: "Target attempt, study goals and local data controls." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, setProfile, goals, setGoals, resetAll, streak, completedCount, results } = useStudy();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6">
      <h1 className="text-balance-tight text-3xl font-extrabold md:text-4xl">Profile</h1>

      <ClayCard className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-muted-foreground">Display name</label>
          <input
            id="name"
            value={profile.name}
            onChange={(e) => setProfile({ name: e.target.value })}
            className="clay-inset min-h-12 w-full px-4 text-sm outline-none"
          />
        </div>
        <div>
          <label htmlFor="target" className="mb-1.5 block text-xs font-semibold text-muted-foreground">Target attempt</label>
          <input
            id="target"
            value={profile.target}
            onChange={(e) => setProfile({ target: e.target.value })}
            className="clay-inset min-h-12 w-full px-4 text-sm outline-none"
          />
        </div>
      </ClayCard>

      <ClayCard className="mt-5">
        <h2 className="text-lg font-bold">Study goals (hours)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {(["daily", "weekly", "monthly"] as const).map((k) => (
            <div key={k}>
              <label htmlFor={k} className="mb-1.5 block text-xs font-semibold capitalize text-muted-foreground">{k}</label>
              <input
                id={k}
                type="number"
                min={1}
                value={goals[k]}
                onChange={(e) => setGoals({ [k]: Number(e.target.value) })}
                className="clay-inset min-h-12 w-full px-4 text-sm outline-none"
              />
            </div>
          ))}
        </div>
      </ClayCard>

      <ClayCard className="mt-5">
        <h2 className="text-lg font-bold">Snapshot</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {streak}-day streak · {completedCount} topics completed · {results.length} tests attempted.
        </p>
        <ClayButton
          variant="danger"
          className="mt-5"
          onClick={() => {
            resetAll();
            toast.success("All local study data cleared");
          }}
        >
          Reset all data
        </ClayButton>
      </ClayCard>
    </div>
  );
}