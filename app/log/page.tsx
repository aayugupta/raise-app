"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HelpPill from "@/components/HelpPill";
import { track } from "@/lib/events";
import { logUnplannedTalk, MOMENTS, type MomentId } from "@/lib/talks";
import { TOPICS, type TopicId } from "@/lib/topics";

// Screen 13: "I had a talk". For talks that happened without a plan in Raise.
// Three taps (topic, when, where), then the same 30-second reflection.

const WHEN: { value: "today" | "yesterday" | "earlier"; label: string; daysAgo: number }[] = [
  { value: "today", label: "Today", daysAgo: 0 },
  { value: "yesterday", label: "Yesterday", daysAgo: 1 },
  { value: "earlier", label: "Earlier this week", daysAgo: 3 },
];

export default function LogTalk() {
  const router = useRouter();
  const [topic, setTopic] = useState<TopicId | null>(null);

  // "Already talked?" from a journey card arrives with its topic chosen.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("topic");
    const match = TOPICS.find((x) => x.id === t);
    if (match) setTopic(match.id);
  }, []);
  const [when, setWhen] = useState<(typeof WHEN)[number]["value"] | null>(null);
  const [moment, setMoment] = useState<MomentId | null>(null);

  function next() {
    if (!topic || !when || !moment) return;
    const daysAgo = WHEN.find((w) => w.value === when)!.daysAgo;
    const at = new Date(Date.now() - daysAgo * 86_400_000);
    const plan = logUnplannedTalk(topic, moment, at);
    track("talk_logged", { topic, plan_id: plan.id, moment, when });
    router.push(`/reflect/${plan.id}`);
  }

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.push("/home")} className="icon-btn" aria-label="Back">
            ←
          </button>
          <HelpPill />
        </div>

        <h1 style={{ fontSize: 28, lineHeight: 1.15, margin: "18px 0 0", textWrap: "balance" }}>Had a talk? Note it here.</h1>
        <p className="why">Talks that just happen count too. Three taps, then 30 seconds on how it went. It stays on your phone.</p>

        <h2 className="section-title" style={{ marginTop: 4 }}>
          What did you talk about?
        </h2>
        <div style={{ display: "grid", gap: 8 }}>
          {TOPICS.map((t) => (
            <button
              key={t.id}
              aria-label={t.name}
              aria-pressed={topic === t.id}
              className={`option${topic === t.id ? " selected" : ""}`}
              onClick={() => setTopic(t.id)}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="topic-dot" style={{ background: t.color, marginTop: 0 }} aria-hidden="true" />
                {t.name}
              </span>
            </button>
          ))}
        </div>

        <h2 className="section-title">When?</h2>
        <div className="chips">
          {WHEN.map((w) => (
            <button key={w.value} className={`chip${when === w.value ? " selected" : ""}`} onClick={() => setWhen(w.value)}>
              {w.label}
            </button>
          ))}
        </div>

        <h2 className="section-title">Where were you?</h2>
        <div className="chips">
          {MOMENTS.map((m) => (
            <button key={m.id} className={`chip${moment === m.id ? " selected" : ""}`} onClick={() => setMoment(m.id)}>
              {m.icon} {m.label.replace(/, when it's quiet$/, "")}
            </button>
          ))}
        </div>

        <div className="sticky-action">
          <button className="btn-primary btn-block" onClick={next} disabled={!topic || !when || !moment}>
            Next: how did it go?
          </button>
        </div>
      </div>
    </main>
  );
}
