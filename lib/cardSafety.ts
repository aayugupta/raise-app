// Checks a Talk Card written by the AI against Raise's rules (Step 3, section 6A)
// before any parent sees it. Any problem means the hand-written base card is shown instead.
import type { BaseCard, Language, TalkCard } from "./cards";

// Never allowed anywhere on a card.
const NEVER: { rule: string; pattern: RegExp }[] = [
  { rule: "fear words", pattern: /dangerous new trend|every parent must|ruin (her|his|their|your) life|will ruin|failed as a parent|you have failed|deadly|terrifying/i },
  { rule: "promised results", pattern: /guarantee|this will fix|will definitely|100% safe|never fails/i },
  { rule: "diagnosis", pattern: /\b(depression|depressed|adhd|autis\w*|bipolar|ocd|disorder|diagnos\w*)\b/i },
  { rule: "medical advice", pattern: /\b(medicine|medication|tablets?|pills?|dose|dosage|dawai|davai)\b|दवा/i },
  { rule: "sexuality or gender judgement", pattern: /\b(gay|lesbian|bisexual|transgender|homosexual|conversion)\b/i },
  { rule: "graphic sexual detail", pattern: /\b(intercourse|orgasm|genitals?|naked|nudes?|porn\w*)\b/i },
];

// Allowed only in the "Avoid" list, where they appear as things NOT to do.
const NOT_OUTSIDE_AVOID: { rule: string; pattern: RegExp }[] = [
  {
    rule: "spying",
    pattern: /\b(spy|spying|track(ing)?|monitor(ing)?|secretly)\b|(read|check|go through)\w*\s+(her|his|their|your)\s+(phone|messages|chats|whatsapp)|jasoosi|जासूसी/i,
  },
  {
    rule: "phone threats or punishment",
    pattern: /take (away )?(her|his|their|your|the) phone|phone (le lu|chheen|chhin)|फ़ोन छीन|confiscate|\bgrounded?\b|punish\w*|\bbeat\b|\bslap\w*|thappad|maarunga|maarungi/i,
  },
];

const DEVANAGARI = /[ऀ-ॿ]/;

// Devanagari digits (०-९) count as the same numbers as 0-9.
function numbers(text: string): string[] {
  const western = text.replace(/[०-९]/g, (d) => String("०१२३४५६७८९".indexOf(d)));
  return western.match(/\d+/g) ?? [];
}

export type SafetyResult = { ok: true; card: TalkCard } | { ok: false; problems: string[] };

export function checkAiCard(raw: unknown, base: BaseCard, language: Language): SafetyResult {
  const problems: string[] = [];
  const c = raw as Partial<TalkCard> | null;

  const isText = (v: unknown, max: number) => typeof v === "string" && v.trim().length > 0 && v.length <= max;
  const isList = (v: unknown, count: number) => Array.isArray(v) && v.length === count && v.every((s) => isText(s, 300));

  if (!c || typeof c !== "object") return { ok: false, problems: ["not a card"] };
  if (!isText(c.whyNow, 400)) problems.push("why now missing or too long");
  if (!isText(c.firstLine, 220)) problems.push("first line missing or too long");
  if (!isList(c.followUps, 2)) problems.push("needs exactly 2 follow-ups");
  if (!isList(c.say, 3)) problems.push("needs exactly 3 'say' lines");
  if (!isList(c.avoid, 3)) problems.push("needs exactly 3 'avoid' lines");
  const r = c.react;
  if (!r || !["quiet", "upset", "disagree", "noTalk"].every((k) => isText((r as Record<string, unknown>)[k], 300))) {
    problems.push("needs all 4 'if they react' lines");
  }
  if (problems.length) return { ok: false, problems };

  const card = c as TalkCard;
  const outsideAvoid = [card.whyNow, card.firstLine, ...card.followUps, ...card.say, ...Object.values(card.react)];
  const everything = [...outsideAvoid, ...card.avoid];

  for (const { rule, pattern } of NEVER) {
    if (everything.some((t) => pattern.test(t))) problems.push(rule);
  }
  for (const { rule, pattern } of NOT_OUTSIDE_AVOID) {
    if (outsideAvoid.some((t) => pattern.test(t))) problems.push(rule);
  }

  // The AI may reword, never add facts: every number in "why now" must already be in the base card,
  // and no other line may carry a statistic ("45%", "9 of 10", "3 out of 5").
  // Everyday numbers like "raat 12 baje" are fine.
  const allowed = new Set(numbers(base.whyNow + " " + base.whySource));
  const added = numbers(card.whyNow).filter((n) => !allowed.has(n));
  if (added.length) problems.push(`new numbers not in the base card: ${added.join(", ")}`);
  const STAT = /\d+\s*(%|percent|प्रतिशत)|\d+\s*(of|out of|in|में से)\s*\d+/i;
  if ([...card.followUps, ...card.say, ...card.avoid, ...Object.values(card.react), card.firstLine].some((t) => STAT.test(t))) {
    problems.push("statistic outside 'why now'");
  }

  // Right script for the chosen language.
  if (language === "hindi" && !DEVANAGARI.test(card.firstLine)) problems.push("Hindi card not in Devanagari");
  if (language !== "hindi" && DEVANAGARI.test(everything.join(" "))) problems.push("unexpected Devanagari");

  return problems.length ? { ok: false, problems } : { ok: true, card };
}
