// The AI Coach chat, kept ONLY on this phone (raise.coach). "Clear my data" deletes it.
// A message with a danger sign is never saved: only a note that help was offered.
import type { TopicId } from "./topics";

export type CoachEntry =
  | { role: "parent"; text: string; at: string; roleplay?: boolean; topic?: TopicId }
  | { role: "parent"; hidden: true; at: string } // a danger sign: the words are not kept
  | { role: "coach"; text: string; at: string; fallback?: boolean; roleplay?: boolean; topic?: TopicId; tip?: string } // in a role-play, text is the child's line
  | { role: "coach"; help: true; dismissed?: boolean; at: string }
  | { role: "coach"; refusal: string; offer: TopicId; offerText: string; at: string };

const KEY = "raise.coach";
const MAX_ENTRIES = 60;

export function loadCoachChat(): CoachEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as CoachEntry[];
  } catch {
    return [];
  }
}

export function saveCoachChat(entries: CoachEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // Storage blocked: the chat works for this visit only.
  }
}

export function clearCoachChat(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

// What the AI sees: plain messages only. Hidden, help, refusal and fallback entries are never sent,
// and neither is a parent message that was refused (the next entry isn't an AI reply).
type Turn = { role: "parent" | "coach"; text: string };

// A role-play only sees its own turns for that topic; the normal chat never sees role-play turns.
export function turnsForAi(all: CoachEntry[], roleplayTopic?: TopicId): Turn[] {
  const entries = all.filter((e) =>
    "text" in e ? (roleplayTopic ? e.roleplay && e.topic === roleplayTopic : !e.roleplay) : !roleplayTopic
  );
  const isAiReply = (e?: CoachEntry) => !!e && e.role === "coach" && "text" in e && !e.fallback;
  return entries.flatMap((e, i): Turn[] => {
    if (!("text" in e)) return [];
    if (e.role === "coach") return isAiReply(e) ? [{ role: "coach", text: e.text }] : [];
    const next = entries[i + 1];
    return !next || isAiReply(next) ? [{ role: "parent", text: e.text }] : [];
  });
}
