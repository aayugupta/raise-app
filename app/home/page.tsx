"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import FamilySofa from "@/components/FamilySofa";
import { currentFirstLine } from "@/lib/cards";
import JourneyCard, { whenText } from "@/components/JourneyCard";
import JourneyMapMini from "@/components/JourneyMapMini";
import Sprout from "@/components/Sprout";
import TopicArt from "@/components/TopicArt";
import { mapPosition } from "@/lib/journeyMap";
import type { Journey } from "@/lib/journey";
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
  // Topics that have ever had a 14-day journey: the setup pick stops being "your chosen topic" once started.
  const [everStarted, setEverStarted] = useState<Set<TopicId>>(new Set());
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
    const records = loadJourneyRecords();
    setTalkedAbout(topicsTalkedAbout(records));
    setEverStarted(new Set(records.map((r) => r.topic)));
    setReady(true);
    // Re-check every minute, so "It's time" appears without reloading.
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, [router]);

  if (!ready || !profile) return <main style={{ minHeight: "100dvh", background: "var(--bg)" }} />;

  const nowPlans = [...plans].sort((a, b) => a.when.localeCompare(b.when)).filter((p) => planStage(p, now) === "now" && p.reminder !== false);
  // The "It's time" banner already covers plans happening now, so they're not repeated below.
  const allJourneys = activeJourneys(plans, openTopics, now, starts, openJourneySteps());
  const journeys = allJourneys.filter((j) => !nowPlans.some((p) => p.id === j.planId));
  const activeTopics = new Set(journeys.map((j) => j.topic));
  // Carousel: topics not already in a journey first, so there's always something new to start.
  // The topic picked in setup gets its own "Your chosen topic" card until its journey starts (Aayushi, 29 Oct 2026);
  // after that it lives in "Your 14-day journey". The carousel then lists new topics before started ones.
  const pick =
    profile.suggestedTopic && !activeTopics.has(profile.suggestedTopic) && !everStarted.has(profile.suggestedTopic)
      ? TOPICS.find((t) => t.id === profile.suggestedTopic)
      : undefined;
  const rank = (id: TopicId) => (activeTopics.has(id) ? 1 : 0);
  const carousel = [...TOPICS].sort((a, b) => rank(a.id) - rank(b.id));

  return (
    <main className="has-bottom-nav" style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "20px 16px 24px" }}>
        {/* Greeting */}
        <h1 style={{ fontSize: 30, lineHeight: 1.15 }}>Hello {greetName(profile)}</h1>
        <div style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 4 }}>One small conversation at a time.</div>

        {/* The small journey map: where you are in Raise's five steps (tap for the full map) */}
        <JourneyMapMini {...mapPosition(allJourneys, pick?.id)} />

        {/* The topic picked in setup, on its own so it's clearly "mine" */}
        {pick && (
          <section className="chosen-topic" style={{ borderColor: `${pick.color}66`, background: `${pick.color}14` }}>
            <div className="card-label">Your chosen topic</div>
            <div className="chosen-topic-name" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TopicArt id={pick.id} size={48} />
              <span>{pick.name}</span>
            </div>
            <p className="chosen-topic-question">Teens wonder: “{pick.teenQuestion}”</p>
            <Link href={`/card/${pick.id}`} className="btn-primary btn-block" style={{ textDecoration: "none" }}>
              Let&apos;s get started →
            </Link>
            <p style={{ margin: "8px 0 0", fontSize: "var(--fs-sm)", color: "var(--text-muted)", textAlign: "center" }}>
              Step 1 of 4: read the flashcards
            </p>
          </section>
        )}

        {/* The gentle nudge: have the talk, then tell Raise how it went, and a new topic can follow. */}
        {journeys.length > 0 && nowPlans.length === 0 && <TalkPrompt journey={journeys[0]} />}

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
        <TopicCarousel topics={carousel} active={activeTopics} />

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
        : "You're on your way. Each talk you note grows a new leaf, at your own pace.";
  return (
    <section className="goal-card goal-sprout" aria-label={`Becoming a Super Parent: ${done} of ${total} topics talked about`}>
      {/* One leaf grows for each topic talked about (29 Oct 2026) */}
      <Sprout done={done} total={total} size={70} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="goal-title">{reached ? "Super Parent ⭐" : "Becoming a Super Parent"}</span>
        <div className="goal-count">
          {Math.min(done, total)} of {total} topics · {Math.min(done, total)} {Math.min(done, total) === 1 ? "leaf" : "leaves"} grown
        </div>
        <p className="goal-message" style={{ marginTop: 6 }}>
          {message}
        </p>
      </div>
    </section>
  );
}

// Home's prompt for the topic furthest along (Aayushi, 29 Oct 2026): the goal is one real talk.
// It asks gently, never says a parent is behind, and points to the two-tap reflection.
function TalkPrompt({ journey }: { journey: Journey }) {
  const t = TOPICS.find((x) => x.id === journey.topic)!;
  return (
    <section className="talk-prompt" aria-label="Your next step">
      <div className="card-label">Your next step</div>
      <div className="talk-prompt-title">
        <span aria-hidden="true">{t.icon}</span> Have you talked about {t.short}?
      </div>
      <p className="talk-prompt-text">
        Whenever it feels right, talk with your child. Then tell us how it went: it only takes two taps. After that, a new topic is
        waiting for you.
      </p>
      <Link href={journey.reflectHref} className="btn-primary btn-block" style={{ textDecoration: "none" }}>
        Yes, tell us how it went
      </Link>
      {journey.href !== journey.reflectHref && (
        <Link href={journey.href} className="talk-prompt-link">
          Not yet? {journey.action}
        </Link>
      )}
    </section>
  );
}
