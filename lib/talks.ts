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

// ---------- 14-day journey (28 Oct 2026): when each topic was started ----------
// A topic starts the first time its card is opened (or it is picked in setup). Day 1 is that day.
// The metric counts a topic as completed if a reflection is saved within 14 days of this.

const STARTS_KEY = "raise.topicStarts";
export const JOURNEY_DAYS = 14;

export function loadTopicStarts(): Partial<Record<TopicId, string>> {
  try {
    return JSON.parse(localStorage.getItem(STARTS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function markTopicStarted(id: TopicId): void {
  try {
    const starts = loadTopicStarts();
    if (!starts[id]) localStorage.setItem(STARTS_KEY, JSON.stringify({ ...starts, [id]: new Date().toISOString() }));
  } catch {}
}

// After a reflection the journey is finished; opening the topic again starts a new one.
export function clearTopicStart(id: TopicId): void {
  try {
    const { [id]: _, ...rest } = loadTopicStarts();
    localStorage.setItem(STARTS_KEY, JSON.stringify(rest));
  } catch {}
}

// "Day 5 of 14". Day 1 is the start day; after day 14 it stays at 14 (never "failed" or "overdue").
export function journeyDay(startedAt: string, now = Date.now()): number {
  const start = new Date(startedAt);
  start.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const day = Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.min(Math.max(day, 1), JOURNEY_DAYS);
}

export function addOpenTopic(id: TopicId): void {
  // Already planned and not yet reflected on: the plan is the journey, so it isn't "open" again.
  if (loadPlans().some((p) => p.topic === id && !p.reflectedAt && !p.closedAt)) return;
  markTopicStarted(id);
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
  startedAt?: string; // Talk mode "Start"
  doneAt?: string; // Talk mode "Done"
  reflectedAt?: string; // set once the parent has said how it went
  closedAt?: string; // "Not yet": this moment is closed, the topic goes to recovery
  unplanned?: boolean; // logged afterwards with "I had a talk": it already happened
};

// A talk that happened without a plan. Saved as already done, so it goes straight to reflection.
export function logUnplannedTalk(topic: TopicId, moment: MomentId, when: Date): Plan {
  const plan = savePlan({ topic, moment, when: when.toISOString() });
  return updatePlan(plan.id, { unplanned: true, doneAt: when.toISOString() }) ?? plan;
}

export function loadPlan(id: string): Plan | undefined {
  return loadPlans().find((p) => p.id === id);
}

export function updatePlan(id: string, change: Partial<Plan>): Plan | undefined {
  const plans = loadPlans();
  const i = plans.findIndex((p) => p.id === id);
  if (i === -1) return undefined;
  plans[i] = { ...plans[i], ...change };
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  } catch {}
  return plans[i];
}

// Metric, step 2 (FR6): "Start" tapped inside the planned window, then "Done" at least 5 minutes later.
// Recorded quietly; never shown to the parent as a pass or fail.
const MIN_TALK_MS = 5 * 60_000;

export function startedOnTime(plan: Plan): boolean {
  if (!plan.startedAt || !plan.doneAt) return false;
  const at = new Date(plan.when).getTime();
  const start = new Date(plan.startedAt).getTime();
  const inWindow = start >= at - WINDOW_BEFORE_MS && start <= at + WINDOW_AFTER_MS;
  return inWindow && new Date(plan.doneAt).getTime() - start >= MIN_TALK_MS;
}

// The planned window: from 1 hour before to 3 hours after the planned time.
// Home shows "It's time" inside it, and a start inside it counts as "started on time".
const WINDOW_BEFORE_MS = 60 * 60_000;
const WINDOW_AFTER_MS = 3 * 60 * 60_000;

export type PlanStage = "upcoming" | "now" | "check-in" | "done";

export function planStage(plan: Plan, now = Date.now()): PlanStage {
  if (plan.reflectedAt || plan.closedAt) return "done";
  if (plan.doneAt) return "check-in";
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
  markTopicStarted(plan.topic);
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify([...loadPlans(), full]));
    removeOpenTopic(plan.topic);
  } catch {
    // Storage blocked: the plan works for this visit only.
  }
  return full;
}
