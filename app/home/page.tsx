"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FamilySofa from "@/components/FamilySofa";
import { currentFirstLine } from "@/lib/cards";
import { isFollowUpDue } from "@/lib/followUp";
import { loadProfile, type Profile } from "@/lib/profile";
import { loadReflections, type Reflection } from "@/lib/reflections";
import { loadOpenTopics, loadPlans, momentOf, planStage, type Plan } from "@/lib/talks";
import { TOPICS, type TopicId } from "@/lib/topics";

// Screen 7: Home. The reason to come back: the next talk, the in-app reminder,
// a gentle check-in after a planned moment, and open topics. No streaks, no scores.

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
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${time}`;
  return `${d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}, ${time}`;
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

  const byTime = [...plans].sort((a, b) => a.when.localeCompare(b.when));
  const nowPlans = byTime.filter((p) => planStage(p, now) === "now");
  const upcoming = byTime.filter((p) => planStage(p, now) === "upcoming");
  const checkIns = byTime.filter((p) => planStage(p, now) === "check-in");
  const followUps = reflections.filter((r) => isFollowUpDue(r, now));
  const nothingYet = !nowPlans.length && !upcoming.length && !checkIns.length && !openTopics.length && !followUps.length;
  const name = profile.nickname || "there";

  return (
    <main style={{ minHeight: "100dvh", background: "var(--cream)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 32px" }}>
        {/* Greeting */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="avatar" aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>{greeting(new Date(now).getHours())},</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>{name}</div>
          </div>
          <Link href="/help" className="help-pill">
            Help
          </Link>
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

        {/* Gentle check-in after a planned moment: never "missed" */}
        {checkIns.map((p) => (
          <section key={p.id} className="notice" style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 17 }}>
              {momentOf(p).icon} How did your {momentOf(p).calendarTitle.replace(/^Your /, "").toLowerCase()} go?
            </div>
            <p style={{ margin: "4px 0 12px", fontSize: 15, color: "var(--muted)" }}>
              {topicMeta(p.topic).name} · {whenText(p.when)}. Whether you talked or not, it helps to note it.
            </p>
            <Link href={`/reflect/${p.id}`} className="btn-secondary btn-block" style={{ textAlign: "center", textDecoration: "none" }}>
              Tell us how it went
            </Link>
          </section>
        ))}

        {/* Upcoming plans */}
        {upcoming.length > 0 && (
          <>
            <h2 className="section-title">Your next talk</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {upcoming.map((p) => (
                <Link key={p.id} href={`/card/${p.topic}`} className="next-talk">
                  <span className="topic-dot" style={{ background: topicMeta(p.topic).color }} aria-hidden="true" />
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontWeight: 700, color: "var(--ink)" }}>
                      {momentOf(p).icon} {whenText(p.when)}
                    </span>
                    <span style={{ display: "block", fontSize: 14, color: "var(--muted)", marginTop: 2 }}>{topicMeta(p.topic).name}</span>
                    <span style={{ display: "block", fontSize: 15, fontStyle: "italic", color: "var(--text)", marginTop: 6 }}>
                      “{currentFirstLine(p.topic, profile)}”
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Open topics: opened, then "Not now" */}
        {openTopics.length > 0 && (
          <>
            <h2 className="section-title">Open topics</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {openTopics.map((id) => (
                <div key={id} className="topic-card" style={{ cursor: "default" }}>
                  <span className="topic-dot" style={{ background: topicMeta(id).color }} aria-hidden="true" />
                  <span style={{ flex: 1, fontWeight: 700, color: "var(--ink)" }}>{topicMeta(id).name}</span>
                  <Link href={`/card/${id}`} style={{ color: "var(--teal)", fontWeight: 700, textDecoration: "none" }}>
                    Plan it →
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

        {nothingYet && (
          <section className="notice" style={{ marginTop: 20, textAlign: "center" }}>
            <div className="illustration-panel" style={{ marginTop: 0 }}>
              <FamilySofa />
            </div>
            <h2 style={{ fontSize: 22 }}>Ready when you are</h2>
            <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>Pick one topic and we'll give you the first line.</p>
          </section>
        )}

        <Link href="/topics" className="btn-primary btn-block" style={{ marginTop: 24 }}>
          {nothingYet ? "Choose a topic" : "Start a new topic"}
        </Link>
      </div>
    </main>
  );
}
