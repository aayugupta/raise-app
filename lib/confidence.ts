// Parent confidence, 1–5, using the parent survey's question (Q14), so it compares with the
// survey baseline (2.8 / 5 for parents putting a talk off). Saved on the phone; only the
// number goes out as an anonymous event. This is the Step 6 leading indicator.
import { track } from "./events";

export const CONFIDENCE_QUESTION = "How confident do you feel about starting a hard talk with your child?";
export const CONFIDENCE_AFTER_QUESTION = "How confident do you feel about your next talk?";

export const CONFIDENCE_SCALE: { value: number; label: string }[] = [
  { value: 1, label: "Not at all" },
  { value: 2, label: "A little" },
  { value: 3, label: "Somewhat" },
  { value: 4, label: "Quite" },
  { value: 5, label: "Very" },
];

export type ConfidenceEntry = { value: number; at: string; when: "setup" | "after_talk" };

const KEY = "raise.confidence";

export function loadConfidence(): ConfidenceEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as ConfidenceEntry[];
  } catch {
    return [];
  }
}

export function recordConfidence(value: number, when: ConfidenceEntry["when"]): void {
  if (!Number.isInteger(value) || value < 1 || value > 5) return;
  try {
    localStorage.setItem(KEY, JSON.stringify([...loadConfidence(), { value, at: new Date().toISOString(), when }]));
  } catch {}
  track("confidence_rated", { value: String(value), when });
}

// Before = the first rating (setup); now = the latest rating after a talk.
export function confidenceChange(entries: ConfidenceEntry[]): { before?: number; now?: number } {
  const before = entries.find((e) => e.when === "setup")?.value;
  const after = entries.filter((e) => e.when === "after_talk");
  return { before, now: after.length ? after[after.length - 1].value : undefined };
}
