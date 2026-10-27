import Link from "next/link";
import type { Journey } from "@/lib/journey";
import { JOURNEY_DAYS } from "@/lib/metric";
import { TOPICS } from "@/lib/topics";

// One active 14-day journey (Home and the Journey tab): "Day 5 of 14", its step
// (Prepare → Talk → Reflect), and the next action. No streaks, never "overdue".

export function whenText(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}, ${time}`;
}

export default function JourneyCard({ journey, whenLabel }: { journey: Journey; whenLabel?: string }) {
  const t = TOPICS.find((x) => x.id === journey.topic)!;
  return (
    <Link href={journey.href} className="journey-card">
      <span className="topic-tile-icon" style={{ background: `${t.color}26` }} aria-hidden="true">
        {t.icon}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
          <span style={{ fontWeight: 700, color: "var(--ink)" }}>{t.short}</span>
          {journey.day && (
            <span className="journey-day">
              Day {journey.day} of {JOURNEY_DAYS}
            </span>
          )}
        </span>
        <span style={{ display: "block", fontSize: 14, color: "var(--muted)", marginTop: 2 }}>
          Step {journey.step} of 3 · {journey.stepName}
          {whenLabel ? ` · ${whenLabel}` : ""}
        </span>
        <span className="journey-steps" aria-hidden="true">
          {[1, 2, 3].map((s) => (
            <span key={s} className={s <= journey.step ? "done" : ""} />
          ))}
        </span>
        <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: "var(--teal)", marginTop: 8 }}>{journey.action} →</span>
      </span>
    </Link>
  );
}
