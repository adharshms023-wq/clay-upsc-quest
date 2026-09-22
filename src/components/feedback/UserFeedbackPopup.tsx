import { useEffect, useState } from "react";
import {
  Bot,
  BookOpen,
  ChartNoAxesCombined,
  FileSearch,
  Lightbulb,
  Loader2,
  Newspaper,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay/ClayButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FEEDBACK_READY_EVENT } from "@/lib/feedback";
import { feedbackOptions, submitUserFeedback } from "@/lib/feedback.functions";
import { cn } from "@/lib/utils";

const STATUS_KEY = "upsc-quest-feedback-v1";
const ANONYMOUS_ID_KEY = "upsc-quest-anonymous-id-v1";

type FeedbackOption = (typeof feedbackOptions)[number];

const optionIcons: Record<FeedbackOption, LucideIcon> = {
  "Current Affairs": Newspaper,
  "UPSC Notes": BookOpen,
  "PYQ Analysis": FileSearch,
  "Mains Answer Writing": PenLine,
  "Personal Progress": ChartNoAxesCombined,
  "AI Study Assistant": Bot,
  "Something Else": Lightbulb,
};

function getAnonymousId() {
  const existing = window.localStorage.getItem(ANONYMOUS_ID_KEY);
  if (existing) return existing;
  const id = window.crypto.randomUUID();
  window.localStorage.setItem(ANONYMOUS_ID_KEY, id);
  return id;
}

export function UserFeedbackPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState<FeedbackOption[]>([]);
  const [customResponse, setCustomResponse] = useState("");
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const show = () => {
      if (window.localStorage.getItem(STATUS_KEY)) return;
      setOpen(true);
    };
    window.addEventListener(FEEDBACK_READY_EVENT, show);
    return () => window.removeEventListener(FEEDBACK_READY_EVENT, show);
  }, []);

  function remember(status: "dismissed" | "submitted") {
    window.localStorage.setItem(STATUS_KEY, status);
  }

  function close() {
    if (!submitted) remember("dismissed");
    setOpen(false);
  }

  function toggle(option: FeedbackOption) {
    setSelected((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
    );
  }

  async function submit() {
    const custom = customResponse.trim();
    const additional = additionalFeedback.trim();
    if (!selected.length) {
      toast.error("Choose at least one option.");
      return;
    }
    if (selected.includes("Something Else") && !custom) {
      toast.error("Tell us what you would like us to add.");
      return;
    }

    setBusy(true);
    try {
      await submitUserFeedback({
        data: {
          selectedOptions: selected,
          customResponse: custom || null,
          additionalFeedback: additional || null,
          anonymousId: getAnonymousId(),
        },
      });
      remember("submitted");
      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't save your feedback. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <DialogContent
        className="clay-lg inset-x-0 bottom-0 top-auto flex max-h-[92dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom [&>button]:right-3 [&>button]:top-3 [&>button]:grid [&>button]:size-11 [&>button]:place-items-center [&>button]:rounded-full sm:left-1/2 sm:top-1/2 sm:max-h-[88dvh] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px] sm:px-6 sm:pb-6 sm:pt-6 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0"
      >
        {submitted ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-3 py-8 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-primary/25 text-2xl" aria-hidden="true">
              💙
            </span>
            <DialogTitle className="mt-5 text-2xl font-bold">Thank you! 💙</DialogTitle>
            <DialogDescription className="mt-3 max-w-md leading-relaxed">
              Your feedback has been received. We&apos;ll use it to improve UPSC Quest.
            </DialogDescription>
            <ClayButton className="mt-7 min-w-32" onClick={() => setOpen(false)}>
              Done
            </ClayButton>
          </div>
        ) : (
          <>
            <div className="shrink-0 pr-12">
              <DialogTitle className="text-xl font-bold sm:text-2xl">Help us improve UPSC Quest 💙</DialogTitle>
              <DialogDescription className="mt-2 text-sm font-medium text-foreground">
                What would you like to see on UPSC Quest next?
              </DialogDescription>
              <p className="mt-1 text-xs text-muted-foreground">Your feedback helps us decide what to build next.</p>
            </div>

            <div className="-mx-1 mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-2">
              <fieldset>
                <legend className="sr-only">Choose one or more improvements</legend>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {feedbackOptions.map((option) => {
                    const Icon = optionIcons[option];
                    const active = selected.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggle(option)}
                        className={cn(
                          "clay-press flex min-h-16 min-w-0 items-center gap-2.5 rounded-[16px] border p-3 text-left text-xs font-semibold shadow-[var(--clay-shadow-sm)] transition-colors sm:min-h-18 sm:text-sm",
                          active ? "border-primary bg-primary/25 text-foreground" : "border-transparent bg-card text-foreground",
                        )}
                      >
                        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", active ? "bg-primary" : "bg-muted")}>
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 leading-snug">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {selected.includes("Something Else") ? (
                <label className="mt-4 block text-sm font-semibold">
                  What would you like us to add?
                  <Textarea
                    value={customResponse}
                    onChange={(event) => setCustomResponse(event.target.value)}
                    maxLength={500}
                    required
                    placeholder="Tell us what would make UPSC Quest more useful for you..."
                    className="clay-inset mt-2 min-h-24 resize-y border-0 bg-muted/40 text-base sm:text-sm"
                  />
                </label>
              ) : null}

              <label className="mt-4 block text-sm font-semibold">
                Anything else you&apos;d like to tell us?
                <Textarea
                  value={additionalFeedback}
                  onChange={(event) => setAdditionalFeedback(event.target.value)}
                  maxLength={2000}
                  placeholder="Tell us what you like, what we could improve, or any feature you'd love to have."
                  className="clay-inset mt-2 min-h-24 resize-y border-0 bg-muted/40 text-base sm:text-sm"
                />
              </label>
            </div>

            <div className="mt-3 flex shrink-0 items-center gap-3 border-t border-border pt-3">
              <ClayButton type="button" variant="ghost" size="sm" onClick={close} disabled={busy}>
                Maybe later
              </ClayButton>
              <ClayButton type="button" className="min-w-0 flex-1" onClick={() => void submit()} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                Send Feedback
              </ClayButton>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}