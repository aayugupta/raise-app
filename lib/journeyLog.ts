// The 14-day journeys, kept on this phone (raise.journeys). One record per journey, never deleted,
// so Progress and the metric can look back. The metric itself is in lib/metric.ts.
import { track } from "./events";
import type { StepsDone } from "./journey";
import { JOURNEY_DAYS, isOpen, withinWindow, type JourneyRecord } from "./metric";
import type { TopicId } from "./topics";

const KEY = "raise.journeys";
const OLD_STARTS_KEY = "raise.topicStarts"; // 28 Oct 2026, before records were kept
const DAY_MS = 86_400_000;

function newId(): string {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function loadJourneyRecords(): JourneyRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as JourneyRecord[];
    // One-time move from the older start-dates-only store.
    const old = JSON.parse(localStorage.getItem(OLD_STARTS_KEY) ?? "{}") as Partial<Record<TopicId, string>>;
    const moved = Object.entries(old).map(([topic, startedAt]) => ({ id: newId(), topic: topic as TopicId, startedAt: startedAt! }));
    save(moved);
    localStorage.removeItem(OLD_STARTS_KEY);
    return moved;
  } catch {
    return [];
  }
}

function save(records: JourneyRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(records));
  } catch {}
}

// Starts a topic's 14-day journey, unless one is already running. A journey left past day 14
// without a talk is closed quietly and a fresh one starts (never "failed").
export function startJourney(topic: TopicId, now = Date.now()): void {
  const records = loadJourneyRecords();
  const open = records.find((r) => r.topic === topic && isOpen(r));
  if (open && now - Date.parse(open.startedAt) <= JOURNEY_DAYS * DAY_MS) return;
  if (open) open.endedAt = new Date(now).toISOString();
  records.push({ id: newId(), topic, startedAt: new Date(now).toISOString() });
  save(records);
  track("journey_started", { topic });
}

// After a reflection. "Not yet" doesn't come here: the journey keeps going.
export function finishJourney(topic: TopicId, happened: boolean, helpOffered: boolean, now = Date.now()): void {
  const records = loadJourneyRecords();
  const open = records.find((r) => r.topic === topic && isOpen(r));
  if (!open) return;
  const at = new Date(now).toISOString();
  open.endedAt = at;
  if (helpOffered) open.helpOffered = true;
  else if (happened && withinWindow(open.startedAt, at)) open.completedAt = at;
  save(records);
}

// Step 1 Learn: the topic's flashcards were opened.
export function markLearned(topic: TopicId, now = Date.now()): void {
  const records = loadJourneyRecords();
  const open = records.find((r) => r.topic === topic && isOpen(r));
  if (!open || open.learnedAt) return;
  open.learnedAt = new Date(now).toISOString();
  save(records);
}

// Step 2 Practise: a message to the AI Coach about this topic, or "Skip, plan a moment".
export function markPractised(topic: TopicId, skipped: boolean, now = Date.now()): void {
  const records = loadJourneyRecords();
  const open = records.find((r) => r.topic === topic && isOpen(r));
  if (!open || open.practisedAt) return;
  open.practisedAt = new Date(now).toISOString();
  if (skipped) open.practiceSkipped = true;
  save(records);
}

// Which of steps 1–2 each running journey has done, for the journey cards.
export function openJourneySteps(): StepsDone {
  return Object.fromEntries(
    loadJourneyRecords()
      .filter(isOpen)
      .map((r) => [r.topic, { learned: Boolean(r.learnedAt), practised: Boolean(r.practisedAt) }])
  );
}

// Start dates of the journeys still running, for "Day 5 of 14" on Home.
export function openJourneyStarts(): Partial<Record<TopicId, string>> {
  return Object.fromEntries(loadJourneyRecords().filter(isOpen).map((r) => [r.topic, r.startedAt]));
}
