// Server-only: the content engine's AI agent. Locked with a passcode so only Aayushi can use it
// (and strangers can't use up the free AI limit). It reads the source links itself, runs the
// panic test, and returns the result. Nothing here reaches a Talk Card without her approval.
import { timingSafeEqual } from "node:crypto";
import { buildPanicPrompt, finalisePanicResult, normUrl } from "@/lib/panicTest";
import { TOPICS } from "@/lib/topics";

export const maxDuration = 60;

const MODEL = process.env.ENGINE_MODEL || "gemini-3.5-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";
const TIMEOUT_MS = 55_000;
const MAX_LINKS = 5;

function passcodeOk(given: unknown): boolean {
  const real = process.env.ENGINE_PASSCODE;
  if (!real || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(real);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!passcodeOk(body?.passcode)) return Response.json({ error: "Wrong passcode." }, { status: 401 });
  if (body?.checkOnly) return Response.json({ ok: true });

  const claim = typeof body?.claim === "string" ? body.claim.trim() : "";
  const urls: string[] = Array.isArray(body?.urls)
    ? [...new Set<string>(body.urls.map((u: unknown) => String(u).trim()).filter((u: string) => /^https?:\/\/\S+$/i.test(u)))]
    : [];
  if (claim.length < 10 || claim.length > 500) return Response.json({ error: "Write the claim in 10 to 500 characters." }, { status: 400 });
  if (urls.length === 0) return Response.json({ error: "Add at least one source link (starting with http)." }, { status: 400 });
  if (urls.length > MAX_LINKS) return Response.json({ error: `Up to ${MAX_LINKS} links at a time.` }, { status: 400 });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "The AI key isn't set up on the server." }, { status: 503 });

  const started = Date.now();
  let model = MODEL;
  const ask = () =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: AbortSignal.timeout(TIMEOUT_MS - (Date.now() - started)),
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPanicPrompt(claim, urls, TOPICS) }] }],
        tools: [{ url_context: {} }],
        generationConfig: { temperature: 0.2, thinkingConfig: { thinkingLevel: "low" } },
      }),
    });

  let data;
  try {
    let res = await ask();
    // 503 = Google's AI is briefly overloaded (common on the free tier):
    // wait a moment and try once more, then fall back to the lighter model.
    if (res.status === 503) {
      await new Promise((r) => setTimeout(r, 3000));
      res = await ask();
    }
    if (res.status === 503 && model !== FALLBACK_MODEL) {
      model = FALLBACK_MODEL;
      res = await ask();
    }
    if (!res.ok) {
      return Response.json({ error: res.status === 429 ? "The free AI limit is used up for now. Try again in a minute." : `The AI service returned an error (${res.status}).` }, { status: 502 });
    }
    data = await res.json();
  } catch (err) {
    const timeout = err instanceof Error && err.name === "TimeoutError";
    return Response.json({ error: timeout ? "The agent took too long. Try fewer links." : "Couldn't reach the AI service." }, { status: 504 });
  }

  const candidate = data?.candidates?.[0];
  const text: string = candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";

  // Which links the agent really opened, as reported by Gemini (not by the agent's own words).
  const opened = new Set<string>(
    (candidate?.urlContextMetadata?.urlMetadata ?? [])
      .filter((m: { urlRetrievalStatus?: string }) => m.urlRetrievalStatus === "URL_RETRIEVAL_STATUS_SUCCESS")
      .map((m: { retrievedUrl?: string }) => normUrl(m.retrievedUrl ?? ""))
  );

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim());
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {}
    }
  }

  const result = finalisePanicResult(
    parsed,
    urls,
    opened,
    TOPICS.map((t) => t.id)
  );
  if (!result) return Response.json({ error: "The agent's answer couldn't be read. Try again." }, { status: 502 });

  return Response.json({ result, ms: Date.now() - started, model });
}
