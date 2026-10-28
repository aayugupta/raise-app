"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadProfile } from "@/lib/profile";
import { TOPICS } from "@/lib/topics";

// "How Raise works": a small journey map, shown once right after setup (Aayushi, 29 Oct 2026).
// Five stops on a path, with "You are here" from the setup answer: a picked topic starts at Learn,
// no pick starts at Pick a topic.

const STOPS = [
  { icon: "📚", title: "Pick a topic", text: "Choose what you'd like to talk about with your child." },
  { icon: "🃏", title: "Learn", text: "Flashcards give you a first line, gentle questions, and what to say." },
  { icon: "💬", title: "Practise (optional)", text: "Ask the AI Coach your doubts, or role-play with it playing your child." },
  { icon: "🗓️", title: "Plan a moment", text: "A walk or a quiet evening. Raise reminds you inside the app." },
  { icon: "💛", title: "Talk, then tell us how it went", text: "Two taps. Your Super Parent bar fills, and a new topic opens up." },
];

export default function HowItWorks() {
  const router = useRouter();
  const [here, setHere] = useState<{ index: number; label: string } | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/");
      return;
    }
    const topic = TOPICS.find((t) => t.id === p.suggestedTopic);
    setHere(topic ? { index: 1, label: `Learn about ${topic.short}` } : { index: 0, label: "Pick a topic" });
  }, [router]);

  if (!here) return <main style={{ minHeight: "100dvh", background: "var(--bg)" }} />;

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "28px 16px 32px" }}>
        <div className="card-label">Your journey with Raise</div>
        <h1 style={{ fontSize: "var(--fs-2xl)", margin: "4px 0 6px" }}>Here&apos;s how it works</h1>
        <p className="why" style={{ marginBottom: 20 }}>
          One topic at a time, five small steps. The goal is simple: one real talk with your child.
        </p>

        <ol className="journey-map" aria-label="The five steps">
          {STOPS.map((s, i) => {
            const state = i < here.index ? "done" : i === here.index ? "here" : "next";
            return (
              <li key={s.title} className={`map-stop ${state}`} aria-current={state === "here" ? "step" : undefined}>
                <span className="map-dot" aria-hidden="true">
                  {state === "done" ? "✓" : s.icon}
                </span>
                <div className="map-body">
                  <div className="map-title">
                    <span className="map-number">{i + 1}</span> {s.title}
                  </div>
                  <div className="map-text">{s.text}</div>
                  {state === "here" && <div className="map-here">You are here: {here.label}</div>}
                </div>
              </li>
            );
          })}
        </ol>

        <p className="map-note">Take your time. Your topic stays open until you tell us about your talk.</p>

        <Link href="/home" className="btn-primary btn-block" style={{ textDecoration: "none", marginTop: 20 }}>
          Let&apos;s begin
        </Link>
      </div>
    </main>
  );
}
