"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import FamilySofa from "@/components/FamilySofa";
import { currentFirstLine } from "@/lib/cards";
import JourneyCard, { whenText } from "@/components/JourneyCard";
import TopicCarousel from "@/components/TopicCarousel";
import { activeJourneys } from "@/lib/journey";
import { greetName, loadProfile, type Profile } from "@/lib/profile";
import { loadJourneyRecords, openJourneyStarts, openJourneySteps } from "@/lib/journeyLog";
import { topicsTalkedAbout } from "@/lib/metric";
import { JOURNEY_DAYS, loadOpenTopics, loadPlans, momentOf, planStage, type Plan } from "@/lib/talks";
import { TOPICS, type TopicId } from "@/lib/topics";

// Screen 5: Home (Aayushi's simplified flow, 28 Oct 2026), opened by the "Topics" tab.
// "Hello Mumma/Papa", the in-app reminder, the active 14-day journeys, a topic carousel,
// and "Choose topic from library". No streaks, no scores: just "Day 5 of 14".

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openTopics, setOpenTopics] = useState<TopicId[]>([]);
  const [starts, setStarts] = useState<Partial<Record<TopicId, string>>>({});
  const [talkedAbout, setTalkedAbout] = useState(0);
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
    setStarts(openJourneyStarts());
    setTalkedAbout(topicsTalkedAbout(loadJourneyRecords()));
    setReady(true);
    // Re-check every minute, so "It's time" appears without reloading.
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, [router]);

  if (!ready || !profile) return <main style={{ minHeight: "100dvh", background: "var(--bg)" }} />;

  const nowPlans = [...plans].sort((a, b) => a.when.localeCompare(b.when)).filter((p) => planStage(p, now) === "now" && p.reminder !== false);
  // The "It's time" banner already covers plans happening now, so they're not repeated below.
  const journeys = activeJourneys(plans, openTopics, now, starts, openJourneySteps()).filter((j) => !nowPlans.some((p) => p.id === j.planId));
  const activeTopics = new Set(journeys.map((j) => j.topic));
  // Carousel: topics not already in a journey first, so there's always something new to start.
  // The topic picked in setup comes first (until its journey starts), then new topics, then ones already started.
  const pick = profile.suggestedTopic && !activeTopics.has(profile.suggestedTopic) ? profile.suggestedTopic : undefined;
  const rank = (id: TopicId) => (id === pick ? 0 : activeTopics.has(id) ? 2 : 1);
  const carousel = [...TOPICS].sort((a, b) => rank(a.id) - rank(b.id));

  return (
    <main className="has-bottom-nav" style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "20px 16px 24px" }}>
        {/* Greeting */}
        <h1 style={{ fontSize: 30, lineHeight: 1.15 }}>Hello {greetName(profile)}</h1>
        <div style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 4 }}>One small conversation at a time.</div>

        <SuperParentGoal done={talkedAbout} total={TOPICS.length} />

        {/* In-app reminder: inside the planned window */}
        {nowPlans.map((p) => (
          <section key={p.id} className="time-banner">
            <div className="card-label" style={{ color: "var(--on-primary)", opacity: 0.85 }}>
              {momentOf(p).icon} {whenText(p.when)}
            </div>
            <h2 style={{ fontSize: 26, color: "var(--on-primary)", margin: "6px 0 10px" }}>It's time for your {momentOf(p).calendarTitle.replace(/^Your /, "").toLowerCase()}</h2>
            <p style={{ margin: "0 0 14px", fontSize: 17, lineHeight: 1.4 }}>“{currentFirstLine(p.topic, profile)}”</p>
            <Link href={`/talk/${p.id}`} className="btn-light btn-block">
              Open Talk mode
            </Link>
            <Link href={`/reflect/${p.id}`} className="banner-reflect">
              Already talked? Tell us how it went
            </Link>
          </section>
        ))}

        {/* Topic carousel: moves by itself, and can be swiped */}
        <h2 className="section-title">Start a conversation</h2>
        <TopicCarousel topics={carousel} pick={pick} active={activeTopics} />

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
              <div style={{ fontWeight: 700, color: "var(--text)" }}>Ready when you are</div>
              <div style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 2 }}>Pick a topic and you'll have {JOURNEY_DAYS} days to prepare, talk and reflect.</div>
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

// "Becoming a Super Parent" (Aayushi's decision, 28 Oct 2026): one step for each topic the parent has
// had a talk about. Kind wording only: it never says a parent isn't one, it only goes up, no streaks.
function SuperParentGoal({ done, total }: { done: number; total: number }) {
  const reached = done >= total;
  const message =
    done === 0
      ? "Every conversation starts somewhere. Pick a topic when you feel ready."
      : reached
        ? `You've noted a talk on all ${total} topics. Keep the conversations going.`
        : "You're on your way. Each talk you note fills one step, at your own pace.";
  return (
    <section className="goal-card" aria-label={`Becoming a Super Parent: ${done} of ${total} topics talked about`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span className="goal-title">{reached ? "Super Parent ⭐" : "Becoming a Super Parent"}</span>
        <span className="goal-count">
          {Math.min(done, total)} of {total} topics
        </span>
      </div>
      <div className="goal-bar" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < done ? "done" : ""} />
        ))}
      </div>
      <p className="goal-message">{message}</p>
    </section>
  );
}
