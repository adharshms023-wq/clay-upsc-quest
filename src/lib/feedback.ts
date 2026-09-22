export const FEEDBACK_READY_EVENT = "upsc-quest:feedback-ready";

export function requestUserFeedback() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FEEDBACK_READY_EVENT));
}