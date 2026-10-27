// Safety boundary for the AI Coach (28 Oct 2026). Every message is checked twice:
//   1. What the parent types, BEFORE anything is sent to the AI (on the phone, and again on the server).
//      Danger signs → the dismissible help offer, and the message is never sent or saved.
//      Spying, diagnosis, medicine, changing who the teen is → a refusal that offers something better.
//   2. What the AI writes back, BEFORE the parent sees it. Anything that breaks Raise's rules is
//      replaced with a safe fallback reply.
// ".ts" endings so the tests (plain Node) can load this file too.
import { writingRuleProblems } from "./cardSafety.ts";
import { checkSetupText } from "./safety.ts";
import type { TopicId } from "./topics";

export const COACH_MAX_CHARS = 600;

export type CoachInputCheck =
  | { kind: "ok" }
  | { kind: "crisis" }
  | { kind: "refuse"; message: string; offer: TopicId; offerText: string };

export function checkCoachMessage(text: string): CoachInputCheck {
  const r = checkSetupText(text);
  if (r.kind === "crisis") return { kind: "crisis" };
  if (r.kind === "refuse") return { kind: "refuse", message: r.message, offer: r.offer, offerText: r.offerText };
  return { kind: "ok" };
}

// A statistic ("45%", "9 of 10") or a long number (a made-up helpline): help numbers only ever come
// from Raise's own Help screen, never from the AI.
const STAT = /\d+\s*(%|percent|प्रतिशत)|\b\d+\s*(of|out of|in|में से)\s*\d+\b/i;
const LONG_NUMBER = /\d{3,}/;

export function coachReplyProblems(reply: string): string[] {
  const problems = writingRuleProblems(reply);
  if (STAT.test(reply)) problems.push("statistic");
  if (LONG_NUMBER.test(reply)) problems.push("phone number or long number");
  if (!reply.trim()) problems.push("empty");
  if (reply.length > 1500) problems.push("too long");
  return problems;
}

// Shown when the AI is slow, fails, or its reply breaks a rule.
export const COACH_FALLBACK =
  "I couldn't answer that one well. Could you tell me a little more: what happened, and what would you like to say to your child? If something feels serious, the Help tab has people you can call.";
