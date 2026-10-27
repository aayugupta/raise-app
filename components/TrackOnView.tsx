"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/events";
import type { EventFields, EventName } from "@/lib/eventSchema";

// Sends one anonymous event when a screen opens (for screens that are otherwise server-rendered).
export default function TrackOnView({ event, fields }: { event: EventName; fields?: EventFields }) {
  // React runs this twice in development; the ref keeps it to one event per visit.
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track(event, fields);
  }, [event, fields]);
  return null;
}
