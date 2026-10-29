"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// The bell on Home (Aayushi, 29 Oct 2026): everything waiting for the parent in one drop-down list,
// each with one tap to act on it. A soft dot, never a number, when something is waiting (no pressure).
// Reminders about a planned moment name the moment ("Your walk"), never the topic.

export type BellItem = {
  id: string;
  icon: string;
  title: string;
  detail: string;
  href: string;
  waiting: boolean; // false for things that are only "coming up" (no dot for those)
};

export default function NotificationBell({ items }: { items: BellItem[] }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const hasWaiting = items.some((i) => i.waiting);

  // Close on a tap outside the list, or with Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="bell" ref={boxRef}>
      <button
        type="button"
        className="bell-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={hasWaiting ? "Reminders, something is waiting" : "Reminders"}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9a6 6 0 0 1 12 0c0 4.5 1.6 6.4 2.4 7.2.3.3.1.8-.3.8H3.9c-.4 0-.6-.5-.3-.8C4.4 15.4 6 13.5 6 9Z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
        {hasWaiting && <span className="bell-dot" aria-hidden="true" />}
      </button>

      {open && (
        <div className="bell-panel" role="dialog" aria-label="Your reminders">
          <div className="bell-panel-title">Your reminders</div>
          {items.length === 0 ? (
            <p className="bell-empty">You&apos;re all caught up 🌿</p>
          ) : (
            <ul className="bell-list">
              {items.map((i) => (
                <li key={i.id}>
                  <Link href={i.href} className="bell-item" onClick={() => setOpen(false)}>
                    <span className="bell-item-icon" aria-hidden="true">
                      {i.icon}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="bell-item-title">{i.title}</span>
                      <span className="bell-item-detail">{i.detail}</span>
                    </span>
                    <span aria-hidden="true" className="bell-item-arrow">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
