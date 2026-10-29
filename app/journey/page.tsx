"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import TopicArt from "@/components/TopicArt";
import ConfidenceScale from "@/components/ConfidenceScale";
import HelpPill from "@/components/HelpPill";
import { CONFIDENCE_QUESTION, confidenceChange, loadConfidence, recordConfidence, type ConfidenceEntry } from "@/lib/confidence";
import JourneyCard, { whenText } from "@/components/JourneyCard";
import { activeJourneys, type Journey } from "@/lib/journey";
import { loadJourneyRecords, openJourneyStarts, openJourneySteps } from "@/lib/journeyLog";
import { journeyStats, topicsTalkedAbout, type JourneyStats } from "@/lib/metric";
import { loadReflections, type Reflection } from "@/lib/reflections";
import { loadOpenTopics, loadPlans } from "@/lib/talks";
import { TOPICS } from "@/lib/topics";

// Screen 10: Journey and Progress (Aayushi's simplified flow, 28 Oct 2026), the "Journey" tab.
// Topics completed vs started (the new metric, as counts: never a score), the journeys running now,
// confidence before → now, and the talks themselves. All from this phone. No streaks.

const FEELING_EMOJI = { good: "😊", okay: "😐", hard: "😣" } as const;

export default function JourneyScreen() {
  const [ready, setReady] = useState(false);
  const [talks, setTalks] = useState<Reflection[]>([]);
  const [stats, setStats] = useState<JourneyStats | null>(null);
  const [active, setActive] = useState<Journey[]>([]);
  const [confidence, setConfidence] = useState<ConfidenceEntry[]>([]);
  const [topicsDone, setTopicsDone] = useState(0);

  useEffect(() => {
    // Talks that happened (fully or partly), newest first.
    setTalks(
      loadReflections()
        .filter((r) => r.happened !== "not-yet")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    );
    const records = loadJourneyRecords();
    setStats(journeyStats(records));
    setTopicsDone(topicsTalkedAbout(records));
    setActive(activeJourneys(loadPlans(), loadOpenTopics(), Date.now(), openJourneyStarts(), openJourneySteps()));
    setConfidence(loadConfidence());
    setReady(true);
  }, []);

  function rateBaseline(value: number) {
    recordConfidence(value, "setup");
    setConfidence(loadConfidence());
  }

  const { before, now } = confidenceChange(confidence);

  return (
    <main className="has-bottom-nav" style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: 30 }}>Your journey</h1>
          <HelpPill />
        </div>
        <p className="why">Only you can see this. It stays on your phone.</p>

        {ready && stats && (
          <>
            {/* Two rings (Aayushi, 29 Oct 2026): left = talks noted out of journeys started (the metric, as counts);
                right = different topics talked about out of all topics (same count as Super Parent on Home) */}
            <section className="notice progress-summary">
              <div className="progress-col">
                <ProgressRing done={stats.completed} total={stats.started} unit="talks" colour="var(--primary)" label={`${stats.completed} of ${stats.started} talks noted`} />
                <div className="progress-caption">
                  <strong>Talks noted</strong>
                  <span>{stats.inProgress} in progress</span>
                  {stats.notCompleted > 0 && <span>{stats.notCompleted} ready for another try</span>}
                </div>
              </div>
              <div className="progress-col">
                <ProgressRing done={topicsDone} total={TOPICS.length} unit="topics" colour="var(--accent)" label={`${topicsDone} of ${TOPICS.length} topics talked about`} />
                <div className="progress-caption">
                  <strong>Topics talked about</strong>
                  <span>out of all {TOPICS.length}</span>
                </div>
              </div>
            </section>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "8px 2px 0" }}>
              A talk counts here when you tell us it happened, within 14 days of starting the topic. How it went is yours to keep.
            </p>

            {/* The 14-day journeys running now */}
            <h2 className="section-title">Active now</h2>
            {active.length > 0 ? (
              <div style={{ display: "grid", gap: 10 }}>
                {active.map((j) => (
                  <JourneyCard key={j.planId ?? j.topic} journey={j} whenLabel={j.when ? whenText(j.when) : undefined} />
                ))}
              </div>
            ) : (
              <section className="notice">
                No journey running right now.{" "}
                <Link href="/home" style={{ color: "var(--primary)", fontWeight: 700 }}>
                  Pick a topic →
                </Link>
              </section>
            )}

            {/* Confidence before → now (survey Q14) */}
            <h2 className="section-title">Your confidence</h2>
            {before === undefined ? (
              <section className="notice">
                <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>{CONFIDENCE_QUESTION}</div>
                <ConfidenceScale value={null} onChoose={rateBaseline} />
                <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "10px 0 0" }}>One tap. We'll ask again after your talks.</p>
              </section>
            ) : (
              <section className="notice">
                <ConfidenceGauge before={before} now={now} />
                <p style={{ fontSize: 15, margin: "12px 0 0", lineHeight: 1.45 }}>
                  {now === undefined
                    ? "After your next talk, we'll ask again so you can see how it changes."
                    : now > before
                      ? `Up ${now - before} since you started. Every talk makes the next one easier.`
                      : "Confidence goes up and down. Every talk still counts."}
                </p>
              </section>
            )}

            {/* The talks themselves */}
            <h2 className="section-title">Your talks</h2>
            {talks.length === 0 ? (
              <section className="notice">Your talks will show here after you note how they went.</section>
            ) : (
              <ol className="talk-timeline">
                {talks.map((r) => {
                  const t = TOPICS.find((x) => x.id === r.topic)!;
                  return (
                    <li key={r.planId} className="talk-entry timeline-entry">
                      <TopicArt id={t.id} size={38} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontWeight: 700, color: "var(--text)" }}>{t.short}</span>
                          {r.feeling && <span aria-label={r.feeling}>{FEELING_EMOJI[r.feeling]}</span>}
                        </div>
                        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          {r.happened === "partly" ? " · Partly" : ""}
                          {r.whoTalked === "teen" ? " · Your child spoke more 💛" : ""}
                        </div>
                        {r.learned && <div style={{ fontSize: 15, fontStyle: "italic", marginTop: 6 }}>“{r.learned}”</div>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </main>
  );
}

function ProgressRing({ done, total, unit, colour, label }: { done: number; total: number; unit: string; colour: string; label: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const share = total ? done / total : 0;
  return (
    <div className="progress-ring" role="img" aria-label={label}>
      <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden="true">
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        {/* Nothing drawn at 0, or the rounded line end shows as a dot. */}
        {done > 0 && <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={colour}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${c * share} ${c}`}
          transform="rotate(-90 44 44)"
        />}
      </svg>
      <div className="progress-ring-label">
        <strong>
          {done}/{total}
        </strong>
        <span>{unit}</span>
      </div>
    </div>
  );
}
