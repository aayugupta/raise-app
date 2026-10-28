"use client";

import { useEffect, useRef, useState } from "react";
import Sprout from "@/components/Sprout";
import { loadJourneyRecords } from "@/lib/journeyLog";
import { topicsTalkedAbout } from "@/lib/metric";
import { TOPICS, type TopicId } from "@/lib/topics";

// Full-screen celebration when a parent completes a topic: a reflection where the talk happened
// (Aayushi, 29 Oct 2026). It celebrates the parent's own note, so it never claims the app saw the talk.
// One tap continues to wherever the reflection leads (thank-you screen, or the repair line after a hard talk).
export default function Celebration({ topic, onContinue }: { topic: TopicId; onContinue: () => void }) {
  const meta = TOPICS.find((t) => t.id === topic)!;
  const [done, setDone] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setDone(topicsTalkedAbout(loadJourneyRecords()));
    buttonRef.current?.focus();
  }, []);

  return (
    <main className="celebrate" role="dialog" aria-modal="true" aria-labelledby="celebrate-title">
      <div className="celebrate-sparkles" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 0.35}s` }} />
        ))}
      </div>
      <div className="celebrate-body">
        <div className="celebrate-emoji" aria-hidden="true">
          🎉
        </div>
        <h1 id="celebrate-title" className="celebrate-title">
          Yayy! You&apos;re one step closer to becoming your child&apos;s best friend.
        </h1>
        <p className="celebrate-sub">
          You took {meta.icon} {meta.name} all the way to a real talk. That takes courage.
        </p>

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
