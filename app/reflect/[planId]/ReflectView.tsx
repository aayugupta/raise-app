"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfidenceScale from "@/components/ConfidenceScale";
import Celebration from "@/components/Celebration";
import HelpPill from "@/components/HelpPill";
import { CONFIDENCE_AFTER_QUESTION, recordConfidence } from "@/lib/confidence";
import { track } from "@/lib/events";
import { BLOCKERS, type BlockerId } from "@/lib/recovery";
import { saveReflection, type Feeling, type Happened, type Reflection, type WhoTalked } from "@/lib/reflections";
import { hasDangerSign } from "@/lib/safety";
import { finishJourney } from "@/lib/journeyLog";
import { loadPlan, loadPlans, momentOf, updatePlan, type Plan } from "@/lib/talks";
import { TOPICS, type TopicId } from "@/lib/topics";

// Reflection (Aayushi's simplified flow, 28 Oct 2026): did it happen and how it went (two taps, enough to save),
// then optionally what you said, what your child said, who spoke more, and what got in the way.
// A talk that happened counts as completed even if it went badly.
// Everything stays on this phone, never sent to the AI or anywhere else. No names or private details.

const HAPPENED: { value: Happened; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "partly", label: "Partly" },
  { value: "not-yet", label: "Not yet" },
];

const WHO: { value: WhoTalked; label: string }[] = [
  { value: "me", label: "Me" },
  { value: "teen", label: "My child" },
  { value: "equal", label: "About equal" },
];

const FEELINGS: { value: Feeling; emoji: string; label: string }[] = [
  { value: "good", emoji: "😊", label: "Went well" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "hard", emoji: "😣", label: "Hard" },
];


