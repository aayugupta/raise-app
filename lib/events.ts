// Sends one anonymous event from the phone. Fire-and-forget: it never slows the app or shows an error.
// What can be sent is fixed in lib/eventSchema.ts.
import type { EventFields, EventName } from "./eventSchema";

const ID_KEY = "raise.anonId";

// A random id made on this phone, so events from one phone can be grouped. It identifies no one.
function anonId(): string {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch {
    return "no-storage-anon";
  }
}

export function track(event: EventName, fields: EventFields = {}): void {
  try {
    fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonId: anonId(), event, fields }),
      keepalive: true, // still sent if the page is closing
    }).catch(() => {});
  } catch {
    // Never let counting break the app.
  }
}
