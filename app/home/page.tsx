"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import FamilySofa from "@/components/FamilySofa";
import HelpPill from "@/components/HelpPill";
import { currentFirstLine } from "@/lib/cards";
import { isFollowUpDue } from "@/lib/followUp";
import { activeJourneys, type Journey } from "@/lib/journey";
import { greetName, loadProfile, type Profile } from "@/lib/profile";
import { loadReflections, type Reflection } from "@/lib/reflections";
import { loadOpenTopics, loadPlans, momentOf, planStage, type Plan } from "@/lib/talks";
import { TOPICS, type TopicId } from "@/lib/topics";

// Screen 7: Home (brainstorm screen 3). The reason to come back: the in-app reminder,
// "Continue your journey", and a grid to start a new conversation. No streaks, no scores.

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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
  const [reflections, setReflections] = useState<Reflection[]>([]);
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
    setReflections(loadReflections());
    setReady(true);
    // Re-check every minute, so "It's time" appears without reloading.
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, [router]);

  if (!ready || !profile) return <main style={{ minHeight: "100dvh", background: "var(--cream)" }} />;

  const nowPlans = [...plans].sort((a, b) => a.when.localeCompare(b.when)).filter((p) => planStage(p, now) === "now");
  const followUps = reflections.filter((r) => isFollowUpDue(r, now));
  // The "It's time" banner already covers plans happening now, so they're not repeated below.
  const journeys = activeJourneys(plans, openTopics, now).filter((j) => !nowPlans.some((p) => p.id === j.planId));
  const name = greetName(profile);

  return (
    <main className="has-bottom-nav" style={{ minHeight: "100dvh", background: "var(--cream)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 24px" }}>
        {/* Greeting */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 26, lineHeight: 1.15 }}>
              {greeting(new Date(now).getHours())}, {name}
            </h1>
            <div style={{ fontSize: 15, color: "var(--muted)", marginTop: 2 }}>Small steps. Big conversations.</div>
          </div>
          <HelpPill />
        </div>

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

        {/* 3-day follow-up, built from the parent's own reflection (FR8) */}
        {followUps.map((r) => (
          <section key={r.planId} className="notice" style={{ marginTop: 16, borderLeft: "5px solid var(--mustard)" }}>
            <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 17 }}>💬 A quick question</div>
            <p style={{ margin: "4px 0 12px", fontSize: 15, color: "var(--muted)" }}>
              About your talk on {new Date(r.createdAt).toLocaleDateString("en-IN", { weekday: "long" })}. Two taps, and we'll suggest a next line.
            </p>
            <Link href={`/follow-up/${r.planId}`} className="btn-secondary btn-block" style={{ textAlign: "center", textDecoration: "none" }}>
              Answer
            </Link>
          </section>
        ))}

        {/* Continue your journey (brainstorm screen 3) */}
        <h2 className="section-title">Continue your journey</h2>
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
              <div style={{ fontSize: 15, color: "var(--muted)", marginTop: 2 }}>Pick a topic below and we'll give you the first line.</div>
            </div>
          </section>
        )}

        {/* Start a new conversation: all 8 topics */}
        <h2 className="section-title">Start a new conversation</h2>
        <div className="topic-grid">
          {TOPICS.map((t) => (
            <Link key={t.id} href={`/card/${t.id}`} className="topic-tile" aria-label={t.name}>
              <span className="topic-tile-icon" style={{ background: `${t.color}26` }} aria-hidden="true">
                {t.icon}
              </span>
              <span>{t.short}</span>
            </Link>
          ))}
        </div>

        {/* For talks that happened without a plan in Raise. */}
        <Link href="/log" className="btn-secondary btn-block" style={{ marginTop: 18, textAlign: "center", textDecoration: "none" }}>
          💬 I had a talk
        </Link>
      </div>
      <BottomNav />
    </main>
  );
}

// One active topic: its step (Prepare → Talk → Reflect), a 3-part progress bar, and the next action.
function JourneyCard({ journey, whenLabel }: { journey: Journey; whenLabel?: string }) {
  const t = topicMeta(journey.topic);
  return (
    <Link href={journey.href} className="journey-card">
      <span className="topic-tile-icon" style={{ background: `${t.color}26` }} aria-hidden="true">
        {t.icon}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontWeight: 700, color: "var(--ink)" }}>{t.short}</span>
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
