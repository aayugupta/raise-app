// The ONLY things Raise ever sends off the phone: fixed event names with fixed-choice fields.
// No free text, no names, no nickname, no reflection notes. The server rejects anything not listed here.

const TOPIC = ["relationships", "stress", "friends", "online-safety", "consent", "body"];
const BOOL = [true, false];
const PLAN_ID = /^[a-z0-9-]{6,64}$/i; // random id made on the phone

type FieldRule = readonly (string | boolean)[] | RegExp;

export const EVENTS: Record<string, Record<string, FieldRule>> = {
  setup_completed: {
    role: ["mother", "father", "guardian"],
    age_band: ["12-14", "15-16", "17-19"],
    language: ["hinglish", "hindi", "english"],
    comfort: ["gentle", "open"],
  },
  card_viewed: { topic: TOPIC, source: ["ai", "base"] },
  // A topic's 14-day journey began (the metric's "topic started").
  journey_started: { topic: TOPIC },
  topic_not_now: { topic: TOPIC },
  plan_set: { topic: TOPIC, plan_id: PLAN_ID, moment: ["walk", "evening", "chores", "meal", "car"] },
  talk_started: { topic: TOPIC, plan_id: PLAN_ID },
  talk_done: { topic: TOPIC, plan_id: PLAN_ID, on_time: BOOL },
  // A talk that happened without a plan, logged afterwards ("I had a talk").
  talk_logged: { topic: TOPIC, plan_id: PLAN_ID, moment: ["walk", "evening", "chores", "meal", "car"], when: ["today", "yesterday", "earlier"] },
  reflection_saved: {
    topic: TOPIC,
    plan_id: PLAN_ID,
    happened: ["yes", "partly", "not-yet"],
    who_talked: ["me", "teen", "equal"],
    feeling: ["good", "okay", "hard"],
    child_response: ["opened-up", "listened", "asked", "little", "short"],
    help_offered: BOOL,
  },
  follow_up_answered: { topic: TOPIC, plan_id: PLAN_ID, matched: BOOL, said_more: ["yes", "little", "not-yet"] },
  recovery_chosen: { topic: TOPIC, plan_id: PLAN_ID, reason: ["moment", "awkward", "mood", "ready", "other", "repair"] },
  // Parent confidence 1–5 (survey Q14): at setup, and after talks. Step 6 leading indicator.
  confidence_rated: { value: ["1", "2", "3", "4", "5"], when: ["setup", "after_talk"] },
  // One AI Coach message: only how it was answered. Never the words.
  coach_message: { result: ["ai", "fallback", "refused", "help"], concern: BOOL },
  // Only THAT help was shown, and where. Never what the crisis was.
  help_shown: { from: ["setup", "reflection", "help_page", "coach"] },
};

export type EventName = keyof typeof EVENTS;
export type EventFields = Record<string, string | boolean>;

const ANON_ID = /^[a-z0-9-]{8,64}$/i;

// Returns a clean copy with only allowed fields, or null if anything is off.
export function cleanEvent(body: unknown): { anonId: string; event: string; fields: EventFields } | null {
  const b = body as { anonId?: unknown; event?: unknown; fields?: unknown } | null;
  if (!b || typeof b.anonId !== "string" || !ANON_ID.test(b.anonId)) return null;
  if (typeof b.event !== "string" || !(b.event in EVENTS)) return null;
  const rules = EVENTS[b.event];
  const given = (b.fields && typeof b.fields === "object" ? b.fields : {}) as Record<string, unknown>;

  const fields: EventFields = {};
  for (const [key, value] of Object.entries(given)) {
    const rule = rules[key];
    if (!rule) return null; // an unknown field: refuse the whole event
    const ok = rule instanceof RegExp ? typeof value === "string" && rule.test(value) : (rule as readonly unknown[]).includes(value);
    if (!ok) return null;
    fields[key] = value as string | boolean;
  }
  return { anonId: b.anonId, event: b.event, fields };
}
