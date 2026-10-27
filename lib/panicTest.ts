// The content engine's panic test (Step 3, section 5). Every new claim must pass all 4 checks
// before it can reach a Talk Card, and then still needs Aayushi's approval.
// The AI judges each check; this file enforces the rules the AI must not be trusted with.
// ".ts" ending so the tests (plain Node) can load this file too.
import { writingRuleProblems } from "./cardSafety.ts";
import type { TopicId } from "./topics";

export type CheckId = "source" | "scale" | "india" | "action";

export const CHECKS: { id: CheckId; name: string; rule: string }[] = [
  {
    id: "source",
    name: "Source",
    rule: "At least 2 independent trusted sources, or 1 official or peer-reviewed source. News counts only as a lead, never as proof.",
  },
  { id: "scale", name: "Scale", rule: "Evidence that many teens are affected, not one case." },
  { id: "india", name: "India fit", rule: "Indian data or Indian cases." },
  { id: "action", name: "Action", rule: "A parent can do something useful about it in a talk." },
];

export const TRUSTED =
  "Indian government (NCRB, CERT-In, Cyber Dost, NCPCR, ministries, PIB), health bodies (IAP, NIMHANS, WHO, UNICEF), peer-reviewed journals, and established research groups (e.g. Common Sense Media, Pew Research). News sites are leads only.";

export type SourceRead = { url: string; opened: boolean; kind?: string; note?: string };
export type CheckResult = { pass: boolean; reason: string };

export type PanicResult = {
  claimSummary: string;
  checks: Record<CheckId, CheckResult>;
  verdict: "accept" | "watch";
  topic: TopicId | null;
  draftWhyNow: string | null;
  sources: SourceRead[];
  notes: string[]; // anything the code changed or dropped, shown to Aayushi
};

export function buildPanicPrompt(claim: string, urls: string[], topics: { id: string; name: string }[]): string {
  return `You are the fact-checking agent for Raise, an app that helps Indian parents talk with their teens.
A new claim has come in. Decide whether it is solid enough to update a parent's Talk Card, using the "panic test".
Your job is to stop alarmist noise: viral stories, one-off cases, foreign scares and fear with nothing to do.

CLAIM: "${claim}"

SOURCE LINKS (read each one with your URL tool):
${urls.map((u, i) => `${i + 1}. ${u}`).join("\n")}

IMPORTANT: Judge ONLY from what you actually read on these pages. If a page could not be opened, do not use what you remember about it.

TRUSTED SOURCES: ${TRUSTED}

THE PANIC TEST (each check is pass or fail):
${CHECKS.map((c) => `- ${c.id} (${c.name}): ${c.rule}`).join("\n")}

TOPICS a claim can belong to: ${topics.map((t) => `${t.id} (${t.name})`).join(", ")}, or null if none fits.

If ALL four checks pass, also write "draftWhyNow": one or two calm sentences for the Talk Card's "why now" line.
It must include a number and a year from the sources, name the source in brackets, and use no fear words
(never "dangerous new trend", "every parent must", "deadly"). If any check fails, set "draftWhyNow" to null.

Reply with JSON only, no other text, in exactly this shape:
{"claimSummary": "one plain sentence",
 "sources": [{"url": "...", "kind": "official | peer-reviewed | research group | news | other", "note": "what this page says about the claim, in one sentence"}],
 "checks": {"source": {"pass": true, "reason": "one sentence"}, "scale": {"pass": true, "reason": "..."}, "india": {"pass": true, "reason": "..."}, "action": {"pass": true, "reason": "..."}},
 "topic": "online-safety",
 "draftWhyNow": "..." }`;
}

// Links compared loosely: "https://www.x.org/a/" and "http://x.org/a" are the same page.
export function normUrl(url: string): string {
  return url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[#?].*$/, "").replace(/\/+$/, "");
}

// Takes the AI's answer plus which links were really opened (normalised), and applies the hard rules.
export function finalisePanicResult(raw: unknown, urls: string[], opened: Set<string>, topicIds: string[]): PanicResult | null {
  const r = raw as Partial<{
    claimSummary: string;
    sources: { url?: string; kind?: string; note?: string }[];
    checks: Partial<Record<CheckId, Partial<CheckResult>>>;
    topic: string | null;
    draftWhyNow: string | null;
  }> | null;
  if (!r || typeof r !== "object" || !r.checks) return null;

  const notes: string[] = [];
  const checks = {} as Record<CheckId, CheckResult>;
  for (const { id } of CHECKS) {
    const c = r.checks[id];
    checks[id] = { pass: c?.pass === true, reason: typeof c?.reason === "string" && c.reason.trim() ? c.reason.trim() : "No reason given." };
  }

  const sources: SourceRead[] = urls.map((url) => {
    const ai = r.sources?.find((s) => typeof s.url === "string" && normUrl(s.url) === normUrl(url));
    const wasOpened = opened.has(normUrl(url));
    return { url, opened: wasOpened, kind: ai?.kind, note: wasOpened ? ai?.note : undefined };
  });

  // Hard rule: a source the agent could not open is not evidence.
  const openedCount = sources.filter((s) => s.opened).length;
  if (openedCount === 0 && checks.source.pass) {
    checks.source = { pass: false, reason: "None of the source links could be opened, so nothing could be checked." };
    notes.push("Source check changed to fail: no link could be opened.");
  } else if (openedCount < urls.length) {
    notes.push(`${urls.length - openedCount} of ${urls.length} links could not be opened and were not used as evidence.`);
  }

  // Hard rule: the verdict comes from the checks, not from the AI.
  const verdict = CHECKS.every(({ id }) => checks[id].pass) ? "accept" : "watch";

  let draftWhyNow = verdict === "accept" && typeof r.draftWhyNow === "string" ? r.draftWhyNow.trim() || null : null;
  if (draftWhyNow) {
    const problems = writingRuleProblems(draftWhyNow);
    if (problems.length) {
      notes.push(`Draft line dropped: it broke the writing rules (${problems.join(", ")}). Write it by hand.`);
      draftWhyNow = null;
    } else if (!/\d/.test(draftWhyNow)) {
      notes.push("Draft line dropped: every claim needs a number and a date.");
      draftWhyNow = null;
    }
  }

  const topic = typeof r.topic === "string" && topicIds.includes(r.topic) ? (r.topic as TopicId) : null;

  return {
    claimSummary: typeof r.claimSummary === "string" ? r.claimSummary : "",
    checks,
    verdict,
    topic,
    draftWhyNow,
    sources,
    notes,
  };
}
