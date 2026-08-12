const KEY = "upsc-clay-plan";

/**
 * Current subscription tier. The daily quiz and limited current-affairs
 * practice are free; the wider current-affairs bank is Quest Plus.
 */
export function isQuestPlus() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "plus";
  } catch {
    return false;
  }
}