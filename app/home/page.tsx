"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import FamilySofa from "@/components/FamilySofa";
import { currentFirstLine } from "@/lib/cards";
import { activeJourneys, type Journey } from "@/lib/journey";
import { greetName, loadProfile, type Profile } from "@/lib/profile";
import { JOURNEY_DAYS, loadOpenTopics, loadPlans, loadTopicStarts, momentOf, planStage, type Plan } from "@/lib/talks";
import { TOPICS, type TopicId } from "@/lib/topics";

// Screen 5: Home (Aayushi's simplified flow, 28 Oct 2026), opened by the "Topics" tab.
// "Hello Mumma/Papa", the in-app reminder, the active 14-day journeys, a topic carousel,
// and "Choose topic from library". No streaks, no scores: just "Day 5 of 14".

function whenText(iso: string) {
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

const topicMeta = (id: TopicId) => TOPICS.find((t) => t.id === id)!;

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openTopics, setOpenTopics] = useState<TopicId[]>([]);
  const [starts, setStarts] = useState<Partial<Record<TopicId, string>>>({});
  const [now, setNow] = useState(() => Date.now());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/");
      return;
    }
    setProfile(p);
    setPlans(loadPlans());
    setOpenTopics(loadOpenTopics());
    setStarts(loadTopicStarts());
    setReady(true);
    // Re-check every minute, so "It's time" appears without reloading.
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, [router]);

  if (!ready || !profile) return <main style={{ minHeight: "100dvh", background: "var(--cream)" }} />;

  const nowPlans = [...plans].sort((a, b) => a.when.localeCompare(b.when)).filter((p) => planStage(p, now) === "now");
  // The "It's time" banner already covers plans happening now, so they're not repeated below.
  const journeys = activeJourneys(plans, openTopics, now, starts).filter((j) => !nowPlans.some((p) => p.id === j.planId));
  const activeTopics = new Set(journeys.map((j) => j.topic));
  // Carousel: topics not already in a journey first, so there's always something new to start.
  const carousel = [...TOPICS].sort((a, b) => Number(activeTopics.has(a.id)) - Number(activeTopics.has(b.id)));

  return (
    <main className="has-bottom-nav" style={{ minHeight: "100dvh", background: "var(--cream)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "20px 16px 24px" }}>
        {/* Greeting */}
        <h1 style={{ fontSize: 30, lineHeight: 1.15 }}>Hello {greetName(profile)}</h1>
        <div style={{ fontSize: 15, color: "var(--muted)", marginTop: 4 }}>One small conversation at a time.</div>

        {/* In-app reminder: inside the planned window */}
        {nowPlans.map((p) => (
          <section key={p.id} className="time-banner">
            <div className="card-label" style={{ color: "#fff", opacity: 0.85 }}>
              {momentOf(p).icon} {whenText(p.when)}
            </div>
            <h2 style={{ fontSize: 26, color: "#fff", margin: "6px 0 10px" }}>It's time for your {momentOf(p).calendarTitle.replace(/^Your /, "").toLowerCase()}</h2>
            <p style={{ margin: "0 0 14px", fontSize: 17, lineHeight: 1.4 }}>“{currentFirstLine(p.topic, profile)}”</p>
            <Link href={`/talk/${p.id}`} className="btn-light btn-block">
              Open Talk mode
            </Link>
          </section>
        ))}

        {/* Topic carousel: swipe sideways */}
        <h2 className="section-title">Start a conversation</h2>
        <div className="topic-carousel" role="list" aria-label="Topics">
          {carousel.map((t) => (
            <Link key={t.id} href={`/card/${t.id}`} className="carousel-card" role="listitem" style={{ background: `${t.color}1f`, borderColor: `${t.color}55` }}>
              <span className="carousel-icon" aria-hidden="true">
                {t.icon}
              </span>
              <span className="carousel-name">{t.name}</span>
              <span className="carousel-question">Teens wonder: “{t.teenQuestion}”</span>
              <span className="carousel-open">{activeTopics.has(t.id) ? "Continue →" : "Open flashcards →"}</span>
            </Link>
          ))}
        </div>

        {/* Active 14-day journeys */}
        <h2 className="section-title">Your {JOURNEY_DAYS}-day journey</h2>
        {journeys.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            {journeys.map((j) => (
              <JourneyCard key={j.planId ?? j.topic} journey={j} whenLabel={j.when ? whenText(j.when) : undefined} />
            ))}
          </div>
        ) : (
          <section className="notice journey-empty">
            <div className="journey-empty-art" aria-hidden="true">
              <FamilySofa />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "var(--ink)" }}>Ready when you are</div>
              <div style={{ fontSize: 15, color: "var(--muted)", marginTop: 2 }}>Pick a topic and you'll have {JOURNEY_DAYS} days to prepare, talk and reflect.</div>
            </div>
          </section>
        )}

        <Link href="/topics" className="btn-secondary btn-block" style={{ marginTop: 18, textAlign: "center", textDecoration: "none" }}>
          📚 Choose topic from library
        </Link>
      </div>
      <BottomNav />
    </main>
  );
}

// One active topic: "Day 5 of 14", its step (Prepare → Talk → Reflect), and the next action.
function JourneyCard({ journey, whenLabel }: { journey: Journey; whenLabel?: string }) {
  const t = topicMeta(journey.topic);
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
