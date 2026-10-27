// The 30-second reflection after a talk (FR7). Saved ONLY on this phone: never sent to the AI,
// to Supabase, or anywhere else. Text that mentions a danger sign is not saved at all.
import type { TopicId } from "./topics";

export type Happened = "yes" | "partly" | "not-yet";
export type WhoTalked = "me" | "teen" | "equal";
export type Feeling = "good" | "okay" | "hard";

export type Reflection = {
  planId: string;
  topic: TopicId;
  happened: Happened;
  discussed: string;
  whoTalked?: WhoTalked;
  learned: string;
  feeling?: Feeling;
  helpOffered: boolean; // a danger sign was spotted and help was offered (the text itself was dropped)
  createdAt: string;
  followUpDue?: string; // 3 days later (FR8)
  followUpAnswer?: string;
  gotInTheWay?: string; // "Not yet": what the parent said got in the way (a fixed choice, no free text)
};

export function updateReflection(planId: string, change: Partial<Reflection>): void {
  try {
    const all = loadReflections().map((r) => (r.planId === planId ? { ...r, ...change } : r));
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}

const KEY = "raise.reflections";
const FOLLOW_UP_DAYS = 3;

export function loadReflections(): Reflection[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Reflection[];
  } catch {
    return [];
  }
}

export function saveReflection(r: Omit<Reflection, "createdAt" | "followUpDue">): Reflection {
  const now = new Date();
  const full: Reflection = {
    ...r,
    createdAt: now.toISOString(),
    // A follow-up only makes sense after a talk that happened, and never after a crisis.
    followUpDue:
      r.happened !== "not-yet" && !r.helpOffered ? new Date(now.getTime() + FOLLOW_UP_DAYS * 86_400_000).toISOString() : undefined,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify([...loadReflections().filter((x) => x.planId !== r.planId), full]));
  } catch {}
  return full;
}
