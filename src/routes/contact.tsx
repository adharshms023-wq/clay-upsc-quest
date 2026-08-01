import { createFileRoute } from "@tanstack/react-router";
import { ClayCard } from "@/components/clay/ClayCard";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | UPSC Clay" },
      { name: "description", content: "Get in touch — UPSC Clay, a calm preparation workspace for civil services aspirants." },
      { property: "og:title", content: "Contact | UPSC Clay" },
      { property: "og:description", content: "Get in touch — UPSC Clay." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6">
      <h1 className="text-balance-tight text-3xl font-extrabold md:text-4xl">Contact</h1>
      <ClayCard size="lg" className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>Get in touch. UPSC Clay is a distraction-free workspace built around the official syllabus, curated study material, exam-style mock tests and honest progress analytics.</p>
        <p>All of your progress — completed topics, study hours, notes, bookmarks and test results — is stored locally in your own browser. Nothing is uploaded, shared or sold, and clearing your browser storage removes it permanently.</p>
        <p>Questions, corrections or feature requests are always welcome at hello@upscclay.app.</p>
      </ClayCard>
    </div>
  );
}
