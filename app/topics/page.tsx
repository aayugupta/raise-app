"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import TopicArt from "@/components/TopicArt";
import TopicBubbles from "@/components/TopicBubbles";
import { loadProfile } from "@/lib/profile";
import { CRISIS_TOPICS, TOPICS, type TopicId } from "@/lib/topics";

// Screen 4: Pick a topic (D1: 3 suggested topics, relationships first).
// Every topic opens from the teen's side. Crisis topics go to Help, never to a Talk Card.
export default function Topics() {
  const router = useRouter();
  const [suggested, setSuggested] = useState<TopicId | undefined>();

  // The setup answers live in browser storage, so read them after the page loads.
  useEffect(() => {
    setSuggested(loadProfile()?.suggestedTopic);
  }, []);

  // Suggest the topic matched from setup first, then the teen favourites, 3 in total.
  const order: TopicId[] = suggested ? [suggested, ...TOPICS.map((t) => t.id).filter((id) => id !== suggested)] : TOPICS.map((t) => t.id);
  const top = order.slice(0, 3);
  const more = order.slice(3);

  return (
    <main className="has-bottom-nav" style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.back()} className="icon-btn" aria-label="Back">
            ←
          </button>
          <Link href="/help" className="help-pill">
            Help
          </Link>
        </div>

        <div className="illustration-panel">
          <TopicBubbles />
        </div>

        <h1 style={{ fontSize: 28, lineHeight: 1.15, textWrap: "balance" }}>What would you like to talk about?</h1>
        <p className="why">Each topic starts from your teen's side, so it feels like curiosity, not a lecture.</p>

        <h2 className="section-title">Suggested for you</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {top.map((id) => (
            <TopicButton key={id} id={id} matched={id === suggested} />
          ))}
        </div>

        <h2 className="section-title">More topics</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {more.map((id) => (
            <TopicButton key={id} id={id} />
          ))}
        </div>

        <div className="notice" style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 20 }}>Is something serious happening?</h2>
          <p style={{ fontSize: 15, color: "var(--text-muted)", margin: "6px 0 12px" }}>
            Some things need a professional, not a talk card. We'll show you who can help.
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {CRISIS_TOPICS.map((c) => (
              <Link key={c.id} href={`/help?about=${c.id}`} className="crisis-link">
                {c.name}
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}

function TopicButton({ id, matched }: { id: TopicId; matched?: boolean }) {
  const topic = TOPICS.find((t) => t.id === id)!;
  return (
    <Link href={`/card/${id}`} className="topic-card">
      <TopicArt id={id} size={44} />
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontWeight: 700, color: "var(--text)", fontSize: 17 }}>{topic.name}</span>
        <span style={{ display: "block", fontSize: 15, color: "var(--text-muted)", fontStyle: "italic", marginTop: 3 }}>
          “{topic.teenQuestion}”
        </span>
        {matched && <span className="match-tag">Matches what you wrote</span>}
      </span>
      <span aria-hidden="true" style={{ color: "var(--primary)", fontSize: 20 }}>
        →
      </span>
    </Link>
  );
}