export default function ReflectView({ planId }: { planId: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null | undefined>(undefined);
  const [happened, setHappened] = useState<Happened | null>(null);
  const [discussed, setDiscussed] = useState("");
  const [whoTalked, setWhoTalked] = useState<WhoTalked | null>(null);
  const [learned, setLearned] = useState("");
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [blocker, setBlocker] = useState<BlockerId | null>(null);
  const [afterConfidence, setAfterConfidence] = useState<number | null>(null);
  const [helpOffer, setHelpOffer] = useState(false);
  const [saved, setSaved] = useState<Reflection | null>(null);
  // A completed topic first shows the celebration; "Continue" then goes where the reflection leads.
  const [celebrate, setCelebrate] = useState<null | (() => void)>(null);

  useEffect(() => {
    setPlan(loadPlan(planId) ?? null);
  }, [planId]);

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

  const topicName = TOPICS.find((t) => t.id === plan.topic)!.name;
  // "If it didn't go well, what got in the way?": asked when it didn't happen, only partly happened, or felt hard.
  const askBlocker = happened === "not-yet" || happened === "partly" || feeling === "hard";
  const complete =
    happened !== null &&
    (happened === "not-yet"
      ? blocker !== null
      : feeling !== null);

  function notYet() {
    updatePlan(planId, { closedAt: new Date().toISOString() });
    saveReflection({ planId, topic: plan!.topic, happened: "not-yet", discussed: "", learned: "", helpOffered: false, gotInTheWay: blocker ?? undefined });
    track("reflection_saved", { topic: plan!.topic, plan_id: planId, happened: "not-yet", help_offered: false });
    router.push(`/recover/${planId}?why=not-yet${blocker ? `&blocker=${blocker}` : ""}`);
  }

  function submit() {
    if (!complete || !happened) return;
    if (happened === "not-yet") return notYet();
    // A danger sign: offer help first. The parent decides (FR12).
    if (hasDangerSign(`${discussed} ${learned}`)) {
      track("help_shown", { from: "reflection" });
      setHelpOffer(true);
      return;
    }
    finish(false);
  }

  function finish(helpOffered: boolean) {
    // Crisis details are never stored: if help was offered, the written notes are dropped.
    const r = saveReflection({
      planId,
      topic: plan!.topic,
      happened: happened!,
      discussed: helpOffered ? "" : discussed.trim(),
      whoTalked: whoTalked ?? undefined,
      learned: helpOffered ? "" : learned.trim(),
      feeling: feeling ?? undefined,
      helpOffered,
      gotInTheWay: askBlocker && blocker ? blocker : undefined,
    });
    updatePlan(planId, { reflectedAt: r.createdAt });
    // Ends the 14-day journey: completed if the talk happened (Yes or Partly) within 14 days.
    const completed = finishJourney(plan!.topic, happened === "yes" || happened === "partly", helpOffered);
    if (afterConfidence) recordConfidence(afterConfidence, "after_talk");
    // The fixed-choice answers only. The written notes never leave the phone.
    track("reflection_saved", {
      topic: plan!.topic,
      plan_id: planId,
      happened: happened!,
      ...(whoTalked ? { who_talked: whoTalked } : {}),
      ...(feeling ? { feeling } : {}),
      help_offered: helpOffered,
    });
    setHelpOffer(false);
    const next = () => {
      // A hard or partial talk goes to repair, never to a "failed" label (FR10).
      if (!helpOffered && (happened === "partly" || feeling === "hard")) {
        router.push(`/recover/${planId}?why=repair`);
        return;
      }
      setSaved(r);
      window.scrollTo(0, 0);
    };
    if (completed) setCelebrate(() => next);
    else next();
  }

  if (helpOffer) {
    return (
      <main style={{ minHeight: "100dvh", background: "var(--bg)" }}>
        <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "40px 16px 32px" }}>
          <section className="notice">
            <h1 style={{ fontSize: 26 }}>This sounds serious.</h1>
            <p>Would you like help from a professional? You don't have to handle this alone.</p>
            <Link href="/help" className="btn-primary btn-block" onClick={() => finish(true)} style={{ marginBottom: 10 }}>
              Yes, show me help
            </Link>
            <button className="btn-secondary btn-block" onClick={() => finish(true)}>
              No, continue
            </button>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "14px 0 0" }}>
              For your privacy, what you wrote about this won't be saved.
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (celebrate)
    return (
      <Celebration
        topic={plan.topic}
        hard={feeling === "hard"}
        onContinue={() => {
          const go = celebrate;
          setCelebrate(null);
          go();
        }}
      />
    );
  if (saved) return <Saved reflection={saved} />;

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.push("/home")} className="icon-btn" aria-label="Back">
            ←
          </button>
          <Link href="/help" className="help-pill">
            Help
          </Link>
        </div>

        <div className="card-label" style={{ marginTop: 18 }}>
          {momentOf(plan).icon} {topicName}
        </div>
        <h1 style={{ fontSize: 28, lineHeight: 1.15, margin: "6px 0 0" }}>How did it go?</h1>
        <p className="why">Two taps are enough. It stays on your phone and is never sent anywhere. Please don't write names or private details.</p>

        <h2 className="section-title" style={{ marginTop: 4 }}>
          {plan.unplanned ? "Did you get into the topic?" : "Did the talk happen?"}
        </h2>
        <div className="chips">
          {/* A talk logged afterwards already happened, so "Not yet" isn't offered. */}
          {HAPPENED.filter((h) => !plan.unplanned || h.value !== "not-yet").map((h) => (
            <button key={h.value} className={`chip${happened === h.value ? " selected" : ""}`} onClick={() => setHappened(h.value)}>
              {h.label}
            </button>
          ))}
        </div>

        {happened === "not-yet" && (
          <>
            <p className="notice" style={{ marginTop: 16 }}>
              That's okay. Most talks take more than one try. Let's find an easier way in.
            </p>
            <BlockerChoice value={blocker} onChoose={setBlocker} />
          </>
        )}

        {(happened === "yes" || happened === "partly") && (
          <>
            {/* One tap here is enough to save (28 Oct 2026): everything after it is optional. */}
            <h2 className="section-title">How did it go?</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {FEELINGS.map((f) => (
                <button
                  key={f.value}
                  aria-label={f.label}
                  aria-pressed={feeling === f.value}
                  className={`option${feeling === f.value ? " selected" : ""}`}
                  onClick={() => setFeeling(f.value)}
                  style={{ textAlign: "center", padding: "12px 6px" }}
                >
                  <span style={{ display: "block", fontSize: 28 }} aria-hidden="true">
                    {f.emoji}
                  </span>
                  <span style={{ fontSize: 14 }}>{f.label}</span>
                </button>
              ))}
            </div>
            {feeling === "hard" && (
              <p style={{ fontSize: 15, color: "var(--text-muted)", margin: "10px 0 0" }}>Hard talks still count. You showed up, and that matters.</p>
            )}

            <div className="reflect-optional">
              <div style={{ fontWeight: 700, color: "var(--text)" }}>Want to add what happened?</div>
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 2 }}>Optional. It helps you remember, and it stays on this phone.</div>

              <label htmlFor="discussed" className="section-title" style={{ display: "block", fontFamily: "var(--font-display)", color: "var(--text)" }}>
                What did you say? <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)" }}>(optional)</span>
              </label>
              <textarea
                id="discussed"
                className="text-input"
                rows={2}
                maxLength={300}
                value={discussed}
                onChange={(e) => setDiscussed(e.target.value)}
                placeholder="e.g. I asked about her friends, and how people know they like someone"
              />

              <label htmlFor="learned" className="section-title" style={{ display: "block", fontFamily: "var(--font-display)", color: "var(--text)" }}>
                What did your child say? <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)" }}>(optional)</span>
              </label>
              <textarea
                id="learned"
                className="text-input"
                rows={2}
                maxLength={300}
                value={learned}
                onChange={(e) => setLearned(e.target.value)}
                placeholder="e.g. She said most crushes in her class are just for fun"
              />

              <h2 className="section-title" style={{ marginTop: 0 }}>
                Who spoke more? <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)" }}>(optional)</span>
              </h2>
              <div className="chips">
                {WHO.map((w) => (
                  <button key={w.value} className={`chip${whoTalked === w.value ? " selected" : ""}`} onClick={() => setWhoTalked(whoTalked === w.value ? null : w.value)}>
                    {w.label}
                  </button>
                ))}
              </div>

              {askBlocker && <BlockerChoice value={blocker} onChoose={setBlocker} optional />}

              {/* Confidence after the talk (survey Q14), for Progress and the Step 6 metric. */}
              <h2 className="section-title">
                {CONFIDENCE_AFTER_QUESTION} <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)" }}>(optional)</span>
              </h2>
              <ConfidenceScale value={afterConfidence} onChoose={setAfterConfidence} />
            </div>
          </>
        )}

        <div className="sticky-action">
          <button className="btn-primary btn-block" onClick={submit} disabled={!complete}>
            {happened === "not-yet" ? "Continue" : "Save"}
          </button>
        </div>
      </div>
    </main>
  );
}

