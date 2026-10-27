// The parent's topics and plans. Saved only on this phone.
import type { TopicId } from "./topics";

// ---------- Open topics ("My open topics", FR3): opened but not yet planned ----------

const OPEN_KEY = "raise.openTopics";

export function loadOpenTopics(): TopicId[] {
  try {
    return JSON.parse(localStorage.getItem(OPEN_KEY) ?? "[]") as TopicId[];
  } catch {
    return [];
  }
}

export function addOpenTopic(id: TopicId): void {
  try {
    const topics = loadOpenTopics();
    if (!topics.includes(id)) localStorage.setItem(OPEN_KEY, JSON.stringify([...topics, id]));
  } catch {
    // Storage blocked: the topic just won't be remembered.
  }
}

function removeOpenTopic(id: TopicId): void {
  try {
    localStorage.setItem(OPEN_KEY, JSON.stringify(loadOpenTopics().filter((t) => t !== id)));
  } catch {}
}

// ---------- Plans (FR4): a topic, a moment and a time, timestamped ----------

export type MomentId = "walk" | "evening" | "chores" | "meal" | "car";

// Walks and late evenings first: that's when teens say they open up (9 and 7 of 12).
export const MOMENTS: {
  id: MomentId;
  label: string;
  icon: string;
  teensPick?: boolean;
  defaultTime: string; // "HH:MM", 24-hour
  phrase: string; // used in "<phrase> <day> at <time>, I'll start with…"
  calendarTitle: string; // what the calendar shows: never the topic
}[] = [
  { id: "walk", label: "On a walk", icon: "🚶", teensPick: true, defaultTime: "18:30", phrase: "On our walk", calendarTitle: "Your walk" },
  { id: "evening", label: "Late evening, when it's quiet", icon: "🌙", teensPick: true, defaultTime: "21:30", phrase: "On a quiet evening", calendarTitle: "Quiet evening" },
  { id: "chores", label: "Cooking or chores together", icon: "🍳", defaultTime: "19:00", phrase: "While we cook together", calendarTitle: "Cooking together" },
  { id: "meal", label: "During a meal", icon: "🍽️", defaultTime: "20:30", phrase: "Over our meal", calendarTitle: "Meal time" },
  { id: "car", label: "In the car", icon: "🚗", defaultTime: "08:00", phrase: "In the car", calendarTitle: "Car ride" },
];

export type Plan = {
  id: string;
  topic: TopicId;
  moment: MomentId;
  when: string; // ISO date-time of the planned moment
  createdAt: string; // when the plan was made (metric: "Planned")
  reflectedAt?: string; // set once the parent has said how it went
};

// The planned window: from 1 hour before to 3 hours after the planned time.
// Home shows "It's time" inside it, and a start inside it counts as "started on time".
const WINDOW_BEFORE_MS = 60 * 60_000;
const WINDOW_AFTER_MS = 3 * 60 * 60_000;

export type PlanStage = "upcoming" | "now" | "check-in" | "done";

export function planStage(plan: Plan, now = Date.now()): PlanStage {
  if (plan.reflectedAt) return "done";
  const at = new Date(plan.when).getTime();
  if (now < at - WINDOW_BEFORE_MS) return "upcoming";
  if (now <= at + WINDOW_AFTER_MS) return "now";
  return "check-in";
}

export function momentOf(plan: Plan) {
  return MOMENTS.find((m) => m.id === plan.moment)!;
}

const PLANS_KEY = "raise.plans";

export function loadPlans(): Plan[] {
  try {
    return JSON.parse(localStorage.getItem(PLANS_KEY) ?? "[]") as Plan[];
  } catch {
    return [];
  }
}

export function savePlan(plan: Omit<Plan, "id" | "createdAt">): Plan {
  const id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const full: Plan = { ...plan, id, createdAt: new Date().toISOString() };
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify([...loadPlans(), full]));
    removeOpenTopic(plan.topic);
  } catch {
    // Storage blocked: the plan works for this visit only.
  }
  return full;
}
