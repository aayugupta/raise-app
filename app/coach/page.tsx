"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { currentFirstLine } from "@/lib/cards";
import { checkCoachMessage, COACH_BUSY, COACH_MAX_CHARS } from "@/lib/coachSafety";
import { CHECKIN_MORE, CHECKIN_READY, clearCoachChat, loadCoachChat, saveCoachChat, turnsForAi, type CoachEntry } from "@/lib/coachChat";
import { track } from "@/lib/events";
import { markPractised, startJourney } from "@/lib/journeyLog";
import { loadProfile, type Profile } from "@/lib/profile";
import { HELP_LINES } from "@/lib/safety";
import { TOPICS, type TopicId } from "@/lib/topics";

// Screen 7: AI Coach (Aayushi's simplified flow, 28 Oct 2026). Parents share how a talk went,
// ask doubts, or bring any topic the flashcards don't cover. Every message is checked before it
// goes to the AI and every reply is checked before it's shown. Serious concerns get a dismissible
// help offer; the parent decides. The chat stays on this phone.
// Opened with ?topic=… it is step 2 of that topic's journey (Practise): ask doubts about the topic,
// or role-play, where the AI plays the child so the parent can try their first line.

const STARTERS = [
  "My talk didn't go well. What can I say now?",
  "My child goes quiet when I ask about school.",
  "How do I bring up something that isn't in the topics?",
  "How do I start talking more with my child?",
];

const TOPIC_STARTERS = ["How do I start this topic?", "What if my child gets upset?", "What if my child doesn't want to talk?"];

const now = () => new Date().toISOString();

