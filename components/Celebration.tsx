"use client";

import { useEffect, useRef, useState } from "react";
import Sprout from "@/components/Sprout";
import { loadJourneyRecords } from "@/lib/journeyLog";
import { topicsTalkedAbout } from "@/lib/metric";
import { TOPICS, type TopicId } from "@/lib/topics";

// Full-screen celebration when a parent completes a topic: a reflection where the talk happened
// (Aayushi, 29 Oct 2026). It celebrates the parent's own note, so it never claims the app saw the talk.
// One tap continues to wherever the reflection leads (thank-you screen, or the repair line after a hard talk).
// After a talk that felt hard (😣), the same screen speaks gently instead of saying "Yayy!" (29 Oct 2026).
export default function Celebration({ topic, hard = false, onContinue }: { topic: TopicId; hard?: boolean; onContinue: () => void }) {
  const meta = TOPICS.find((t) => t.id === topic)!;
  const [done, setDone] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setDone(topicsTalkedAbout(loadJourneyRecords()));
    buttonRef.current?.focus();
  }, []);

  return (
    <main className="celebrate" role="dialog" aria-modal="true" aria-labelledby="celebrate-title">
      {hard ? (
        // A hard talk: soft leaves drifting down slowly, in sage and terracotta (growth, not a party).
        <div className="celebrate-leaves" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <svg
              key={i}
              viewBox="0 0 20 12"
              width={16 + (i % 3) * 5}
              style={{ left: `${(i * 41 + 7) % 96}%`, animationDelay: `${(i % 5) * 1.1 + (i > 4 ? 0.6 : 0)}s`, animationDuration: `${7 + (i % 4)}s` }}
            >
              <path d="M1 6 C 5 0 14 0 19 5 C 14 11 5 11 1 6 Z" fill={i % 3 === 0 ? "#e5b99d" : i % 3 === 1 ? "#9cb89a" : "#cfe3c6"} />
              <path d="M2 6 C 7 5 13 5 18 5.2" stroke="rgba(41,45,42,0.25)" strokeWidth="0.8" fill="none" />
            </svg>
          ))}
        </div>
      ) : (
        <div className="celebrate-sparkles" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 0.35}s` }} />
          ))}
        </div>
      )}
      <div className="celebrate-body">
        <div className="celebrate-emoji" aria-hidden="true">
          {hard ? "💛" : "🎉"}
        </div>
        {hard ? (
          <>
            <h1 id="celebrate-title" className="celebrate-title">
              That took real courage. You showed up for your child.
            </h1>
            <p className="celebrate-sub">
              Hard talks still count, and they often matter most. You opened the door on {meta.name}, and your child saw you
              try. Next, we&apos;ll help you take the next step gently.
            </p>
          </>
        ) : (
          <>
            <h1 id="celebrate-title" className="celebrate-title">
              Yayy! You&apos;re one step closer to becoming your child&apos;s best friend.
            </h1>
            <p className="celebrate-sub">
              You took {meta.icon} {meta.name} all the way to a real talk. That takes courage.
            </p>
          </>
        )}

        <div className="celebrate-goal" aria-label={`Becoming a Super Parent: ${done} of ${TOPICS.length} topics`}>
          <Sprout done={done} total={TOPICS.length} size={64} onDark />
          <div style={{ fontSize: "var(--fs-sm)" }}>
            <div>Becoming a Super Parent</div>
            <strong>
              A new leaf: {done} of {TOPICS.length} topics
            </strong>
          </div>
        </div>

        <button ref={buttonRef} className="btn-light btn-block celebrate-button" onClick={onContinue}>
          Continue
        </button>
      </div>
    </main>
  );
}