// After a talk that happened and felt okay: thanks, a listening nudge, the 3-day check-in and what's next.
function Saved({ reflection }: { reflection: Reflection }) {
  const [next, setNext] = useState<TopicId | null>(null);

  useEffect(() => {
    const used = new Set(loadPlans().map((p) => p.topic));
    setNext(TOPICS.find((t) => !used.has(t.id))?.id ?? null);
  }, []);

  const nextTopic = TOPICS.find((t) => t.id === next);

  // After a danger sign: calm thanks and help, no "next topic" yet.
  if (reflection.helpOffered) {
    return (
      <main style={{ minHeight: "100dvh", background: "var(--bg)" }}>
        <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "40px 16px 32px" }}>
          <h1 style={{ fontSize: 30, lineHeight: 1.15 }}>Thank you for listening to your teen.</h1>
          <p style={{ fontSize: 17, lineHeight: 1.5 }}>
            What they shared matters. Staying calm and close, like you did, helps most. Help is always one tap away.
          </p>
          <Link href="/help" className="btn-primary btn-block" style={{ marginTop: 16 }}>
            See who can help
          </Link>
          <Link href="/home" className="btn-link" style={{ textAlign: "center" }}>
            Go to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 32px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <HelpPill />
        </div>
        <h1 style={{ fontSize: 30, lineHeight: 1.15 }}>Thank you for showing up for this talk.</h1>
        <p style={{ fontSize: 17, lineHeight: 1.5 }}>Every talk, even a short one, tells your teen the door is open.</p>

        {reflection.whoTalked === "me" && (
          <p className="notice">💡 Next time, try asking one more question, then waiting. Teens say listening helps most.</p>
        )}
        {reflection.whoTalked === "teen" && <p className="notice">💛 Your teen did most of the talking. That's a great sign.</p>}


        {nextTopic && (
          <>
            <h2 className="section-title">When you're ready</h2>
            <Link href={`/card/${nextTopic.id}`} className="topic-card">
              <span className="topic-dot" style={{ background: nextTopic.color }} aria-hidden="true" />
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontWeight: 700, color: "var(--text)" }}>{nextTopic.name}</span>
                <span style={{ display: "block", fontSize: 15, color: "var(--text-muted)", fontStyle: "italic", marginTop: 3 }}>
                  “{nextTopic.teenQuestion}”
                </span>
              </span>
              <span aria-hidden="true" style={{ color: "var(--primary)" }}>
                →
              </span>
            </Link>
          </>
        )}

        <Link href="/home" className="btn-primary btn-block" style={{ marginTop: 24 }}>
          Go to Home
        </Link>
      </div>
    </main>
  );
}

// "What got in the way?" A fixed choice, never free text. Leads to an easier next step, never a "failed" label.
function BlockerChoice({ value, onChoose, optional = false }: { value: BlockerId | null; onChoose: (id: BlockerId) => void; optional?: boolean }) {
  return (
    <>
      <h2 className="section-title">
        What got in the way?{" "}
        {optional && <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-muted)" }}>(optional)</span>}
      </h2>
      <div style={{ display: "grid", gap: 8 }}>
        {BLOCKERS.map((b) => (
          <button key={b.id} className={`option${value === b.id ? " selected" : ""}`} aria-pressed={value === b.id} onClick={() => onChoose(b.id)} style={{ fontSize: 16, padding: "12px 14px" }}>
            {b.label}
          </button>
        ))}
      </div>
    </>
  );
}
