// Server-only: the AI Coach. The API key never reaches the phone, and nothing the parent
// writes is logged or stored here. The phone already checked the message; the server checks again,
// so a crisis or a refused request never reaches the AI, and every AI reply is checked before it's sent back.
import type { Family } from "@/lib/cardPrompt";
import { coachInstructions, type Practice } from "@/lib/coachPrompt";
import { isTopicId } from "@/lib/topics";
import { checkCoachMessage, COACH_BUSY, COACH_FALLBACK, COACH_MAX_CHARS, coachReplyProblems } from "@/lib/coachSafety";

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
  // A broken rule gets the "tell me more" reply; a busy or unreachable AI gets "please send again".
  return Response.json({ kind: "fallback", reply: reason === "broke a rule" || reason === "not json" ? COACH_FALLBACK : COACH_BUSY, reason });
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

  // Step 2 of a topic's journey: practising that topic (questions, or the AI playing the child).
  const practice: Practice | undefined =
    typeof body?.topic === "string" && isTopicId(body.topic) ? { topic: body.topic, roleplay: body?.mode === "roleplay" } : undefined;

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
          systemInstruction: { parts: [{ text: coachInstructions(family, practice) }] },
          // Earlier coach replies go back in the same JSON shape we ask for, so the AI keeps answering in it.
          contents: turns.map((t) =>
            t.role === "parent"
              ? { role: "user", parts: [{ text: t.text }] }
              : { role: "model", parts: [{ text: JSON.stringify({ reply: t.text, concern: "none" }) }] }
          ),
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
            thinkingConfig: { thinkingLevel: "minimal" },
          },
        }),
      });
      if (!res.ok) {
        // Busy (429 = free-plan speed limit) or a passing server error: wait a moment and try once more.
        if (attempt === 1 && [429, 500, 503].includes(res.status) && Date.now() - started < RETRY_IF_UNDER_MS) {
          await new Promise((r) => setTimeout(r, 1200));
          reason = `gemini ${res.status}`;
          continue;
        }
        return fallback(`gemini ${res.status}`);
      }
      const data = await res.json();
      text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    } catch (err) {
      return fallback(err instanceof Error && err.name === "TimeoutError" ? "timeout" : "network");
    }

    let parsed: { reply?: unknown; tip?: unknown; concern?: unknown };
    try {
      // The AI sometimes wraps its JSON in a code fence or a stray sentence: read the {...} inside.
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      parsed = JSON.parse(start >= 0 && end > start ? text.slice(start, end + 1) : text);
      if (typeof parsed !== "object" || parsed === null) parsed = { reply: String(parsed) };
    } catch {
      // Plain text instead of JSON: still a usable reply. It goes through the same rule checks below.
      if (text.trim() && !practice?.roleplay) {
        parsed = { reply: text.trim(), concern: "none" };
      } else {
        console.warn(`[coach] reply was not JSON on attempt ${attempt}`);
        reason = "not json";
        continue;
      }
    }
    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    // In a role-play the coach's tip is checked by the same rules as the child's line.
    const tip = practice?.roleplay && typeof parsed.tip === "string" ? parsed.tip.trim() : "";
    const problems = [...coachReplyProblems(reply), ...(tip ? coachReplyProblems(tip).map((p) => `tip: ${p}`) : [])];
    if (problems.length === 0) {
      return Response.json({ kind: "ai", reply, ...(tip ? { tip } : {}), concern: parsed.concern === "serious" ? "serious" : "none", ms: Date.now() - started });
    }
    // Only the rule names are logged, never the parent's words or the reply.
    console.warn(`[coach] reply rejected on attempt ${attempt} (${problems.join("; ")})`);
    reason = "broke a rule";
  }
  return fallback(reason);
}
