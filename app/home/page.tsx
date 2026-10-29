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
  // Topics talked about (a completed journey), newest first: shown as "Done ✓" in the journey section.
  const [doneTopics, setDoneTopics] = useState<{ topic: TopicId; at: string }[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [ready, setReady] = useState(false);
  const [snoozed, setSnoozed] = useState<Record<string, string>>({});

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
    const latest = new Map<TopicId, string>();
    for (const rec of records) {
      if (rec.completedAt && !rec.helpOffered && (latest.get(rec.topic) ?? "") < rec.completedAt) latest.set(rec.topic, rec.completedAt);
    }
    setDoneTopics([...latest].map(([topic, at]) => ({ topic, at })).sort((a, b) => b.at.localeCompare(a.at)));
    try {
      setSnoozed(JSON.parse(localStorage.getItem(SNOOZE_KEY) ?? "{}"));
    } catch {}
    setReady(true);
    // Re-check every minute, so "It's time" appears without reloading.
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, [router]);

  function remindTomorrow(planId: string) {
    const at = new Date();
    at.setDate(at.getDate() + 1);
    at.setHours(8, 0, 0, 0);
    const next = { ...snoozed, [planId]: at.toISOString() };
    setSnoozed(next);
    try {
      localStorage.setItem(SNOOZE_KEY, JSON.stringify(next));
    } catch {}
  }

  if (!ready || !profile) return <main style={{ minHeight: "100dvh", background: "var(--bg)" }} />;

  // Reflection reminder (Aayushi, 29 Oct 2026): once a planned moment has passed, the top of Home gently asks
  // how it went, until the parent reflects or picks "Remind me tomorrow". It never names the topic.
  const duePlan = [...plans]
    .sort((a, b) => a.when.localeCompare(b.when))
    .find((p) => {
      const stage = planStage(p, now);
      // From 30 minutes after the planned time (Aayushi, 29 Oct 2026), not only once the reminder window closes.
      const due = stage === "check-in" || (stage === "now" && now > Date.parse(p.when) + REFLECT_AFTER_MS);
      return due && !(snoozed[p.id] && Date.parse(snoozed[p.id]) > now);
    });
  const nowPlans = [...plans].sort((a, b) => a.when.localeCompare(b.when)).filter((p) => planStage(p, now) === "now" && p.reminder !== false && p.id !== duePlan?.id);
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
  // New topics first, then ones in progress, then ones already talked about.
  const done = new Set(doneTopics.map((d) => d.topic));
  const rank = (id: TopicId) => (done.has(id) ? 2 : activeTopics.has(id) ? 1 : 0);
  const carousel = [...TOPICS].sort((a, b) => rank(a.id) - rank(b.id));
  // Up next: the first topic (in the library's order) not done, not in progress and not the setup pick.
  const upNext = TOPICS.find((t) => !done.has(t.id) && !activeTopics.has(t.id) && t.id !== pick?.id);

  return (
    <main className="has-bottom-nav" style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div className="home-layout">
        <div className="home-top">
          {/* Greeting */}
          <h1 style={{ fontSize: 30, lineHeight: 1.15 }}>Hello {greetName(profile)}</h1>
          <div style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 4 }}>One small conversation at a time.</div>

          {duePlan && <ReflectReminder plan={duePlan} onLater={() => remindTomorrow(duePlan.id)} />}

          {/* The small journey map: where you are in Raise's five steps (tap for the full map) */}
          {/* Becoming a Super Parent first, then the journey map right below it (Aayushi, 29 Oct 2026) */}
          <SuperParentGoal done={talkedAbout} total={TOPICS.length} />
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
        </div>

        <div className="home-carousel">
          {/* Topic carousel: moves by itself, and can be swiped */}
          <h2 className="section-title">Start a conversation</h2>
          <TopicCarousel topics={carousel} active={activeTopics} />
        </div>

        {/* Right column on wider screens; under the carousel on phones (next step first there) */}
        <aside className="home-side">
          <div className="home-side-next">
            {/* The gentle nudge: have the talk, then tell Raise how it went, and a new topic can follow. */}
            {journeys.length > 0 && nowPlans.length === 0 && journeys[0].planId !== duePlan?.id && <TalkPrompt journey={journeys[0]} />}
          </div>
        </aside>

        <div className="home-journey">
          {/* Active 14-day journeys */}
          <h2 className="section-title">Your {JOURNEY_DAYS}-day journey</h2>
          {journeys.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {journeys.map((j) => (
                <JourneyCard key={j.planId ?? j.topic} journey={j} whenLabel={j.when ? whenText(j.when) : undefined} />
              ))}
            </div>
          ) : upNext || doneTopics.length > 0 ? null : (
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

          {/* Up next: one topic not started yet (the setup pick has its own card above) */}
          {upNext && (
            <Link href={`/card/${upNext.id}`} className="up-next" style={{ borderColor: `${upNext.color}66` }}>
              <TopicArt id={upNext.id} size={44} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="card-label">Up next</span>
                <span className="up-next-name">{upNext.name}</span>
                <span className="up-next-question">Teens wonder: “{upNext.teenQuestion}”</span>
              </span>
              <span className="up-next-go">Start →</span>
            </Link>
          )}

          {/* Done: topics already talked about, so progress stays visible */}
          {doneTopics.length > 0 && (
            <div className="done-topics">
              <div className="card-label">Done</div>
              {doneTopics.map((d) => {
                const t = TOPICS.find((x) => x.id === d.topic)!;
                return (
                  <div key={d.topic} className="done-row">
                    <TopicArt id={t.id} size={32} />
                    <span style={{ flex: 1, minWidth: 0, fontWeight: 600 }}>{t.short}</span>
                    <span className="done-tag">
                      ✓ Talked about · {new Date(d.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <Link href="/topics" className="btn-secondary btn-block" style={{ marginTop: 18, textAlign: "center", textDecoration: "none" }}>
            📚 Choose topic from library
          </Link>
        </div>
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
      ? "Every conversation starts somewhere."
      : reached
        ? "Keep the conversations going."
        : "Each talk you note grows a leaf.";
  return (
    <section className="goal-card goal-sprout" aria-label={`Becoming a Super Parent: ${done} of ${total} topics talked about`}>
      {/* One leaf grows for each topic talked about (29 Oct 2026) */}
      <Sprout done={done} total={total} size={48} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span className="goal-title">{reached ? "Super Parent ⭐" : "Becoming a Super Parent"}</span>
          <span className="goal-count">
            {Math.min(done, total)} of {total} topics
          </span>
        </div>
        <p className="goal-message goal-italic">{message}</p>
      </div>
    </section>
  );
}

const SNOOZE_KEY = "raise.reflectSnooze";
const REFLECT_AFTER_MS = 30 * 60_000;

// The gentle "how did it go?" at the top of Home, after a planned moment. Names the moment ("Your walk"),
// never the topic, because a teen might see the screen.
function ReflectReminder({ plan, onLater }: { plan: Plan; onLater: () => void }) {
  const m = momentOf(plan);
  return (
    <section className="reflect-reminder" role="status" aria-label="Reminder: tell us how it went">
      <div className="card-label">
        <span aria-hidden="true">{m.icon}</span> {m.calendarTitle} · {whenText(plan.when)}
      </div>
      <div className="reflect-reminder-title">How did it go?</div>
      <p className="reflect-reminder-text">
        Take a minute to note it while it&apos;s fresh. It only takes two taps, and it stays on your phone. If it didn&apos;t happen yet,
        that&apos;s okay too.
      </p>
      <Link href={`/reflect/${plan.id}`} className="btn-primary btn-block" style={{ textDecoration: "none" }}>
        Tell us how it went
      </Link>
      <button type="button" className="reflect-reminder-later" onClick={onLater}>
        Remind me tomorrow
      </button>
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
