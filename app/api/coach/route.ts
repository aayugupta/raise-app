// Server-only: the AI Coach. The API key never reaches the phone, and nothing the parent
// writes is logged or stored here. The phone already checked the message; the server checks again,
// so a crisis or a refused request never reaches the AI, and every AI reply is checked before it's sent back.
import type { Family } from "@/lib/cardPrompt";
import { coachInstructions } from "@/lib/coachPrompt";
import { checkCoachMessage, COACH_FALLBACK, COACH_MAX_CHARS, coachReplyProblems } from "@/lib/coachSafety";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const TIMEOUT_MS = 12000;
const RETRY_IF_UNDER_MS = 6000;
const MAX_TURNS = 12; // the latest messages only, so the AI has context without the whole history

const ALLOWED = {
  role: ["mother", "father", "guardian"],
  ageBand: ["12-14", "15-16", "17-19"],
  teenGender: ["girl", "boy", "unsaid"],
  language: ["hinglish", "hindi", "english"],
  comfort: ["gentle", "open"],
} as const;

type Turn = { role: "parent" | "coach"; text: string };

function fallback(reason: string) {
  return Response.json({ kind: "fallback", reply: COACH_FALLBACK, reason });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const family = {} as Family;
  for (const [field, values] of Object.entries(ALLOWED)) {
    const value = body?.family?.[field];
    if (!(values as readonly string[]).includes(value)) return Response.json({ error: `bad ${field}` }, { status: 400 });
    (family as Record<string, string>)[field] = value;
  }

  const raw = Array.isArray(body?.messages) ? body.messages.slice(-MAX_TURNS) : [];
  const turns: Turn[] = raw.filter(
    (m: Turn) => (m?.role === "parent" || m?.role === "coach") && typeof m.text === "string" && m.text.trim() && m.text.length <= 1500
  );
  const latest = turns[turns.length - 1];
  if (!latest || latest.role !== "parent" || latest.text.length > COACH_MAX_CHARS) return Response.json({ error: "bad message" }, { status: 400 });

  // Checked again here: these never reach the AI.
  const check = checkCoachMessage(latest.text);
  if (check.kind !== "ok") return Response.json(check);

  const key = process.env.GEMINI_API_KEY;
  if (!key) return fallback("no key");

  const started = Date.now();
  let reason = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (attempt === 2 && Date.now() - started > RETRY_IF_UNDER_MS) break;
    let text: string;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        signal: AbortSignal.timeout(TIMEOUT_MS - (Date.now() - started)),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: coachInstructions(family) }] },
          contents: turns.map((t) => ({ role: t.role === "parent" ? "user" : "model", parts: [{ text: t.text }] })),
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
            thinkingConfig: { thinkingLevel: "minimal" },
          },
        }),
      });
      if (!res.ok) return fallback(`gemini ${res.status}`);
      const data = await res.json();
      text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    } catch (err) {
      return fallback(err instanceof Error && err.name === "TimeoutError" ? "timeout" : "network");
    }

    let parsed: { reply?: unknown; concern?: unknown };
    try {
      parsed = JSON.parse(text);
    } catch {
      reason = "not json";
      continue;
    }
    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    const problems = coachReplyProblems(reply);
    if (problems.length === 0) {
      return Response.json({ kind: "ai", reply, concern: parsed.concern === "serious" ? "serious" : "none", ms: Date.now() - started });
    }
    // Only the rule names are logged, never the parent's words or the reply.
    console.warn(`[coach] reply rejected on attempt ${attempt} (${problems.join("; ")})`);
    reason = "broke a rule";
  }
  return fallback(reason);
}
