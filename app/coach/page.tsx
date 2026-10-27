"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { checkCoachMessage, COACH_FALLBACK, COACH_MAX_CHARS } from "@/lib/coachSafety";
import { clearCoachChat, loadCoachChat, saveCoachChat, turnsForAi, type CoachEntry } from "@/lib/coachChat";
import { track } from "@/lib/events";
import { loadProfile, type Profile } from "@/lib/profile";
import { HELP_LINES } from "@/lib/safety";
import { TOPICS } from "@/lib/topics";

// Screen 7: AI Coach (Aayushi's simplified flow, 28 Oct 2026). Parents share how a talk went,
// ask doubts, or bring any topic the flashcards don't cover. Every message is checked before it
// goes to the AI and every reply is checked before it's shown. Serious concerns get a dismissible
// help offer; the parent decides. The chat stays on this phone.

const STARTERS = [
  "My talk didn't go well. What can I say now?",
  "My child goes quiet when I ask about school.",
  "How do I bring up something that isn't in the topics?",
  "How do I start talking more with my child?",
];

const now = () => new Date().toISOString();

export default function Coach() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [chat, setChat] = useState<CoachEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/");
      return;
    }
    setProfile(p);
    setChat(loadCoachChat());
  }, [router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [chat.length, waiting]);

  function update(next: CoachEntry[]) {
    setChat(next);
    saveCoachChat(next);
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || waiting || !profile) return;
    setDraft("");

    // Checked on the phone first: a danger sign or a refused request never leaves the phone.
    const check = checkCoachMessage(message);
    if (check.kind === "crisis") {
      track("help_shown", { from: "coach" });
      track("coach_message", { result: "help", concern: true });
      return update([...chat, { role: "parent", hidden: true, at: now() }, { role: "coach", help: true, at: now() }]);
    }
    if (check.kind === "refuse") {
      track("coach_message", { result: "refused", concern: false });
      return update([
        ...chat,
        { role: "parent", text: message, at: now() },
        { role: "coach", refusal: check.message, offer: check.offer, offerText: check.offerText, at: now() },
      ]);
    }

    const withMessage: CoachEntry[] = [...chat, { role: "parent", text: message, at: now() }];
    update(withMessage);
    setWaiting(true);
    const family = { role: profile.role, ageBand: profile.ageBand, teenGender: profile.teenGender, language: profile.language, comfort: profile.comfort };
    let data: { kind?: string; reply?: string; concern?: string; message?: string; offer?: string; offerText?: string } | null = null;
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family, messages: turnsForAi(withMessage) }),
        signal: AbortSignal.timeout(15000),
      });
      data = res.ok ? await res.json() : null;
    } catch {
      data = null;
    }
    setWaiting(false);

    if (data?.kind === "crisis") {
      // The server spotted what the phone missed: drop the words, offer help.
      track("help_shown", { from: "coach" });
      track("coach_message", { result: "help", concern: true });
      return update([...chat, { role: "parent", hidden: true, at: now() }, { role: "coach", help: true, at: now() }]);
    }
    if (data?.kind === "refuse" && data.message && data.offer && data.offerText) {
      track("coach_message", { result: "refused", concern: false });
      const offer = TOPICS.find((t) => t.id === data!.offer)?.id ?? "stress";
      return update([...withMessage, { role: "coach", refusal: data.message, offer, offerText: data.offerText, at: now() }]);
    }
    if (data?.kind === "ai" && data.reply) {
      const serious = data.concern === "serious";
      track("coach_message", { result: "ai", concern: serious });
      const reply: CoachEntry = { role: "coach", text: data.reply, at: now() };
      if (!serious) return update([...withMessage, reply]);
      track("help_shown", { from: "coach" });
      return update([...withMessage, reply, { role: "coach", help: true, at: now() }]);
    }
    track("coach_message", { result: "fallback", concern: false });
    update([...withMessage, { role: "coach", text: data?.reply || COACH_FALLBACK, fallback: true, at: now() }]);
  }

  function dismissHelp(index: number) {
    update(chat.map((e, i) => (i === index && "help" in e ? { ...e, dismissed: true } : e)));
  }

  function clearChat() {
    clearCoachChat();
    setChat([]);
    setConfirmClear(false);
  }

  if (!profile) return <main style={{ minHeight: "100dvh", background: "var(--cream)" }} />;

  return (
    <main className="has-bottom-nav" style={{ minHeight: "100dvh", background: "var(--cream)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" }}>
        <h1 style={{ fontSize: 30 }}>AI Coach</h1>
        <p className="why" style={{ marginBottom: 10 }}>
          Share how a talk went, ask a doubt, or bring up anything about talking with your child.
        </p>
        <p className="coach-privacy">
          🔒 What you type here goes to Google's Gemini AI to write a reply. Please don't use names. Your chat stays on this phone.
        </p>

        {chat.length === 0 && (
          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            <div className="card-label">Try asking</div>
            {STARTERS.map((s) => (
              <button key={s} className="option" style={{ fontSize: 16, padding: "12px 14px" }} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="coach-chat" aria-live="polite">
          {chat.map((e, i) => (
            <Entry key={i} entry={e} onDismiss={() => dismissHelp(i)} />
          ))}
          {waiting && (
            <div className="bubble coach" aria-label="The coach is writing">
              <div className="loading-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {chat.length > 0 && (
          <div style={{ textAlign: "center", margin: "4px 0 8px" }}>
            {!confirmClear ? (
              <button className="btn-link" style={{ fontSize: 14 }} onClick={() => setConfirmClear(true)}>
                Clear this chat
              </button>
            ) : (
              <span style={{ fontSize: 14 }}>
                Delete this chat from your phone?{" "}
                <button className="btn-link" style={{ display: "inline", width: "auto", fontSize: 14, color: "#b4472f" }} onClick={clearChat}>
                  Yes, clear
                </button>{" "}
                ·{" "}
                <button className="btn-link" style={{ display: "inline", width: "auto", fontSize: 14 }} onClick={() => setConfirmClear(false)}>
                  Keep
                </button>
              </span>
            )}
          </div>
        )}

        <form
          className="coach-composer"
          onSubmit={(ev) => {
            ev.preventDefault();
            send(draft);
          }}
        >
          <textarea
            className="text-input"
            value={draft}
            onChange={(ev) => setDraft(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" && !ev.shiftKey) {
                ev.preventDefault();
                send(draft);
              }
            }}
            placeholder="Type your question…"
            maxLength={COACH_MAX_CHARS}
            rows={2}
            aria-label="Your message to the coach"
          />
          <button className="btn-primary" type="submit" disabled={!draft.trim() || waiting} aria-label="Send">
            ➤
          </button>
        </form>
        <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", margin: "6px 0 0" }}>
          The coach is AI and can get things wrong. It isn't counselling or medical advice.
        </p>
      </div>
      <BottomNav />
    </main>
  );
}

function Entry({ entry, onDismiss }: { entry: CoachEntry; onDismiss: () => void }) {
  if (entry.role === "parent") {
    return "hidden" in entry ? (
      <div className="bubble parent hidden-note">Message not saved, for your privacy.</div>
    ) : (
      <div className="bubble parent">{entry.text}</div>
    );
  }
  if ("help" in entry) {
    if (entry.dismissed) {
      return (
        <div className="bubble coach" style={{ fontSize: 14 }}>
          Help is always one tap away in the <Link href="/help">Help tab</Link>.
        </div>
      );
    }
    // The dismissible help offer (FR12): the parent decides.
    return (
      <section className="notice coach-help">
        <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 18 }}>This sounds serious.</div>
        <p style={{ margin: "4px 0 10px" }}>Would you like help from a professional? You don't have to handle this alone.</p>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 10px", display: "grid", gap: 6 }}>
          {HELP_LINES.map((h) => (
            <li key={h.number}>
              <a href={`tel:${h.number}`} className="help-line">
                <strong>
                  {h.name} · {h.number}
                </strong>
                <span>{h.note}</span>
              </a>
            </li>
          ))}
        </ul>
        <Link href="/help" className="btn-primary btn-block" style={{ marginBottom: 8 }}>
          Yes, show me help
        </Link>
        <button className="btn-secondary btn-block" onClick={onDismiss}>
          Not now
        </button>
      </section>
    );
  }
  if ("refusal" in entry) {
    const topic = TOPICS.find((t) => t.id === entry.offer)!;
    return (
      <div className="bubble coach">
        <p style={{ margin: 0, fontWeight: 700 }}>{entry.refusal}</p>
        <p style={{ margin: "6px 0 10px" }}>{entry.offerText}</p>
        <Link href={`/card/${topic.id}`} className="btn-secondary btn-block" style={{ textAlign: "center", textDecoration: "none" }}>
          {topic.icon} Open {topic.short} flashcards
        </Link>
      </div>
    );
  }
  return <div className={`bubble coach${entry.fallback ? " fallback" : ""}`}>{entry.text}</div>;
}
