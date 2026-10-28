// The 14-day journey cards on Home and the Journey tab (Aayushi's 4 steps, 28 Oct 2026):
//   1 Learn:    read the topic's flashcards
//   2 Practise: ask doubts or role-play with the AI Coach (encouraged, can be skipped)
//   3 Plan:     pick a moment (walk, late evening…)
//   4 Reflect:  after the talk, two taps: did it happen, how did it go
// A talk that already happened can be logged from any step ("Already talked?").
// ".ts" ending so the tests (plain Node) can load this file too.
import { JOURNEY_DAYS, journeyDay, planStage, type Plan } from "./talks.ts";
import type { TopicId } from "./topics";

export const STEP_NAMES = ["Learn", "Practise", "Plan", "Reflect"] as const;

export type StepsDone = Partial<Record<TopicId, { learned: boolean; practised: boolean }>>;

export type Journey = {
  topic: TopicId;
  step: 1 | 2 | 3 | 4;
  stepName: (typeof STEP_NAMES)[number];
  action: string;
  href: string;
  planHref?: string; // step 2: "Plan a moment" is always offered next to practising
  planId?: string;
  when?: string;
  day?: number; // "Day 5 of 14", when the start date is known
  stillOpen?: boolean; // past day 14 with no reflection yet: the topic waits for the parent
  reflectHref: string; // "Already talked? Tell us how it went", from any step
};

export function activeJourneys(
  plans: Plan[],
  openTopics: TopicId[],
  now = Date.now(),
  starts: Partial<Record<TopicId, string>> = {},
  steps: StepsDone = {}
): Journey[] {
  const journeys: Journey[] = [];
  const byTime = [...plans].sort((a, b) => a.when.localeCompare(b.when));

  // A planned talk: steps 1–3 are behind it, so it's at step 4.
  for (const p of byTime) {
    const stage = planStage(p, now);
    if (stage === "done") continue;
    const base = { topic: p.topic, step: 4 as const, stepName: "Reflect" as const, planId: p.id, when: p.when, reflectHref: `/reflect/${p.id}` };
    if (stage === "check-in") journeys.push({ ...base, action: "Tell us how it went", href: `/reflect/${p.id}` });
    else if (stage === "now") journeys.push({ ...base, action: "Open Talk mode", href: `/talk/${p.id}` });
    else journeys.push({ ...base, action: "See your first line", href: `/card/${p.topic}` });
  }

  // Started but not planned yet: step 1, 2 or 3.
  const unplanned = [...new Set([...openTopics, ...(Object.keys(starts) as TopicId[])])];
  for (const topic of unplanned) {
    if (journeys.some((j) => j.topic === topic)) continue;
    const done = steps[topic] ?? { learned: false, practised: false };
    const reflectHref = `/log?topic=${topic}`;
    if (!done.learned) {
      journeys.push({ topic, step: 1, stepName: "Learn", action: "Open the flashcards", href: `/card/${topic}`, reflectHref });
    } else if (!done.practised) {
      journeys.push({
        topic,
        step: 2,
        stepName: "Practise",
        action: "Practise with AI Coach",
        href: `/coach?topic=${topic}`,
        planHref: `/plan/${topic}?skipPractice=1`,
        reflectHref,
      });
    } else {
      journeys.push({ topic, step: 3, stepName: "Plan", action: "Plan a moment", href: `/plan/${topic}`, reflectHref });
    }
  }

  for (const j of journeys) {
    const start = starts[j.topic] ?? plans.find((p) => p.id === j.planId)?.createdAt;
    if (!start) continue;
    const day = journeyDay(start, now);
    const pastWindow = now - Date.parse(start) > JOURNEY_DAYS * 86_400_000;
    if (pastWindow) j.stillOpen = true;
    else j.day = day;
  }

  // Furthest along first: the talk that needs a reflection comes before one still being learned.
  return journeys.sort((a, b) => b.step - a.step);
}
