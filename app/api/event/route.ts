// Server-only: receives anonymous events from the phone, checks them against the allowed list,
// and saves them to Supabase. The Supabase key never reaches the phone.
// Until Supabase is set up, events are accepted and dropped.
import { cleanEvent } from "@/lib/eventSchema";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const e = cleanEvent(body);
  if (!e) return new Response(null, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return new Response(null, { status: 204 });

  const { topic, plan_id, ...props } = e.fields;
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        anon_id: e.anonId,
        event: e.event,
        topic: typeof topic === "string" ? topic : null,
        plan_id: typeof plan_id === "string" ? plan_id : null,
        props,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.warn(`[event] Supabase said ${res.status} for ${e.event}`);
  } catch {
    console.warn(`[event] couldn't reach Supabase for ${e.event}`);
  }
  return new Response(null, { status: 204 });
}
