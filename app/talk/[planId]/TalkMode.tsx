"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { currentFirstLine, SAFETY_PROMISE } from "@/lib/cards";
import { loadProfile } from "@/lib/profile";
import { track } from "@/lib/events";
import { loadPlan, momentOf, startedOnTime, updatePlan, type Plan } from "@/lib/talks";

// One screen: the first line at a glance, Start, phone away, Done.
// If the phone locks or the page closes, the talk carries on: Start is saved on the phone.

const ACCIDENTAL_DONE_MS = 60_000;

export default function TalkMode({ planId }: { planId: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null | undefined>(undefined);
  const [firstLine, setFirstLine] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [confirmEarly, setConfirmEarly] = useState(false);

  useEffect(() => {
    const p = loadPlan(planId) ?? null;
    setPlan(p);
    if (p) setFirstLine(currentFirstLine(p.topic, loadProfile()));
  }, [planId]);

  // Tick the minutes quietly while talking.
  useEffect(() => {
    if (!plan?.startedAt || plan.doneAt) return;
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, [plan?.startedAt, plan?.doneAt]);

  if (plan === undefined) return <main style={{ minHeight: "100dvh", background: "var(--bg)" }} />;

  if (plan === null) {
    return (
      <main style={{ padding: "56px 24px", maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: 28 }}>We couldn't find this plan</h1>
        <p style={{ fontSize: 17, lineHeight: 1.45 }}>It may have been made on another phone or browser.</p>
        <Link href="/home" className="btn-primary">
          Go to Home
        </Link>
      </main>
    );
  }

  const moment = momentOf(plan);

  function start() {
    setNow(Date.now());
    setPlan(updatePlan(planId, { startedAt: new Date().toISOString() }) ?? null);
    track("talk_started", { topic: plan!.topic, plan_id: planId });
  }

  function done(force = false) {
    const elapsed = Date.now() - new Date(plan!.startedAt!).getTime();
    if (!force && elapsed < ACCIDENTAL_DONE_MS) {
      setConfirmEarly(true);
      return;
    }
    const finished = updatePlan(planId, { doneAt: new Date().toISOString() });
    // on_time = Start in the planned window and 5+ minutes long (metric step 2).
    if (finished) track("talk_done", { topic: finished.topic, plan_id: planId, on_time: startedOnTime(finished) });
    router.push(`/reflect/${planId}`);
  }

  // ---------- Talking: phone away ----------
  if (plan.startedAt && !plan.doneAt) {
    const minutes = Math.max(0, Math.floor((now - new Date(plan.startedAt).getTime()) / 60_000));
    return (
      <main className="talking">
        <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "40px 20px 32px", display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
          <div className="card-label" style={{ color: "var(--on-primary)", opacity: 0.8 }}>
            {moment.icon} {moment.calendarTitle}
          </div>
          <h1 style={{ fontSize: 34, color: "var(--on-primary)", margin: "10px 0 8px", lineHeight: 1.1 }}>You've started. Put the phone away.</h1>
          <p style={{ fontSize: 17, opacity: 0.9, margin: 0 }}>Listen more than you talk. Come back and tap Done when you've finished.</p>

          <div className="talk-glance">
            <div className="card-label" style={{ color: "var(--on-primary)", opacity: 0.75 }}>
              If you need it
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 18 }}>“{firstLine}”</p>
          </div>

          <p style={{ marginTop: "auto", textAlign: "center", opacity: 0.85 }} aria-live="polite">
            {minutes === 0 ? "Just started" : `${minutes} min`}
          </p>

          {confirmEarly ? (
            <div className="talk-confirm">
              <p style={{ margin: "0 0 12px", fontWeight: 700, color: "var(--text)" }}>Finish already?</p>
              <button className="btn-primary btn-block" onClick={() => setConfirmEarly(false)}>
                Keep going
              </button>
              <button className="btn-link" onClick={() => done(true)}>
                Yes, we're done
              </button>
            </div>
          ) : (
            <button className="btn-light btn-block" onClick={() => done()} style={{ fontSize: 22, padding: "18px 20px", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Done
            </button>
          )}

          <Link href="/help" style={{ color: "var(--on-primary)", textAlign: "center", marginTop: 16, fontSize: 15 }}>
            Something serious came up? Get help
          </Link>
        </div>
      </main>
    );
  }

  // ---------- Before starting: first line at a glance ----------
  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.push("/home")} className="icon-btn" aria-label="Back">
            ←
          </button>
          <Link href="/help" className="help-pill">
            Help
          </Link>
        </div>

        <div className="card-label" style={{ marginTop: 18 }}>
          {moment.icon} {moment.calendarTitle}
        </div>
        <h1 style={{ fontSize: 28, lineHeight: 1.15, margin: "6px 0 0" }}>Your first line</h1>

        <section className="first-line" style={{ marginTop: 12 }}>
          <p style={{ fontSize: 26, margin: "0 0 4px" }}>“{firstLine}”</p>
        </section>

        <ul className="card-list" style={{ margin: "18px 0 0" }}>
          <li>Listen more than you talk.</li>
          <li>Stay calm, whatever they say.</li>
        </ul>

        <section className="promise" style={{ marginTop: 18 }}>
          <div className="card-label" style={{ color: "var(--on-primary)", opacity: 0.85 }}>
            Always say this
          </div>
          <p>“{SAFETY_PROMISE}”</p>
        </section>

        <button className="btn-primary btn-block" onClick={start} style={{ marginTop: 24, fontSize: 22, padding: "18px 20px" }}>
          Start
        </button>
        <p className="why" style={{ textAlign: "center", marginTop: 10 }}>
          Tap Start, put the phone away, and talk.
        </p>
        <Link href={`/card/${plan.topic}`} style={{ display: "block", textAlign: "center", color: "var(--primary)", fontWeight: 600 }}>
          See the full card
        </Link>
      </div>
    </main>
  );
}
