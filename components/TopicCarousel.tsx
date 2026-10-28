"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { TOPICS, TopicId } from "@/lib/topics";

// Home's topic carousel. It slides to the next topic every few seconds and loops back to the start.
// It pauses while the parent touches, hovers or uses the keyboard on it (and for a while after),
// and stays still for people who've asked their phone to reduce motion. It can always be swiped.

const EVERY_MS = 3500;
const PAUSE_AFTER_TOUCH_MS = 8000;

type Topic = (typeof TOPICS)[number];

export default function TopicCarousel({ topics, active }: { topics: Topic[]; active: Set<TopicId> }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      const row = rowRef.current;
      if (!row || Date.now() < pausedUntil.current || document.hidden) return;
      const cards = Array.from(row.children) as HTMLElement[];
      const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
      const current = Math.round(row.scrollLeft / (cards[0].offsetWidth + 12));
      const next = atEnd ? 0 : Math.min(current + 1, cards.length - 1);
      row.scrollTo({ left: cards[next].offsetLeft - row.offsetLeft - 16, behavior: "smooth" });
    }, EVERY_MS);
    return () => clearInterval(timer);
  }, []);

  function pause() {
    pausedUntil.current = Date.now() + PAUSE_AFTER_TOUCH_MS;
  }

  function onScroll() {
    const row = rowRef.current;
    if (!row) return;
    const first = row.children[0] as HTMLElement;
    setIndex(Math.round(row.scrollLeft / (first.offsetWidth + 12)));
  }

  return (
    <>
      <div
        ref={rowRef}
        className="topic-carousel"
        role="list"
        aria-label="Topics"
        onScroll={onScroll}
        onPointerDown={pause}
        onPointerEnter={pause}
        onTouchStart={pause}
        onFocus={pause}
      >
        {topics.map((t) => (
          <Link key={t.id} href={`/card/${t.id}`} className="carousel-card" role="listitem" style={{ background: `${t.color}1f`, borderColor: `${t.color}55` }}>
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="carousel-icon" aria-hidden="true">
                {t.icon}
              </span>
            </span>
            <span className="carousel-name">{t.name}</span>
            <span className="carousel-question">Teens wonder: “{t.teenQuestion}”</span>
            <span className="carousel-open">{active.has(t.id) ? "Continue →" : "Open flashcards →"}</span>
          </Link>
        ))}
      </div>
      <div className="flash-dots" aria-hidden="true" style={{ justifyContent: "center", marginTop: 2 }}>
        {topics.map((t, i) => (
          <span key={t.id} className={i === Math.min(index, topics.length - 1) ? "on" : ""} />
        ))}
      </div>
    </>
  );
}
