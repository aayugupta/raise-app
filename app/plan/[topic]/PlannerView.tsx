"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FamilySofa from "@/components/FamilySofa";
import HelpPill from "@/components/HelpPill";
import TopicArt from "@/components/TopicArt";
import WalkTogether from "@/components/WalkTogether";
import { currentFirstLine } from "@/lib/cards";
import { track } from "@/lib/events";
import { markPractised, startJourney } from "@/lib/journeyLog";
import { loadProfile } from "@/lib/profile";
import { MOMENTS, savePlan, type MomentId, type Plan } from "@/lib/talks";
import { TOPICS, type TopicId } from "@/lib/topics";

const DAYS_AHEAD = 7;
const MIN_LEAD_MIN = 15; // a plan must be at least 15 minutes away

function dateFor(dayOffset: number, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
}

function dayLabel(offset: number): string {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
}

function dayPhrase(offset: number): string {
  if (offset === 0) return "today";
  if (offset === 1) return "tomorrow";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `this ${d.toLocaleDateString("en-IN", { weekday: "long" })}`;
}

function timeText(date: Date): string {
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

function isSoonEnough(date: Date): boolean {
  return date.getTime() - Date.now() >= MIN_LEAD_MIN * 60_000;
}

export default function PlannerView({
  topic,
  suggestedMoment,
  skippedPractice = false,
}: {
  topic: TopicId;
  suggestedMoment?: MomentId;
  skippedPractice?: boolean;
}) {
  const router = useRouter();
  const [firstLine, setFirstLine] = useState("");
  const [moment, setMoment] = useState<MomentId | null>(null);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState("18:30");
  const [reminder, setReminder] = useState(true);
  const [saved, setSaved] = useState<Plan | null>(null);

  function chooseMoment(id: MomentId) {
    const m = MOMENTS.find((x) => x.id === id)!;
    setMoment(id);
    setTime(m.defaultTime);
    // If that time has already gone today, suggest tomorrow.
    if (day === 0 && !isSoonEnough(dateFor(0, m.defaultTime))) setDay(1);
  }

  // The first line the parent just read on the card (personalised if it was),
  // and the moment Recovery suggested, if any.
  useEffect(() => {
    setFirstLine(currentFirstLine(topic, loadProfile()));
    if (suggestedMoment) chooseMoment(suggestedMoment);
    // "Plan a moment" without practising: step 2 is passed over, never required.
    if (skippedPractice) markPractised(topic, true);
  }, [topic, suggestedMoment, skippedPractice]);

  const when = useMemo(() => dateFor(day, time), [day, time]);
  const momentInfo = MOMENTS.find((m) => m.id === moment);
  const valid = Boolean(moment) && isSoonEnough(when);

  function save() {
    if (!moment || !valid) return;
    const plan = savePlan({ topic, moment, when: when.toISOString(), reminder });
    startJourney(topic);
    track("plan_set", { topic, plan_id: plan.id, moment });
    setSaved(plan);
    window.scrollTo(0, 0);
  }

  if (saved && momentInfo) {
    const start = new Date(saved.when);
    return (
      <main style={{ minHeight: "100dvh", background: "var(--bg)" }}>
        <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 32px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <HelpPill />
          </div>
          <div className="illustration-panel">{moment === "walk" || moment === "car" ? <WalkTogether /> : <FamilySofa />}</div>

          {/* Encouragement first (Aayushi, 29 Oct 2026): choosing a moment is a real step */}
          <section className="plan-cheer">
            <span className="plan-cheer-icon" aria-hidden="true">
              🌱
            </span>
            <p>
              You&apos;ve just taken a big step. Most parents wait for the “right moment”. You chose one, and that&apos;s how a
              closer bond with your child begins.
            </p>
          </section>

          <h1 style={{ fontSize: 28, lineHeight: 1.15, marginTop: 20 }}>Your plan is set</h1>

          {/* The plan at a glance */}
          <section className="plan-summary" aria-label="Your plan">
            <div className="plan-row">
              <span className="plan-key">Topic</span>
              <span className="plan-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TopicArt id={topic} size={28} />
                {TOPICS.find((t) => t.id === topic)!.name}
              </span>
            </div>
            <div className="plan-row">
              <span className="plan-key">Where</span>
              <span className="plan-value">
                {momentInfo.icon} {momentInfo.label}
              </span>
            </div>
            <div className="plan-row">
              <span className="plan-key">When</span>
              <span className="plan-value">
                {dayLabel(day)}, {timeText(start)}
              </span>
            </div>
            <div className="plan-row">
              <span className="plan-key">Reminder</span>
              <span className="plan-value">
                {saved.reminder === false ? "Off" : `🔔 On Home, when it's time for your ${momentInfo.calendarTitle.replace(/^Your /, "").toLowerCase()}`}
              </span>
            </div>
            <div className="plan-first-line">
              <span className="card-label">You&apos;ll start with</span>
              <p>“{firstLine}”</p>
            </div>
          </section>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-muted)", margin: "10px 2px 0" }}>
            {saved.reminder === false
              ? "Your plan waits in your 14-day journey."
              : "Raise sends no notifications, so nothing pops up for your teen to see."}
          </p>

          {/* Two ways on (Aayushi, 29 Oct 2026): back to Home, or see the plan in the journey */}
          <div className="plan-saved-actions">
            <Link href="/home" className="btn-secondary" style={{ textDecoration: "none" }}>
              Back to Home
            </Link>
            <Link href="/journey" className="btn-primary" style={{ textDecoration: "none" }}>
              See your journey →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.back()} className="icon-btn" aria-label="Back">
            ←
          </button>
          <Link href="/help" className="help-pill">
            Help
          </Link>
        </div>

        <h1 style={{ fontSize: 28, lineHeight: 1.15, margin: "18px 0 0", textWrap: "balance" }}>Plan your talk</h1>
        <p className="why">Teens open up most side by side: on walks and late in the evening.</p>

        <h2 className="section-title">Where will you talk?</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {MOMENTS.map((m) => (
            <button key={m.id} className={`option${moment === m.id ? " selected" : ""}`} onClick={() => chooseMoment(m.id)}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden="true" style={{ fontSize: 20 }}>
                  {m.icon}
                </span>
                <span style={{ flex: 1 }}>{m.label}</span>
                {m.teensPick && <span className="match-tag" style={{ marginTop: 0 }}>Teens' pick</span>}
              </span>
            </button>
          ))}
        </div>

        {momentInfo && (
          <>
            <h2 className="section-title">Which day?</h2>
            <div className="chips">
              {Array.from({ length: DAYS_AHEAD }, (_, i) => (
                <button key={i} className={`chip${day === i ? " selected" : ""}`} onClick={() => setDay(i)}>
                  {dayLabel(i)}
                </button>
              ))}
            </div>

            <label htmlFor="plan-time" className="section-title" style={{ display: "block", fontFamily: "var(--font-display)", color: "var(--text)" }}>
              What time?
            </label>
            <input id="plan-time" type="time" className="text-input" value={time} onChange={(e) => setTime(e.target.value)} style={{ maxWidth: 180 }} />
            {!isSoonEnough(when) && (
              <p style={{ color: "var(--danger)", fontSize: 15, margin: "-8px 0 12px" }}>That time is too soon. Pick a time at least 15 minutes from now.</p>
            )}

            <h2 className="section-title">Reminder</h2>
            <button className={`option${reminder ? " selected" : ""}`} role="switch" aria-checked={reminder} onClick={() => setReminder(!reminder)}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden="true">{reminder ? "🔔" : "🔕"}</span>
                <span style={{ flex: 1 }}>Remind me on Home when it's time</span>
                <span className="match-tag" style={{ marginTop: 0 }}>{reminder ? "On" : "Off"}</span>
              </span>
            </button>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "8px 0 0" }}>In Raise only. No notifications, and it never names the topic.</p>

            <PlanSentence phrase={momentInfo.phrase} day={dayPhrase(day)} time={timeText(when)} firstLine={firstLine} />
          </>
        )}

        <div className="sticky-action">
          <button className="btn-primary btn-block" onClick={save} disabled={!valid}>
            Save my plan
          </button>
        </div>
      </div>
    </main>
  );
}

// "On our walk this Sunday at 6:30 pm, I'll start with: '…'" (D3: see the plan as a sentence)
function PlanSentence({ phrase, day, time, firstLine }: { phrase: string; day: string; time: string; firstLine: string }) {
  return (
    <div className="first-line" style={{ marginTop: 16 }}>
      <div className="card-label">Your plan</div>
      <div style={{ fontSize: 17, color: "var(--text)", margin: "8px 0 6px", lineHeight: 1.4 }}>
        {phrase} {day} at {time}, I'll start with:
      </div>
      <p style={{ fontSize: 20, margin: 0 }}>“{firstLine}”</p>
    </div>
  );
}
