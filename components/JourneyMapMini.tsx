import Link from "next/link";
import { MAP_STOPS } from "@/lib/journeyMap";

// The small journey map on Home (Aayushi, 29 Oct 2026): five dots in a row, done steps ticked,
// the current one highlighted, "You are here" underneath. Tapping it opens the full map.
export default function JourneyMapMini({ index, label }: { index: number; label: string }) {
  return (
    <Link href="/how-it-works?from=home" className="mini-map" aria-label={`Your journey: you are here, ${label}. Open how Raise works`}>
      <ol className="mini-map-row" aria-hidden="true">
        {MAP_STOPS.map((s, i) => (
          <li key={s.short} className={i < index ? "done" : i === index ? "here" : ""}>
            <span className="mini-map-dot">{i < index ? "✓" : i + 1}</span>
            <span className="mini-map-label">{s.short}</span>
          </li>
        ))}
      </ol>
      <div className="mini-map-foot">
        <span>
          <strong>You are here:</strong> {label}
        </span>
        <span className="mini-map-link">How it works →</span>
      </div>
    </Link>
  );
}
