"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HandOnShoulder from "@/components/HandOnShoulder";
import type { Language } from "@/lib/cards";
import { track } from "@/lib/events";
import { loadProfile } from "@/lib/profile";
import { BLOCKERS, REPAIR_LINE, SOFTER_RESTART, type BlockerId } from "@/lib/recovery";
import { updateReflection } from "@/lib/reflections";
import { finishJourney } from "@/lib/journeyLog";
import { addOpenTopic, loadPlan, type Plan } from "@/lib/talks";
import { TOPICS } from "@/lib/topics";

// Never a "failed" label. A missed talk gets an easier next step; a hard talk gets a repair line.
export default function RecoverView({ planId, why, picked }: { planId: string; why: "not-yet" | "repair"; picked?: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null | undefined>(undefined);
  const [language, setLanguage] = useState<Language>("hinglish");
  // The reason may already have been picked on the Reflection screen.
  const [blocker, setBlocker] = useState<BlockerId | null>(BLOCKERS.find((b) => b.id === picked)?.id ?? null);

  useEffect(() => {
    const p = loadPlan(planId) ?? null;
    setPlan(p);
    const saved = loadProfile()?.language;
    if (saved) setLanguage(saved);
    if (p && why === "repair") track("recovery_chosen", { topic: p.topic, plan_id: planId, reason: "repair" });
    const pickedId = BLOCKERS.find((b) => b.id === picked)?.id;
    if (p && why === "not-yet" && pickedId) track("recovery_chosen", { topic: p.topic, plan_id: planId, reason: pickedId });
  }, [planId, why, picked]);

  if (plan === undefined) return <main style={{ minHeight: "100dvh", background: "var(--bg)" }} />;
  if (plan === null) {
    return (
      <main style={{ padding: "56px 24px", maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: 28 }}>We couldn't find this plan</h1>
        <Link href="/home" className="btn-primary">
          Go to Home
        </Link>
      </main>
    );
  }

  const topic = TOPICS.find((t) => t.id === plan.topic)!;
  const chosen = BLOCKERS.find((b) => b.id === blocker);

  function choose(id: BlockerId) {
    setBlocker(id);
    updateReflection(planId, { gotInTheWay: id });
    track("recovery_chosen", { topic: plan!.topic, plan_id: planId, reason: id });
  }

  // Keep it open: the topic stays in the 14-day journey (back to step 1, Prepare).
  function keepOpen() {
    addOpenTopic(plan!.topic);
    router.push("/home");
  }

  // Not now: set the topic aside. Its journey ends (not completed); it can be started fresh any time.
  function notNow() {
    finishJourney(plan!.topic, false, false);
    router.push("/home");
  }

  const planAgainHref = `/plan/${plan.topic}${chosen?.suggestMoment ? `?moment=${chosen.suggestMoment}` : ""}`;

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

        <div className="illustration-panel">
          <HandOnShoulder />
        </div>

        <div className="card-label">{topic.name}</div>

        {why === "not-yet" ? (
          <>
            <h1 style={{ fontSize: 28, lineHeight: 1.15, margin: "6px 0 0", textWrap: "balance" }}>That's okay. Let's find an easier way in.</h1>
            <p className="why">Most talks take more than one try. What got in the way?</p>

            <div style={{ display: "grid", gap: 8 }}>
              {BLOCKERS.map((b) => (
                <button key={b.id} className={`option${blocker === b.id ? " selected" : ""}`} onClick={() => choose(b.id)}>
                  {b.label}
                </button>
              ))}
            </div>

            {chosen && (
              <p className="notice" style={{ marginTop: 16 }} aria-live="polite">
                💡 {chosen.tip}
              </p>
            )}
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 28, lineHeight: 1.15, margin: "6px 0 0", textWrap: "balance" }}>Hard talks happen.</h1>
            <p style={{ fontSize: 17, lineHeight: 1.5, margin: "8px 0 0" }}>
              It doesn't mean it went wrong. It means you started, and your teen saw you try.
            </p>

            <section className="first-line">
              <div className="card-label">Your repair line</div>
              <p className={language === "hindi" ? "devanagari" : undefined} lang={language === "hindi" ? "hi" : language === "hinglish" ? "hi-Latn" : "en"}>
                “{REPAIR_LINE[language]}”
              </p>
              <div style={{ fontSize: 14 }}>Say it before you bring the topic up again.</div>
            </section>

            <h2 className="section-title">A softer restart</h2>
            <ul className="card-list">
              {SOFTER_RESTART.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </>
        )}

        {(why === "repair" || chosen) && (
          <div style={{ marginTop: 24 }}>
            <Link href={planAgainHref} className="btn-primary btn-block">
              Plan again
            </Link>
            <button className="btn-secondary btn-block" onClick={keepOpen} style={{ marginTop: 10 }}>
              Keep it open
            </button>
            <button className="btn-link" onClick={notNow}>
              Not now
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
