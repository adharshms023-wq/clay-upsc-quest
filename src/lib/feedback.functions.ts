import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const feedbackOptions = [
  "Current Affairs",
  "UPSC Notes",
  "PYQ Analysis",
  "Mains Answer Writing",
  "Personal Progress",
  "AI Study Assistant",
  "Something Else",
] as const;

const feedbackSchema = z
  .object({
    selectedOptions: z.array(z.enum(feedbackOptions)).min(1).max(feedbackOptions.length),
    customResponse: z.string().trim().max(500).nullable(),
    additionalFeedback: z.string().trim().max(2000).nullable(),
    anonymousId: z.string().uuid(),
  })
  .superRefine((value, context) => {
    if (new Set(value.selectedOptions).size !== value.selectedOptions.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["selectedOptions"], message: "Choose each option only once." });
    }
    if (value.selectedOptions.includes("Something Else") && !value.customResponse) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["customResponse"], message: "Tell us what you would like us to add." });
    }
  });

export const submitUserFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => feedbackSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("Feedback is temporarily unavailable.");

    const response = await fetch(`${url}/rest/v1/user_feedback`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        selected_options: data.selectedOptions,
        custom_response: data.customResponse || null,
        additional_feedback: data.additionalFeedback || null,
        anonymous_id: data.anonymousId,
      }),
    });

    if (!response.ok) throw new Error("We couldn't save your feedback. Please try again.");
    return { ok: true };
  });