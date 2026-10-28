"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { activeJourneys } from "@/lib/journey";
import { loadJourneyRecords, openJourneyStarts, openJourneySteps } from "@/lib/journeyLog";
import { MAP_STOPS, mapPosition } from "@/lib/journeyMap";
import { loadProfile } from "@/lib/profile";
import { loadOpenTopics, loadPlans } from "@/lib/talks";

// "How Raise works": a small journey map, shown once right after setup (Aayushi, 29 Oct 2026).
// Five stops on a path, with "You are here": the open topic furthest along, else the setup pick (at Learn),
// else Pick a topic. Also opened from the small map on Home (?from=home).

export default function HowItWorks() {
  const router = useRouter();
  const [here, setHere] = useState<{ index: number; label: string } | null>(null);
  const [fromHome, setFromHome] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/");
      return;
    }
    const journeys = activeJourneys(loadPlans(), loadOpenTopics(), Date.now(), openJourneyStarts(), openJourneySteps());
    const started = new Set(loadJourneyRecords().map((r) => r.topic));
    const pick = p.suggestedTopic && !started.has(p.suggestedTopic) ? p.suggestedTopic : undefined;
    setHere(mapPosition(journeys, pick));
    setFromHome(new URLSearchParams(window.location.search).get("from") === "home");
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
          {MAP_STOPS.map((s, i) => {
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
          {fromHome ? "Back to Home" : "Let's begin"}
        </Link>
      </div>
    </main>
  );
}
