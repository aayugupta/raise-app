// "Continue your journey" on Home: where each active topic is, in 3 steps.
//   1 Prepare: the card was opened but no talk is planned yet
//   2 Talk:    a talk is planned
//   3 Reflect: the talk is done, or its time has passed, and the parent hasn't said how it went
// ".ts" ending so the tests (plain Node) can load this file too.
import { journeyDay, planStage, type Plan } from "./talks.ts";
import type { TopicId } from "./topics";

export type Journey = {
  topic: TopicId;
  step: 1 | 2 | 3;
  stepName: "Prepare" | "Talk" | "Reflect";
  action: string;
  href: string;
  planId?: string;
  when?: string;
  day?: number; // "Day 5 of 14", when the start date is known
  reflectHref?: string; // a planned talk: "Already talked? Tell us how it went", any time
};

export function activeJourneys(
  plans: Plan[],
  openTopics: TopicId[],
  now = Date.now(),
  starts: Partial<Record<TopicId, string>> = {}
): Journey[] {
  const journeys: Journey[] = [];
  const byTime = [...plans].sort((a, b) => a.when.localeCompare(b.when));

  for (const p of byTime) {
    const stage = planStage(p, now);
    if (stage === "check-in") {
      journeys.push({ topic: p.topic, step: 3, stepName: "Reflect", action: "Tell us how it went", href: `/reflect/${p.id}`, planId: p.id, when: p.when });
    } else if (stage === "now") {
      journeys.push({ topic: p.topic, step: 2, stepName: "Talk", action: "Open Talk mode", href: `/talk/${p.id}`, planId: p.id, when: p.when, reflectHref: `/reflect/${p.id}` });
    } else if (stage === "upcoming") {
      journeys.push({ topic: p.topic, step: 2, stepName: "Talk", action: "See your first line", href: `/card/${p.topic}`, planId: p.id, when: p.when, reflectHref: `/reflect/${p.id}` });
    }
  }

  // Opened but not planned, and not already in progress above.
  for (const topic of openTopics) {
    if (!journeys.some((j) => j.topic === topic)) {
      journeys.push({ topic, step: 1, stepName: "Prepare", action: "Plan this talk", href: `/card/${topic}` });
    }
  }

  for (const j of journeys) {
    const start = starts[j.topic] ?? plans.find((p) => p.id === j.planId)?.createdAt;
    if (start) j.day = journeyDay(start, now);
  }

  // Most urgent first: reflect, then talk, then prepare.
  return journeys.sort((a, b) => b.step - a.step);
}
