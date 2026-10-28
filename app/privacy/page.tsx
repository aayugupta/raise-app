"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HelpPill from "@/components/HelpPill";
import PhoneLock from "@/components/PhoneLock";

// Screen 3: Privacy promise (D1: shown before choosing a topic).
// Every line must stay true to how Raise is actually built.
const PROMISES: { title: string; detail: string }[] = [
  {
    title: "Your notes stay on this phone",
    detail: "What you write after a talk is never sent anywhere. Not to us, not to the AI.",
  },
  {
    title: "Your teen never sees Raise",
    detail: "Raise sends no notifications. Reminders show only inside the app, and never name the topic, just “your walk”.",
  },
  {
    title: "A talk tool, never a spy tool",
    detail: "Raise doesn't track, monitor or read anything on your teen's phone.",
  },
  {
    title: "No talks are recorded",
    detail: "Raise never listens or records. You put the phone away and talk.",
  },
  {
    title: "The AI sees only what it needs",
    detail:
      "Talk Cards use only your taps (like “father, 15–16, Hinglish”). In AI Coach, what you type goes to Google's Gemini AI to write a reply, so please don't use names. Your reflections are never sent.",
  },
  {
    title: "We count taps, not people",
    detail: "To improve Raise we count things like “card opened”, with no names and no words you write.",
  },
];

export default function Privacy() {
  const router = useRouter();
  // Shown during setup, and again any time from Profile ("?from=profile").
  const [fromProfile, setFromProfile] = useState(false);
  useEffect(() => {
    setFromProfile(new URLSearchParams(window.location.search).get("from") === "profile");
  }, []);

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => (fromProfile ? router.push("/profile") : router.push("/setup"))} className="icon-btn" aria-label="Back">
            ←
          </button>
          <HelpPill />
        </div>

        <div className="illustration-panel">
          <PhoneLock />
        </div>

        <h1 style={{ fontSize: 30, lineHeight: 1.15, textWrap: "balance" }}>Your talks stay yours</h1>
        <p className="why">{fromProfile ? "Our promise to you and your teen." : "Before you start, here's our promise."}</p>

        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "grid", gap: 14 }}>
          {PROMISES.map((p) => (
            <li key={p.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span className="tick" aria-hidden="true">
                ✓
              </span>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 16 }}>{p.title}</div>
                <div style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.4, marginTop: 2 }}>{p.detail}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="sticky-action">
          <button className="btn-primary btn-block" onClick={() => router.push(fromProfile ? "/profile" : "/topics")}>
            {fromProfile ? "Back to Profile" : "Got it, choose a topic"}
          </button>
        </div>
      </div>
    </main>
  );
}
