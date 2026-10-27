// Server-only: asks Gemini to personalise a Talk Card. The API key never reaches the phone.
// Any failure (no key, slow, bad JSON, broken rule) returns { source: "base" } so the
// phone shows the hand-written base card instead.
import { getBaseCard } from "@/lib/cards";
import { checkAiCard } from "@/lib/cardSafety";
import { buildPrompt, type Family } from "@/lib/cardPrompt";
import { isTopicId } from "@/lib/topics";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const TIMEOUT_MS = 8000;
const RETRY_IF_UNDER_MS = 4000;

const ALLOWED = {
  role: ["mother", "father", "guardian"],
  ageBand: ["12-14", "15-16", "17-19"],
  teenGender: ["girl", "boy", "unsaid"],
  language: ["hinglish", "hindi", "english"],
  comfort: ["gentle", "open"],
} as const;

function fallback(reason: string) {
  return Response.json({ source: "base", reason });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  // Accept only the tapped answers, and only known values. Anything else is ignored.
  const topic = body?.topic;
  if (typeof topic !== "string" || !isTopicId(topic)) return Response.json({ error: "unknown topic" }, { status: 400 });
  const family = {} as Family;
  for (const [field, values] of Object.entries(ALLOWED)) {
    const value = body?.family?.[field];
    if (!(values as readonly string[]).includes(value)) return Response.json({ error: `bad ${field}` }, { status: 400 });
    (family as Record<string, string>)[field] = value;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return fallback("no key");

  const base = getBaseCard(topic);
  const started = Date.now();
  const prompt = buildPrompt(base, family);

  // One retry when a card is rejected, but only while there is still time for it.
  let reason = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (attempt === 2 && Date.now() - started > RETRY_IF_UNDER_MS) break;
    const left = TIMEOUT_MS - (Date.now() - started);

    let text: string;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        signal: AbortSignal.timeout(left),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.6,
            thinkingConfig: { thinkingLevel: "minimal" },
          },
        }),
      });
      // Errors from Gemini itself (e.g. 429 = free limit reached) are not worth retrying.
      if (!res.ok) return fallback(`gemini ${res.status}`);
      const data = await res.json();
      text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    } catch (err) {
      return fallback(err instanceof Error && err.name === "TimeoutError" ? "timeout" : "network");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      reason = "not json";
      continue;
    }

    const result = checkAiCard(parsed, base, family.language);
    if (result.ok) {
      return Response.json({ source: "ai", card: result.card, ms: Date.now() - started, attempt });
    }
    console.warn(`[talk-card] ${topic}: AI card rejected on attempt ${attempt} (${result.problems.join("; ")})`);
    reason = "broke a rule";
  }

  return fallback(reason);
}
