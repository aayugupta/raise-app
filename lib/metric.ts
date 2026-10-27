// The completed-conversation metric (Aayushi's simple rule, 28 Oct 2026), worked out from
// the journey records on this phone. The same rule runs in Supabase (supabase/schema.sql).
//
//   A topic is STARTED when its 14-day journey begins (flashcards first opened, picked in setup, or planned).
//   It is COMPLETED when a reflection where the talk happened (Yes or Partly) is saved within 14 days.
//   It counts even if the talk went badly: how it went doesn't matter, only that it happened.
//   Completed Conversation Rate = completed ÷ started.
// Journeys where help was offered are left out, either way. "Not yet" doesn't complete a journey.
// ".ts" endings so the tests (plain Node) can load this file too.
import type { TopicId } from "./topics";

export const JOURNEY_DAYS = 14;
const DAY_MS = 86_400_000;

export type JourneyRecord = {
  id: string;
  topic: TopicId;
  startedAt: string;
  endedAt?: string; // reflected on (or replaced by a new journey after day 14)
  completedAt?: string; // a reflection where the talk happened, within 14 days
  helpOffered?: boolean; // a danger sign was spotted: left out of the metric
};

export function withinWindow(startedAt: string, at: string): boolean {
  const ms = Date.parse(at) - Date.parse(startedAt);
  return ms >= 0 && ms <= JOURNEY_DAYS * DAY_MS;
}

// Open = not ended yet. It may be past day 14: it stays on Home until the parent moves on.
export function isOpen(r: JourneyRecord): boolean {
  return !r.endedAt;
}

export type JourneyStats = {
  started: number;
  completed: number;
  inProgress: number; // open and still within 14 days
  notCompleted: number; // ended, or past 14 days, without a completed talk
  ratePct: number | null; // completed ÷ started, for Aayushi (never shown to parents as a score)
};

export function journeyStats(records: JourneyRecord[], now = Date.now()): JourneyStats {
  const counted = records.filter((r) => !r.helpOffered);
  const completed = counted.filter((r) => r.completedAt && withinWindow(r.startedAt, r.completedAt)).length;
  const inProgress = counted.filter((r) => !r.completedAt && isOpen(r) && now - Date.parse(r.startedAt) <= JOURNEY_DAYS * DAY_MS).length;
  const started = counted.length;
  return {
    started,
    completed,
    inProgress,
    notCompleted: started - completed - inProgress,
    ratePct: started ? Math.round((1000 * completed) / started) / 10 : null,
  };
}

// Home's "Becoming a Super Parent" goal (Aayushi, 28 Oct 2026): how many different topics the parent
// has had a talk about (a completed journey). It only ever goes up: nothing is lost for a missed day.
export function topicsTalkedAbout(records: JourneyRecord[]): number {
  return new Set(records.filter((r) => r.completedAt && !r.helpOffered).map((r) => r.topic)).size;
}