export default function Coach() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [chat, setChat] = useState<CoachEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [roleplay, setRoleplay] = useState(false);
  const [practised, setPractised] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/");
      return;
    }
    setProfile(p);
    setChat(loadCoachChat());
    const t = TOPICS.find((x) => x.id === new URLSearchParams(window.location.search).get("topic"))?.id ?? null;
    setTopic(t);
    if (t) startJourney(t); // no-op if this topic's journey is already running
  }, [router]);

  const topicMeta = topic ? TOPICS.find((t) => t.id === topic)! : null;
  // In a role-play only that topic's role-play messages show; otherwise the normal chat.
  // Help offers and refusals always show, whichever mode they came from.
  const visible = chat.filter((e) => !("text" in e) || (roleplay ? e.roleplay && e.topic === topic : !e.roleplay));

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
    // Role-play turns are kept apart, so the normal chat never mixes with the practice.
    const tag = roleplay && topic ? { roleplay: true, topic } : {};

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
        { role: "parent", text: message, at: now(), ...tag },
        { role: "coach", refusal: check.message, offer: check.offer, offerText: check.offerText, at: now() },
      ]);
    }

    const withMessage: CoachEntry[] = [...chat, { role: "parent", text: message, at: now(), ...tag }];
    update(withMessage);
    setWaiting(true);
    const family = { role: profile.role, ageBand: profile.ageBand, teenGender: profile.teenGender, language: profile.language, comfort: profile.comfort };
    let data: { kind?: string; reply?: string; tip?: string; concern?: string; message?: string; offer?: string; offerText?: string } | null = null;
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          family,
          messages: turnsForAi(withMessage, roleplay && topic ? topic : undefined),
          ...(topic ? { topic, mode: roleplay ? "roleplay" : "coach" } : {}),
        }),
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
      // Step 2 of the topic's journey is done once the parent has practised with the coach.
      if (topic) {
        markPractised(topic, false);
        setPractised(true);
      }
      const reply: CoachEntry = { role: "coach", text: data.reply, at: now(), ...tag, ...(data.tip ? { tip: data.tip } : {}) };
      if (!serious) return update([...withMessage, reply]);
      track("help_shown", { from: "coach" });
      return update([...withMessage, reply, { role: "coach", help: true, at: now() }]);
    }
    track("coach_message", { result: "fallback", concern: false });
    update([...withMessage, { role: "coach", text: data?.reply || COACH_BUSY, fallback: true, at: now() }]);
  }

  function dismissHelp(entry: CoachEntry) {
    update(chat.map((e) => (e === entry && "help" in e ? { ...e, dismissed: true } : e)));
  }

  function clearChat() {
    clearCoachChat();
    setChat([]);
    setConfirmClear(false);
  }

  if (!profile) return <main style={{ minHeight: "100dvh", background: "var(--bg)" }} />;

  return (
    <main className="has-bottom-nav" style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" }}>
        <h1 style={{ fontSize: 30 }}>AI Coach</h1>
        <p className="why" style={{ marginBottom: 10 }}>
          Share how a talk went, ask a doubt, or bring up anything about talking with your child.
        </p>
        <p className="coach-privacy">
          🔒 What you type here goes to Google's Gemini AI to write a reply. Please don't use names. Your chat stays on this phone.
        </p>

        {/* Step 2 of a topic's journey: practise it */}
        {topicMeta && (
          <section className="practice-card">
            <div className="card-label">Step 2 of 4 · Practise</div>
            <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 17, margin: "2px 0 10px" }}>
              {topicMeta.icon} {topicMeta.name}
            </div>
            <div className="practice-modes" role="tablist" aria-label="How to practise">
              <button role="tab" aria-selected={!roleplay} className={!roleplay ? "on" : ""} onClick={() => setRoleplay(false)}>
                Ask a doubt
              </button>
              <button role="tab" aria-selected={roleplay} className={roleplay ? "on" : ""} onClick={() => setRoleplay(true)}>
                Role-play
              </button>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "8px 0 0" }}>
              {roleplay
                ? "The AI plays your child. Say your first line and see how it goes. You'll get a short tip after each reply."
                : "Ask anything about this talk: how to start, what to say, what if it goes wrong."}
            </p>
            <Link href={`/plan/${topicMeta.id}`} className={`btn-block ${practised ? "btn-primary" : "btn-secondary"}`} style={{ marginTop: 12, textAlign: "center", textDecoration: "none" }}>
              {practised ? "Next: plan a moment →" : "Skip, plan a moment"}
            </Link>
          </section>
        )}

        {topicMeta && roleplay && visible.length === 0 && (
          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            <div className="card-label">Start the role-play</div>
            <button className="option" style={{ fontSize: 16, padding: "12px 14px" }} onClick={() => setDraft(currentFirstLine(topicMeta.id, profile))}>
              Try your first line
            </button>
          </div>
        )}

        {topicMeta && !roleplay && visible.length === 0 && (
          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            <div className="card-label">Try asking</div>
            {TOPIC_STARTERS.map((s) => (
              <button key={s} className="option" style={{ fontSize: 16, padding: "12px 14px" }} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {!topicMeta && visible.length === 0 && (
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
          {visible.map((e, i) => (
            <Entry key={i} entry={e} onDismiss={() => dismissHelp(e)} />
          ))}
          {/* Check-in under the Coach's latest reply: tapping one sends it as the parent's message and the
              Coach answers (a warm close for "ready", an invitation to ask for "another question").
              Not shown under the Coach's reply to "ready": the chat has ended there. */}
          {!waiting && (() => {
            const last = visible[visible.length - 1];
            const before = visible[visible.length - 2];
            if (!last || last.role !== "coach" || !("text" in last) || last.fallback) return null;
            if (before && "text" in before && before.role === "parent" && before.text === CHECKIN_READY) return null;
            return (
              <div className="coach-checkin" role="group" aria-label="Did that help?">
                <button className="chip" onClick={() => send(CHECKIN_READY)}>
                  ✓ {CHECKIN_READY}
                </button>
                <button className="chip" onClick={() => send(CHECKIN_MORE)}>
                  {CHECKIN_MORE}
                </button>
              </div>
            );
          })()}
          {waiting && (
            <div className="bubble coach" aria-label="The coach is writing">
              <div className="loading-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          {/* Scrolls far enough that the check-in buttons clear the message box and tab bar. */}
          <div ref={endRef} style={{ scrollMarginBottom: 190 }} />
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
                <button className="btn-link" style={{ display: "inline", width: "auto", fontSize: 14, color: "var(--danger)" }} onClick={clearChat}>
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
        <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", margin: "6px 0 0" }}>
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
        <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 18 }}>This sounds serious.</div>
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
  if (entry.roleplay) {
    return (
      <>
        <div className="bubble coach child">
          <span className="card-label" style={{ display: "block", marginBottom: 2 }}>
            Your child (practice)
          </span>
          {entry.text}
        </div>
        {entry.tip && <div className="bubble coach tip">💡 {entry.tip}</div>}
      </>
    );
  }
  return <div className={`bubble coach${entry.fallback ? " fallback" : ""}`}>{entry.text}</div>;
}
