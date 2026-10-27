"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FamilySofa from "@/components/FamilySofa";
import WalkTogether from "@/components/WalkTogether";
import { googleCalendarUrl, icsFile } from "@/lib/calendar";
import { currentFirstLine } from "@/lib/cards";
import { loadProfile } from "@/lib/profile";
import { MOMENTS, savePlan, type MomentId, type Plan } from "@/lib/talks";
import type { TopicId } from "@/lib/topics";

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

export default function PlannerView({ topic, suggestedMoment }: { topic: TopicId; suggestedMoment?: MomentId }) {
  const router = useRouter();
  const [firstLine, setFirstLine] = useState("");
  const [moment, setMoment] = useState<MomentId | null>(null);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState("18:30");
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
  }, [topic, suggestedMoment]);

  const when = useMemo(() => dateFor(day, time), [day, time]);
  const momentInfo = MOMENTS.find((m) => m.id === moment);
  const valid = Boolean(moment) && isSoonEnough(when);

  function save() {
    if (!moment || !valid) return;
    setSaved(savePlan({ topic, moment, when: when.toISOString() }));
    window.scrollTo(0, 0);
  }

  if (saved && momentInfo) {
    const start = new Date(saved.when);
    const appUrl = `${window.location.origin}/home`;
    const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFile(momentInfo.calendarTitle, start, appUrl, saved.id))}`;

    return (
      <main style={{ minHeight: "100dvh", background: "var(--cream)" }}>
        <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 32px" }}>
          <div className="illustration-panel">{moment === "walk" || moment === "car" ? <WalkTogether /> : <FamilySofa />}</div>

          <h1 style={{ fontSize: 30, lineHeight: 1.15 }}>Your plan is set</h1>
          <PlanSentence phrase={momentInfo.phrase} day={dayPhrase(day)} time={timeText(start)} firstLine={firstLine} />

          <h2 className="section-title">Add a reminder</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <a className="btn-primary btn-block" href={googleCalendarUrl(momentInfo.calendarTitle, start, appUrl)} target="_blank" rel="noreferrer">
              Add to Google Calendar
            </a>
            <a className="btn-secondary btn-block" href={icsHref} download="raise-plan.ics" style={{ textAlign: "center", textDecoration: "none" }}>
              Other calendar app
            </a>
          </div>
          <p className="why" style={{ marginTop: 12 }}>
            🔒 The calendar will only say “{momentInfo.calendarTitle}”. It never names the topic.
          </p>

          <button className="btn-link" onClick={() => router.push("/home")}>
            Done, go to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100dvh", background: "var(--cream)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.push(`/card/${topic}`)} className="icon-btn" aria-label="Back">
            ←
          </button>
          <Link href="/help" className="help-pill">
            Help
          </Link>
        </div>

        <h1 style={{ fontSize: 28, lineHeight: 1.15, margin: "18px 0 0", textWrap: "balance" }}>When will you try it?</h1>
        <p className="why">Teens open up most side by side: on walks and late in the evening.</p>

        <h2 className="section-title" style={{ marginTop: 4 }}>
          Pick a moment
        </h2>
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

            <label htmlFor="plan-time" className="section-title" style={{ display: "block", fontFamily: "var(--font-serif), Georgia, serif", color: "var(--ink)" }}>
              What time?
            </label>
            <input id="plan-time" type="time" className="text-input" value={time} onChange={(e) => setTime(e.target.value)} style={{ maxWidth: 180 }} />
            {!isSoonEnough(when) && (
              <p style={{ color: "#b4472f", fontSize: 15, margin: "-8px 0 12px" }}>That time is too soon. Pick a time at least 15 minutes from now.</p>
            )}

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
      <div style={{ fontSize: 17, color: "var(--ink)", margin: "8px 0 6px", lineHeight: 1.4 }}>
        {phrase} {day} at {time}, I'll start with:
      </div>
      <p style={{ fontSize: 20, margin: 0 }}>“{firstLine}”</p>
    </div>
  );
}
